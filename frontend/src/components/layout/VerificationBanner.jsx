import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useResendVerificationMutation } from '../../features/auth/userApiSlice.js';

export const VerificationBanner = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const [message, setMessage] = useState('');

  if (!userInfo || userInfo.isVerified) return null;

  const handleResend = async () => {
    try {
      await resendVerification({ email: userInfo.email }).unwrap();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to resend. Please try again later.');
    }
  };

  return (
    <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 px-4 py-3 sm:px-6 lg:px-8 text-sm flex justify-between items-center w-full">
      <div>
        <span className="font-semibold mr-2">Action Required:</span>
        Please verify your email address to unlock all features.
      </div>
      <div className="flex items-center gap-4">
        {message && <span className="text-emerald-700 italic">{message}</span>}
        <button 
          onClick={handleResend} 
          disabled={isLoading}
          className="text-yellow-900 underline hover:text-yellow-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? 'Sending...' : 'Resend Email'}
        </button>
      </div>
    </div>
  );
};
