import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductDetailsQuery } from '../features/products/productApiSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { Loader } from '../components/ui/Loader.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Button } from '../components/ui/Button.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Shield, Truck, RefreshCw, CheckCircle } from 'lucide-react';

export const ProductDetails = () => {
  const { id: productId } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

  // --- All original business logic preserved ---
  const currentVariant = product?.variants?.[activeVariant] || null;
  const variantImages = currentVariant?.images || [];
  const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900"><rect fill="%23f1f5f9" width="800" height="900"/><text fill="%2394a3b8" font-family="sans-serif" font-size="40" text-anchor="middle" x="400" y="460">No Image</text></svg>';
  const images = variantImages.length > 0 ? variantImages : [FALLBACK_IMG];
  
  // Stock per-variant (total across all sizes in a variant for general info)
  const variantStockTotal = currentVariant?.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;
  
  // Stock for specific selected size
  const selectedSizeObj = currentVariant?.sizes?.find(s => s.size === selectedSize);
  const sizeStock = selectedSizeObj ? selectedSizeObj.stock : 0;

  const addToCartHandler = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: images[0],
      price: product.price,
      qty,
      stock: sizeStock,
      color: currentVariant?.color,
      size: selectedSize,
    }));
    navigate('/cart');
  };

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;
  if (error) return <Message variant="danger" className="mt-8">{error?.data?.message || 'Error loading product'}</Message>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4 }}
      className="py-8"
    >
      {/* Back link */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 group font-medium transition-colors">
        <span className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-colors shadow-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        Back to store
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Image Gallery */}
        <div className="flex flex-col gap-3 md:sticky md:top-24 self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-lg"
            >
              <img 
                src={images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImage ? 'border-secondary shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info + Purchase Panel */}
        <div className="flex flex-col space-y-7">
          <div>
            {product.category && (
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 block">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-gray-900">${product.price.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-gray-600 leading-7 text-base border-t border-gray-100 pt-6">
            {product.description}
          </p>

          {/* Purchase Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] p-6 space-y-5">
            {/* Color Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Color:</span>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setActiveVariant(i); setActiveImage(0); setSelectedSize(''); }}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                        i === activeVariant
                          ? 'bg-secondary text-white border-secondary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {currentVariant?.sizes && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Size:</span>
                  {selectedSize && (
                    <span className="text-xs font-medium text-gray-500">
                      {sizeStock > 0 ? `${sizeStock} in stock` : 'Out of stock'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentVariant.sizes.map((s, i) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSize(s.size)}
                      disabled={s.stock === 0}
                      className={`h-11 px-4 rounded-xl text-sm font-bold border transition-all ${
                        selectedSize === s.size
                          ? 'bg-primary text-white border-primary shadow-md'
                          : s.stock > 0
                            ? 'bg-white border-gray-200 text-gray-900 hover:border-gray-400'
                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Availability</span>
              {variantStockTotal > 0 ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> In Stock ({variantStockTotal} units)
                </span>
              ) : (
                <span className="text-sm font-bold text-red-500">Out of Stock</span>
              )}
            </div>

            {/* Qty Selector */}
            {sizeStock > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm transition-all font-bold text-gray-600"
                  >−</button>
                  <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(sizeStock, 10, q + 1))}
                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm transition-all font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={qty >= Math.min(sizeStock, 10)}
                  >+</button>
                </div>
              </div>
            )}

            {userInfo ? (
              <Button
                className="w-full text-base rounded-xl"
                size="lg"
                onClick={addToCartHandler}
                disabled={!selectedSize || sizeStock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {!selectedSize ? 'Select a Size' : sizeStock === 0 ? 'Currently Unavailable' : 'Add to Cart'}
              </Button>
            ) : (
              <Link to="/login">
                <Button className="w-full text-base rounded-xl" size="lg">
                  Sign in to Purchase
                </Button>
              </Link>
            )}
          </div>


          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Truck size={18} />, label: 'Free Shipping' },
              { icon: <Shield size={18} />, label: 'Secure Pay' },
              { icon: <RefreshCw size={18} />, label: '30-Day Returns' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl text-gray-500">
                {icon}
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
