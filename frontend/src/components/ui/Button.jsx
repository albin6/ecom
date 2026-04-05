import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans uppercase tracking-[0.08em] text-[10px] font-bold transition-all duration-[250ms] ease-[0.25,0.1,0.25,1] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-accent text-base-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(201,169,110,0.2)]',
    secondary: 'bg-surface text-text-primary border border-border-mute hover:border-accent hover:text-accent',
    outline: 'border border-accent text-accent hover:bg-accent hover:text-base-black',
    ghost: 'text-text-primary hover:bg-surface/40',
    danger: 'bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40',
    glass: 'bg-surface/20 backdrop-blur-md border border-border-mute text-text-primary hover:bg-surface/40'
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
