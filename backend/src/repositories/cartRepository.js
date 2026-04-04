import { Cart } from '../models/Cart.js';

class CartRepository {
  async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate('cartItems.product');
  }

  async update(userId, cartItems) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { cartItems },
      { new: true, upsert: true }
    );
  }

  async clear(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { cartItems: [] },
      { new: true }
    );
  }
}

export const cartRepository = new CartRepository();
