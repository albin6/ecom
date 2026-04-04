import { categoryRepository } from '../repositories/categoryRepository.js';
import { redisClient } from '../config/redis.js';

export class CategoryService {
  async getCategories({ keyword, page = 1, limit = 10, sort = '-createdAt', isAdmin = false } = {}) {
    // Secondary safety: ensure defaults if params come in as empty or invalid
    page = page || 1;
    limit = Number(limit) || 10;
    sort = sort || '-createdAt';

    const cacheKey = `categories:${keyword || ''}:${page}:${limit}:${sort}:${isAdmin}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const query = {};
    if (!isAdmin) {
      query.isBlocked = false; // Hide completely blocked category hierarchies from public users
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { slug: { $regex: keyword, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      categoryRepository.find(query, sort, skip, limit),
      categoryRepository.count(query)
    ]);

    const result = {
      categories,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    };

    // Cache categories to relieve DB strain
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
    return result;
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(data) {
    const category = await categoryRepository.create(data);
    await this.invalidateCache();
    return category;
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.update(id, data);
    if (!category) throw new Error('Category not found');
    await this.invalidateCache();
    return category;
  }

  async deleteCategory(id) {
    const category = await categoryRepository.delete(id);
    if (!category) throw new Error('Category not found');
    await this.invalidateCache();
    return category;
  }

  async invalidateCache() {
    try {
      const keys = await redisClient.keys('categories:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      // Also clear the active category IDs set used by ProductService
      await redisClient.del('active_category_ids');
      // Invalidate all product lists since they depend on category status
      const productKeys = await redisClient.keys('products:*');
      if (productKeys.length > 0) {
        await redisClient.del(productKeys);
      }
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }
}

export const categoryService = new CategoryService();
