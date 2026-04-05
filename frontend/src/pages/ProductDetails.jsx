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
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-12 bg-base-black min-h-screen"
    >
      {/* Editorial Breadcrumbs */}
      <div className="container mx-auto px-6 mb-12">
        <Link to="/shop" className="group inline-flex items-center gap-4 text-[10px] tracking-[0.4em] font-bold uppercase text-text-muted hover:text-accent transition-all">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-2 transition-transform" />
          The Archive / {product.category?.name || 'Hannvis Selection'}
        </Link>
      </div>

      <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-20">
        
        {/* Left: Expansive Image Gallery (60%) */}
        <div className="lg:w-[60%] space-y-8">
          <div className="relative aspect-[4/5] bg-surface overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[activeImage]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[1200ms]"
              />
            </AnimatePresence>
            
            {/* Image Counter (Luxury Detail) */}
            <div className="absolute bottom-8 right-8 text-[10px] tracking-widest font-mono text-white/40 bg-base-black/40 backdrop-blur-md px-4 py-2 rounded-full pt-2.5">
              {String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-[4/5] bg-surface transition-all duration-500 overflow-hidden relative ${
                    i === activeImage ? 'ring-1 ring-accent grayscale-0' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-[0.5]'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sticky Details Panel (40%) */}
        <div className="lg:w-[40%]">
          <div className="sticky top-32 space-y-12">
            <header className="space-y-6">
              {product.category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4 block underline underline-offset-8">
                  {typeof product.category === 'object' ? product.category.name : product.category}
                </span>
              )}
              <h1 className="text-5xl lg:text-7xl font-serif tracking-tight leading-[1.1] italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <span className="text-3xl font-mono text-accent">${product.price.toFixed(2)}</span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${variantStockTotal > 0 ? 'text-success/60' : 'text-error/60'}`}>
                  {variantStockTotal > 0 ? `Available / ${variantStockTotal} Pieces` : 'Currently Reserved'}
                </span>
              </div>
            </header>

            <div className="space-y-12 border-t border-white/5 pt-12">
              <p className="text-text-muted leading-relaxed text-sm font-serif italic max-w-md">
                {product.description}
              </p>

              {/* Functional Selectors (Logic Preserved) */}
              <div className="space-y-10">
                {/* Color Variant Swatches */}
                {product.variants && product.variants.length > 1 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">Selected Palette</span>
                    <div className="flex gap-4 flex-wrap">
                      {product.variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setActiveVariant(i); setActiveImage(0); setSelectedSize(''); }}
                          className={`w-8 h-8 rounded-full border border-white/10 p-1 transition-all duration-500 ${
                            i === activeVariant ? 'border-accent scale-125' : 'opacity-40 hover:opacity-100 hover:scale-110'
                          }`}
                        >
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: v.color.toLowerCase() }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editorial Size Chips */}
                {currentVariant?.sizes && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">Measurement</span>
                      {selectedSize && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent italic">
                          {sizeStock > 0 ? `${sizeStock} Remaining` : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {currentVariant.sizes.map((s) => (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => setSelectedSize(s.size)}
                          disabled={s.stock === 0}
                          className={`min-w-[50px] h-12 px-4 text-[11px] font-bold border transition-all duration-300 ${
                            selectedSize === s.size
                              ? 'bg-accent text-base-black border-accent'
                              : s.stock > 0
                                ? 'bg-transparent border-white/10 text-text-muted hover:border-white/30 hover:text-text-primary'
                                : 'bg-transparent border-white/5 text-text-muted/20 cursor-not-allowed line-through'
                          }`}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qty & Action */}
                <div className="grid grid-cols-1 gap-6 pt-6">
                  {sizeStock > 0 && (
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Procurement Amount</span>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors text-xl font-serif italic"
                        >−</button>
                        <span className="w-8 text-center font-mono text-sm">{qty}</span>
                        <button
                          onClick={() => setQty(q => Math.min(sizeStock, 10, q + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors text-xl font-serif italic disabled:opacity-20"
                          disabled={qty >= Math.min(sizeStock, 10)}
                        >+</button>
                      </div>
                    </div>
                  )}

                  {userInfo ? (
                    <button
                      className="w-full h-16 bg-accent text-base-black text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden group relative transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                      onClick={addToCartHandler}
                      disabled={!selectedSize || sizeStock === 0}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                        {!selectedSize ? 'Select Measurement' : sizeStock === 0 ? 'Currently Unavailable' : 'Procure Piece'}
                      </span>
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-boutique" />
                    </button>
                  ) : (
                    <Link to="/login">
                      <button className="w-full h-16 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent/5 transition-colors">
                        Authenticity Required to Purchase
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Editorial Trust Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
              {[
                { icon: <Truck size={18} strokeWidth={1} />, label: 'COMPLIMENTARY SHIPPING', desc: 'Direct to portal' },
                { icon: <Shield size={18} strokeWidth={1} />, label: 'SECURE ESCROW', desc: 'Encrypted transfer' },
                { icon: <RefreshCw size={18} strokeWidth={1} />, label: '30-DAY ARCHIVE RETURN', desc: 'Pristine condition' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="space-y-3">
                  <div className="text-accent opacity-60">{icon}</div>
                  <h4 className="text-[9px] font-bold tracking-widest text-text-primary uppercase">{label}</h4>
                  <p className="text-[9px] text-text-muted leading-tight uppercase tracking-widest">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
