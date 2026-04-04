import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  qty: { type: Number, required: true, min: 1, max: 10 },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cartItems: [cartItemSchema],
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);
