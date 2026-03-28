import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'error', onDismiss }) => {
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border max-w-sm"
      style={{
        pointerEvents: 'auto',
        backgroundColor: isSuccess ? '#e6f4ed' : '#fef2f2',
        borderColor: isSuccess ? '#b0dfc4' : '#fecaca',
        color: isSuccess ? '#065f46' : '#991b1b',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#109856' }} />
      ) : (
        <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
      )}
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 cursor-pointer bg-transparent border-none p-0.5 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
    </motion.div>
  );
};

export default Toast;
