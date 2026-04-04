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
    <>
      <CheckoutTimer />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
          <p className="text-gray-700">
            <strong>Address: </strong>
            {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
          <p className="text-gray-700"><strong>Method: </strong>{cart.paymentMethod}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          {cart.cartItems.length === 0 ? (
            <Message>Your cart is empty</Message>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cart.cartItems.map((item, index) => (
                <li key={index} className="py-4 flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover border" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product}`} className="font-bold text-gray-900 hover:text-secondary truncate block">{item.name}</Link>
                    <div className="flex gap-3 text-[10px] items-center mt-1">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Color: <span className="text-gray-900">{item.color}</span></span>
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Size: <span className="text-gray-900">{item.size}</span></span>
                    </div>
                  </div>
                  <p className="text-gray-900 shrink-0 font-black text-sm whitespace-nowrap">{item.qty} × ${item.price.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          <ul className="space-y-3 text-gray-700 divide-y divide-gray-200">
            <li className="flex justify-between py-2">
              <span>Items</span>
              <span>${cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Shipping</span>
              <span>$10.00</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Tax</span>
              <span>${(cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) * 0.15).toFixed(2)}</span>
            </li>
            <li className="flex justify-between py-2 font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span className="text-secondary">${(
                cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) + 10 +
                cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) * 0.15
              ).toFixed(2)}</span>
            </li>
          </ul>
          
          {error && <Message variant="danger" className="mt-4">{error?.data?.message || 'Error occurred during checkout'}</Message>}
          
          <Button 
            className="w-full mt-6" 
            size="lg"
            disabled={cart.cartItems.length === 0 || isLoading}
            isLoading={isLoading}
            onClick={placeOrderHandler}
          >
            Place Order
          </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
};
