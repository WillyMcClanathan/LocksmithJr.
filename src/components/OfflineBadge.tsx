import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { setupServiceWorkerListeners } from '../utils/pwa';

export default function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swActivated, setSwActivated] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cleanup = setupServiceWorkerListeners(() => {
      setSwActivated(true);
    });

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSwActivated(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, []);

  if (!swActivated) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isOnline
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
      }`}
    >
      {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {isOnline ? 'Works Offline' : 'Offline Mode'}
    </div>
  );
}
