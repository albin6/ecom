import mongoose from 'mongoose';
import { orderRepository } from '../repositories/orderRepository.js';
import { Product } from '../models/Product.js';
import logger from '../utils/logger.js';
import { redisClient } from '../config/redis.js';
import { releaseReservation } from '../controllers/checkoutController.js';

export class OrderService {
  async createOrder({ user, orderItems, shippingAddress, paymentMethod, idempotencyKey }) {
    // 1. Check Idempotency Key
    if (idempotencyKey) {
      const existingOrder = await orderRepository.findByIdempotencyKey(idempotencyKey);
      if (existingOrder) {
        logger.info(`Idempotent order return for key: ${idempotencyKey}`);
        return existingOrder;
      }
    }

    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items');
    }

    // 2. Start Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2.5 Verify active checkout session
      const checkoutSession = await redisClient.get(`checkout:session:${user}`);
      if (!checkoutSession) {
        throw new Error('Checkout session expired. Please return to cart and try again.');
      }
      // Optional: deeper validation of items match
      // 3. Verify stock and calculate prices
      let itemsPrice = 0;
      for (const item of orderItems) {
        const product = await Product.findById(item.product).session(session);
        
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        // Find the specific variant and size to deduct stock correctly
        const variant = product.variants.find(v => v.color === item.color);
        if (!variant) {
          throw new Error(`Variant ${item.color} not found for ${product.name}`);
        }

        const sizeObj = variant.sizes.find(s => s.size === item.size);
        if (!sizeObj) {
          throw new Error(`Size ${item.size} not found for ${product.name} - ${item.color}`);
        }

        if (sizeObj.stock < item.qty) {
          throw new Error(`Insufficient stock for ${product.name} (${item.color} - ${item.size})`);
        }

        // Deduct stock from specific variant/size
        sizeObj.stock -= item.qty;
        
        // Ensure atomic save within session
        product.markModified('variants');
        await product.save({ session });

        // Calculate price based on DB to prevent frontend tampering
        itemsPrice += product.price * item.qty;
      }

      const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // 4. Create Order
      const order = await orderRepository.createWithTransaction({
        user,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        idempotencyKey
      }, session);

      // 5. Commit Transaction
      await session.commitTransaction();
      session.endSession();

      // 6. Cleanup Redis session and reservations
      await releaseReservation(user);

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Transaction failed: ${error.message}`);
      throw error;
    }
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderToPaid(id, paymentResult) {
    const order = await this.getOrderById(id);
    
    if (order.isPaid) {
      throw new Error('Order is already paid');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;

    return await order.save();
  }

  async getMyOrders(userId) {
    return await orderRepository.findUserOrders(userId);
  }

  async getOrders({ keyword, page = 1, limit = 10, sort = '-createdAt' } = {}) {
    page = page || 1;
    limit = Number(limit) || 10;
    sort = sort || '-createdAt';

    const query = {};
    if (keyword) {
      // Check if it's an orderId or a user search
      if (keyword.startsWith('#ORD-')) {
          query.orderId = { $regex: keyword.substring(1), $options: 'i' };
      } else {
          query.$or = [
            { orderId: { $regex: keyword, $options: 'i' } },
            { 'user.name': { $regex: keyword, $options: 'i' } },
            { 'user.email': { $regex: keyword, $options: 'i' } },
            { _id: keyword.length === 24 ? keyword : undefined }
          ].filter(q => q._id !== undefined || !q._id);
      }
    }

    const skip = (page - 1) * limit;

    // Note: Since user information is in a separate collection, searching by user.name/email 
    // usually requires an aggregation or pre-fetching user IDs.
    // However, for this implementation, we'll assume the keyword search on Order fields for now
    // and if user search is needed, we'll optimize with aggregation.
    
    // Improved User Search:
    let userIds = [];
    if (keyword && !keyword.startsWith('#ORD-')) {
        const User = mongoose.model('User');
        const users = await User.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        }).select('_id');
        userIds = users.map(u => u._id);
        
        if (userIds.length > 0) {
            query.$or = [
                ...(query.$or || []),
                { user: { $in: userIds } }
            ];
        }
    }

    const [orders, total] = await Promise.all([
      orderRepository.find(query, sort, skip, limit),
      orderRepository.count(query)
    ]);

    return {
      orders,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    };
  }

  async updateOrderToDelivered(id) {
    const order = await this.getOrderById(id);
    
    if (order.isDelivered) {
      throw new Error('Order is already delivered');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    return await order.save();
  }
}

export const orderService = new OrderService();
