import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: { 
    type: [String], 
    validate: [arr => arr && arr.length >= 3, 'A minimum of 3 images are required for each color variant.'] 
  },
  sizes: [sizeSchema]
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  variants: [variantSchema],
  isBlocked: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes for search and caching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model('Product', productSchema);
