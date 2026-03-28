import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* Counter stays the same */
  const [counts, setCounts] = useState({ offers: 0, accepted: 0, escrowed: 0 });
  useEffect(() => {
    const targets = { offers: 1247, accepted: 1103, escrowed: 2.4 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        offers: Math.round(targets.offers * ease),
        accepted: Math.round(targets.accepted * ease),
        escrowed: parseFloat((targets.escrowed * ease).toFixed(1)),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Strict Editorial Easing
  const customEase = [0.16, 1, 0.3, 1];

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: customEase } }
  });

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-[200px] pb-24 overflow-hidden">
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-[1200px]">
        
        {/* Massive Editorial Headline */}
        <motion.h1
          variants={fadeUp(0.1)}
          initial="hidden" animate="show"
          className="editorial-display mb-6"
        >
          No Fakes.<br />
          No Ghosts. No Lawyers.
        </motion.h1>

        {/* Muted Subcopy */}
        <motion.p 
          variants={fadeUp(0.2)}
          initial="hidden" animate="show"
          className="editorial-body max-w-[600px] text-2xl font-normal mx-auto mb-10"
        >
          The trust layer for web3 hiring. AI scans and verifies every offer and degree, while autonomous contracts ensure neither side ghosts.
        </motion.p>

        {/* Violet CTA */}
        <motion.div 
          variants={fadeUp(0.35)}
          initial="hidden" animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <button
            onClick={() => scrollTo('company')}
            className="btn-accent px-[32px] py-[16px] text-[18px] cursor-pointer"
          >
            I'm a Company
          </button>
          <button
            onClick={() => scrollTo('candidate')}
            className="btn-transparent px-[32px] py-[16px] text-[18px] cursor-pointer"
          >
            I'm a Candidate
          </button>
        </motion.div>

        {/* Strict Clean Stats */}
        <motion.div
          variants={fadeUp(0.5)}
          initial="hidden" animate="show"
          className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 mt-[100px] pt-12 border-t border-[var(--border-subtle)] w-full max-w-[800px] mx-auto"
        >
          {[
            { label: 'Offers created', value: counts.offers.toLocaleString() },
            { label: 'Accepted', value: counts.accepted.toLocaleString() },
            { label: 'USDC escrowed', value: `$${counts.escrowed}M` },
          ].map((stat, i) => (
            <div key={i} className="text-center flex-1 min-w-[140px]">
              <p className="editorial-label mb-2">{stat.label}</p>
              <p className="text-[38px] font-semibold leading-none text-[var(--text-primary)] tracking-[-0.02em]">{stat.value}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
