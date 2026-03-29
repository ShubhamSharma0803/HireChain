import React, { useState, useContext, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ElectricBorder from './ElectricBorder';
import Grainient from './Grainient';
import {
  ShieldCheck,
  CheckCircle2, AlertTriangle, FileText, Loader2,
} from 'lucide-react';
import { ESCROW_FLOOR, createOffer, CONTRACT_ADDRESS } from '../utils/contract';
import QRCodeDisplay from './QRCodeDisplay';
import { verifyGST } from '../utils/api';
import { AppContext } from '../App';

/* ── Trust Score Circular Progress (Minimal) ─────────────── */
const TrustProgress = ({ score, color = 'rgba(255,255,255,0.9)' }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--border-card)" strokeWidth="8" />
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
        <span className="text-[38px] font-semibold tracking-tight text-[var(--text-primary)]">{score}%</span>
      </div>
    </div>
  );
};

const CompanySection = () => {
  const { isGSTVerified, setIsGSTVerified, setGstTrustData, gstTrustData, addToast, userWallet } = useContext(AppContext);

  const [gst, setGst] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', wallet: '', salary: '' });
  const [offerCreated, setOfferCreated] = useState(false);

  /* Scroll-Linked Exit Animation */
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["end 80%", "end start"]
  });

  const exitScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const exitOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  /* ── API CALLS (Preserved) ──────────────────────────────── */
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
        const reason = result.details?.reason || result.details?.layer_3_mca21 || 'GST not found in registry.';
        addToast(`Verification failed: ${typeof reason === 'string' ? reason : 'Not found in registry'}`, 'error');
      }
    } catch (err) {
      addToast(err.message || 'Verification failed.', 'error');
      setIsGSTVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!isGSTVerified) { addToast('Verify details first.', 'error'); return; }
    const salaryNum = Number(form.salary);
    if (salaryNum < ESCROW_FLOOR) { addToast(`Minimum escrow is ₹${ESCROW_FLOOR.toLocaleString()} USDC`, 'error'); return; }
    if (!userWallet) { addToast('Connect your wallet first.', 'error'); return; }
    
    setLoading(true);
    try {
      // Joining timestamp 30 days into the future
      const joiningDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      await createOffer(form.wallet, form.title, salaryNum, joiningDate);
      setOfferCreated(true);
      addToast(`Offer generated: ${form.title} — ₹${salaryNum.toLocaleString()} USDC escrowed`, 'success');
    } catch (err) {
      addToast(err.message || 'Transaction failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mca = gstTrustData?.details?.layer_3_mca21;
  const trustScore = gstTrustData?.trust_score;

  return (
    <section 
      id="company" 
      ref={sectionRef}
      className="relative min-h-[120vh] flex flex-col justify-center items-center py-24 px-6 md:px-12 w-full"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Background Entrance */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none z-0"
      />

      <motion.div 
        style={{ scale: exitScale, opacity: exitOpacity }}
        className="w-full max-w-[1200px] relative z-10"
      >
        {/* Massive Card (Scale Entrance) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          <ElectricBorder color="rgba(255, 255, 255, 0.15)" speed={0.5} chaos={0.08} borderRadius={24}>
            <div 
              className="editorial-card w-full relative overflow-hidden border border-[#E64A19]/20 shadow-xl rounded-[24px]"
              style={{ backgroundColor: '#111111', '--text-primary': '#FAFAFA', '--text-secondary': '#E0E0E0', '--border-card': 'rgba(255,255,255,0.1)' }}
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

              <div className="relative z-10 w-full h-full p-10 md:p-14 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  {/* Section Header */}
                  <div className="flex flex-col items-center justify-center text-center mb-16">
                    <span className="editorial-label mb-4">Enterprise Node</span>
                    <h2 className="editorial-heading">Company Trust Gate</h2>
                    <p className="editorial-body max-w-2xl mt-4">
                      Validate business entities structurally. The protocol strictly enforces a multi-layer consensus covering GST registries and off-chain AI heuristics.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* LEFT COLUMN */}
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="w-5 h-5 text-white/90" />
                        <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Entity Parameters</h3>
                      </div>
                      
                      <form className="flex flex-col gap-6" onSubmit={handleTrustCheck}>
                        <div>
                          <label className="editorial-label block mb-3">GST Number / Signature</label>
                          <input
                            type="text" value={gst} onChange={(e) => setGst(e.target.value)} required
                            className="w-full editorial-input font-mono uppercase tracking-wider bg-black/20 border-white/20 !text-white !placeholder-white/40 focus:border-white focus:bg-black/40 backdrop-blur-md transition-all"
                            placeholder="22AAAAA0000A1Z5"
                          />
                        </div>
                        <button
                          type="submit" disabled={loading}
                          className={`w-full text-[17px] font-semibold tracking-wide py-4 rounded-lg bg-black/30 border border-white/20 text-white hover:bg-black/50 backdrop-blur-md transition flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Sequence'}
                        </button>
                      </form>

                      {gstTrustData && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="mt-12 pt-10 border-t border-[var(--border-card)]"
                        >
                          <h4 className="text-2xl font-semibold flex items-center justify-between text-[var(--text-primary)] mb-8">
                            <span>Heuristics Evaluated</span>
                            {isGSTVerified ? 
                              <CheckCircle2 className="w-5 h-5 text-white/90" /> : 
                              <AlertTriangle className="w-5 h-5 text-white/40" />
                            }
                          </h4>

                          <TrustProgress score={trustScore} color={isGSTVerified ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />

                          {isGSTVerified && typeof mca === 'object' && (
                            <div className="grid grid-cols-3 gap-4 mt-10">
                              {[
                                { label: 'Lifespan', value: `${mca.company_age_years} yrs` },
                                { label: 'Type', value: mca.entity_type },
                                { label: 'State', value: mca.status },
                              ].map((stat, i) => (
                                <div key={i} className="text-center p-4 bg-[rgba(0,0,0,0.03)] rounded-lg border border-[var(--border-card)]">
                                  <p className="editorial-label mb-2 opacity-60">{stat.label}</p>
                                  <p className="text-base font-semibold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {gstTrustData.details?.layer_2_ai && (
                            <div className="mt-6 p-5 bg-[rgba(0,0,0,0.03)] rounded-lg border border-[var(--border-card)]">
                              <p className="editorial-label mb-3 text-[var(--text-secondary)]">Vector Analysis</p>
                              <p className="text-[17px] leading-relaxed text-[var(--text-secondary)]">
                                {typeof gstTrustData.details.layer_2_ai === 'string'
                                  ? gstTrustData.details.layer_2_ai.slice(0, 500)
                                  : "Verified via structured data endpoints mapping against registry schemas."}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <FileText className="w-5 h-5 text-white/90" />
                        <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Offer Constructor</h3>
                      </div>

                      {!isGSTVerified && (
                        <div className="flex items-start gap-4 p-5 rounded-lg mb-8 bg-black/40 backdrop-blur-md border border-white/10 text-white/90">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-white/70" />
                          <p className="text-[17px] font-medium leading-relaxed">Identity resolution required. Complete the sequential checks on the left to unlock cryptographic offer minting.</p>
                        </div>
                      )}

                      {offerCreated ? (
                        <div className="mt-4 fade-in">
                          <QRCodeDisplay offerId={1} contractAddress={CONTRACT_ADDRESS} />
                        </div>
                      ) : (
                        <form className={`flex flex-col gap-6 ${!isGSTVerified ? 'opacity-30 pointer-events-none' : ''}`} onSubmit={handleCreateOffer}>
                          <div>
                            <label className="editorial-label block mb-3">Target Profile Title</label>
                            <input
                              type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                              className="w-full editorial-input bg-black/20 border-white/20 !text-white !placeholder-white/40 focus:border-white focus:bg-black/40 backdrop-blur-md transition-all" placeholder="Protocol Engineer"
                            />
                          </div>
                          <div>
                            <label className="editorial-label block mb-3">Destination Address</label>
                            <input
                              type="text" value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} required
                              className="w-full editorial-input font-mono tracking-wider text-base bg-black/20 border-white/20 !text-white !placeholder-white/40 focus:border-white focus:bg-black/40 backdrop-blur-md transition-all" placeholder="0x..."
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="editorial-label">Liquidity Lock (USDC)</label>
                              <span className="editorial-label opacity-60">Floor: {ESCROW_FLOOR}</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-semibold text-white/50">$</span>
                              <input
                                type="number" min={ESCROW_FLOOR} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required
                                className="w-full pl-9 editorial-input bg-black/20 border-white/20 !text-white !placeholder-white/40 focus:border-white focus:bg-black/40 backdrop-blur-md transition-all" placeholder={ESCROW_FLOOR.toString()}
                              />
                            </div>
                          </div>
  
                          <p className="text-[19px] leading-relaxed text-[var(--text-secondary)] pb-2">
                            Constructing this offer permanently locks funds into resolving protocol escrows for a 30-day epoch.
                          </p>
  
                          <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-[#111] font-semibold text-[17px] tracking-wide py-4 rounded-full bg-white hover:bg-white/90 shadow-xl transition-all ${loading ? 'opacity-60 scale-95' : 'hover:scale-[1.02]'}`}
                          >
                            {loading ? 'Minting Contract...' : 'Generate Hash & Mint'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </ElectricBorder>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CompanySection;
