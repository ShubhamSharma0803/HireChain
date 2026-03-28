import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck, Fingerprint, Briefcase, GraduationCap,
  Brain, CheckCircle2, AlertTriangle, Link2, Award,
  Mail, ShieldAlert, Loader2, Upload,
} from 'lucide-react';
import { verifyCandidate, checkResumeLogic } from '../utils/api';
import { AppContext } from '../App';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

/* High-contrast verification badge — MetaMask-style green #109856 */
const VerifiedBadge = ({ label = 'Verified' }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    whileHover={{ y: -5 }}
    className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border cursor-default verify-pulse"
    style={{ color: '#109856', backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }}
  >
    <CheckCircle2 className="w-3 h-3" /> {label}
  </motion.span>
);

const CandidateSection = () => {
  const {
    isAadhaarVerified, setIsAadhaarVerified,
    identityHash, setIdentityHash,
    candidateData, setCandidateData,
    addToast, userWallet,
  } = useContext(AppContext);

  const [bindingLoading, setBindingLoading] = useState(false);
  const [digiConnected, setDigiConnected] = useState(false);
  const [digiLoading, setDigiLoading] = useState(false);

  /* ── AI Resume State ──────────────────────────────────────── */
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Aadhaar Bind Identity → POST /verify-candidate ──────── */
  const handleBindIdentity = async () => {
    if (!userWallet) {
      addToast('Please connect your wallet first.', 'error');
      return;
    }
    setBindingLoading(true);
    try {
      // Generate a mock aadhaar hash from wallet address
      const mockAadhaarHash = `sha256_${userWallet.slice(2, 18)}`;
      const result = await verifyCandidate(mockAadhaarHash, 'dl_token_valid_001');

      if (result.status) {
        setIsAadhaarVerified(true);
        setIdentityHash(mockAadhaarHash);
        setCandidateData(result.details);
        addToast(`Identity bound — Trust score: ${result.trust_score}%`, 'success');
      } else {
        addToast(result.details?.reason || 'Aadhaar verification failed.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Aadhaar binding failed — is backend running?', 'error');
    } finally {
      setBindingLoading(false);
    }
  };

  /* ── DigiLocker Connect ─────────────────────────────────── */
  const handleDigiLocker = async () => {
    if (!isAadhaarVerified) {
      addToast('Bind your Aadhaar identity first.', 'error');
      return;
    }
    setDigiLoading(true);
    // Simulate DigiLocker OAuth (backend already returns degree data via verify-candidate)
    setTimeout(() => {
      setDigiConnected(true);
      setDigiLoading(false);
      addToast('DigiLocker connected — certificates pulled.', 'success');
    }, 1500);
  };

  /* ── AI Resume Upload → POST /check-resume-logic ─────────── */
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeLoading(true);
    setResumeResult(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target.result;
        const result = await checkResumeLogic(text);
        setResumeResult(result);
        if (result.status) {
          addToast(`Resume clean — AI Score: ${result.trust_score}%`, 'success');
        } else {
          addToast(`Impossible claims detected — Score: ${result.trust_score}%`, 'error');
        }
      } catch (err) {
        addToast(err.message || 'Resume analysis failed.', 'error');
      } finally {
        setResumeLoading(false);
      }
    };
    reader.onerror = () => {
      addToast('Failed to read file.', 'error');
      setResumeLoading(false);
    };
    reader.readAsText(file);
  };

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
          { label: 'Layer 3: Aadhaar Identity', active: isAadhaarVerified },
          { label: 'Layer 4: Escrow Floors', active: true },
          { label: 'Layer 5: AI Resume Truth-Check', active: !!resumeResult },
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
            {isAadhaarVerified && <VerifiedBadge label="Bound" />}
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-4 flex-1">
            Create a one-way on-chain hash of your Aadhaar, binding your physical identity to a single wallet. This prevents Sybil attacks and duplicate profiles.
          </p>

          {/* Show identity hash after binding */}
          {identityHash && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-sm">
              <p className="text-xs font-bold text-[#6A737D] uppercase tracking-wider mb-1">Identity Hash</p>
              <p className="font-mono text-xs text-[#030D1E] break-all">{identityHash}</p>
            </div>
          )}

          {/* Show candidate details from backend */}
          {candidateData && (
            <div className="mb-4 p-3 rounded-xl border" style={{ backgroundColor: '#e6f4ed', borderColor: '#b0dfc4' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#109856' }}>DigiLocker Data</p>
              <p className="text-sm font-semibold text-[#030D1E]">{candidateData.candidate_name}</p>
              <p className="text-xs text-[#6A737D]">{candidateData.degree} — {candidateData.university} ({candidateData.graduation_year})</p>
            </div>
          )}

          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBindIdentity}
            disabled={bindingLoading || isAadhaarVerified}
            className="w-full py-4 rounded-full font-bold text-lg transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
            style={
              isAadhaarVerified
                ? { backgroundColor: '#109856', color: '#FFFFFF' }
                : bindingLoading
                  ? { backgroundColor: '#9ca3af', color: '#FFFFFF' }
                  : { backgroundColor: '#030D1E', color: '#FFFFFF' }
            }
          >
            {bindingLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Binding…</>
            ) : isAadhaarVerified ? (
              <><CheckCircle2 className="w-5 h-5" /> Identity bound</>
            ) : (
              <><Fingerprint className="w-5 h-5" /> Bind identity</>
            )}
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
              onClick={handleDigiLocker}
              disabled={digiLoading || !isAadhaarVerified}
              className={`w-full py-4 rounded-full font-bold text-lg transition-all cursor-pointer border-none flex items-center justify-center gap-2 ${
                !isAadhaarVerified ? 'opacity-50' : ''
              }`}
              style={{ backgroundColor: digiLoading ? '#9ca3af' : '#109856', color: '#FFFFFF' }}
            >
              {digiLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Connecting…</>
              ) : (
                <><Link2 className="w-5 h-5" /> Connect DigiLocker</>
              )}
            </motion.button>
          )}

          {!isAadhaarVerified && !digiConnected && (
            <p className="mt-3 text-xs text-center text-amber-600 font-semibold">Bind Aadhaar identity first to unlock DigiLocker</p>
          )}
        </motion.div>

        {/* ── 4. AI Resume Scanner ─────────────────────────── */}
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
              <p className="text-sm text-[#6A737D]">Gemini 2.0 Flash analysis</p>
            </div>
          </div>
          <p className="text-[#6A737D] leading-relaxed mb-6">
            Upload your resume and our AI cross-references dates, tenures, and claim logic. It flags impossible timelines and inflated experiences.
          </p>

          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={resumeLoading}
            className="w-full py-4 rounded-full font-bold text-lg transition-all cursor-pointer border-2 border-dashed flex items-center justify-center gap-2 mb-6"
            style={{
              backgroundColor: resumeLoading ? '#f3f4f6' : 'white',
              borderColor: resumeLoading ? '#9ca3af' : '#FF8131',
              color: resumeLoading ? '#9ca3af' : '#FF8131',
            }}
          >
            {resumeLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Gemini…</>
            ) : (
              <><Upload className="w-5 h-5" /> Upload resume for AI scan</>
            )}
          </motion.button>

          {/* Live AI Result from Backend */}
          {resumeResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="rounded-2xl p-6 border"
              style={{
                background: resumeResult.status
                  ? 'linear-gradient(135deg, #e6f4ed, #f0faf5)'
                  : 'linear-gradient(135deg, #fffbeb, #fff7ed)',
                borderColor: resumeResult.status ? '#b0dfc4' : '#fde68a',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: resumeResult.status ? '#109856' : '#d97706' }}
                >
                  {resumeResult.status ? 'Resume verified' : 'Impossible claims detected'}
                </span>
                <span className="text-3xl font-extrabold"
                  style={{ color: resumeResult.status ? '#109856' : '#d97706' }}
                >
                  {resumeResult.trust_score}%
                </span>
              </div>

              {/* Verified Tenure Badge */}
              {resumeResult.status && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                  style={{ backgroundColor: '#109856', color: '#FFFFFF' }}
                >
                  <CheckCircle2 className="w-3 h-3" /> Verified Tenure
                </motion.div>
              )}

              {/* Gemini Full Analysis */}
              {resumeResult.details?.gemini_full_analysis && (
                <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs font-bold text-[#6A737D] uppercase tracking-wider mb-2">Gemini Analysis</p>
                  <p className="text-sm text-[#030D1E] leading-relaxed whitespace-pre-wrap">
                    {resumeResult.details.gemini_full_analysis.slice(0, 600)}
                  </p>
                </div>
              )}

              {/* AI Score Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#6A737D]"
              >
                <Brain className="w-4 h-4" />
                Analysis engine: {resumeResult.details?.analysis_engine || 'Gemini 2.0 Flash'} · {resumeResult.details?.resume_length_chars || 0} chars analyzed
              </motion.div>
            </motion.div>
          )}

          {/* Static fallback if no upload yet */}
          {!resumeResult && !resumeLoading && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Sample report</span>
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
              <p className="mt-4 text-xs text-center text-[#6A737D] font-semibold">Upload your resume above to get a real AI analysis</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CandidateSection;
