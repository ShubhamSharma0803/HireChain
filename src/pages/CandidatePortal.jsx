import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck } from 'lucide-react';
import { acceptOffer } from '../utils/contract';

const CandidatePortal = () => {
  const [offerId, setOfferId] = useState('');
  const [offerDetails, setOfferDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mocking an offer fetch
    setTimeout(() => {
      if (offerId === '123') {
        setOfferDetails({
          companyName: 'Paradigm',
          role: 'Smart Contract Auditor',
          salary: '$150,000 USDC',
          joiningDate: 'October 1st, 2026',
          status: 'Pending Verification'
        });
      } else {
        alert('Offer ID not found. Try 123.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleAccept = async () => {
    try {
      await acceptOffer(offerId);
      setOfferDetails({ ...offerDetails, status: 'Degree Verified & Accepted!' });
      alert('Offer Accepted On-Chain Successfully!');
    } catch (err) {
      alert('Failed to accept the offer.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-6 py-16 text-center"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] mb-6 tracking-tight">Candidate Verification Portal</h2>
      <p className="text-xl text-[#6A737D] mb-12 max-w-2xl mx-auto leading-relaxed">
        Input your unique cryptographic Offer ID. Your degree will be zero-knowledge verified automatically upon acceptance.
      </p>

      <form onSubmit={handleSearch} className="flex max-w-lg mx-auto mb-16 relative">
        <input 
          type="text" 
          value={offerId}
          placeholder="Enter Offer ID (e.g. 123)"
          onChange={(e) => setOfferId(e.target.value)} 
          className="w-full px-8 py-4 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:border-[#FF8131] transition-colors pr-32 shadow-sm"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-8 bg-[#030D1E] hover:bg-gray-800 text-white font-bold rounded-full transition-colors flex items-center justify-center"
        >
          {loading ? 'Searching...' : <Search className="w-5 h-5 text-current" />}
        </button>
      </form>

      {offerDetails && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8">
            <ShieldCheck className="w-16 h-16 text-[#030D1E] opacity-10" />
          </div>
          <h3 className="text-2xl font-bold text-[#030D1E] mb-6 border-b border-gray-100 pb-4">Offer Memorandum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <p className="text-sm font-semibold text-[#6A737D] uppercase tracking-wider mb-1">Employing Entity</p>
              <p className="text-xl font-bold text-[#030D1E]">{offerDetails.companyName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#6A737D] uppercase tracking-wider mb-1">Contract Role</p>
              <p className="text-xl font-bold text-[#030D1E]">{offerDetails.role}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#6A737D] uppercase tracking-wider mb-1">Base Compensation</p>
              <p className="text-xl font-bold text-[#FF8131]">{offerDetails.salary}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#6A737D] uppercase tracking-wider mb-1">Commencement Date</p>
              <p className="text-xl font-bold text-[#030D1E]">{offerDetails.joiningDate}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center border border-gray-100 mb-8">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm font-semibold text-[#6A737D] uppercase tracking-wider mb-1">Contract Status</p>
              <p className={`text-lg font-bold ${offerDetails.status.includes('Accepted') ? 'text-green-600' : 'text-orange-500'}`}>
                {offerDetails.status}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400 font-mono">
              Network: Ethereum Mainnet <br/>
              Consensus: Verified
            </div>
          </div>

          <div className="text-center">
             <button 
               onClick={handleAccept}
               disabled={offerDetails.status.includes('Accepted')}
               className={`w-full py-5 rounded-full font-bold text-lg text-white shadow-lg transition-all ${offerDetails.status.includes('Accepted') ? 'bg-green-500 cursor-not-allowed' : 'bg-[#FF8131] hover:bg-[#E06D22]'}`}
             >
               {offerDetails.status.includes('Accepted') ? 'Offer Secured via Smart Contract' : 'Verify Degree & Accept'}
             </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CandidatePortal;
