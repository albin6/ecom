import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    Users, 
    ShoppingBag, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    Package, 
    AlertCircle, 
    CheckCircle2, 
    Clock 
} from 'lucide-react';

export const Admin = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const stats = [
    { label: 'Atelier Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Active Clients', value: '+2,350', change: '+180.1%', icon: Users, color: 'text-text-primary', bg: 'bg-white/5' },
    { label: 'Order Volume', value: '12,234', change: '+19%', icon: ShoppingBag, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Collection Count', value: '573', change: '+201', icon: Package, color: 'text-text-primary', bg: 'bg-white/5' },
  ];

  const recentOrders = [
    { id: '#ORD-E92A1B8C', user: 'Alex Rivera', status: 'Delivered', amount: '$120.50', time: '2 mins ago' },
    { id: '#ORD-F72D3E42', user: 'Sarah Chen', status: 'Pending', amount: '$89.00', time: '15 mins ago' },
    { id: '#ORD-B1C2D3A4', user: 'Mike Ross', status: 'Shipped', amount: '$245.99', time: '1 hour ago' },
    { id: '#ORD-D4E5F6G7', user: 'Emma Wilson', status: 'Processing', amount: '$54.20', time: '3 hours ago' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
      {/* Welcome Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="glass-panel p-12 border border-white/10 shadow-3xl flex-grow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-[1.6] transition-transform duration-1000 text-accent">
                  <TrendingUp size={120} />
              </div>
              <div className="space-y-4 relative">
                  <p className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] italic opacity-80">Studio Infrastructure • v4.2</p>
                  <h1 className="text-5xl font-display text-text-primary tracking-tight">Bonjour, {userInfo?.name?.split(' ')[0]}</h1>
                  <div className="flex items-center gap-4 pt-4">
                      <div className="h-px w-8 bg-accent" />
                      <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em]">
                          System metrics indicate a <span className="text-accent font-black">12.4% yield increase</span> in the current cycle.
                      </p>
                  </div>
              </div>
          </div>
          <div className="flex gap-4 shrink-0">
              <Link to="/admin/product/new" className="group">
                <button className="h-16 px-10 bg-accent text-white rounded-sm font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-accent/90 transition-all shadow-gold-glow">
                    New Collection Piece <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </Link>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
            <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="glass-panel p-8 border border-white/5 shadow-2xl hover:border-accent/30 transition-all duration-500 group"
            >
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-sm border border-white/5 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-700`}>
                        <stat.icon size={20} />
                    </div>
                    <span className="text-[9px] font-black text-accent bg-accent/5 px-3 py-1 border border-accent/20 tracking-widest uppercase">
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 italic-editorial">{stat.label}</h3>
                <p className="text-3xl font-display text-text-primary tracking-tighter">{stat.value}</p>
            </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Recent Orders Table */}
          <div className="lg:col-span-8 glass-panel border border-white/5 shadow-3xl overflow-hidden">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                       <div className="w-1 h-5 bg-accent" />
                       <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Order Fulfillment</h3>
                  </div>
                  <Link to="/admin/orderlist" className="text-accent text-[9px] font-black uppercase tracking-[0.3em] hover:text-white transition-all border-b border-accent/30">View All Records</Link>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-white/[0.02]">
                              <th className="px-10 py-5 text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Reference</th>
                              <th className="px-10 py-5 text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Client</th>
                              <th className="px-10 py-5 text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                              <th className="px-10 py-5 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Amount</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {recentOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-white/[0.01] transition-all group">
                                  <td className="px-10 py-6">
                                      <span className="font-mono text-[11px] text-accent tracking-widest uppercase">{order.id}</span>
                                  </td>
                                  <td className="px-10 py-6">
                                      <p className="text-[11px] font-black text-text-primary uppercase tracking-[0.1em]">{order.user}</p>
                                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-40 mt-1">{order.time}</p>
                                  </td>
                                  <td className="px-10 py-6">
                                      <div className="flex items-center gap-2">
                                          <div className={`w-1 h-1 rounded-full ${
                                              order.status === 'Delivered' ? 'bg-accent shadow-[0_0_8px_rgba(201,169,110,0.8)]' :
                                              order.status === 'Pending' ? 'bg-amber-500/50' : 'bg-white/20'
                                          }`} />
                                          <span className="text-[9px] font-black text-text-primary uppercase tracking-widest opacity-80">
                                              {order.status}
                                          </span>
                                      </div>
                                  </td>
                                  <td className="px-10 py-6 text-sm font-bold text-text-primary text-right tracking-tighter">{order.amount}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Activity/Alerts Sidebar */}
          <div className="lg:col-span-4 space-y-8">
              <div className="glass-panel p-10 border border-white/5 shadow-2xl">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                      <div className="w-1 h-4 bg-red-900" />
                      Critical Alerts
                  </h3>
                  <div className="space-y-6">
                      <div className="flex gap-5 p-6 bg-red-900/10 border border-red-900/20 text-red-400 group">
                          <AlertCircle size={20} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Stock Critical</p>
                              <p className="text-[11px] font-bold mt-2 leading-relaxed opacity-80">Slim Fit Denim (M) is currently depleted.</p>
                          </div>
                      </div>
                      <div className="flex gap-5 p-6 bg-accent/5 border border-white/5 text-accent group">
                          <Clock size={20} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Procurement Warning</p>
                              <p className="text-[11px] font-bold mt-2 leading-relaxed opacity-80 text-text-muted">4 priority assets are below reorder threshold.</p>
                          </div>
                      </div>
                      <div className="flex gap-5 p-6 bg-white/[0.02] border border-white/5 text-text-muted group">
                          <CheckCircle2 size={20} className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">System Sync Protocol</p>
                              <p className="text-[11px] font-bold mt-2 leading-relaxed opacity-60 italic-editorial">Winter collection integration successfully committed.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-accent/10 p-10 border border-accent/20 rounded-sm relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                       <DollarSign size={160} />
                  </div>
                  <h4 className="text-lg font-display text-text-primary tracking-tight mb-8 relative">Management Support & Documentation</h4>
                  <button className="w-full h-12 bg-white/5 hover:bg-accent hover:text-white border border-white/10 rounded-sm text-[9px] font-black uppercase tracking-[0.3em] transition-all relative z-10">
                      Access Infrastructure Guide
                  </button>
              </div>
          </div>
      </div>
    </motion.div>
  );
};
