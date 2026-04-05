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
    <div className="max-w-7xl mx-auto py-16 px-6">
      <header className="mb-16 border-b border-white/5 pb-8">
        <h1 className="font-display text-5xl mb-4 tracking-tight">Archival Record</h1>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em] font-bold">Personal Dossier — v.1.0.4</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Profile Management Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:w-1/3"
        >
          <div className="glass-panel p-10 border border-white/10">
            <h3 className="font-display text-2xl mb-10 tracking-tight">Credentials</h3>
            
            <form className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Legal Identity</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Digital Alias</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent" />
              </div>
              
              <Button className="w-full h-12 text-[10px] tracking-[0.2em] mt-4">Update Archives</Button>
              
              <div className="pt-10 border-t border-white/5 space-y-4">
                {userInfo && userInfo.role === 'admin' && (
                  <Link to="/admin" className="block">
                    <Button variant="outline" className="w-full h-12 text-[10px] tracking-[0.2em]">Management Studio</Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-[10px] tracking-[0.2em] text-red-400 hover:text-red-300" 
                  onClick={logoutHandler}
                >
                  Terminate Session
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Temporal History (Orders) Section */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:w-2/3"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-display text-2xl tracking-tight">Temporal History</h3>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface/40 px-3 py-1 rounded-full border border-white/5">
              {orders.length} Records
            </span>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-surface/20 rounded-2xl border border-white/5">
              <Loader />
            </div>
          ) : error ? (
            <Message variant="danger">{error?.data?.message || 'Archival Retrieval Failure'}</Message>
          ) : orders.length === 0 ? (
            <div className="glass-panel p-20 text-center border-dashed border-white/10">
              <p className="text-text-muted text-sm italic italic-editorial">No historical acquisitions found in this archive.</p>
              <Link to="/" className="inline-block mt-6 text-accent text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                Begin Collection
              </Link>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-5 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Reference</th>
                      <th className="px-8 py-5 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Timestamp</th>
                      <th className="px-8 py-5 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Value</th>
                      <th className="px-8 py-5 text-left text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Settlement</th>
                      <th className="px-8 py-5 text-right text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Manifest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="font-mono text-xs text-text-primary tracking-wider uppercase">
                            #{order.orderId || order._id.substring(18).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xs text-text-muted">
                          {order.createdAt.substring(0, 10).replace(/-/g, '.')}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xs text-text-primary font-bold">
                          ${order.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {order.isPaid ? (
                            <span className="text-[9px] font-black bg-emerald-900/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30 uppercase tracking-widest">Authorized</span>
                          ) : (
                            <span className="text-[9px] font-black bg-red-900/10 text-red-400 px-2 py-0.5 rounded border border-red-900/20 uppercase tracking-widest">Pending</span>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <Link to={`/order/${order._id}`}>
                            <button className="text-[10px] font-bold text-accent hover:text-white transition-all uppercase tracking-widest group-hover:translate-x-1 duration-300">
                              Review Manifest →
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
