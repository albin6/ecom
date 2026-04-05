import React from 'react';
import { cn } from './Button.jsx';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Message = ({ variant = 'info', children, className }) => {
  const variants = {
    info: 'bg-surface/40 text-text-primary border-border-mute',
    success: 'bg-emerald-900/10 text-emerald-400 border-emerald-900/30',
    danger: 'bg-red-900/10 text-red-100 border-red-900/30',
    warning: 'bg-accent/10 text-accent border-accent/20',
  };

  const icons = {
    info: <Info className="w-4 h-4 mr-3 flex-shrink-0 text-text-muted" />,
    success: <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-emerald-500" />,
    danger: <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 mr-3 flex-shrink-0 text-accent" />
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
