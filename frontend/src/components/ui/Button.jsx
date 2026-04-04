import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-[&:not(:focus-visible)]:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-primary text-white shadow-md hover:bg-slate-800 hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-secondary to-indigo-500 text-white shadow-md hover:from-indigo-700 hover:to-indigo-600 hover:shadow-lg',
    outline: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-900',
    danger: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
    glass: 'bg-white/50 backdrop-blur-sm border border-white/40 text-gray-900 hover:bg-white/70 shadow-sm'
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 py-2 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10 flex items-center justify-center'
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: props.disabled || isLoading ? 1 : 0.97 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
});
Button.displayName = 'Button';
