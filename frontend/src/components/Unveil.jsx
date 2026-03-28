import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Unveil = ({ onComplete }) => {
  const [stage, setStage] = useState('initial'); // 'initial' -> 'split' -> 'done'

  useEffect(() => {
    // Hold solid for 800ms, then trigger the split
    const timer1 = setTimeout(() => {
      setStage('split');
    }, 800);

    // After the split animation (1.2s), trigger the unmount
    const timer2 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  // Curtain variants pushing left/right
  const leftCurtainVariants = {
    initial: { x: '0%' },
    split: { x: '-100%', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  const rightCurtainVariants = {
    initial: { x: '0%' },
    split: { x: '100%', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden pointer-events-none">
      {/* LEFT HALF */}
      <motion.div
        variants={leftCurtainVariants}
        initial="initial"
        animate={stage}
        className="relative w-1/2 h-full bg-[#FFFFFF] shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-[#F1F5F9] flex items-center justify-end overflow-hidden"
      >
        {/* Word pinned to the right edge of this half */}
        <div className="absolute right-0 translate-x-[0%] editorial-display text-nowrap pointer-events-none tracking-tight">
          <span className="text-[#111113]">Hire</span>
        </div>
      </motion.div>

      {/* RIGHT HALF */}
      <motion.div
        variants={rightCurtainVariants}
        initial="initial"
        animate={stage}
        className="relative w-1/2 h-full bg-[#FFFFFF] shadow-[-4px_0_24px_rgba(0,0,0,0.05)] border-l border-[#F1F5F9] flex items-center justify-start overflow-hidden"
      >
        {/* Word pinned to the left edge of this half */}
        <div className="absolute left-0 -translate-x-[0%] editorial-display text-nowrap pointer-events-none tracking-tight">
          <span className="text-[#FF8131]">Chain</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Unveil;
