import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, ShieldCheck, BarChart3, Send,
  CheckCircle2, AlertTriangle, FileText, TrendingUp, Loader2,
} from 'lucide-react';
import { ESCROW_FLOOR } from '../utils/contract';
import { verifyGST } from '../utils/api';
import { AppContext } from '../App';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

const CompanySection = () => {
  const { isGSTVerified, setIsGSTVerified, setGstTrustData, gstTrustData, addToast, userWallet } = useContext(AppContext);

  const [gst, setGst] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', wallet: '', salary: '' });
  const [offerCreated, setOfferCreated] = useState(false);

  /* ── Call backend: POST /verify-company ──────────────────── */
  const handleTrustCheck = async (e) => {
    e.preventDefault();
    if (!gst.trim()) { addToast('Please enter a GST number.', 'error'); return; }
    setLoading(true);
    try {
      const result = await verifyGST(gst.trim());
      setGstTrustData(result);
      if (result.status) {
        setIsGSTVerified(true);
        addToast(`MCA21 matched — Trust score: ${result.trust_score}%`, 'success');
      } else {
        setIsGSTVerified(false);
        const reason = result.details?.reason || result.details?.layer_3_mca21 || 'GST not found in MCA21 registry.';
        addToast(`GST verification failed: ${typeof reason === 'string' ? reason : 'Not found in registry'}`, 'error');
      }
    } catch (err) {
      addToast(err.message || 'GST verification failed.', 'error');
      setIsGSTVerified(false);
    } finally {
      setLoading(false);
    }
  };

  /* ── Create Offer (with escrow floor) ───────────────────── */
  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!isGSTVerified) {
      addToast('Please verify GST first.', 'error');
      return;
    }
    const salaryNum = Number(form.salary);
    if (salaryNum < ESCROW_FLOOR) {
      addToast(`Minimum escrow is ₹${ESCROW_FLOOR.toLocaleString()} USDC`, 'error');
      return;
    }
    if (!userWallet) {
      addToast('Please connect your wallet first.', 'error');
      return;
    }
    // ✅ Offer created — in production this calls createOffer() from contract.js
    setOfferCreated(true);
    addToast(`Offer created: ${form.title} — ₹${salaryNum.toLocaleString()} USDC escrowed`, 'success');
  };

  /* ── Extract trust details from backend response ────────── */
  const mca = gstTrustData?.details?.layer_3_mca21;
  const trustScore = gstTrustData?.trust_score;

  return (
    <section id="company" className="relative py-28 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Title */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[#FF8131] text-sm font-bold mb-6">
          <Building2 className="w-4 h-4" /> For companies
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] tracking-tight">Company trust gate</h2>
        <p className="mt-4 text-lg text-[#6A737D] max-w-2xl mx-auto leading-relaxed">
          Before you create an on-chain offer, prove your entity is real. Our 3-layer trust check verifies GST, MCA21, and generates an AI trust score.
        </p>
      </motion.div>

      {/* Trust Layer Indicators */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {[
          { label: 'Layer 1: GST & MCA21 Cross-Check', active: isGSTVerified },
          { label: 'Layer 2: AI Trust Score', active: !!gstTrustData?.details?.layer_2_gemini },
        ].map((layer, i) => (
          <motion.span
            key={i} whileHover={{ y: -5 }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border cursor-default"
            style={
              layer.active
                ? { color: '#109856', backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }
                : { color: '#6A737D', backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }
            }
          >
            <CheckCircle2 className="w-3 h-3" /> {layer.label}
          </motion.span>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* LEFT — 3-Layer Trust Check */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-[#030D1E] mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FF8131]" /> 3-Layer trust check
          </h3>
          <form className="flex flex-col gap-4" onSubmit={handleTrustCheck}>
            <div>
              <label className="text-sm font-semibold text-[#6A737D] mb-1 block">GST number</label>
              <input
                type="text" value={gst} onChange={(e) => setGst(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className={`mt-2 py-3.5 rounded-full font-bold transition-colors cursor-pointer border-none flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400 text-gray-200' : 'bg-[#030D1E] text-white hover:bg-gray-800'
              }`}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</> : 'Run trust verification'}
            </button>
          </form>

          {/* Live API Result — AI Trust Score Card */}
          {gstTrustData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="mt-6 rounded-2xl p-6 border"
              style={
                isGSTVerified
                  ? { background: 'linear-gradient(135deg, #e6f4ed, #f0faf5)', borderColor: '#b0dfc4' }
                  : { background: 'linear-gradient(135deg, #fef2f2, #fff5f5)', borderColor: '#fecaca' }
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#030D1E] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: isGSTVerified ? '#109856' : '#ef4444' }} />
                  {isGSTVerified ? 'AI trust score' : 'Verification failed'}
                </h4>
                <span className="text-3xl font-extrabold" style={{ color: isGSTVerified ? '#109856' : '#ef4444' }}>
                  {trustScore}%
                </span>
              </div>

              {isGSTVerified && typeof mca === 'object' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                    <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Company age</p>
                    <p className="text-lg font-bold text-[#030D1E] mt-1">{mca.company_age_years} yrs</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                    <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Entity</p>
                    <p className="text-lg font-bold text-[#030D1E] mt-1">{mca.entity_type}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                    <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Status</p>
                    <p className="text-lg font-bold mt-1 flex items-center justify-center gap-1" style={{ color: '#109856' }}>
                      <CheckCircle2 className="w-4 h-4" /> {mca.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Gemini AI Analysis */}
              {gstTrustData.details?.layer_2_gemini && (
                <div className="mt-4 p-4 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs font-bold text-[#6A737D] uppercase tracking-wider mb-2">Gemini AI Analysis</p>
                  <p className="text-sm text-[#030D1E] leading-relaxed whitespace-pre-wrap">
                    {typeof gstTrustData.details.layer_2_gemini === 'string'
                      ? gstTrustData.details.layer_2_gemini.slice(0, 500)
                      : JSON.stringify(gstTrustData.details.layer_2_gemini)}
                  </p>
                </div>
              )}

              {/* MCA21 Matched Badge */}
              {isGSTVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full w-fit mx-auto"
                  style={{ backgroundColor: '#109856', color: '#FFFFFF' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-bold">MCA21 Matched — {mca?.entity_name}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT — Create Offer */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-[#030D1E] mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#FF8131]" /> Create trust offer
          </h3>

          {/* GST gate */}
          {!isGSTVerified && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 mb-6">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>Complete the <span className="font-bold">3-Layer Trust Check</span> first to unlock offer creation.</p>
            </div>
          )}

          <form className={`flex flex-col gap-4 ${!isGSTVerified ? 'opacity-50 pointer-events-none' : ''}`} onSubmit={handleCreateOffer}>
            <div>
              <label className="text-sm font-semibold text-[#6A737D] mb-1 block">Job title</label>
              <input
                type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all"
                placeholder="Protocol engineer"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#6A737D] mb-1 block">Candidate wallet address</label>
              <input
                type="text" value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all font-mono text-sm"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#6A737D] mb-1 block">
                Salary (USDC)
                <span className="ml-2 text-xs text-orange-500 font-bold">
                  Min escrow: ₹{ESCROW_FLOOR.toLocaleString()} USDC
                </span>
              </label>
              <input
                type="number" min={ESCROW_FLOOR} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all"
                placeholder={ESCROW_FLOOR.toString()}
              />
            </div>

            {/* Escrow info */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-800">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>
                <span className="font-bold">Rs. 5,000 USDC</span> will be escrowed in the smart contract. If the company ghosts, funds are automatically released to the candidate after a 30-day dispute window.
              </p>
            </div>

            <button
              type="submit"
              className={`mt-2 py-4 rounded-full font-bold text-lg transition-colors shadow-lg cursor-pointer border-none flex items-center justify-center gap-2 ${
                offerCreated
                  ? 'bg-[#109856] text-white'
                  : 'bg-[#FF8131] text-white hover:bg-[#E06D22]'
              }`}
            >
              {offerCreated ? (
                <><CheckCircle2 className="w-5 h-5" /> Offer created</>
              ) : (
                <><Send className="w-5 h-5" /> Generate trust offer</>
              )}
            </button>
          </form>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <motion.div whileHover={{ y: -5 }} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 cursor-default">
              <TrendingUp className="w-5 h-5 text-[#FF8131] mx-auto mb-1" />
              <p className="text-xs text-[#6A737D] font-semibold">Offers created</p>
              <p className="text-2xl font-extrabold text-[#030D1E]">1,247</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 cursor-default">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" style={{ color: '#109856' }} />
              <p className="text-xs text-[#6A737D] font-semibold">Accepted</p>
              <p className="text-2xl font-extrabold text-[#030D1E]">1,103</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompanySection;
