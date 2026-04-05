import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../components/ui/Button.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { useCreateOrderMutation } from '../features/orders/orderApiSlice.js';
import { clearCartItems } from '../features/cart/cartSlice.js';
import { motion } from 'framer-motion';
import { CheckoutTimer } from '../components/checkout/CheckoutTimer.jsx';
import { useGetCheckoutStatusQuery } from '../features/checkout/checkoutApiSlice.js';

export const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const { data: status, error: statusError } = useGetCheckoutStatusQuery();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    } else if (statusError) {
      navigate('/cart?message=Session expired');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate, statusError]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/profile`); // Redirect to user profile (Order History) on success, simulating order success view.
    } catch (err) {
      console.error(err);
    }
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
        <CheckoutSteps step1 step2 step3 step4 />

        <div className="flex flex-col lg:flex-row gap-20 items-start mt-12">
          {/* Left Column: Final Review Details (2/3) */}
          <div className="lg:w-[60%] space-y-20">
            
            {/* Delivery Archive Section */}
            <section className="space-y-10 group">
              <header className="flex items-center gap-6">
                <span className="text-[10px] tracking-[0.4em] font-bold text-accent uppercase">01 / Delivery Archive</span>
                <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-accent/20 transition-all duration-700" />
              </header>
              <div className="pl-10 space-y-4">
                <h3 className="text-3xl font-serif italic">Shipping Destination</h3>
                <p className="text-text-muted tracking-widest text-[11px] uppercase leading-loose border-l border-accent/20 pl-6 py-2">
                  {cart.shippingAddress.address}<br />
                  {cart.shippingAddress.city} {cart.shippingAddress.postalCode}<br />
                  {cart.shippingAddress.country}
                </p>
                <Link to="/shipping" className="text-[9px] tracking-[0.3em] font-bold text-accent uppercase hover:underline underline-offset-8">
                  Modify Destination
                </Link>
              </div>
            </section>

            {/* Financial Layer Section */}
            <section className="space-y-10 group">
              <header className="flex items-center gap-6">
                <span className="text-[10px] tracking-[0.4em] font-bold text-accent uppercase">02 / Financial Layer</span>
                <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-accent/20 transition-all duration-700" />
              </header>
              <div className="pl-10 space-y-4">
                <h3 className="text-3xl font-serif italic">Verified Method</h3>
                <p className="text-text-muted tracking-widest text-[11px] uppercase leading-loose border-l border-accent/20 pl-6 py-2">
                  {cart.paymentMethod} Authorization System
                </p>
                <Link to="/payment" className="text-[9px] tracking-[0.3em] font-bold text-accent uppercase hover:underline underline-offset-8">
                  Adjust Payment
                </Link>
              </div>
            </section>

            {/* The Selection Section */}
            <section className="space-y-10 group">
              <header className="flex items-center gap-6">
                <span className="text-[10px] tracking-[0.4em] font-bold text-accent uppercase">03 / The Selection</span>
                <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-accent/20 transition-all duration-700" />
              </header>
              <div className="pl-10">
                {cart.cartItems.length === 0 ? (
                  <Message>Your archival selection is currently vacant.</Message>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {cart.cartItems.map((item, index) => (
                      <li key={index} className="py-8 flex gap-10 items-center group/item">
                        <div className="h-24 w-16 bg-surface overflow-hidden relative shadow-lg shadow-black/40">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale-[0.5] group-hover/item:grayscale-0 transition-all duration-700" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <Link to={`/product/${item.product}`} className="font-serif text-xl italic hover:text-accent transition-colors block leading-tight">
                            {item.name}
                          </Link>
                          <div className="flex gap-6 text-[9px] items-center tracking-[0.2em] font-bold uppercase text-text-muted opacity-40">
                            <span>Palette: {item.color}</span>
                            <span>Measurement: {item.size}</span>
                          </div>
                        </div>
                        <p className="text-accent font-mono text-xs whitespace-nowrap bg-accent/5 px-4 py-2 border border-accent/10">
                          {item.qty} × ${item.price.toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Final Procurement Summary (1/3) */}
          <div className="lg:w-[40%]">
            <div className="sticky top-32">
              <div className="bg-surface/50 backdrop-blur-3xl border border-white/5 p-12 space-y-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                
                <h2 className="text-[10px] tracking-[0.4em] font-bold text-accent uppercase pb-8 border-b border-white/5">Procurement Summary</h2>
                
                <ul className="space-y-6 text-[11px] tracking-widest font-bold uppercase">
                  <li className="flex justify-between">
                    <span className="text-text-muted">Total Initial Pieces</span>
                    <span className="font-mono text-sm">${cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Archival Transport</span>
                    <span className="font-serif italic text-success/60 lowercase tracking-normal">Complimentary</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-muted">Transaction Tax</span>
                    <span className="font-mono text-sm">${(cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) * 0.15).toFixed(2)}</span>
                  </li>
                  
                  <li className="pt-10 border-t border-white/5 flex items-end justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-text-muted/40 uppercase tracking-[0.3em]">Final Secure Amount</span>
                      <div className="text-4xl font-mono text-accent leading-none">
                        ${(
                          cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) +
                          cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) * 0.15
                        ).toFixed(2)}
                      </div>
                    </div>
                  </li>
                </ul>
                
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-error/5 border border-error/20 text-error text-[10px] items-center text-center tracking-widest font-bold uppercase">
                    {error?.data?.message || 'Archival Verification Failed'}
                  </motion.div>
                )}
                
                <button 
                  className="w-full h-20 bg-accent text-base-black text-[12px] font-bold uppercase tracking-[0.5em] group relative overflow-hidden transition-all shadow-2xl active:scale-95 disabled:opacity-30" 
                  disabled={cart.cartItems.length === 0 || isLoading}
                  onClick={placeOrderHandler}
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {isLoading ? 'Processing Transfer...' : 'Initiate Procurement'}
                    {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-4 transition-transform duration-700" />}
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-boutique" />
                </button>

                <p className="pt-6 text-center text-[9px] text-text-muted/30 uppercase tracking-[0.2em] italic">
                  By initiating, you agree to the Hannvis Archival Procurement Terms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
