import React from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';

const NetworkStatusBanner: React.FC = () => {
  const { online, slow, effectiveType } = useNetworkStatus();

  if (online && !slow) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full z-[1000] flex justify-center items-center px-4 py-2 text-white text-sm font-medium shadow-lg transition-all animate-fade-in ${!online ? 'bg-red-600' : 'bg-yellow-500'}`}
      role="status"
      aria-live="polite"
    >
      {!online ? (
        <span> You are offline. Some features may not work. Please check your connection.</span>
      ) : (
        <span> Slow network detected ({effectiveType}). Experience may be degraded.</span>
      )}
    </div>
  );
};

export default NetworkStatusBanner; 