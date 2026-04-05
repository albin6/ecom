import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../features/cart/cartSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Message } from '../components/ui/Message.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useInitiateCheckoutMutation } from '../features/checkout/checkoutApiSlice.js';

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [initiateCheckout, { isLoading: isInitiating }] = useInitiateCheckoutMutation();

  // --- All original business logic preserved ---
  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (item) => {
    dispatch(removeFromCart({ product: item.product, color: item.color, size: item.size }));
  };

  const checkoutHandler = async () => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping');
      return;
    }

    try {
      await initiateCheckout({
        items: cartItems.map(item => ({
          product: item.product,
          qty: item.qty,
          color: item.color,
          size: item.size
        }))
      }).unwrap();
      
      navigate('/shipping');
    } catch (err) {
      const message = err.data?.message || 'Error initiating checkout';
      
      if (message.includes('active checkout session')) {
        navigate('/shipping');
      } else {
        alert(message);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} 
      className="py-12 bg-base-black min-h-screen"
    >
      <header className="mb-16 border-b border-white/5 pb-10 flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-serif italic tracking-tight mb-2 flex items-center gap-4">
            The Selection
          </h1>
          <p className="text-[10px] tracking-[0.4em] font-bold text-text-muted uppercase">
            Reviewing your curated pieces
          </p>
        </div>
        {cartItems.length > 0 && (
          <span className="text-[10px] tracking-[0.2em] font-bold text-accent uppercase bg-accent/5 px-4 py-2 border border-accent/10">
            {totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'} Securing
          </span>
        )}
      </header>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-10">
          <div className="h-40 w-40 bg-surface rounded-full flex items-center justify-center text-text-muted/10 border border-white/5 shadow-inner">
            <ShoppingBag size={64} strokeWidth={0.5} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif italic">Your archive is vacant</h2>
            <p className="text-[10px] tracking-widest text-text-muted uppercase">Explore our current collections to find your match</p>
          </div>
          <Link to="/">
            <button className="btn btn-primary px-12 h-14 text-[10px]">Return to Collection</button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Items List (Editorial Style) */}
          <div className="lg:w-2/3 w-full space-y-12">
            <div className="divide-y divide-white/5 border-t border-b border-white/5">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={`${item.product}-${item.color}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="py-10 flex flex-col sm:flex-row items-center gap-10 group"
                  >
                    <Link to={`/product/${item.product}`} className="flex-shrink-0 relative overflow-hidden bg-surface aspect-[3/4] w-32 shadow-xl group-hover:shadow-accent/5 transition-all duration-700">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" />
                    </Link>

                    <div className="flex-1 min-w-0 text-center sm:text-left space-y-4">
                      <div>
                        <Link to={`/product/${item.product}`}>
                          <h3 className="font-serif text-2xl italic hover:text-accent transition-colors leading-tight">{item.name}</h3>
                        </Link>
                        <p className="text-[9px] tracking-[0.3em] font-bold text-text-muted uppercase mt-2">Hannvis Certified</p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-6 font-mono text-[10px] text-accent/60">
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-widest text-[9px] text-text-muted opacity-40">Palette:</span>
                          <span className="uppercase tracking-widest">{item.color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-widest text-[9px] text-text-muted opacity-40">Measurement:</span>
                          <span className="uppercase tracking-widest">{item.size}</span>
                        </div>
                      </div>

                      {item.adjusted && (
                        <div className="inline-block px-3 py-1 bg-accent/5 border border-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest italic">
                          Inventory Adjusted
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-6 w-full sm:w-auto">
                      <div className="text-xl font-mono text-accent">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>

                      <div className="flex items-center gap-8">
                        {/* Luxury Stepper */}
                        <div className="flex items-center gap-6">
                          <button
                            type="button"
                            onClick={() => item.qty > 1 ? addToCartHandler(item, item.qty - 1) : removeFromCartHandler(item)}
                            className="text-text-muted hover:text-accent transition-colors font-serif italic text-2xl"
                          >−</button>
                          <span className="w-6 text-center text-sm font-mono">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCartHandler(item, Math.min(item.stock || 10, 10, item.qty + 1))}
                            className="text-text-muted hover:text-accent transition-colors font-serif italic text-2xl disabled:opacity-20"
                            disabled={item.qty >= Math.min(item.stock || 10, 10)}
                          >+</button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCartHandler(item)}
                          className="text-text-muted hover:text-error transition-colors p-2"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Link to="/" className="inline-block text-[10px] tracking-[0.3em] font-bold uppercase text-text-muted hover:text-accent transition-colors pb-1 border-b border-transparent hover:border-accent">
               ← Resume Procurement
            </Link>
          </div>

          {/* Order Summary (Glassmorphic) */}
          <div className="lg:w-1/3 w-full sticky top-32">
            <div className="bg-surface/50 backdrop-blur-2xl border border-white/5 p-10 space-y-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
              <h2 className="text-[10px] tracking-[0.4em] font-bold text-accent uppercase pb-6 border-b border-white/5">Order Overview</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between text-[11px] tracking-widest font-bold uppercase">
                  <span className="text-text-muted">Procured Subtotal</span>
                  <span className="text-text-primary text-sm font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] tracking-widest font-bold uppercase">
                  <span className="text-text-muted">Transport</span>
                  <span className="text-success/60 italic font-serif">Complimentary</span>
                </div>
                <div className="flex items-center justify-between text-[11px] tracking-widest font-bold uppercase">
                  <span className="text-text-muted">Total Tax</span>
                  <span className="text-text-primary text-sm font-mono">$0.00</span>
                </div>
                
                <div className="pt-8 border-t border-white/5 flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.3em]">Final Amount</span>
                    <div className="text-3xl font-mono text-accent leading-none">${subtotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <button
                className="w-full h-16 bg-accent text-base-black text-[11px] font-bold uppercase tracking-[0.3em] group relative overflow-hidden active:scale-[0.98] transition-all disabled:opacity-30"
                onClick={checkoutHandler}
                disabled={isInitiating}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isInitiating ? 'Processing...' : 'Confirm Selection'}
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" strokeWidth={3} />
                </div>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-boutique" />
              </button>

              <div className="space-y-4 pt-6 text-center">
                <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] italic">
                  Secure checkout powered by Hannvis Escrow
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
