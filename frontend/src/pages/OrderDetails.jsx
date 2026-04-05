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
            className="py-16 max-w-7xl mx-auto px-8 space-y-16"
        >
            <div className="border-b border-white/5 pb-10 flex flex-col md:flex-row items-end justify-between gap-8">
                <div>
                  <Link to="/profile" className="inline-flex items-center text-[10px] font-black text-accent uppercase tracking-[0.3em] hover:text-white transition-all gap-2 mb-6 group">
                      <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retrace to Archive
                  </Link>
                  <h1 className="text-5xl font-display text-text-primary tracking-tight">Acquisition Manifest</h1>
                  <p className="text-[10px] font-bold text-text-muted mt-3 uppercase tracking-[0.4em]">Reference ID: <span className="font-mono text-accent">{order.orderId || order._id.toUpperCase()}</span></p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className={`px-6 py-2 border ${order.isPaid ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-red-500/30 bg-red-500/5 text-red-400'} rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                        {order.isPaid ? 'Settlement Confirmed' : 'Authorization Required'}
                    </div>
                    {order.isPaid && <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest italic opacity-60">Verified on {new Date(order.paidAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Information Modules */}
                <div className="lg:col-span-8 space-y-16">
                    
                    {/* Module Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Shipping Module */}
                        <motion.div variants={containerVariants} className="glass-panel p-10 border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-accent group-hover:scale-110 transition-transform duration-1000"><Truck size={60} /></div>
                            <h2 className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <div className="w-1 h-3 bg-accent" />
                                Logistics
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Recipient</p>
                                    <p className="text-text-primary font-bold text-base tracking-tight">{order.user.name}</p>
                                    <p className="text-[10px] font-mono text-text-muted italic opacity-40 uppercase tracking-tighter mt-1">{order.user.email}</p>
                                </div>
                                <div className="space-y-1 pt-4 border-t border-white/5">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Destination</p>
                                    <p className="text-text-primary text-sm tracking-wide leading-loose uppercase">
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                                <div className={`p-4 border ${order.isDelivered ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-500'} flex items-center gap-3 transition-all duration-700`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${order.isDelivered ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-slow-ping'}`} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                                        {order.isDelivered ? `Finalized: ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Transit Sequence Initiated'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Module */}
                        <motion.div variants={containerVariants} className="glass-panel p-10 border border-white/10 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 text-accent group-hover:scale-110 transition-transform duration-1000"><CreditCard size={60} /></div>
                           <h2 className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <div className="w-1 h-3 bg-accent" />
                                Settlement
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Financial Protocol</p>
                                    <p className="text-text-primary font-bold text-base tracking-widest uppercase italic">{order.paymentMethod}</p>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                     <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Authorization Status</p>
                                     <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 flex items-center justify-center rounded-sm border ${order.isPaid ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                                              {order.isPaid ? <CreditCard size={20} /> : <div className="animate-pulse">!</div>}
                                          </div>
                                          <div>
                                              <p className={`text-[10px] font-black uppercase tracking-widest ${order.isPaid ? 'text-emerald-400' : 'text-red-400'}`}>
                                                  {order.isPaid ? 'PAYMENT RECEIVED' : 'AWAITING DISHURSEMENT'}
                                              </p>
                                              <p className="text-[9px] font-bold text-text-muted truncate max-w-[200px] uppercase opacity-40 mt-1">Transaction Verified through secure bridge</p>
                                          </div>
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Manifest Item List */}
                    <motion.div variants={containerVariants} className="space-y-10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-1 h-3 bg-accent" />
                                Collection Contents
                            </h2>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest italic opacity-40">{order.orderItems.length} Units Secured</p>
                        </div>
                        <div className="space-y-2">
                            {order.orderItems.map((item, index) => (
                                <motion.div 
                                    key={index} 
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.01)" }}
                                    className="p-6 flex gap-10 items-center border border-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className="h-32 w-28 bg-surface/40 overflow-hidden border border-white/5 p-1 transition-transform group-hover:scale-[1.02] duration-700">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-6">
                                        <div>
                                            <Link to={`/product/${item.product}`} className="text-xl font-display text-text-primary hover:text-accent transition-colors block">
                                                {item.name}
                                            </Link>
                                            <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mt-1 opacity-60">Asset Registry: {item.product.substring(18).toUpperCase()}</p>
                                        </div>
                                        <div className="flex gap-8">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted block opacity-50">Chromatic</span>
                                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">{item.color}</span>
                                            </div>
                                            <div className="space-y-1 border-l border-white/5 pl-8">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted block opacity-50">Scale</span>
                                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">{item.size}</span>
                                            </div>
                                            <div className="space-y-1 border-l border-white/5 pl-8">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted block opacity-50">Quantity</span>
                                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">{item.qty}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 pr-4">
                                        <p className="text-[9px] text-text-muted font-black tracking-widest mb-1 opacity-40 uppercase italic">${item.price.toLocaleString()} EA</p>
                                        <p className="text-xl font-bold text-text-primary tracking-tighter">${(item.qty * item.price).toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Order Summary Console */}
                <div className="lg:col-span-4 relative">
                    <motion.div variants={containerVariants} className="glass-panel p-10 border border-white/10 shadow-3xl sticky top-32 overflow-hidden bg-white/[0.01]">
                        <div className="absolute top-0 right-0 p-12 opacity-5 -mr-6 -mt-6">
                             <div className="text-9xl font-display italic tracking-tighter">Receipt</div>
                        </div>
                        
                        <h2 className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                            <div className="w-1 h-3 bg-accent" />
                            Financial Ledger
                        </h2>
                        
                        <div className="space-y-8 relative">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 italic-editorial">Itemized Gross</span>
                                    <span className="text-text-primary font-bold text-sm tracking-wider">${order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 italic-editorial">Fulfillment Logistics</span>
                                    <span className="text-text-primary font-bold text-sm tracking-wider">${order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 italic-editorial">Statutory Assessment (GST)</span>
                                    <span className="text-text-primary font-bold text-sm tracking-wider">${order.taxPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 my-10" />

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em] mb-2 pl-1">Consolidated Total</p>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-5xl font-display text-text-primary tracking-tighter">${order.totalPrice.toLocaleString()}</p>
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">USD</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-12 border-t border-white/5 space-y-6">
                            <Link to="/profile">
                              <Button variant="ghost" className="w-full h-14 text-[10px] tracking-[0.3em] border border-white/5 hover:border-accent hover:text-accent font-black uppercase">
                                  Return to Dashboard
                              </Button>
                            </Link>

                            {userInfo && userInfo.role === 'admin' && order.isPaid && !order.isDelivered && (
                                <Button 
                                    onClick={deliverHandler}
                                    isLoading={loadingDeliver}
                                    variant="primary"
                                    className="w-full h-14 text-[10px] tracking-[0.3em] font-black uppercase shadow-gold-glow"
                                >
                                    Authorize Delivery Completion
                                </Button>
                            )}
                            
                            <p className="text-center text-[8px] text-text-muted uppercase tracking-[0.2em] font-bold opacity-30 mt-8">Certified Transaction Manifest Copy • Non-Alterable</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
