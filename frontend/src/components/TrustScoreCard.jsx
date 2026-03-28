import React from 'react';
import { motion } from 'framer-motion';

const TrustScoreCard = ({ score, label = "Trust Score" }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = '#10B981'; // green
  if (score < 40) color = '#EF4444'; // red
  else if (score < 70) color = '#F59E0B'; // amber

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md h-full">
      <div className="relative w-32 h-32 mb-6 mt-2">
        <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-white">{score}%</span>
        </div>
      </div>
      <p className="text-[var(--text-secondary)] font-semibold uppercase tracking-widest text-sm">{label}</p>
    </div>
  );
};

export default TrustScoreCard;
