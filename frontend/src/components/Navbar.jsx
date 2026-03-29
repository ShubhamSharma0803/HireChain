import React, { useContext, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import CardNav from './CardNav';

const navItems = [
  {
    label: 'Platform',
    bgColor: '#5227FF',
    textColor: '#fff',
    links: [
      { label: 'Company Hub', href: '#company' },
      { label: 'Candidate Suite', href: '#candidate' }
    ]
  },
  {
    label: 'Protocol',
    bgColor: '#1A1513',
    textColor: '#fff',
    links: [
      { label: 'Registry Map', href: '#registry' },
      { label: 'Core Team', href: '#team' }
    ]
  }
];

const Navbar = () => {
  const { 
    userWallet, connectWallet,
    isLoggedIn, setShowAuthModal, logout 
  } = useContext(AppContext);
  
  const { scrollY } = useScroll();
  const [isPill, setIsPill] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsPill(y > 40);
  });

  const fmt = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <AnimatePresence mode="wait">
      {!isPill ? (
        <motion.nav
          key="nav-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed z-50 flex items-center justify-between w-full px-6 md:px-12 py-6 bg-transparent"
        >
          {/* Logos & Links (Left) */}
          <div className="flex items-center gap-10">
            <button 
              onClick={() => scrollTo('home')} 
              className="text-[17px] font-semibold tracking-tight bg-transparent border-none cursor-pointer text-[var(--text-primary)]"
            >
              HireChain
            </button>

            <div className="hidden md:flex items-center gap-6">
              {['company', 'candidate', 'registry', 'team'].map((s) => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className="text-base font-semibold tracking-[0.02em] capitalize bg-transparent border-none cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Auth / CTA (Right) */}
          <div className="flex items-center gap-4">
            {/* Dynamic Login */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button onClick={connectWallet} className="btn-transparent text-base py-2 px-4 cursor-pointer">
                  {userWallet ? fmt(userWallet) : 'Link Wallet'}
                </button>
                <button onClick={logout} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none transition-colors text-base font-semibold">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-accent text-base py-2 px-5 cursor-pointer rounded-full">
                Log in
              </button>
            )}
          </div>
        </motion.nav>
      ) : (
        <motion.div
           key="nav-pill"
           initial={{ opacity: 0, y: -30, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -20, scale: 0.97 }}
           transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
           className="fixed top-0 left-0 w-full z-[80] pointer-events-none"
        >
           <div className="pointer-events-auto">
             <CardNav items={navItems} />
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Navbar;