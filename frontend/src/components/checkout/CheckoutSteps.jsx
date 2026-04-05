import React from 'react';
import { motion } from 'framer-motion';

export const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    { label: 'AUTHENTICATE', active: step1, num: '01' },
    { label: 'DELIVERY', active: step2, num: '02' },
    { label: 'PORTAL', active: step3, num: '03' },
    { label: 'FINALIZE', active: step4, num: '04' },
  ];

  return (
    <div className="max-w-3xl mx-auto mb-20 px-6">
      <div className="relative flex justify-between items-center">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ 
            width: step4 ? '100%' : step3 ? '66.6%' : step2 ? '33.3%' : '0%' 
          }}
          className="absolute top-1/2 left-0 h-[1px] bg-accent -translate-y-1/2 z-10 transition-all duration-[1200ms] ease-boutique"
        />

        {steps.map((s, i) => (
          <div key={i} className="relative z-20 flex flex-col items-center gap-4 group">
            <motion.div
              initial={false}
              animate={{ 
                scale: s.active ? 1.2 : 1,
                borderColor: s.active ? '#C9A96E' : 'rgba(255,255,255,0.05)',
                backgroundColor: s.active ? '#0F0F0F' : 'transparent'
              }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-700`}
            >
              <span className={`font-mono text-[10px] ${s.active ? 'text-accent' : 'text-text-muted/20'} transition-colors duration-700`}>
                {s.num}
              </span>
            </motion.div>
            
            <span className={`text-[9px] tracking-[0.4em] font-bold uppercase transition-all duration-700 ${
              s.active ? 'text-accent translate-y-0 opacity-100' : 'text-text-muted/20 translate-y-1 opacity-50'
            }`}>
              {s.label}
            </span>
            
            {/* Soft Glow for Active Step */}
            {s.active && (
              <motion.div 
                layoutId="step-glow"
                className="absolute inset-0 -m-4 bg-accent/5 blur-2xl rounded-full -z-10"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
