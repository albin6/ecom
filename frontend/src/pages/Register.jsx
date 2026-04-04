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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-primary to-slate-700 p-10 text-white">
          <div className="text-2xl font-black tracking-tight">Hannvis</div>
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">Join the community.</h2>
            <p className="text-gray-300 text-lg leading-relaxed">Create your account and unlock exclusive access to our curated collections.</p>
          </div>
          <div className="space-y-3">
            {['Exclusive early access', 'Member-only discounts', 'Seamless order tracking'].map(t => (
              <div key={t} className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 md:p-12 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-black text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-500 text-sm mb-8">
            Already a member?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-secondary font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          {message && <Message variant="danger" className="mb-5">{message}</Message>}
          {error && <Message variant="danger" className="mb-5">{error?.data?.message || 'Registration failed'}</Message>}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <Input type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <Input type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full rounded-xl mt-2" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
