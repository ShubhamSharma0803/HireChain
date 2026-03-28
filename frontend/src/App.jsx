import React, { useState, useCallback, useEffect, createContext } from 'react';

import Unveil from './components/Unveil';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CompanySection from './components/CompanySection';
import CandidateSection from './components/CandidateSection';
import RegistrySection from './components/RegistrySection';
import TeamSection from './components/TeamSection';
import Toast from './components/Toast';

/* ── Global App Context ───────────────────────────────────── */
export const AppContext = createContext(null);

function App() {
  const [unveiled, setUnveiled] = useState(false);

  /* ── Auth State ─────────────────────────────────────────── */
  const [authToken, setAuthToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  /* ── Connect Wallet ─────────────────────────────────────── */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      addToast('MetaMask not detected. Please install it.', 'error');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length) {
        setUserWallet(accounts[0]);
        addToast(`Wallet connected: ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`, 'success');
      }
    } catch (err) {
      addToast('Wallet connection rejected.', 'error');
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
      {!unveiled && <Unveil onComplete={() => setUnveiled(true)} />}

      <div className="min-h-screen bg-[#F2F4F6]" style={{ scrollBehavior: 'smooth' }}>
        <Navbar />
        <Hero />
        <CompanySection />
        <CandidateSection />
        <RegistrySection />
        <TeamSection />
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3" style={{ pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </AppContext.Provider>
  );
}

export default App;