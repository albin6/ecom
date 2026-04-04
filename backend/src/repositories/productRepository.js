import { Product } from '../models/Product.js';

class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async find(query, sort = {}, skip = 0, limit = 10) {
    return await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(query) {
    return await Product.countDocuments(query);
  }

  async findById(id) {
    return await Product.findById(id).populate('category', 'name slug').lean();
  }

  async update(id, productData) {
    return await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

export const productRepository = new ProductRepository();
