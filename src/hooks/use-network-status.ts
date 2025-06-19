import { useEffect, useState } from 'react';

interface NetworkStatus {
  online: boolean;
  effectiveType: string;
  slow: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const getStatus = (): NetworkStatus => {
    const nav = navigator as any;
    const online = typeof window !== 'undefined' ? window.navigator.onLine : true;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const effectiveType = connection?.effectiveType || 'unknown';
    const slow = effectiveType === '2g' || effectiveType === 'slow-2g';
    return { online, effectiveType, slow };
  };

  const [status, setStatus] = useState<NetworkStatus>(getStatus());

  useEffect(() => {
    const update = () => setStatus(getStatus());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', update);
    }
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', update);
      }
    };
  }, []);

  return status;
} 