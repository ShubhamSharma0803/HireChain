import React from 'react';

const repeatedPhrases = Array(12).fill('ON-CHAIN VERIFICATION');

const Ticker = () => {
  return (
    <div 
      className="w-full relative overflow-hidden flex items-center py-[14px]"
      style={{ backgroundColor: 'transparent', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="ticker-track flex items-center">
        {repeatedPhrases.map((text, i) => (
          <React.Fragment key={i}>
            <span 
              className="text-[18px] font-normal leading-none mx-6 tracking-[0.04em]"
              style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
            >
              {text}
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
          </React.Fragment>
        ))}
        {/* Duplicate the exact array immediately for a seamless infinite loop */}
        {repeatedPhrases.map((text, i) => (
          <React.Fragment key={`dup-${i}`}>
            <span 
              className="text-[18px] font-normal leading-none mx-6 tracking-[0.04em]"
              style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
            >
              {text}
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
