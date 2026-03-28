import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchBreachRegistry } from '../utils/api';

const fallbackData = [
  { wallet: '0x1a2b…9c3d', entity: 'Candidate', breaches: 1, flags: 1, status: 'Active',   delay: '28 days left', priorRelationship: false },
  { wallet: '0x4e5f…8a1b', entity: 'Company',   breaches: 3, flags: 3, status: 'Frozen',   delay: 'Frozen',       priorRelationship: true },
  { wallet: '0x7c8d…2e4f', entity: 'Candidate', breaches: 2, flags: 2, status: 'Warned',   delay: '12 days left', priorRelationship: false },
  { wallet: '0xab12…de34', entity: 'Company',   breaches: 1, flags: 1, status: 'Active',   delay: '30 days left', priorRelationship: true },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const RegistrySection = () => {
  const [registryData, setRegistryData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const data = await fetchBreachRegistry();
        if (data.entries && data.entries.length > 0) {
          setRegistryData(data.entries);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    loadRegistry();
  }, []);

  return (
    <section id="registry" className="relative py-32 px-6 md:px-12 max-w-[1200px] mx-auto w-full z-10">

      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-24"
      >
        <span className="editorial-label mb-4 block">Accountability</span>
        <h2 className="editorial-heading">Breach Registry</h2>
        <p className="editorial-body max-w-2xl mx-auto mt-4">
          Ghosting has consequences. Every protocol breach is recorded immutably with a 30-day dispute window.
        </p>
      </motion.div>

      {/* Grid view of incidents instead of a basic table */ }
      <motion.div
        variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          <div className="col-span-full py-16 text-center text-[var(--text-secondary)] editorial-label">Loading Network Data...</div>
        ) : (
          registryData.map((row, i) => (
            <motion.div
              variants={item}
              key={i}
              className="editorial-card-interactive editorial-card p-8 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="editorial-label mb-2 opacity-50">Entity Trace</p>
                  <p className="font-mono text-[var(--text-primary)] tracking-wider font-semibold text-[17px]">{row.wallet}</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'Frozen' ? 'bg-red-500' : 'bg-[var(--accent-color)]'}`} />
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="editorial-label mb-1.5 opacity-40">Class</p>
                  <p className="text-[17px] text-[var(--text-primary)]">{row.entity}</p>
                </div>
                <div>
                  <p className="editorial-label mb-1.5 opacity-40">State</p>
                  <p className="text-[17px] text-[var(--text-primary)]">{row.status}</p>
                </div>
                <div>
                  <p className="editorial-label mb-1.5 opacity-40">Strikes</p>
                  <p className="text-[17px] font-semibold text-[var(--text-primary)]">{row.flags} / 3</p>
                </div>
                <div>
                  <p className="editorial-label mb-1.5 opacity-40">Epoch Window</p>
                  <p className="text-[17px] font-mono text-[var(--text-secondary)]">{row.delay}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </section>
  );
};

export default RegistrySection;
