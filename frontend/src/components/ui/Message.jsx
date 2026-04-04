import React from 'react';
import { cn } from './Button.jsx';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Message = ({ variant = 'info', children, className }) => {
  const variants = {
    info: 'bg-blue-50/80 text-blue-800 border-blue-200/50',
    success: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50',
    danger: 'bg-red-50/80 text-red-800 border-red-200/50',
    warning: 'bg-amber-50/80 text-amber-800 border-amber-200/50',
  };

  const icons = {
    info: <Info className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-500" />,
    danger: <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-amber-500" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('p-4 rounded-xl border backdrop-blur-sm text-sm font-medium flex items-start shadow-sm', variants[variant], className)}
    >
      {icons[variant]}
      <div className="leading-relaxed">{children}</div>
    </motion.div>
  );
};
