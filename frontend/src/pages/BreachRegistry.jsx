import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldX, Verified } from 'lucide-react';

const BreachRegistry = () => {
  const registryData = [
    { wallet: '0x1234abcd...56ef', entity: 'Candidate', breaches: 3, riskLevel: 'High' },
    { wallet: '0xabcd1234...ef56', entity: 'Company', breaches: 1, riskLevel: 'Low' },
    { wallet: '0x9876zxyw...01ab', entity: 'Candidate', breaches: 5, riskLevel: 'Critical' }
  ];

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto px-6 py-16 text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-red-50 rounded-full">
          <ShieldX className="w-12 h-12 text-red-500" />
        </div>
      </div>
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] mb-6 tracking-tight">Public Breach Registry</h2>
      <p className="text-xl text-[#6A737D] mb-16 max-w-3xl mx-auto leading-relaxed">
        HireChain penalizes bad actors. Ghosting or backing out of signed smart contracts irreversibly taints reputation across the decentralized network.
      </p>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-left overflow-x-auto relative">
        <h3 className="text-2xl font-bold text-[#030D1E] tracking-tight mb-8">Registered Violations</h3>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 text-[#6A737D] text-sm uppercase tracking-wider">
              <th className="pb-4 font-semibold px-4">Wallet Address</th>
              <th className="pb-4 font-semibold px-4 text-center">Entity Type</th>
              <th className="pb-4 font-semibold px-4 text-center">Breach Count</th>
              <th className="pb-4 font-semibold px-4 text-right">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {registryData.map((row, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="border-b border-gray-50 hover:bg-red-50/50 transition-colors"
              >
                <td className="py-6 px-4 font-mono text-[#030D1E] font-medium flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  {row.wallet}
                </td>
                <td className="py-6 px-4 text-center text-[#6A737D] font-medium">{row.entity}</td>
                <td className="py-6 px-4 text-center">
                  <span className="inline-flex items-center gap-1 font-bold text-[#030D1E]">
                     <AlertTriangle className="w-4 h-4 text-orange-500" /> {row.breaches}
                  </span>
                </td>
                <td className="py-6 px-4 text-right">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getRiskColor(row.riskLevel)}`}>
                    {row.riskLevel}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {registryData.length === 0 && (
           <div className="text-center py-20 text-gray-400 font-medium">
              <Verified className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              The network is clean. No breaches registered.
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default BreachRegistry;
