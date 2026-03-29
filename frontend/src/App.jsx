import React, { useState, useCallback, useEffect, createContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BreakawayHeading from './components/BreakawayHeading';
import CompanySection from './components/CompanySection';
import CandidateSection from './components/CandidateSection';
import Ticker from './components/Ticker';
import RegistrySection from './components/RegistrySection';
import TeamSection from './components/TeamSection';
import Toast from './components/Toast';
import Unveil from './components/Unveil';
import AuthModal from './components/AuthModal';
import DotGrid from './components/DotGrid';

/* ── Global App Context ───────────────────────────────────── */
export const AppContext = createContext(null);

function App() {
  const [authToken, setAuthToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnveil, setShowUnveil] = useState(true);
  const isLoggedIn = !!authToken;

  useEffect(() => {
    const stored = localStorage.getItem('hirechain_token');
    if (stored) setAuthToken(stored);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hirechain_token');
    setAuthToken(null);
  }, []);

  /* ── Global State ───────────────────────────────────────── */
  const [userWallet, setUserWallet] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isGSTVerified, setIsGSTVerified] = useState(false);
  const [activeOffers, setActiveOffers] = useState([]);
  const [identityHash, setIdentityHash] = useState('');
  const [gstTrustData, setGstTrustData] = useState(null);
  const [candidateData, setCandidateData] = useState(null);

  /* ── Toast Notifications ────────────────────────────────── */
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Let Toast handle its own dismiss effect, but keep safety mechanism
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  }, []);

  /* ── Custom Web3 Simulator ──────────────────────────────── */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      addToast('MetaMask not detected. Environment constraint.', 'error');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length) {
        setUserWallet(accounts[0]);
        addToast(`Key secured: ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`, 'success');
      }
    } catch (err) {
      addToast('Wallet resolution aborted.', 'error');
    }
  }, [addToast]);

  const ctx = {
    userWallet, setUserWallet, connectWallet,
    isAadhaarVerified, setIsAadhaarVerified,
    isGSTVerified, setIsGSTVerified,
    activeOffers, setActiveOffers,
    identityHash, setIdentityHash,
    gstTrustData, setGstTrustData,
    candidateData, setCandidateData,
    addToast,
    authToken, setAuthToken, isLoggedIn,
    showAuthModal, setShowAuthModal,
    logout,
  };

  return (
    <AppContext.Provider value={ctx}>
      <AnimatePresence mode="wait">
        {showUnveil && (
          <Unveil key="unveil" onComplete={() => setShowUnveil(false)} />
        )}
        {showAuthModal && (
          <AuthModal key="authmodal" />
        )}
      </AnimatePresence>

      {/* Dynamic DotGrid Background Logic */}
      <DotGrid 
        baseColor="#1e1b4b" 
        activeColor="#5227FF" 
        dotSize={2}
        gap={38}
        proximity={200}
      />

      {/* Core Layout Structure */}
      <div className={`relative z-10 min-h-screen text-[var(--text-primary)] ${showUnveil ? 'h-screen overflow-hidden' : ''}`}>
        <div className="relative z-10 w-full flex flex-col">
          <Navbar />
          <Hero />
          <BreakawayHeading />
          <CompanySection />
          <CandidateSection />
          <Ticker />
          <RegistrySection />
          <TeamSection />
        </div>
      </div>

      {/* Editoral Toasts placed neatly bottom right */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast 
                message={t.message} 
                type={t.type} 
                onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} 
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export default App;