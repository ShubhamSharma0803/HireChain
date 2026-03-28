import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Wallet, Fingerprint } from 'lucide-react';
import { AppContext } from '../App';

const Navbar = () => {
  const { userWallet, connectWallet, isAadhaarVerified, addToast } = useContext(AppContext);

  const handleKYC = () => {
    addToast('Aadhaar KYC via Signzy / Surepass — scroll to the Candidate section below.', 'success');
    document.getElementById('candidate')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fmt = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white/70 backdrop-blur-md border-b border-white/40"
    >
      {/* Logo */}
      <button onClick={() => scrollTo('home')} className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none">
        <div className="w-9 h-9 rounded-xl bg-[#FF8131] flex items-center justify-center shadow-md shadow-orange-200/60 group-hover:shadow-orange-300/60 transition-shadow">
          <LinkIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-[#030D1E]">HireChain</span>
      </button>

      {/* Links */}
      <div className="hidden md:flex items-center gap-7">
        {['company', 'candidate', 'registry', 'team'].map((s) => (
          <button key={s} onClick={() => scrollTo(s)} className="text-sm font-semibold text-[#6A737D] hover:text-[#030D1E] transition-colors capitalize bg-transparent border-none cursor-pointer">
            {s}
          </button>
        ))}
      </div>

      {/* Action Pills */}
      <div className="flex items-center gap-3">
        {/* Aadhaar KYC */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleKYC}
          className={`hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full transition-colors border-2 cursor-pointer ${
            isAadhaarVerified
              ? 'bg-green-50 border-green-400 text-green-700'
              : 'bg-white border-[#030D1E] text-[#030D1E] hover:bg-gray-50'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          {isAadhaarVerified ? 'KYC verified' : 'Aadhaar KYC'}
        </motion.button>

        {/* Connect Wallet */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={connectWallet}
          className="flex items-center gap-2 bg-[#FF8131] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#E06D22] transition-colors shadow-lg shadow-orange-500/20 cursor-pointer border-none"
        >
          <Wallet className="w-4 h-4" />
          {userWallet ? fmt(userWallet) : 'Connect Wallet'}
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;