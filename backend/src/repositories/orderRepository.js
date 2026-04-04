import { Order } from '../models/Order.js';

class OrderRepository {
  async createWithTransaction(orderData, session) {
    const order = new Order(orderData);
    return await order.save({ session });
  }

  async findByIdempotencyKey(key) {
    return await Order.findOne({ idempotencyKey: key });
  }

  async findById(id) {
    return await Order.findById(id).populate('user', 'name email').populate('orderItems.product');
  }

  async find(query = {}, sort = '-createdAt', skip = 0, limit = 0) {
    let mQuery = Order.find(query).populate('user', 'id name email').sort(sort);
    if (skip > 0) mQuery = mQuery.skip(skip);
    if (limit > 0) mQuery = mQuery.limit(limit);
    return await mQuery;
  }

  async count(query = {}) {
    return await Order.countDocuments(query);
  }

  async findUserOrders(userId) {
    return await Order.find({ user: userId }).sort('-createdAt').populate('orderItems.product', 'name images price');
  }

  async findAll() {
    return await this.find({});
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export const orderRepository = new OrderRepository();
