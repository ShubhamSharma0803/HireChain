import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { UserCheck, Building2, CheckCircle2, CircleDashed } from 'lucide-react';

const OfferStatus = () => {
  const { id } = useParams();

  const steps = [
    { label: 'Offer Forged on Chain', completed: true, date: 'Oct 10, 2026 14:02' },
    { label: 'Company Identity Verified', completed: true, date: 'Oct 10, 2026 14:05' },
    { label: 'Zero-Knowledge Degree Validated', completed: true, date: 'Oct 12, 2026 09:15' },
    { label: 'Offer Cryptographically Accepted', completed: false, date: 'Pending' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-6 py-16 text-center"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] mb-6 tracking-tight">Trust Verification Log</h2>
      <p className="text-xl text-[#6A737D] mb-16 max-w-2xl mx-auto leading-relaxed">
        Immutable cryptographic history for Offer #{id}. This page mathematically proves the validity of the employment pact.
      </p>

      <div className="flex flex-col md:flex-row gap-12 text-left mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-orange-50 rounded-full text-[#FF8131]">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#030D1E]">Paradigm</h3>
            <p className="text-[#6A737D] font-mono mt-1 text-sm bg-gray-50 p-2 rounded-lg">0xCompanyWalletAddress</p>
            <div className="flex items-center gap-2 mt-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" /> KYC & GST Verified
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-blue-50 rounded-full text-blue-500">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#030D1E]">Sanyam Nandal</h3>
            <p className="text-[#6A737D] font-mono mt-1 text-sm bg-gray-50 p-2 rounded-lg">0xCandidateWalletAddress</p>
            <div className="flex items-center gap-2 mt-2 text-green-600 font-semibold text-sm">
               <CheckCircle2 className="w-4 h-4" /> Degree Hash Verified
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 text-left items-start">
        <div className="flex-1 w-full relative pl-8">
           <div className="absolute top-0 bottom-0 left-[2.2rem] w-1 bg-gray-100 rounded-full z-0"></div>
           {steps.map((step, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 * idx }}
               className="relative z-10 flex gap-6 items-start mb-10"
             >
               <div className={`mt-1 bg-white rounded-full ${step.completed ? 'text-green-500' : 'text-gray-300'}`}>
                 {step.completed ? <CheckCircle2 className="w-8 h-8 drop-shadow-sm" /> : <CircleDashed className="w-8 h-8" />}
               </div>
               <div>
                  <h4 className={`text-xl font-bold ${step.completed ? 'text-[#030D1E]' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  <p className="text-sm font-mono text-gray-500 mt-1">{step.date}</p>
               </div>
             </motion.div>
           ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto lg:mx-0 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center mt-6 lg:mt-0"
        >
          <h3 className="text-lg font-bold text-[#030D1E] tracking-tight mb-6">Scan Contract Verification</h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <QRCodeSVG value={`https://etherscan.io/tx/mock_tx_hash_for_${id}`} size={200} fgColor="#030D1E" />
          </div>
          <p className="text-xs text-gray-400 font-mono mt-4">Powered by HireChain</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OfferStatus;
