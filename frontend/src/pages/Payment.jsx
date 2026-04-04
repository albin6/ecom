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
    <>
      <CheckoutTimer />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-sm border mt-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Payment Method</h2>
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              className="form-radio h-5 w-5 text-secondary" 
              name="paymentMethod" 
              value="PayPal" 
              checked={paymentMethod === 'PayPal'} 
              onChange={(e) => setPaymentMethod(e.target.value)} 
            />
            <span className="text-gray-900 font-medium pb-0.5">PayPal or Credit Card</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              className="form-radio h-5 w-5 text-secondary" 
              name="paymentMethod" 
              value="Stripe" 
              checked={paymentMethod === 'Stripe'} 
              onChange={(e) => setPaymentMethod(e.target.value)} 
            />
            <span className="text-gray-900 font-medium pb-0.5">Stripe</span>
          </label>
        </div>
        <Button type="submit" className="w-full mt-6">Continue to Review</Button>
      </form>
    </motion.div>
    </>
  );
};
