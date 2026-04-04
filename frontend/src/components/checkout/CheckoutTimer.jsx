import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertCircle } from 'lucide-react';
import { useGetCheckoutStatusQuery, useCancelCheckoutMutation } from '../../features/checkout/checkoutApiSlice.js';

export const CheckoutTimer = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const { data, error, isSuccess } = useGetCheckoutStatusQuery(undefined, {
    pollingInterval: 30000,
  });
  const [cancelCheckout] = useCancelCheckoutMutation();

  useEffect(() => {
    if (isSuccess && data?.active) {
      // Only set timeLeft if it's currently null (initial load) 
      // or if the server drift is more than 5 seconds
      if (timeLeft === null || Math.abs(timeLeft - data.expiresIn) > 5) {
        setTimeLeft(data.expiresIn);
      }
      setIsActive(true);
    } else if (error) {
      setIsActive(false);
    }
  }, [data, isSuccess, error, timeLeft]);

  useEffect(() => {
    if (!isActive || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsActive(false);
      alert('Your checkout session has expired. Inventory has been released.');
      navigate('/cart');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive, navigate]);

  if (!isActive || timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const cancelHandler = async () => {
    if (window.confirm('Are you sure you want to cancel your checkout? Your reservation will be released.')) {
      try {
        await cancelCheckout().unwrap();
        navigate('/cart');
      } catch (err) {
        console.error('Error canceling checkout:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2"
      >
        <div className={`flex items-center gap-3 px-6 py-2 rounded-full shadow-lg border backdrop-blur-md ${
          timeLeft < 60 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-white/90 border-gray-100 text-gray-700'
        }`}>
          <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-bold tracking-tight">
            Checkout expires in: <span className="font-mono">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </span>
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <button 
            onClick={cancelHandler}
            className="text-[10px] uppercase font-black tracking-widest hover:text-red-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
