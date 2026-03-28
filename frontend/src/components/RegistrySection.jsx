import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldX, AlertTriangle, Clock, Lock, Ban, Loader2 } from 'lucide-react';
import { fetchBreachRegistry } from '../utils/api';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

/* ── Fallback data if backend doesn't have /breach-registry yet ── */
const fallbackData = [
  { wallet: '0x1a2b…9c3d', entity: 'Candidate', breaches: 1, flags: 1, status: 'Active',   delay: '28 days left', priorRelationship: false },
  { wallet: '0x4e5f…8a1b', entity: 'Company',   breaches: 3, flags: 3, status: 'Frozen',   delay: 'Frozen',       priorRelationship: true },
  { wallet: '0x7c8d…2e4f', entity: 'Candidate', breaches: 2, flags: 2, status: 'Warned',   delay: '12 days left', priorRelationship: false },
  { wallet: '0xab12…de34', entity: 'Company',   breaches: 1, flags: 1, status: 'Active',   delay: '30 days left', priorRelationship: true },
];

const getRiskStyle = (flags) => {
  if (flags >= 3) return 'bg-red-100 text-red-800';
  if (flags >= 2) return 'bg-orange-100 text-orange-800';
  return 'bg-yellow-100 text-yellow-800';
};

const getStatusIcon = (status) => {
  if (status === 'Frozen') return <Lock className="w-4 h-4" />;
  if (status === 'Warned') return <AlertTriangle className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

const RegistrySection = () => {
  const [registryData, setRegistryData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  /* ── Fetch breach registry from backend on mount ─────────── */
  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const data = await fetchBreachRegistry();
        if (data.entries && data.entries.length > 0) {
          setRegistryData(data.entries);
        }
        // If empty, keep fallback data
      } catch {
        // Backend may not have this endpoint — keep fallback
      } finally {
        setLoading(false);
      }
    };
    loadRegistry();
  }, []);

  return (
    <section id="registry" className="relative py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-bold mb-6">
          <ShieldX className="w-4 h-4" /> Public accountability
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] tracking-tight">Breach registry</h2>
        <p className="mt-4 text-lg text-[#6A737D] max-w-2xl mx-auto leading-relaxed">
          Ghosting has consequences. Every breach is recorded immutably with a 30-day dispute window and a 3-flag freeze threshold.
        </p>
      </motion.div>

      {/* Rules Cards */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={float}
        className="grid sm:grid-cols-3 gap-4 mb-10"
      >
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-3 items-start">
          <Clock className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#030D1E]">30-day delay notice</p>
            <p className="text-xs text-[#6A737D] mt-1">Breaches are published only after the dispute window closes.</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-3 items-start">
          <Lock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#030D1E]">3-flag freeze</p>
            <p className="text-xs text-[#6A737D] mt-1">3 confirmed breaches permanently freeze the wallet from new offers.</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-3 items-start">
          <Ban className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#030D1E]">No reputation gaming</p>
            <p className="text-xs text-[#6A737D] mt-1">Wallets with prior on-chain relationships cannot boost each other's scores.</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={float}
        className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-x-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[#6A737D]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-semibold">Loading breach registry from backend…</span>
          </div>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-[#6A737D] text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold px-4">Wallet</th>
                <th className="pb-4 font-semibold px-4 text-center">Entity</th>
                <th className="pb-4 font-semibold px-4 text-center">Breaches</th>
                <th className="pb-4 font-semibold px-4 text-center">Flags</th>
                <th className="pb-4 font-semibold px-4 text-center">Dispute window</th>
                <th className="pb-4 font-semibold px-4 text-center">Prior relationship</th>
                <th className="pb-4 font-semibold px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {registryData.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.08 * i }}
                  className="border-b border-gray-50 hover:bg-red-50/30 transition-colors"
                >
                  <td className="py-5 px-4 font-mono text-sm font-medium text-[#030D1E] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    {row.wallet}
                  </td>
                  <td className="py-5 px-4 text-center text-sm text-[#6A737D] font-medium">{row.entity}</td>
                  <td className="py-5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-[#030D1E]">
                      <AlertTriangle className="w-4 h-4 text-orange-500" /> {row.breaches}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskStyle(row.flags)}`}>
                      {row.flags} / 3
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center text-sm text-[#6A737D] font-mono">{row.delay}</td>
                  <td className="py-5 px-4 text-center">
                    {row.priorRelationship ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">Blocked</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                      row.status === 'Frozen' ? 'bg-red-100 text-red-700' : row.status === 'Warned' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getStatusIcon(row.status)} {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </section>
  );
};

export default RegistrySection;
