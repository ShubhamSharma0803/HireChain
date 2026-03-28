import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, ShieldCheck, BarChart3, Send,
  CheckCircle2, AlertTriangle, FileText, TrendingUp,
} from 'lucide-react';
import { ESCROW_FLOOR } from '../utils/contract';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const CompanySection = () => {
  const [gst, setGst] = useState('');
  const [cin, setCin] = useState('');
  const [trustResult, setTrustResult] = useState(null);
  const [form, setForm] = useState({ title: '', wallet: '', salary: '' });

  const handleTrustCheck = (e) => {
    e.preventDefault();
    // Mock AI Trust Score result
    setTrustResult({
      companyAge: 12,
      taxRating: 'A+',
      registrationStatus: 'Active',
      aiScore: 94,
    });
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    const salaryNum = Number(form.salary);
    if (salaryNum < ESCROW_FLOOR) {
      alert(`Minimum escrow is ₹${ESCROW_FLOOR.toLocaleString()} USDC`);
      return;
    }
    alert(`Offer created for ${form.title} — ₹${salaryNum.toLocaleString()} USDC escrowed.`);
  };

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
          'Layer 1: GST & MCA21 Cross-Check',
          'Layer 2: AI Trust Score',
        ].map((layer, i) => (
          <motion.span
            key={i} whileHover={{ y: -5 }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border cursor-default"
            style={{ color: '#109856', backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }}
          >
            <CheckCircle2 className="w-3 h-3" /> {layer}
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
            <div>
              <label className="text-sm font-semibold text-[#6A737D] mb-1 block">MCA21 CIN</label>
              <input
                type="text" value={cin} onChange={(e) => setCin(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all"
                placeholder="U72200MH2009PTC123456"
              />
            </div>
            <button type="submit" className="mt-2 bg-[#030D1E] text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-colors cursor-pointer border-none">
              Run trust verification
            </button>
          </form>

          {/* AI Trust Score Card — uses #109856 green */}
          {trustResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl p-6 border"
              style={{ background: 'linear-gradient(135deg, #e6f4ed, #f0faf5)', borderColor: '#b0dfc4' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#030D1E] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: '#109856' }} /> AI trust score
                </h4>
                <span className="text-3xl font-extrabold" style={{ color: '#109856' }}>{trustResult.aiScore}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                  <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Company age</p>
                  <p className="text-lg font-bold text-[#030D1E] mt-1">{trustResult.companyAge} yrs</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                  <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Tax rating</p>
                  <p className="text-lg font-bold text-[#030D1E] mt-1">{trustResult.taxRating}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border" style={{ borderColor: '#b0dfc4' }}>
                  <p className="text-xs text-[#6A737D] font-semibold uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold mt-1 flex items-center justify-center gap-1" style={{ color: '#109856' }}>
                    <CheckCircle2 className="w-4 h-4" /> {trustResult.registrationStatus}
                  </p>
                </div>
              </div>
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
          <form className="flex flex-col gap-4" onSubmit={handleCreateOffer}>
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

            <button type="submit" className="mt-2 bg-[#FF8131] text-white py-4 rounded-full font-bold text-lg hover:bg-[#E06D22] transition-colors shadow-lg cursor-pointer border-none flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> Generate trust offer
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
