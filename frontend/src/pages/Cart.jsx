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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="py-8">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
        <ShoppingBag className="text-secondary" />
        Shopping Cart
        {cartItems.length > 0 && (
          <span className="text-base font-semibold text-gray-400 mt-1">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
        )}
      </h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/">
            <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Items List */}
          <div className="lg:w-2/3 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={`${item.product}-${item.color}-${item.size}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="p-5 flex items-center gap-5"
                  >
                    <Link to={`/product/${item.product}`} className="flex-shrink-0">
                      <div className="h-24 w-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product}`}>
                        <h3 className="font-bold text-gray-900 truncate text-base hover:text-secondary transition-colors">{item.name}</h3>
                      </Link>
                      <div className="flex flex-wrap gap-3 items-center mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Color</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg font-bold border border-gray-200">{item.color}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Size</span>
                          <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-lg font-bold border border-secondary/10 uppercase">{item.size}</span>
                        </div>
                        {item.adjusted && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            Adjusted to Stock
                          </span>
                        )}
                        {item.stock <= 3 && item.stock > 0 && (
                          <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 italic">
                            Only {item.stock} left
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-black text-gray-900 mt-2">${(item.price * item.qty).toFixed(2)}</p>
                      {item.qty > 1 && <p className="text-xs text-gray-400 font-medium">${item.price.toFixed(2)} each</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => item.qty > 1 ? addToCartHandler(item, item.qty - 1) : removeFromCartHandler(item)}
                          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold text-base"
                        >−</button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCartHandler(item, Math.min(item.stock || 10, 10, item.qty + 1))}
                          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.qty >= Math.min(item.stock || 10, 10)}
                        >+</button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeFromCartHandler(item)}
                        className="h-9 w-9 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-6 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-black text-gray-900 text-base">Total</span>
                  <span className="font-black text-gray-900 text-xl">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full text-base rounded-xl"
                size="lg"
                onClick={checkoutHandler}
              >
                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Link to="/" className="block text-center mt-4 text-sm text-secondary font-semibold hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
