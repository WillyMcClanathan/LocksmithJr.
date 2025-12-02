import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_ACTIVATED') {
          const currentVersion = event.data.version;
          if (currentVersion && currentVersion !== localStorage.getItem('app-version')) {
            setNewVersion(currentVersion);
            setShowUpdate(true);
          }
        }
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (newVersion) {
      localStorage.setItem('app-version', newVersion);
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-[#161B22] border border-blue-500 rounded-lg shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Update Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              A new version of Locksmith Jr. is ready. Refresh to get the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-100 dark:bg-[#0D1117] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-900 dark:text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
