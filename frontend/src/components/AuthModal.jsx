import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Wallet, X, ArrowRight, ShieldCheck, Link2 } from 'lucide-react';
import { AppContext } from '../App';

/* Strict ease-out-expo as per rules */
const modalEase = [0.16, 1, 0.3, 1];

const AuthModal = () => {
  const { setShowAuthModal, connectWallet, setAuthToken, addToast } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setAuthToken(`mock_token_${Date.now()}`);
      localStorage.setItem('hirechain_token', `mock_token_${Date.now()}`);
      setShowAuthModal(false);
      addToast(`Authenticated: ${email}`, 'success');
    }, 1200);
  };

  const handleWalletLogin = async () => {
    setLoading(true);
    await connectWallet();
    setTimeout(() => {
      setAuthToken(`mock_wallet_token_${Date.now()}`);
      localStorage.setItem('hirechain_token', `mock_wallet_token_${Date.now()}`);
      setShowAuthModal(false);
      addToast('Wallet resolution confirmed.', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: modalEase }}
        onClick={() => setShowAuthModal(false)}
        className="absolute inset-0 bg-[var(--bg-color)]/80"
      />

      {/* Editoral Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: modalEase }}
        className="relative w-full max-w-md editorial-card shadow-2xl overflow-hidden"
      >
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 rounded-md bg-transparent border-none text-[rgba(0,0,0,0.4)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 pb-8 border-b border-[var(--border-card)]">
          <ShieldCheck className="w-8 h-8 text-[var(--accent-color)] mb-6" />
          <h2 className="text-[38px] font-semibold text-[var(--text-primary)] tracking-tight leading-none mb-3">Access Protocol</h2>
          <p className="editorial-body text-[18px]">Verify your identity to interact with the master contract state.</p>
        </div>

        <div className="p-10 flex flex-col gap-6 bg-[var(--bg-surface)]">
          <button
            onClick={handleWalletLogin}
            disabled={loading}
            className="group w-full flex items-center justify-between p-5 rounded-md transition-colors cursor-pointer bg-[rgba(0,0,0,0.03)] border border-[var(--border-card)] hover:bg-[var(--border-card)] hover:border-[var(--accent-color)]"
          >
            <div className="flex items-center gap-4 text-left">
              <Wallet className="w-5 h-5 text-[var(--text-primary)]" />
              <div>
                <p className="text-[18px] font-semibold text-[var(--text-primary)]">MetaMask Key</p>
                <p className="editorial-label opacity-50 mt-1">Web3 Vector</p>
              </div>
            </div>
            {loading ? <div className="loading-dots"><span/><span/><span/></div> : <Link2 className="w-5 h-5 text-[rgba(0,0,0,0.2)] group-hover:text-[var(--accent-color)] transition-colors" />}
          </button>

          <div className="flex items-center gap-3 my-2 opacity-30">
            <div className="h-px w-full bg-[#FFFFFF]" />
            <span className="editorial-label">OR</span>
            <div className="h-px w-full bg-[#FFFFFF]" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.4)]" />
              <input
                type="email" required placeholder="corporate@domain.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-[44px] editorial-input bg-[rgba(0,0,0,0.03)]"
                disabled={loading}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-accent w-full text-[18px] flex items-center justify-center gap-3"
            >
              {loading ? <div className="loading-dots"><span/><span/><span/></div> : <>Authenticate <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
