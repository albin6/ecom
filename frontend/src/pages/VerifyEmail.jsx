import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useVerifyEmailMutation } from '../features/auth/userApiSlice.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Message } from '../components/ui/Message.jsx';
import { motion } from 'framer-motion';

export const VerifyEmail = () => {
  const { token } = useParams();
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);
  
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    
    const verifyToken = async () => {
      try {
        await verifyEmail(token).unwrap();
        setStatus('success');
        setMessage('Your email has been successfully verified! You now have full access.');
        if (userInfo) {
          dispatch(setCredentials({ ...userInfo, isVerified: true }));
        }
      } catch (err) {
        setStatus('error');
        setMessage(err?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    verifyToken();
  }, [token, verifyEmail, userInfo, dispatch]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-8 bg-white border rounded-xl shadow-lg text-center"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Identity Verification</h2>
      
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center space-y-4 my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF]"></div>
          <p className="text-gray-600 font-medium">Authenticating your identity...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <Message variant="success" className="mb-6">{message}</Message>
          <Link to="/">
            <Button className="w-full">Enter the Atelier</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div>
          <Message variant="danger" className="mb-6">{message}</Message>
          <p className="text-gray-600 mb-6 text-sm">
            If your link has expired, you can request a new one from the yellow banner above.
          </p>
          <Link to="/">
            <Button variant="secondary" className="w-full">Back to Home</Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
};
