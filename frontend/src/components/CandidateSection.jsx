import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Grainient from './Grainient';
import {
  Briefcase, GraduationCap,
  Brain, CheckCircle2, AlertTriangle, Award,
  Loader2, Upload,
} from 'lucide-react';
import { checkResumeLogic } from '../utils/api';
import { AppContext } from '../App';
import { getOffer, acceptOffer, confirmJoining, reportBreach } from '../utils/contract';
import OfferCard from './OfferCard';

/* Verified badge — dark minimal mode */
const VerifiedBadge = ({ label = 'Verified' }) => (
  <span
    className="flex items-center gap-2 text-[17px] uppercase tracking-[0.1em] font-semibold px-4 py-2 rounded-full cursor-default border border-white/20 bg-black/20 backdrop-blur-md text-white/90"
  >
    <CheckCircle2 className="w-3.5 h-3.5 text-white/90" /> {label}
  </span>
);

/* ── Trust Score Circular Progress (Minimal) ─────────────── */
const TrustProgress = ({ score, color = 'rgba(255,255,255,0.9)' }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <motion.circle
          cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[38px] font-semibold tracking-tight text-white">{score}%</span>
      </div>
    </div>
  );
};

const CandidateSection = () => {
  const { addToast } = useContext(AppContext);

  const [digiConnected, setDigiConnected] = useState(false);
  const [digiLoading, setDigiLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const fileInputRef = useRef(null);

  /* Scroll-Linked Exit Animation */
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["end 80%", "end start"]
  });
  const exitScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const exitOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  /* ── API CALLS ────────────────────────────────── */
  const [offer, setOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    // Poll the contract for offer ID 1
    const fetchOffer = async () => {
      try {
        const o = await getOffer(1);
        if (o && o.company !== "0x0000000000000000000000000000000000000000") {
          setOffer(o);
        }
      } catch (e) {
        // Ignore, offer might not exist
      }
    };
    
    // Check every 5 seconds
    fetchOffer();
    const interval = setInterval(fetchOffer, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (id) => {
    setOfferLoading(true);
    try {
      await acceptOffer(id, offer.escrowAmount);
      addToast('Offer accepted and escrow locked.', 'success');
      const o = await getOffer(1);
      setOffer(o);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    setOfferLoading(true);
    try {
      await confirmJoining(id);
      addToast('Joining confirmed. Waiting for company.', 'success');
      const o = await getOffer(1);
      setOffer(o);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleBreach = async (id) => {
    setOfferLoading(true);
    try {
      await reportBreach(id);
      addToast('Breach reported. Escrow seized.', 'success');
      const o = await getOffer(1);
      setOffer(o);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleDigiLocker = async () => {
    setDigiLoading(true);
    setTimeout(() => {
      setDigiConnected(true);
      setDigiLoading(false);
      addToast('DigiLocker synchronization complete.', 'success');
    }, 1500);
  };

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
          addToast(`Vector clean. Match: ${result.trust_score}%`, 'success');
        } else {
          addToast(`Anomaly flag. Match: ${result.trust_score}%`, 'error');
        }
      } catch (err) {
        addToast(err.message || 'Analysis failed.', 'error');
      } finally {
        setResumeLoading(false);
      }
    };
    reader.onerror = () => {
      addToast('I/O error.', 'error');
      setResumeLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <section 
      id="candidate" 
      ref={sectionRef}
      className="relative min-h-[120vh] flex flex-col justify-center items-center py-24 px-6 md:px-12 w-full"
      style={{ backgroundColor: 'transparent' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
      />

      <motion.div 
        style={{ scale: exitScale, opacity: exitOpacity }}
        className="w-full max-w-[1200px] relative z-10"
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-card w-full relative overflow-hidden border border-[#E64A19]/20 shadow-xl rounded-[24px]"
          style={{ backgroundColor: '#111111', '--text-primary': '#FAFAFA', '--text-secondary': '#E0E0E0', '--border-card': 'rgba(255,255,255,0.1)', '--border-subtle': 'rgba(255,255,255,0.05)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            <Grainient 
              className="w-full h-full object-cover"
              color1="#3A4A40" 
              color2="#E64A19" 
              color3="#FFE0D2" 
              grainAnimated={true}
              timeSpeed={0.25}
              zoom={1.5}
              contrast={1.0}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            className="relative z-10 w-full h-full p-10 md:p-14"
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center justify-center text-center mb-16">
              <span className="editorial-label mb-4">Talent Node</span>
              <h2 className="editorial-heading">Verifiable ID Suite</h2>
              <p className="editorial-body max-w-2xl mt-4">
                A unified construct to bind your deterministic identity. Eliminate redundant screening by porting verified logic states structurally.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

              {/* LEFT — DigiLocker + MCA21 */}
              <div className="flex flex-col gap-12">
                
                {/* Box 1 (Was Hardware Binding, now DigiLocker) */}
                <div>
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="w-6 h-6 text-white/90" />
                      <div>
                        <h3 className="text-[34px] font-semibold text-white tracking-tight">DigiLocker</h3>
                      </div>
                    </div>
                    {digiConnected && <VerifiedBadge label="Synced" />}
                  </div>

                  <p className="editorial-body mb-8">
                    Initiate an OAuth mapping to your state-issued records. Generates a secure token enabling access to educational credentials instantly.
                  </p>

                  {digiConnected ? (
                    <div className="space-y-4 mb-8">
                      {[
                        { name: 'Data Structures', issuer: 'NPTEL', date: 'Mar 2025' },
                        { name: 'Full Stack Engineering', issuer: 'NASSCOM', date: 'Aug 2025' },
                      ].map((cert, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-lg border border-[var(--border-card)] bg-[rgba(0,0,0,0.02)]">
                          <div>
                            <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-1">{cert.name}</p>
                            <p className="text-[19px] text-[var(--text-secondary)] tracking-wide">{cert.issuer} • {cert.date}</p>
                          </div>
                          <Award className="w-5 h-5 text-[var(--accent-color)]" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={handleDigiLocker}
                      disabled={digiLoading}
                      className="w-full text-[#111] font-semibold text-[17px] tracking-wide py-4 bg-white hover:bg-white/90 rounded-full transition shadow-lg flex items-center justify-center gap-2"
                    >
                      {digiLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'OAuth DigiLocker'}
                    </button>
                  )}
                </div>

                {/* Box 2 (Corporate Ledgers) */}
                <div className="pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4 mb-10">
                    <Briefcase className="w-6 h-6 text-white/90" />
                    <h3 className="text-[34px] font-semibold text-white tracking-tight">Corporate Ledgers</h3>
                  </div>

                  <div className="space-y-4 pl-3 relative border-l border-white/20">
                    {[
                      { company: 'Paradigm Inc.', domain: 'paradigm.xyz', verified: true },
                      { company: 'Polygon Labs', domain: 'polygon.technology', verified: true },
                      { company: 'Freelance', domain: '—', verified: false },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center justify-between pl-6 py-2 relative">
                        <div className={`absolute -left-[5px] w-[9px] h-[9px] rounded-full ${entry.verified ? 'bg-white' : 'bg-white/20'}`} />
                        <div>
                          <p className="text-[18px] font-semibold text-white">{entry.company}</p>
                          <p className="editorial-label opacity-60 mt-1">{entry.domain}</p>
                        </div>
                        {entry.verified ? <span className="editorial-label text-white/90">Linked</span> : <span className="editorial-label text-white/40">Pending</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — Resume Analyser */}
              <div className="flex flex-col gap-12">

                {/* Box 3 (Resume Analyser) */}
                <div>
                  <div className="flex items-center flex-col md:flex-row justify-between mb-8 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <Brain className="w-6 h-6 text-white/90" />
                      <h3 className="text-[34px] font-semibold text-white tracking-tight">Resume Analyser</h3>
                    </div>
                  </div>

                  <p className="editorial-body mb-8">
                    Cross-reference PDF semantics directly against your active block-state. Any time-overlap anomalies or fabricated experiences are isolated instantly.
                  </p>

                  <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={resumeLoading}
                    className="w-full text-white font-semibold text-[17px] tracking-wide py-4 bg-black/40 backdrop-blur-md rounded-lg transition shadow-none border border-white/30 hover:bg-black/60 flex items-center justify-center gap-2 mb-8"
                  >
                    {resumeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5"/> Input Document Matrix</>}
                  </button>

                  {resumeResult ? (
                    <div className="rounded-xl p-6 bg-black/30 backdrop-blur-md border border-white/10 mt-4">
                      <div className="flex items-center justify-between mb-8">
                        <span className="editorial-label text-white/90">
                          {resumeResult.status ? 'Verified Clean' : 'Anomalies Detected'}
                        </span>
                      </div>
                      <TrustProgress score={resumeResult.trust_score} color={resumeResult.status ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
                      {resumeResult.details?.ai_full_analysis && (
                        <div className="mt-8 p-5 rounded-lg bg-black/20 border border-white/10">
                          <p className="editorial-label opacity-70 mb-3 text-white">Vector Analysis</p>
                          <p className="text-[17px] leading-relaxed text-white/80">
                            {resumeResult.details.ai_full_analysis.slice(0, 300)}...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl p-6 bg-black/20 backdrop-blur-md border border-white/10 mt-4 opacity-70">
                      <div className="flex items-center justify-between mb-8">
                        <span className="editorial-label text-white/60">Mock Data</span>
                        <span className="text-[38px] font-semibold text-white/80">78%</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-white/60" />
                          <p className="text-[18px] text-white/80">Overlap conflict: paradigm.xyz presence invalidates polygon data.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIVE OFFERS SECTIONS BELOW GRID */}
            <div className="mt-20 pt-10 border-t border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <Briefcase className="w-6 h-6 text-white/90" />
                <h3 className="text-[34px] font-semibold text-white tracking-tight">Active Protocol Offers</h3>
              </div>
              
              {offer ? (
                <OfferCard 
                  offer={offer}
                  onAccept={handleAccept}
                  onConfirm={handleConfirm}
                  onBreach={handleBreach}
                  loading={offerLoading}
                />
              ) : (
                <p className="text-white/50 bg-white/5 p-6 rounded-xl border border-white/5 text-center editorial-body">
                  Awaiting cryptographically secure offer from employer. Minting...
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CandidateSection;
