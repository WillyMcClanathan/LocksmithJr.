export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      })
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user to update
                console.log('New version available! Refresh to update.');

                // Optionally auto-update
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        return registration;
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        return null;
      });
  }
  return Promise.resolve(null);
}

export function setupServiceWorkerListeners(
  onActivated: () => void
): () => void {
  if ('serviceWorker' in navigator) {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        onActivated();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }

  return () => {};
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function canInstall(): boolean {
  return (
    'serviceWorker' in navigator &&
    'BeforeInstallPromptEvent' in window &&
    !isStandalone()
  );
}
