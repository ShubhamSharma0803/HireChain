import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Unveil = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // After text finishes scaling + hold, fade the whole veil out
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) setTimeout(onComplete, 800);
    }, 3200); // 0.5s delay + 1.5s text anim + 1.2s hold
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="veil"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
          }}
        >
          {/* Animated company name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5,
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex flex-col items-center"
          >
            {/* Orange dot accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-4 h-4 rounded-full bg-[#FF8131] mb-6"
            />
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 800,
                color: '#030D1E',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              HireChain
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.1rem',
                color: '#6A737D',
                fontWeight: 500,
                marginTop: '1rem',
                letterSpacing: '0.05em',
              }}
            >
              Trust protocol for hiring
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Unveil;
