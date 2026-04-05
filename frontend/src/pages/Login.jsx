import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../features/auth/userApiSlice.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Message } from '../components/ui/Message.jsx';
import { motion } from 'framer-motion';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const [login, { isLoading, error }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, redirect, userInfo]);

  // --- Original business logic preserved ---
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res.user, token: res.accessToken }));
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Editorial Background Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110 opacity-40 bg-[url('/images/auth-bg.png')]"
        style={{ filter: 'grayscale(0.5) contrast(1.1)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-base-black/80 via-transparent to-base-black" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="glass-panel p-10 md:p-14 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          <header className="mb-12 text-center">
            <h1 className="font-display text-4xl mb-3 tracking-tight">Sign In</h1>
            <p className="text-text-muted text-xs uppercase tracking-[0.2em] font-bold">Access your account</p>
          </header>

          {error && (
            <Message variant="danger" className="mb-8">
              {error?.data?.message || 'Verification Error'}
            </Message>
          )}

          <form onSubmit={submitHandler} className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-transparent"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 mt-6 text-xs tracking-[0.2em]" 
              size="lg" 
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-text-muted text-[11px]">
              No active identity?{' '}
              <Link 
                to={redirect ? `/register?redirect=${redirect}` : '/register'} 
                className="text-accent font-bold hover:text-white transition-colors ml-1 uppercase tracking-wider"
              >
                Establish Access
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};
