import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck, Fingerprint, Briefcase, GraduationCap,
  Brain, CheckCircle2, AlertTriangle, Link2, Award,
  Mail, ShieldAlert,
} from 'lucide-react';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* High-contrast verification badge — MetaMask-style green #109856 */
const VerifiedBadge = ({ label = 'Verified' }) => (
  <motion.span
    whileHover={{ y: -5 }}
    className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border cursor-default"
    style={{ color: '#109856', backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }}
  >
    <CheckCircle2 className="w-3 h-3" /> {label}
  </motion.span>
);

const CandidateSection = () => {
  const [identityBound, setIdentityBound] = useState(false);
  const [digiConnected, setDigiConnected] = useState(false);

  return (
    <section id="candidate" className="relative py-28 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Title */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6">
          <UserCheck className="w-4 h-4" /> For candidates
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] tracking-tight">Candidate verification suite</h2>
        <p className="mt-4 text-lg text-[#6A737D] max-w-2xl mx-auto leading-relaxed">
          Bind your identity, verify your resume, and accept offers — all cryptographically provable.
        </p>
      </motion.div>

      {/* Trust Layers Legend */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {[
          'Layer 3: Aadhaar Identity',
          'Layer 4: Escrow Floors',
          'Layer 5: AI Resume Truth-Check',
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

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* ── 1. Aadhaar Identity ──────────────────────────── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-violet-50 text-violet-600">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#030D1E]">Aadhaar identity</h3>
                <p className="text-sm text-[#6A737D]">1 Human = 1 Wallet</p>
              </div>
            </div>
            {identityBound && <VerifiedBadge label="Bound" />}
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-6 flex-1">
            Create a one-way on-chain hash of your Aadhaar, binding your physical identity to a single wallet. This prevents Sybil attacks and duplicate profiles.
          </p>
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIdentityBound(true)}
            className="w-full py-4 rounded-full font-bold text-lg transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
            style={
              identityBound
                ? { backgroundColor: '#109856', color: '#FFFFFF' }
                : { backgroundColor: '#030D1E', color: '#FFFFFF' }
            }
          >
            {identityBound ? <><CheckCircle2 className="w-5 h-5" /> Identity bound</> : <><Fingerprint className="w-5 h-5" /> Bind identity</>}
          </motion.button>
        </motion.div>

        {/* ── 2. Work History (MCA21 Email) ────────────────── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#030D1E]">Work history verification</h3>
              <p className="text-sm text-[#6A737D]">MCA21-linked email confirmation</p>
            </div>
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-6">
            We cross-reference your claimed employer against MCA21 registry and send an automated verification email to the company domain.
          </p>

          {/* Mock verified entries */}
          <div className="space-y-3">
            {[
              { company: 'Paradigm Inc.', domain: 'paradigm.xyz', verified: true },
              { company: 'Polygon Labs', domain: 'polygon.technology', verified: true },
              { company: 'Freelance', domain: '—', verified: false },
            ].map((entry, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#6A737D]" />
                  <div>
                    <p className="text-sm font-semibold text-[#030D1E]">{entry.company}</p>
                    <p className="text-xs font-mono text-[#6A737D]">{entry.domain}</p>
                  </div>
                </div>
                {entry.verified ? (
                  <VerifiedBadge />
                ) : (
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Unverifiable</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. DigiLocker Skills ─────────────────────────── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#030D1E]">DigiLocker skills</h3>
                <p className="text-sm text-[#6A737D]">NPTEL & NASSCOM certificates</p>
              </div>
            </div>
            {digiConnected && <VerifiedBadge label="Connected" />}
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-6">
            Connect your DigiLocker via OAuth to pull verified NPTEL, NASSCOM, and university certificates directly into your on-chain resume.
          </p>

          {digiConnected ? (
            <div className="space-y-3">
              {[
                { name: 'Data Structures & Algorithms', issuer: 'NPTEL', date: 'Mar 2025' },
                { name: 'Full Stack Development', issuer: 'NASSCOM', date: 'Aug 2025' },
              ].map((cert, i) => (
                <motion.div
                  key={i} whileHover={{ y: -5 }}
                  className="flex items-center justify-between p-3 rounded-xl border"
                  style={{ backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4" style={{ color: '#109856' }} />
                    <div>
                      <p className="text-sm font-semibold text-[#030D1E]">{cert.name}</p>
                      <p className="text-xs text-[#6A737D]">{cert.issuer} · {cert.date}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#109856' }} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDigiConnected(true)}
              className="w-full py-4 rounded-full font-bold text-lg text-white hover:opacity-90 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ backgroundColor: '#109856' }}
            >
              <Link2 className="w-5 h-5" /> Connect DigiLocker
            </motion.button>
          )}
        </motion.div>

        {/* ── 4. AI Consistency Score ──────────────────────── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#030D1E]">AI consistency score</h3>
              <p className="text-sm text-[#6A737D]">Claude logic analysis</p>
            </div>
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-6">
            Our AI cross-references dates, tenures, and claim logic. It flags impossible timelines and inflated experiences.
          </p>

          {/* Mock AI result card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Consistency report</span>
              <span className="text-3xl font-extrabold text-amber-600">78%</span>
            </div>
            <div className="space-y-2">
              <motion.div whileHover={{ y: -5 }} className="flex items-start gap-2 p-3 rounded-xl bg-white border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-[#030D1E]">
                  <span className="font-bold">Warning:</span> Impossible tenure claim — 3 years at Company X but LinkedIn shows 14 months.
                </p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="flex items-start gap-2 p-3 rounded-xl bg-white border" style={{ borderColor: '#b0dfc4' }}>
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#109856' }} />
                <p className="text-sm text-[#030D1E]">Education timeline verified — B.Tech 2020–2024 matches NPTEL certificate dates.</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="flex items-start gap-2 p-3 rounded-xl bg-white border border-amber-100">
                <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-[#030D1E]">
                  <span className="font-bold">Notice:</span> Skill gap detected — claims "Solidity expert" with no blockchain project evidence.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CandidateSection;
