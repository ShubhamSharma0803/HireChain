import React from 'react';

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  let dotClass = 'bg-gray-400';

  switch (status?.toUpperCase()) {
    case 'CREATED':
    case 'PENDING':
      colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      dotClass = 'bg-blue-400';
      break;
    case 'ACCEPTED':
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      dotClass = 'bg-amber-400';
      break;
    case 'COMPLETED':
    case 'JOINED':
      colorClass = 'bg-green-500/20 text-green-300 border-green-500/30';
      dotClass = 'bg-green-400';
      break;
    case 'BREACHED':
      colorClass = 'bg-red-500/20 text-red-300 border-red-500/30';
      dotClass = 'bg-red-400';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold tracking-wide uppercase ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
