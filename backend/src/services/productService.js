import { productRepository } from '../repositories/productRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { redisClient } from '../config/redis.js';

export class ProductService {
  async getProducts({ keyword, category, page = 1, limit = 10, sort = '-createdAt', isAdmin = false, minPrice, maxPrice }) {
    // Secondary safety: ensure defaults if params come in as empty or invalid
    page = page || 1;
    limit = limit || 10;
    sort = sort || '-createdAt';
    // Check cache
    const cacheKey = `products:${keyword || ''}:${category || ''}:${page}:${limit}:${sort}:${isAdmin}:${minPrice || ''}:${maxPrice || ''}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      data.products = await this.applyReservations(data.products);
      return data;
    }

    const query = {};
    if (!isAdmin) {
      query.isBlocked = false; // Soft-delete visibility mechanism
      
      // Enforce parent Category visibility layer restrictions
      // Optimized: Cache active category IDs to prevent redundant DB hits
      const categoryCacheKey = 'active_category_ids';
      let activeCategoryIds;
      const cachedCategories = await redisClient.get(categoryCacheKey);
      
      if (cachedCategories) {
        activeCategoryIds = JSON.parse(cachedCategories);
      } else {
        const activeCategories = await categoryRepository.find({ isBlocked: false });
        activeCategoryIds = activeCategories.map(c => c._id.toString());
        await redisClient.setEx(categoryCacheKey, 600, JSON.stringify(activeCategoryIds)); // 10 min cache
      }

      // Guard: if no categories exist yet (fresh DB), return empty product list safely
      if (activeCategoryIds.length === 0 && !category) {
        return { products: [], page: Number(page), pages: 0, total: 0 };
      }

      if (category) {
        if (!activeCategoryIds.includes(category)) {
          query.category = '000000000000000000000000';
        } else {
          query.category = category;
        }
      } else {
        query.category = { $in: activeCategoryIds };
      }
    } else {
      if (category) query.category = category;
    }
    
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.find(query, sort, skip, Number(limit)),
      productRepository.count(query)
    ]);

    const result = {
      products,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    // Dynamic stock adjustment on the final result (do not cache the adjusted stock!)
    result.products = await this.applyReservations(result.products);

    return result;
  }

  async getProductById(id) {
    const cacheKey = `product:${id}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const product = JSON.parse(cachedData);
      return await this.applyReservations(product);
    }

    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Cache for 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(product));

    // Dynamic stock adjustment
    const adjustedProduct = await this.applyReservations(product);

    return adjustedProduct;
  }

  async createProduct(data) {
    const product = await productRepository.create(data);
    await this.invalidateCache();
    return product;
  }

  async updateProduct(id, data) {
    const product = await productRepository.update(id, data);
    if (!product) throw new Error('Product not found');
    await this.invalidateCache(id);
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (!product) throw new Error('Product not found');
    await this.invalidateCache(id);
    return product;
  }

  // Helper to invalidate caches when products change
  async invalidateCache(productId = null) {
    try {
      // Clear product list cache
      const keys = await redisClient.keys('products:*');
      if (keys.length > 0) {
        await redisClient.del(keys); // In production, Redis unlink is safer for large key sizes, but for our case del is fine
      }
      
      if (productId) {
        await redisClient.del(`product:${productId}`);
      }
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  /**
   * Adjusts product stock levels by subtracting active Redis reservations.
   */
  async applyReservations(products) {
    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];

    // Collect all reservation keys in one pass
    const lookups = [];
    for (const product of productList) {
      if (!product.variants) continue;
      for (const variant of product.variants) {
        if (!variant.sizes) continue;
        for (const size of variant.sizes) {
          // Bug fix: use size.size (not size.name) to match the schema field name
          const reservedKey = `checkout:reserved:${product._id}:${variant.color}:${size.size}`;
          lookups.push({ size, reservedKey });
        }
      }
    }

    if (lookups.length === 0) return isArray ? productList : productList[0];

    // Batch all Redis calls in parallel instead of sequential awaits
    const results = await Promise.all(lookups.map(({ reservedKey }) => redisClient.hGetAll(reservedKey)));

    results.forEach((reservations, idx) => {
      const { size } = lookups[idx];
      let totalReserved = 0;
      for (const userId in reservations) {
        totalReserved += parseInt(reservations[userId], 10);
      }
      size.stock = Math.max(0, size.stock - totalReserved);
    });

    return isArray ? productList : productList[0];
  }
}

export const productService = new ProductService();
