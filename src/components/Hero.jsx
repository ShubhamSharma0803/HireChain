import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Shield } from 'lucide-react';

const Hero = () => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
      style={{ background: 'radial-gradient(circle at center, #FFFFFF 0%, #F2F4F6 50%, #E5E7EB 100%)' }}
    >
      {/* Decorative rings */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-gray-200/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gray-200/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-purple-200/15" />
      </div>

      {/* Soft neon ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, rgba(0,255,255,0.06) 40%, transparent 70%)' }}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Trust badge */}
        <motion.div variants={item} className="flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white/80 border border-gray-200 shadow-sm text-sm font-semibold text-[#6A737D]">
          <Shield className="w-4 h-4 text-[#FF8131]" />
          Built on Ethereum · Trustless by design
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={item} className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight" style={{ color: '#030D1E' }}>
          Job offers. Verified.<br />Enforced. On chain.
        </motion.h1>

        {/* Subcopy */}
        <motion.p variants={item} className="mt-7 max-w-xl text-lg md:text-xl leading-relaxed font-medium" style={{ color: '#6A737D' }}>
          The trust layer for hiring — AI verifies every offer and degree, while smart contracts ensure neither side ghosts.
        </motion.p>

        {/* CTA Buttons — pill shaped, mmOrange */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 mt-12">
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(255,129,49,0.18)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('company')}
            className="group flex items-center gap-2 px-10 py-4 text-white text-lg font-bold rounded-full transition-colors cursor-pointer border-none"
            style={{ backgroundColor: '#FF8131', boxShadow: '0 12px 30px rgba(255,129,49,0.12)' }}
          >
            I'm a Company
            <ArrowDown className="w-5 h-5 opacity-70 group-hover:translate-y-1 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(255,129,49,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('candidate')}
            className="flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-full border-2 transition-colors cursor-pointer"
            style={{ color: '#FF8131', borderColor: '#FF8131', backgroundColor: 'white', boxShadow: '0 12px 30px rgba(255,129,49,0.08)' }}
          >
            I'm a Candidate
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
