import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../features/cart/cartSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { motion } from 'framer-motion';
import { CheckoutTimer } from '../components/checkout/CheckoutTimer.jsx';
import { useEffect } from 'react';
import { useGetCheckoutStatusQuery } from '../features/checkout/checkoutApiSlice.js';

export const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems } = cart;
  const navigate = useNavigate();

  const { data: status, error: statusError } = useGetCheckoutStatusQuery();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    } else if (statusError) {
      navigate('/cart?message=Session expired');
    }
  }, [navigate, cartItems, statusError]);

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-12 bg-base-black min-h-screen"
    >
      <CheckoutTimer />
      
      <div className="container mx-auto px-6">
        <CheckoutSteps step1 step2 />

        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-surface/50 backdrop-blur-3xl border border-white/5 p-12 lg:p-20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group"
          >
            {/* Subtle Radial Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-accent/10 transition-all duration-[1200ms]" />
            
            <header className="mb-16 space-y-4 relative z-10">
              <h2 className="text-4xl lg:text-5xl font-serif italic tracking-tight">Delivery Details</h2>
              <p className="text-[10px] tracking-[0.4em] font-bold text-text-muted uppercase">Where shall we send your selection?</p>
            </header>

            <form onSubmit={submitHandler} className="space-y-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[9px] tracking-[0.3em] font-bold text-text-muted uppercase opacity-40">Shipping Address</label>
                  <input 
                    className="w-full bg-transparent border-b border-white/10 py-4 font-serif text-lg italic text-text-primary focus:border-accent focus:outline-none transition-all placeholder:text-text-muted/20"
                    placeholder="Enter your address..." 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[9px] tracking-[0.3em] font-bold text-text-muted uppercase opacity-40">City</label>
                  <input 
                    className="w-full bg-transparent border-b border-white/10 py-4 font-serif text-lg italic text-text-primary focus:border-accent focus:outline-none transition-all placeholder:text-text-muted/20"
                    placeholder="Enter your city..." 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] tracking-[0.3em] font-bold text-text-muted uppercase opacity-40">Postal Code</label>
<input 
                    className="w-full bg-transparent border-b border-white/10 py-4 font-mono text-sm tracking-widest text-text-primary focus:border-accent focus:outline-none transition-all placeholder:text-text-muted/20"
                    placeholder="Postal Code" 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    required 
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-[9px] tracking-[0.3em] font-bold text-text-muted uppercase opacity-40">Country</label>
                  <input 
                    className="w-full bg-transparent border-b border-white/10 py-4 font-serif text-lg italic text-text-primary focus:border-accent focus:outline-none transition-all placeholder:text-text-muted/20"
                    placeholder="Select country..." 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="pt-12">
                <button 
                  type="submit" 
                  className="w-full h-18 bg-accent text-base-black text-[11px] font-bold uppercase tracking-[0.4em] group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    Continue to Payment
                    <ArrowRight size={14} className="group-hover:translate-x-4 transition-transform duration-700" />
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-boutique" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
