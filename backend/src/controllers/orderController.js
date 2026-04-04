import { orderService } from '../services/orderService.js';
import { z } from 'zod';

const orderItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().positive(),
  image: z.string().url(),
  price: z.number().positive(),
  color: z.string(),
  size: z.string(),
  product: z.string(), // ObjectId
});

const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string()
  }),
  paymentMethod: z.string(),
});

export const addOrderItems = async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const idempotencyKey = req.headers['x-idempotency-key'];

    const order = await orderService.createOrder({
      user: req.user.userId,
      orderItems: data.orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      idempotencyKey,
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400);
      return next(new Error(error.errors[0].message));
    }
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    // Ensure the order belongs to the user or user is admin
    if (order.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } catch (error) {
    if (error.message === 'Order not found') res.status(404);
    next(error);
  }
};

export const updateOrderToPaid = async (req, res, next) => {
  try {
    // In a real scenario, this is called by a webhook from Stripe
    const order = await orderService.updateOrderToPaid(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    if (error.message === 'Order is already paid') res.status(400);
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrdersSchema = z.object({
  keyword: z.string().transform(v => v === '' ? undefined : v).optional(),
  page: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  limit: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  sort: z.string().transform(v => v === '' ? undefined : v).optional(),
});

export const getOrders = async (req, res, next) => {
  try {
    const filters = getOrdersSchema.parse(req.query);
    const result = await orderService.getOrders(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderToDelivered(req.params.id);
    res.json(order);
  } catch (error) {
    if (error.message === 'Order is already delivered') res.status(400);
    next(error);
  }
};
