import React from 'react';
import { cn } from './Button.jsx';
import { motion } from 'framer-motion';

export const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <motion.input
        whileFocus={{ scale: 1.005 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        type={type}
        className={cn(
          "flex w-full bg-transparent border-b border-border-mute py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all duration-300",
          error && "border-red-500/50 focus:border-red-500 text-red-200",
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
