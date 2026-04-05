import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../features/orders/orderApiSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { useLogoutMutation } from '../features/auth/userApiSlice.js';
import { logout } from '../features/auth/authSlice.js';
import { motion } from 'framer-motion';

export const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: ordersData, isLoading, error } = useGetMyOrdersQuery(undefined, { skip: !userInfo });
  const orders = ordersData || [];
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo, navigate]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-20 px-8 space-y-20">
      <header className="border-b border-white/5 pb-12">
        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-3 italic opacity-80">Member Dashboard</p>
        <h1 className="font-display text-6xl tracking-tight text-text-primary">Client Portrait</h1>
        <div className="flex items-center gap-4 mt-6">
            <span className="h-px w-12 bg-accent opacity-30" />
            <p className="text-text-muted text-[10px] uppercase tracking-[0.3em] font-bold">Personal Profile • {userInfo?.name?.split(' ')[0]}</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Profile Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:w-1/3"
        >
          <div className="glass-panel p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-1000">
                <div className="text-8xl font-display italic">H</div>
            </div>
            
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-12 flex items-center gap-3">
                <div className="w-1 h-4 bg-accent" />
                Credentials
            </h3>
            
            <form className="space-y-12">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@address.com" />
              </div>
              
              <Button variant="primary" className="w-full h-14 text-[10px] tracking-[0.3em] font-black shadow-gold-glow mt-4">
                Update Profile
              </Button>
              
              <div className="pt-12 border-t border-white/5 space-y-6">
                {userInfo && userInfo.role === 'admin' && (
                  <Link to="/admin" className="block">
                    <Button variant="ghost" className="w-full h-12 text-[10px] tracking-[0.2em] border border-white/5 hover:border-accent hover:text-accent font-bold">
                        Access The Atelier
                    </Button>
                  </Link>
                )}
                <button 
                  type="button"
                  className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-400 transition-all py-4 italic border border-dashed border-white/5 hover:border-red-900/30" 
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Temporal History (Orders) Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:w-2/3 space-y-10"
        >
          <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-1">Order History</h3>
                 <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Your collection history</p>
            </div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-surface/40 px-4 py-1 border border-white/5 shadow-gold-glow/5">
              {orders.length} Orders
            </span>
          </div>

          {isLoading ? (
            <div className="h-96 flex items-center justify-center bg-surface/20 border border-white/5 animate-pulse">
              <Loader />
            </div>
          ) : error ? (
            <Message variant="danger">{error?.data?.message || 'History Retrieval Failure'}</Message>
          ) : orders.length === 0 ? (
            <div className="glass-panel py-32 px-10 text-center border-dashed border-white/10 group">
              <p className="text-text-muted text-sm italic italic-editorial uppercase tracking-widest opacity-60">No previous orders found in our records.</p>
              <Link to="/" className="inline-block mt-10">
                 <Button variant="primary" className="h-12 px-10 text-[9px] font-black tracking-[0.3em] shadow-gold-glow">
                    Explore Collection
                 </Button>
              </Link>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Reference</th>
                      <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Order Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Total Price</th>
                      <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-accent uppercase tracking-[0.2em]">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/[0.01] transition-all group">
                        <td className="px-8 py-6">
                            <span className="font-mono text-[11px] text-text-muted bg-surface/40 px-2 py-1 border border-white/5 tracking-wider uppercase">
                                #{order.orderId || order._id.substring(18).toUpperCase()}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).replace(/ /g, ' • ')}
                        </td>
                        <td className="px-8 py-6 text-sm text-text-primary font-black">
                          ${order.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          {order.isPaid ? (
                            <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                                <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                Validated
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-500/60 font-black text-[9px] uppercase tracking-widest">
                                <div className="w-1 h-1 bg-red-500 rounded-full opacity-50" />
                                Pending
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link to={`/order/${order._id}`}>
                            <button className="text-[10px] font-black text-accent hover:text-white transition-all uppercase tracking-[0.2em] relative overflow-hidden group/btn">
                                <span className="relative z-10">View Order</span>
                                <div className="absolute bottom-0 left-0 w-full h-px bg-accent scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-500" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
