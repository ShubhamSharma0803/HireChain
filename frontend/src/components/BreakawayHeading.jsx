import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CircularText from './CircularText';

const BreakawayHeading = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Dramatic breakaway transforms
  // As user scrolls through the 150vh section, the text breaks down and shifts
  const scale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 1, 0.45]);
  
  // Word 1: Shifts up and significantly left
  const x1 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0, -200]);
  const y1 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0, -80]);

  // Word 2: Shifts down and right
  const x2 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0, 60]);

  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <section ref={containerRef} className="h-[200vh] relative w-full bg-transparent">
      {/* Sticky container holds the breakaway text in the middle of viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Decorative Spinning Circular Text */}
        <motion.div 
          style={{ opacity }}
          className="absolute z-0 pointer-events-none text-[#FF8131] opacity-20"
        >
          <CircularText 
             text="HIRECHAIN PROTOCOL • SECURE GATEWAYS • " 
             radius={220} 
             spinDuration={30} 
             className="text-[24px] font-mono tracking-widest"
          />
        </motion.div>

        <motion.div 
          style={{ scale, opacity }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 text-center z-10"
        >
          <motion.span 
            style={{ x: x1, y: y1 }}
            className="editorial-display text-[var(--text-primary)] block will-change-transform"
          >
            TRUST
          </motion.span>
          <motion.span 
            style={{ x: x2, y: y2 }}
            className="editorial-display text-[var(--accent-color)] block will-change-transform"
          >
            GATEWAYS.
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
};

export default BreakawayHeading;
