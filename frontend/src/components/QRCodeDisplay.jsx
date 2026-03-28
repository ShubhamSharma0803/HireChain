import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ offerId, contractAddress }) => {
  // Use Sepolia Etherscan link for the demo
  const url = `https://sepolia.etherscan.io/address/${contractAddress}#readContract`;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
      <div className="bg-white p-4 rounded-xl mb-4 shadow-xl">
        <QRCodeSVG 
          value={url} 
          size={200} 
          bgColor="#ffffff" 
          fgColor="#000000" 
          level="H" 
          includeMargin={false} 
        />
      </div>
      <p className="text-[var(--text-primary)] font-semibold text-lg mb-1">Offer #{offerId} Minted</p>
      <p className="text-[var(--text-secondary)] text-[13px] font-mono break-all text-center max-w-[250px] mb-6">
        {contractAddress}
      </p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full text-center py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold tracking-wide transition-colors"
      >
        View on Explorer
      </a>
    </div>
  );
};

export default QRCodeDisplay;
