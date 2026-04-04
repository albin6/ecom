import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const ProductCard = ({ product }) => {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col"
    >
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={product.variants?.[0]?.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="%23f1f5f9" width="400" height="500"/><text fill="%2394a3b8" font-family="sans-serif" font-size="24" text-anchor="middle" x="200" y="260">No Image</text></svg>'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-black text-gray-900 tracking-tight">${product.price.toFixed(2)}</span>
          <Link to={`/product/${product._id}`}>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-secondary hover:text-white transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
