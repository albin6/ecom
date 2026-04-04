import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  isBlocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

categorySchema.index({ slug: 1 });

export const Category = mongoose.model('Category', categorySchema);
