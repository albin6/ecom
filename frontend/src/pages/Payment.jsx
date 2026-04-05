import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../features/cart/cartSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import { CheckoutTimer } from '../components/checkout/CheckoutTimer.jsx';
import { useGetCheckoutStatusQuery } from '../features/checkout/checkoutApiSlice.js';

export const Payment = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems } = cart;

  const { data: status, error: statusError } = useGetCheckoutStatusQuery();

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    } else if (statusError) {
      navigate('/cart?message=Session expired');
    }
  }, [shippingAddress, navigate, cartItems, statusError]);

  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-12 bg-base-black min-h-screen"
    >
      <CheckoutTimer />
      
      <div className="container mx-auto px-6">
        <CheckoutSteps step1 step2 step3 />

        <div className="max-w-xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-surface/50 backdrop-blur-3xl border border-white/5 p-12 lg:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group text-center"
          >
            {/* Subtle Radial Glow */}
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full -ml-40 -mb-40 group-hover:bg-accent/10 transition-all duration-[1200ms]" />
            
            <header className="mb-16 space-y-4 relative z-10">
              <h2 className="text-4xl lg:text-5xl font-serif italic tracking-tight">Financial Portal</h2>
              <p className="text-[10px] tracking-[0.4em] font-bold text-text-muted uppercase">Select your preferred transfer method</p>
            </header>

            <form onSubmit={submitHandler} className="space-y-12 relative z-10 text-left">
              <div className="space-y-6">
                {[
                  { id: 'PayPal', label: 'PAYPAL / GLOBAL CREDIT', desc: 'Secure escrow with buyer protection' },
                  { id: 'Stripe', label: 'STRIPE PORTAL', desc: 'Encrypted direct card processing' }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`block p-8 border transition-all duration-500 cursor-pointer group/item ${
                      paymentMethod === method.id 
                        ? 'bg-accent/5 border-accent shadow-[0_10px_30px_-10px_rgba(201,169,110,0.2)]' 
                        : 'bg-transparent border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <input 
                            type="radio" 
                            className="hidden" 
                            name="paymentMethod" 
                            value={method.id} 
                            checked={paymentMethod === method.id} 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                          />
                          {/* Custom Radio Ring */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 ${
                            paymentMethod === method.id ? 'border-accent' : 'border-white/20'
                          }`}>
                            {paymentMethod === method.id && (
                              <motion.div 
                                layoutId="active-radio"
                                className="w-2 h-2 bg-accent rounded-full"
                              />
                            )}
                          </div>
                          <span className={`text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${
                            paymentMethod === method.id ? 'text-accent' : 'text-text-primary'
                          }`}>
                            {method.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted tracking-widest pl-9 uppercase opacity-60">
                          {method.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  className="w-full h-18 bg-accent text-base-black text-[11px] font-bold uppercase tracking-[0.4em] group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                  <span className="relative z-10">Establish Portal</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-boutique" />
                </button>
              </div>
            </form>

            <p className="mt-12 text-[9px] text-text-muted/30 uppercase tracking-[0.3em] italic">
              Encrypted 256-bit Secure Transaction Layer
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
