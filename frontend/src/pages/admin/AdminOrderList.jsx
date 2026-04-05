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
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h3 className="font-display text-2xl tracking-tight">Fulfillment Ledger</h3>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2">Fulfillment Records: {data?.orders?.length || 0}</p>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Client Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Order Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Total Price</th>
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Payment Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Delivery Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-accent uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.orders?.map((order) => (
                                <motion.tr 
                                    key={order._id}
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.01)" }}
                                    className="transition-all group"
                                >
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-[11px] text-text-muted bg-surface/40 px-2 py-1 border border-white/5 tracking-wider uppercase">
                                            {order.orderId || `#${order._id.substring(18).toUpperCase()}`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-text-primary tracking-tight">{order.user?.name || 'Anonymous'}</p>
                                        <p className="text-[9px] font-mono text-text-muted uppercase tracking-tighter mt-1 opacity-60 italic">{order.user?.email}</p>
                                    </td>
                                    <td className="px-8 py-6 text-[11px] text-text-muted font-medium uppercase tracking-widest">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 font-bold text-text-primary">
                                        ${order.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        {order.isPaid ? (
                                            <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> Paid/{order.paidAt.substring(0, 10)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-400 font-black text-[9px] uppercase tracking-widest opacity-60">
                                                <XCircle size={12} /> Pending
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {order.isDelivered ? (
                                            <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> Dispatched/{order.deliveredAt.substring(0, 10)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-widest opacity-80">
                                                <XCircle size={12} /> In Transit
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link to={`/order/${order._id}`}>
                                            <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] uppercase tracking-[0.2em] border border-white/5 hover:border-accent hover:text-accent font-bold">
                                                <Eye size={14} className="mr-2" /> View Detail
                                            </Button>
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                            {data.orders?.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                       <p className="text-text-muted text-xs italic italic-editorial uppercase tracking-widest">
                                          {searchQuery ? `No orders matching "${searchQuery}" in ledger.` : 'Fulfillment ledger is empty.'}
                                       </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pt-8 pb-4 flex justify-center">
                    <Pagination 
                       page={data.page} 
                       pages={data.pages} 
                       onPageChange={(page) => setPageNumber(page)} 
                    />
                </div>
            </div>
        </motion.div>
    );
};
