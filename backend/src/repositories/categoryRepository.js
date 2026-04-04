import { Category } from '../models/Category.js';

class CategoryRepository {
  async find(query = {}, sort = '-createdAt', skip = 0, limit = 0) {
    let mQuery = Category.find(query).sort(sort);
    if (skip > 0) mQuery = mQuery.skip(skip);
    if (limit > 0) mQuery = mQuery.limit(limit);
    return await mQuery;
  }

  async count(query = {}) {
    return await Category.countDocuments(query);
  }

  async findById(id) {
    return Category.findById(id);
  }

  async create(data) {
    return Category.create(data);
  }

  async update(id, data) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Category.findByIdAndDelete(id);
  }
}

export const categoryRepository = new CategoryRepository();
