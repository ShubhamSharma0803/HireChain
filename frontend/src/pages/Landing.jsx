import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  /* Stagger children inside the hero */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div
      className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #ffffff 0%, #F2F4F6 45%, #E5E7EB 100%)',
      }}
    >
      {/* Subtle decorative rings */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-gray-200/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gray-200/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-orange-200/20" />
      </div>

      {/* Hero Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-4 text-center"
      >
        {/* Trust badge */}
        <motion.div
          variants={item}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm text-sm font-semibold text-[#6A737D]"
        >
          <Shield className="w-4 h-4 text-[#FF8131]" />
          Built on Ethereum · Trustless by design
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#030D1E] leading-[1.08] tracking-tight"
        >
          Job offers. Verified.
          <br />
          Enforced. On chain.
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          variants={item}
          className="mt-7 max-w-xl text-lg md:text-xl text-[#6A737D] leading-relaxed font-medium"
        >
          The trust layer for hiring — AI verifies every offer and degree,
          while smart contracts ensure neither side ghosts.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 mt-12"
        >
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/company')}
            className="group flex items-center gap-2 px-10 py-4 bg-[#FF8131] text-white text-lg font-bold rounded-full hover:bg-[#E06D22] transition-colors shadow-xl shadow-orange-500/10"
          >
            I'm a Company
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/candidate')}
            className="flex items-center gap-2 px-10 py-4 bg-white text-[#FF8131] text-lg font-bold rounded-full border-2 border-[#FF8131] hover:bg-orange-50 transition-colors shadow-xl shadow-orange-500/10"
          >
            I'm a Candidate
          </motion.button>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          variants={item}
          className="mt-20 w-full max-w-3xl"
        >
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-white/60 shadow-2xl shadow-gray-300/30 bg-gradient-to-br from-white via-gray-50 to-[#F2F4F6]">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white/90 border-b border-gray-100">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="ml-4 flex-1 h-6 bg-gray-100 rounded-md" />
            </div>
            {/* Mock content skeleton */}
            <div className="p-8 space-y-5">
              <div className="h-5 w-2/5 bg-gray-200/80 rounded-full" />
              <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
              <div className="h-4 w-1/2 bg-gray-100 rounded-full" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="h-20 rounded-2xl bg-orange-50 border border-orange-100" />
                <div className="h-20 rounded-2xl bg-blue-50 border border-blue-100" />
                <div className="h-20 rounded-2xl bg-green-50 border border-green-100" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
