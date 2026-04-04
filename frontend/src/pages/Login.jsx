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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-secondary to-indigo-800 p-10 text-white">
          <div className="text-2xl font-black tracking-tight">Hannvis</div>
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">Welcome back.</h2>
            <p className="text-indigo-200 text-lg leading-relaxed">Sign in to continue your premium shopping experience.</p>
          </div>
          <div className="space-y-3">
            {['Free returns on all orders', 'Exclusive member discounts', 'Priority customer support'].map(t => (
              <div key={t} className="flex items-center gap-2 text-indigo-200 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right auth form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 md:p-12 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 text-sm mb-8">
            New here?{' '}
            <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-secondary font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          {error && <Message variant="danger" className="mb-5">{error?.data?.message || 'Login failed'}</Message>}

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full rounded-xl mt-2" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
