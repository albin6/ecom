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
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Users', value: '+2,350', change: '+180.1%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Orders', value: '12,234', change: '+19%', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Products', value: '573', change: '+201', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentOrders = [
    { id: '#ORD-E92A1B8C', user: 'Alex Rivera', status: 'Delivered', amount: '$120.50', time: '2 mins ago' },
    { id: '#ORD-F72D3E42', user: 'Sarah Chen', status: 'Pending', amount: '$89.00', time: '15 mins ago' },
    { id: '#ORD-B1C2D3A4', user: 'Mike Ross', status: 'Shipped', amount: '$245.99', time: '1 hour ago' },
    { id: '#ORD-D4E5F6G7', user: 'Emma Wilson', status: 'Processing', amount: '$54.20', time: '3 hours ago' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex-grow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={120} />
              </div>
              <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 italic">System Overview</p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Good morning, {userInfo?.name?.split(' ')[0]}!</h1>
              <p className="text-gray-400 mt-2 font-medium">Your store has seen a <span className="text-emerald-500 font-bold">12% growth</span> in the last 24 hours.</p>
          </div>
          <div className="flex gap-4">
              <Link to="/admin/products/new">
                <button className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                    Quick Add <ArrowUpRight size={18} />
                </button>
              </Link>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
            <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={22} />
                    </div>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</h3>
                <p className="text-2xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</p>
            </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Fulfillment</h3>
                  <Link to="/admin/orderlist" className="text-secondary text-sm font-bold hover:underline">View All Orders</Link>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-gray-50/50">
                              <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {recentOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                  <td className="px-8 py-5 text-xs font-bold text-secondary font-mono">{order.id}</td>
                                  <td className="px-8 py-5">
                                      <p className="text-sm font-bold text-gray-900">{order.user}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{order.time}</p>
                                  </td>
                                  <td className="px-8 py-5">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                          order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                          'bg-indigo-50 text-indigo-600'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </td>
                                  <td className="px-8 py-5 text-sm font-black text-gray-900 text-right">{order.amount}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Activity/Alerts Sidebar */}
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Inventory Alerts</h3>
                  <div className="space-y-4">
                      <div className="flex gap-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-700">
                          <AlertCircle size={24} className="shrink-0" />
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest">Stock Critical</p>
                              <p className="text-sm font-medium mt-1">Slim Fit Denim (M) is out of stock.</p>
                          </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
                          <Clock size={24} className="shrink-0" />
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest">Reorder Soon</p>
                              <p className="text-sm font-medium mt-1">4 items are below threshold.</p>
                          </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700">
                          <CheckCircle2 size={24} className="shrink-0" />
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest">Batch Complete</p>
                              <p className="text-sm font-medium mt-1">Winter collection sync successful.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 flex flex-col justify-between min-h-[200px]">
                  <h4 className="text-lg font-black tracking-tight leading-tight">Need help with managing the platform?</h4>
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                      Documentation
                  </button>
              </div>
          </div>
      </div>
    </motion.div>
  );
};
