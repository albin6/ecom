import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../features/products/productApiSlice.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Button } from '../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import { Shield, Truck, RefreshCw } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Home = () => {
  const { data, isLoading, error } = useGetProductsQuery({ keyword: '', pageNumber: '' });

  return (
    <div className="w-full flex flex-col overflow-hidden -mt-6"> {/* Negative margin to bleed into header gap */}
      
      {/* 1. Massive Animated Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-gray-900 overflow-hidden rounded-b-3xl sm:rounded-b-[4rem] shadow-2xl mb-16">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0.5 }} 
          animate={{ scale: 1, opacity: 0.4 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide uppercase mb-6"
          >
            Spring Collection 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 leading-tight"
          >
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Elegance.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl font-light"
          >
            Discover our meticulously curated selection of premium apparel. Designed for comfort, tailored for distinction.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto text-lg rounded-full px-8 shadow-lg shadow-secondary/30">
                Shop Now
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="w-full sm:w-auto text-lg rounded-full px-8 text-white hover:text-white border-white/30">
              Explore Lookbook
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. Trust Signals / Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-20">
        <motion.div 
          variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-secondary">
              <Truck size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Free Express Delivery</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Complimentary shipping on all premium orders over $150.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <Shield size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Transactions</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Bank-grade 256-bit encryption for seamless and secure checkouts.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="h-14 w-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-600">
              <RefreshCw size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">30-Day Returns</h3>
            <p className="text-gray-500 text-sm leading-relaxed">No questions asked. Seamless return labels generated instantly.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Featured Products Grid (Sourced directly from API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Trending Now</h2>
            <p className="text-gray-500">Curated selections from our global catalog.</p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="hidden sm:flex text-secondary font-semibold">View All →</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader /></div>
        ) : error ? (
          <Message variant="danger">{error?.data?.message || 'Failed to sync catalog'}</Message>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
          >
            {data.products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </section>
      
      {/* 4. Categorical Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-20">
         <div className="w-full bg-primary rounded-3xl overflow-hidden relative flex items-center min-h-[300px] shadow-xl">
           <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
           <div className="relative z-10 p-10 md:p-16 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Elevate Your Wardrobe.</h2>
              <p className="text-gray-300 text-lg mb-8">Join thousands of exclusive members receiving curated Drops and early-access privileges globally.</p>
              <div className="flex gap-3">
                <input type="email" placeholder="Enter your email" className="h-12 px-4 rounded-lg w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-secondary text-gray-900" />
                <Button size="lg" className="h-12 rounded-lg">Subscribe</Button>
              </div>
           </div>
         </div>
      </section>

    </div>
  );
};
