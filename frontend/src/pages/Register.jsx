import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../features/auth/userApiSlice.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Message } from '../components/ui/Message.jsx';
import { motion } from 'framer-motion';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const [register, { isLoading, error }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  // --- Original business logic preserved ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res.user, token: res.accessToken }));
      navigate(redirect);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Editorial Background Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110 opacity-30 bg-[url('/images/auth-bg.png')]"
        style={{ filter: 'grayscale(0.6) brightness(0.8)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-base-black/90 via-transparent to-base-black" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="glass-panel p-10 md:p-14 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)]">
          <header className="mb-12 text-center">
            <h1 className="font-display text-4xl mb-3 tracking-tight">Create Account</h1>
            <p className="text-text-muted text-xs uppercase tracking-[0.2em] font-bold">Join the atelier</p>
          </header>

          {message && <Message variant="danger" className="mb-6">{message}</Message>}
          {error && <Message variant="danger" className="mb-6">{error?.data?.message || 'Registration Error'}</Message>}

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-transparent"
              />
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Confirm</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="bg-transparent"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 mt-6 text-xs tracking-[0.2em]" 
              size="lg" 
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <footer className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-text-muted text-[11px]">
              Already established?{' '}
              <Link 
                to={redirect ? `/login?redirect=${redirect}` : '/login'} 
                className="text-accent font-bold hover:text-white transition-colors ml-1 uppercase tracking-wider"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};
