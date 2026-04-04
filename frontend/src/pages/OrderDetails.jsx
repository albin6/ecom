import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useGetOrderDetailsQuery, useDeliverOrderMutation } from '../features/orders/orderApiSlice.js';
import { Loader } from '../components/ui/Loader.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Package, Truck, CreditCard, ChevronLeft } from 'lucide-react';

export const OrderDetails = () => {
    const { id: orderId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const { data: order, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId);
    const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

    const deliverHandler = async () => {
        try {
            await deliverOrder(orderId).unwrap();
            refetch();
            // toast.success('Order delivered');
        } catch (err) {
            console.error(err);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;
    if (error) return <Message variant="danger" className="mt-10 mx-auto max-w-4xl">{error?.data?.message || 'Failed to fetch order details'}</Message>;

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="py-10 max-w-6xl mx-auto px-4"
        >
            <div className="mb-8 flex items-center justify-between">
                <div>
                  <Link to="/profile" className="inline-flex items-center text-sm font-semibold text-secondary hover:underline gap-1 mb-2">
                      <ChevronLeft size={16} /> Back to My Orders
                  </Link>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Details</h1>
                  <p className="text-gray-500 text-sm mt-1">Order ID: <span className="font-mono text-secondary">{order.orderId || order._id}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? 'Paid' : 'Payment Pending'}
                    </span>
                    {order.isPaid && <p className="text-[10px] text-gray-400 font-medium">Paid on {new Date(order.paidAt).toLocaleDateString()}</p>}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Order Content */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Shipping Info */}
                    <motion.div variants={containerVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5 text-secondary"><Truck size={80} /></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck size={22} className="text-secondary" />
                            Shipping Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipient</p>
                                <p className="text-gray-900 font-semibold text-base">{order.user.name}</p>
                                <p className="text-gray-500">{order.user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</p>
                                <p className="text-gray-700 leading-relaxed">
                                    {order.shippingAddress.address}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                    {order.shippingAddress.country}
                                </p>
                            </div>
                        </div>
                        <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${order.isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${order.isDelivered ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <p className="text-sm font-bold">
                                {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Shipping in Progress'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Order Items */}
                    <motion.div variants={containerVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package size={22} className="text-secondary" />
                            Items Ordered
                        </h2>
                        <ul className="divide-y divide-gray-100">
                            {order.orderItems.map((item, index) => (
                                <li key={index} className="py-6 flex gap-6 items-center flex-wrap sm:flex-nowrap">
                                    <div className="h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 shadow-inner">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${item.product}`} className="text-lg font-bold text-gray-900 hover:text-secondary truncate transition-colors block">
                                            {item.name}
                                        </Link>
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color</span>
                                                <span className="text-sm font-bold text-gray-700">{item.color}</span>
                                            </div>
                                            <div className="flex flex-col border-l border-gray-100 pl-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Size</span>
                                                <span className="text-sm font-bold text-gray-700 uppercase">{item.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm text-gray-400 font-medium mb-1">{item.qty} × ${item.price.toFixed(2)}</p>
                                        <p className="text-lg font-black text-gray-900">${(item.qty * item.price).toFixed(2)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <motion.div variants={containerVariants} className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24 overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 h-40 w-40 bg-secondary/10 rounded-full blur-3xl" />
                        
                        <h2 className="text-2xl font-black mb-8 relative">Order Summary</h2>
                        <div className="space-y-5 relative">
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="font-medium text-sm">Items Subtotal</span>
                                <span className="text-white font-bold">${order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="font-medium text-sm">Shipping Fee</span>
                                <span className="text-white font-bold">${order.shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="font-medium text-sm">Taxes (15%)</span>
                                <span className="text-white font-bold">${order.taxPrice.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Grand Total</p>
                                  <p className="text-4xl font-black text-white">${order.totalPrice.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <CreditCard size={32} className="text-secondary/50 mb-1" />
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter italic">{order.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                            <p className="text-center text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Thank you for your purchase</p>
                            <Link to="/profile">
                              <Button variant="glass" className="w-full rounded-2xl text-white border-white/20 hover:bg-white/5 shadow-none py-6">
                                  Return to Dashboard
                              </Button>
                            </Link>

                            {userInfo && userInfo.role === 'admin' && order.isPaid && !order.isDelivered && (
                                <Button 
                                    onClick={deliverHandler}
                                    isLoading={loadingDeliver}
                                    className="w-full rounded-2xl bg-secondary text-white border-none shadow-lg shadow-secondary/20 py-6"
                                >
                                    Mark as Delivered
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
