import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertCircle, X } from 'lucide-react';
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
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-2"
      >
        <div className={`flex items-center gap-6 px-10 py-3 rounded-full shadow-[0_15px_40px_-5px_rgba(0,0,0,0.4)] border backdrop-blur-3xl transition-all duration-700 ${
          timeLeft < 60 
            ? 'bg-error/10 border-error/20 text-error' 
            : 'bg-surface/60 border-white/5 text-accent'
        }`}>
          <div className="flex items-center gap-3">
            <Timer className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'animate-pulse' : 'opacity-40'}`} strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.3em] font-bold uppercase">
              Reservation Expires: 
            </span>
            <span className="font-mono text-sm tracking-tighter tabular-nums bg-accent/5 px-3 py-1 rounded border border-accent/10">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
          
          <div className="w-[1px] h-4 bg-white/5 mx-2" />
          
          <button 
            onClick={cancelHandler}
            className="text-[9px] uppercase font-bold tracking-[0.3em] text-text-muted hover:text-error transition-all duration-300 group flex items-center gap-2"
          >
            Release Reservation
            <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
