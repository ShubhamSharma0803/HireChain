import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { createOffer } from '../utils/contract';

const CompanyDashboard = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    salary: '',
    joiningDate: '',
    candidateWallet: '',
    gstNumber: '',
    degreeBase64: ''
  });
  const [offers, setOffers] = useState([
    { id: 1, role: 'Senior Smart Contract Eng.', status: 'Pending', txHash: '0xabc...def' },
    { id: 2, role: 'Frontend Lead', status: 'Accepted', txHash: '0x123...456' },
  ]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, degreeBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const txHash = await createOffer(
        formData.candidateWallet,
        formData.jobTitle,
        formData.salary,
        new Date(formData.joiningDate).getTime(),
        "mockDegreeHash123" // In reality, this would be generated from degreeBase64
      );
      
      const newOffer = {
        id: offers.length + 1,
        role: formData.jobTitle,
        status: 'Pending',
        txHash: `${txHash.substring(0, 5)}...${txHash.substring(txHash.length - 3)}`
      };
      setOffers([newOffer, ...offers]);
      alert('Offer Created Successfully!');
    } catch (err) {
      alert('Failed to create offer.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Create Offer Form */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-extrabold text-[#030D1E] mb-6 tracking-tight">Create Offer</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#6A737D]">Job Title</label>
              <input type="text" name="jobTitle" onChange={handleInputChange} required className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all" placeholder="e.g. Protocol Engineer" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold text-[#6A737D]">Salary (USDC)</label>
                <input type="number" name="salary" onChange={handleInputChange} required className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all" placeholder="120000" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-semibold text-[#6A737D]">Joining Date</label>
                <input type="date" name="joiningDate" onChange={handleInputChange} required className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#6A737D]">Candidate Wallet Address</label>
              <input type="text" name="candidateWallet" onChange={handleInputChange} required className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all" placeholder="0x..." />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#6A737D]">GST Number</label>
              <input type="text" name="gstNumber" onChange={handleInputChange} required className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8131] transition-all" placeholder="22AAAAA0000A1Z5" />
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-sm font-semibold text-[#6A737D]">Degree Certificate Upload</label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                {formData.degreeBase64 ? (
                  <div className="flex flex-col items-center text-[#FF8131]">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">File Uploaded Successfully</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-400">PDF, PNG, JPG</span>
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
              </label>
            </div>

            <button type="submit" className="mt-6 bg-[#FF8131] text-white py-4 rounded-full font-bold text-lg hover:bg-[#E06D22] transition-colors shadow-lg">
              Generate Trust Offer
            </button>
          </form>
        </div>

        {/* Right Side: Active Offers Table */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-3xl font-extrabold text-[#030D1E] mb-6 tracking-tight">Active Offers</h2>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[#6A737D] text-sm">
                  <th className="pb-4 font-semibold">Offer ID</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-[#030D1E]">#{offer.id}</td>
                    <td className="py-4 text-[#030D1E]">{offer.role}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        offer.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#6A737D] font-mono text-sm">{offer.txHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyDashboard;
