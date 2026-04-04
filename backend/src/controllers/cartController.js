import { cartRepository } from '../repositories/cartRepository.js';
import { productRepository } from '../repositories/productRepository.js';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    let cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      cart = await cartRepository.update(userId, []);
      return res.json(cart);
    }

    // --- Stock Scrubbing Logic ---
    let isChanged = false;
    
    // We already have populated products from cartRepository.findByUserId
    const scrubbedItems = cart.cartItems.map(item => {
      const product = item.product; // This is already populated via cartRepository
      
      if (!product || product.isBlocked) {
        isChanged = true;
        return null;
      }

      const variant = product.variants.find(v => v.color === item.color);
      if (!variant) {
        isChanged = true;
        return null;
      }

      const size = variant.sizes.find(s => s.size === item.size);
      if (!size || size.stock <= 0) {
        isChanged = true;
        return null;
      }

      if (item.qty > size.stock) {
        isChanged = true;
        // Construct updated item, ensuring we only store the ID to avoid re-population issues
        const itemObj = item.toObject();
        return { ...itemObj, product: product._id, qty: size.stock, adjusted: true };
      }

      // Return the item with just the product ID to ensure consistency in the items array
      const itemObj = item.toObject();
      return { ...itemObj, product: product._id };
    }).filter(Boolean);

    if (isChanged) {
      cart = await cartRepository.update(userId, scrubbedItems);
    }
    
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cartItems } = req.body;
    
    const cart = await cartRepository.update(userId, cartItems);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await cartRepository.clear(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
