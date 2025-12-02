/**
 * Locksmith Jr. Service Worker
 * Production-ready PWA service worker with comprehensive caching strategies
 * Version: 1.1.0
 */

const VERSION = '1.1.0';
const CACHE_NAME = `locksmith-jr-v${VERSION}`;
const RUNTIME_CACHE = `locksmith-jr-runtime-v${VERSION}`;
const IMAGE_CACHE = `locksmith-jr-images-v${VERSION}`;

// Core app shell files (must be available offline)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon-180.png',
  '/icons/locksmithjr-1024.png',
];

// Routes to cache for offline access
const OFFLINE_ROUTES = [
  '/home',
  '/vault',
  '/learn',
  '/create',
  '/unlock',
];

// Maximum cache sizes
const MAX_RUNTIME_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

/**
 * Install event - precache essential files
 */
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW ${VERSION}] Precaching app shell`);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log(`[SW ${VERSION}] Installation complete`);
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error(`[SW ${VERSION}] Installation failed:`, error);
      })
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);

  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== IMAGE_CACHE &&
              cacheName.startsWith('locksmith-jr-')
            ) {
              console.log(`[SW ${VERSION}] Deleting old cache:`, cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log(`[SW ${VERSION}] Activated and ready`);

      // Notify all clients that SW is activated
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: VERSION
          });
        });
      });
    })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API calls and IndexedDB
  if (
    url.pathname.includes('/api/') ||
    url.pathname.includes('indexedDB') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  // Handle different resource types with appropriate strategies
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'image' || isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(handleAssetRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

/**
 * Handle document requests (HTML pages)
 * Strategy: Network-first with cache fallback
 */
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Cache successful response
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // If network fails, try cache
    return await caches.match(request) ||
           await caches.match('/index.html') ||
           createOfflineResponse();
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request) ||
                          await caches.match('/index.html');

    if (cachedResponse) {
      return cachedResponse;
    }

    return createOfflineResponse();
  }
}

/**
 * Handle image requests
 * Strategy: Cache-first with network fallback
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Cache the image
      cache.put(request, networkResponse.clone());

      // Trim cache if needed
      trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Image fetch failed:', error);
    return new Response('', { status: 404, statusText: 'Image Not Found' });
  }
}

/**
 * Handle asset requests (JS, CSS, fonts)
 * Strategy: Cache-first with network fallback
 */
async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached version and update in background
    fetchAndCache(request, RUNTIME_CACHE);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Asset fetch failed:', error);
    return new Response('', { status: 404, statusText: 'Asset Not Found' });
  }
}

/**
 * Handle generic requests
 * Strategy: Network-first with cache fallback
 */
async function handleGenericRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Fetch and cache in background (stale-while-revalidate)
 */
async function fetchAndCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

/**
 * Trim cache to maximum size
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Remove oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

/**
 * Check if URL is an image request
 */
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

/**
 * Create offline fallback response
 */
function createOfflineResponse() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Locksmith Jr.</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          color: white;
          padding: 2rem;
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; opacity: 0.9; }
        button {
          margin-top: 2rem;
          padding: 1rem 2rem;
          font-size: 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You're Offline</h1>
        <p>Locksmith Jr. needs an internet connection to load this page.</p>
        <p>Please check your connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
      statusText: 'Service Unavailable'
    }
  );
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('locksmith-jr-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

/**
 * Handle push notifications (future enhancement)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from Locksmith Jr.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Locksmith Jr.', options)
    );
  }
});

/**
 * Handle notification clicks (future enhancement)
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

console.log(`[SW ${VERSION}] Service Worker loaded and ready`);
