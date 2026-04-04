import React from 'react';
import { cn } from './Button.jsx';
import { motion } from 'framer-motion';

export const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary shadow-sm transition-all disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          error && "border-red-400 focus:ring-red-400/30 focus:border-red-400 bg-red-50/50",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-1.5 text-xs font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
