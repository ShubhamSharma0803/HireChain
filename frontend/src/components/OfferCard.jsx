import React from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle2, AlertTriangle, Briefcase, Calendar } from 'lucide-react';

const OfferCard = ({ offer, onAccept, onConfirm, onBreach, loading }) => {
  const { id, title, salary, status, joiningDate, company } = offer;

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-[var(--text-secondary)] font-medium flex items-center gap-2 mt-2">
            <span className="opacity-60"><Briefcase className="w-4 h-4" /></span> {company}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[13px] text-white/50 mb-1.5 uppercase tracking-wider font-semibold">Escrow Locked</p>
          <p className="text-lg font-mono text-white tracking-wide">${salary} <span className="text-sm text-white/40">USDC</span></p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[13px] text-white/50 mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Joining
          </p>
          <p className="text-lg font-mono text-white tracking-wide">{joiningDate}</p>
        </div>
      </div>

      {/* Contextual Actions based on status */}
      <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
        {(status === 'CREATED' || status === 'PENDING') && (
          <button 
            onClick={() => onAccept(id)}
            disabled={loading}
            className="flex-1 py-3.5 px-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Processing...' : 'Accept & Lock Escrow'}
          </button>
        )}
        
        {status === 'ACCEPTED' && (
          <>
            <button 
              onClick={() => onConfirm(id)}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" /> Confirm Join
            </button>
            <button 
              onClick={() => onBreach(id)}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle className="w-5 h-5" /> Report Breach
            </button>
          </>
        )}
        
        {(status === 'COMPLETED' || status === 'BREACHED' || status === 'JOINED') && (
          <div className="flex-1 py-3 text-center text-white/40 font-semibold uppercase tracking-widest text-sm bg-white/5 rounded-xl border border-white/5">
            Contract Resolved
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
