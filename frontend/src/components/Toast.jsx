import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const toastEase = [0.16, 1, 0.3, 1];

const Toast = ({ message, type = 'error', onDismiss }) => {
  const isError = type === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ x: 60, opacity: 0, scale: 0.96 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 60, opacity: 0, scale: 0.96 }}
      transition={{ type: 'tween', duration: 0.4, ease: toastEase }}
      className="min-w-[320px] max-w-sm flex items-start gap-4 p-5 rounded-md editorial-card"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 111, 224, 0.3)',
        borderLeft: isError ? '4px solid #EF4444' : '4px solid var(--accent-color)'
      }}
    >
      <div className={`shrink-0 mt-0.5 ${isError ? 'text-[#EF4444]' : 'text-[var(--accent-color)]'}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-[17px] font-semibold text-[var(--text-primary)] leading-snug">
          {message}
        </p>
      </div>
      
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-sm text-[rgba(0,0,0,0.3)] hover:text-[var(--text-primary)] hover:bg-[var(--border-card)] transition-colors border-none bg-transparent cursor-pointer p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
