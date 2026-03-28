import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Wallet, UserCheck, LogIn, UserPlus } from 'lucide-react';
import { AppContext } from '../App';

const API = 'http://localhost:8000';

const AuthModal = () => {
  const { userWallet, addToast, setShowAuthModal, setAuthToken } = useContext(AppContext);
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState(userWallet || '');
  const [role, setRole] = useState('candidate');

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setWalletAddress(userWallet || '');
    setRole('candidate');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !walletAddress) {
      addToast('Please fill all fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, wallet_address: walletAddress, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      addToast('Account created! Please log in.', 'success');
      resetFields();
      setTab('login');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !walletAddress) {
      addToast('Please fill all fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, wallet_address: walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      localStorage.setItem('hirechain_token', data.access_token);
      setAuthToken(data.access_token);
      addToast('Logged in successfully!', 'success');
      setShowAuthModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => setShowAuthModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 rounded-2xl bg-[#0B1120] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {tab === 'login' ? 'Sign in to your HireChain account' : 'Join the decentralized hiring revolution'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex mx-8 mt-4 rounded-xl bg-white/5 p-1">
            <button
              onClick={() => { setTab('login'); resetFields(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${
                tab === 'login'
                  ? 'bg-[#FF8131] text-white shadow-md shadow-orange-500/30'
                  : 'bg-transparent text-white/50 hover:text-white/70'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              onClick={() => { setTab('signup'); resetFields(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${
                tab === 'signup'
                  ? 'bg-[#FF8131] text-white shadow-md shadow-orange-500/30'
                  : 'bg-transparent text-white/50 hover:text-white/70'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="px-8 pt-6 pb-8 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FF8131]/60 focus:ring-1 focus:ring-[#FF8131]/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FF8131]/60 focus:ring-1 focus:ring-[#FF8131]/30 transition-all"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Wallet Address</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-[#FF8131]/60 focus:ring-1 focus:ring-[#FF8131]/30 transition-all"
                />
              </div>
            </div>

            {/* Role (Signup only) */}
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Role</label>
                <div className="flex gap-3">
                  {['candidate', 'company'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                        role === r
                          ? 'bg-[#FF8131]/15 border-[#FF8131]/50 text-[#FF8131]'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer border-none shadow-lg ${
                loading
                  ? 'bg-[#FF8131]/50 cursor-not-allowed shadow-none'
                  : 'bg-[#FF8131] hover:bg-[#E06D22] shadow-orange-500/25'
              }`}
            >
              {loading
                ? 'Please wait…'
                : tab === 'login'
                  ? 'Sign In'
                  : 'Create Account'
              }
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
