import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetOrdersQuery } from '../../features/orders/orderApiSlice.js';
import { Loader } from '../../components/ui/Loader.jsx';
import { Message } from '../../components/ui/Message.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination.jsx';

export const AdminOrderList = () => {
    const { searchQuery } = useOutletContext();
    const [pageNumber, setPageNumber] = useState(1);
    
    const { data, isLoading, error } = useGetOrdersQuery({ keyword: searchQuery, pageNumber });

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;
    if (error) return <Message variant="danger">{error?.data?.message || 'Failed to fetch orders'}</Message>;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <div className="mb-4"></div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Paid</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Delivered</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.orders?.map((order) => (
                                <motion.tr 
                                    key={order._id}
                                    whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                                    className="transition-colors group"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="font-mono text-xs font-bold text-secondary bg-secondary/5 px-2 py-1 rounded">
                                            {order.orderId || `#${order._id.substring(18).toUpperCase()}`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900">{order.user?.name || 'Deleted User'}</p>
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">{order.user?.email}</p>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-900">
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {order.isPaid ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                                <CheckCircle2 size={14} /> {order.paidAt.substring(0, 10)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-tighter">
                                                <XCircle size={14} /> Pending
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {order.isDelivered ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                                <CheckCircle2 size={14} /> {order.deliveredAt.substring(0, 10)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-tighter">
                                                <XCircle size={14} /> Not Shipped
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <Link to={`/order/${order._id}`}>
                                            <Button variant="ghost" size="sm" className="font-bold text-secondary hover:bg-secondary/5 gap-1.5">
                                                <Eye size={16} /> Details
                                            </Button>
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                            {data.orders?.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-12 text-center">
                                       <p className="text-gray-400 font-medium">
                                          {searchQuery ? `No orders matching "${searchQuery}"` : 'No orders found in the system.'}
                                       </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                   page={data.page} 
                   pages={data.pages} 
                   onPageChange={(page) => setPageNumber(page)} 
                />
            </div>
        </motion.div>
    );
};
