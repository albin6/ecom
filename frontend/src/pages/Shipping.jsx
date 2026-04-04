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

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <>
      <CheckoutTimer />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-sm border mt-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Shipping</h2>
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <Input placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <Input placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <Input placeholder="Enter postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <Input placeholder="Enter country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full">Continue to Payment</Button>
      </form>
    </motion.div>
    </>
  );
};
