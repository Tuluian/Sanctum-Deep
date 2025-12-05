/**
 * Sanctum Ruins Service Worker
 * Enables offline play by caching game assets
 */

const CACHE_NAME = 'sanctum-ruins-v1';

// Core assets that must be cached for offline play
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.webp',
  '/privacy.html',
  '/terms.html',
  '/robots.txt'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets...');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      console.log('[SW] Core assets cached');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Failed to cache core assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network, then cache new resources
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache if not a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response since we need to use it twice
        const responseToCache = networkResponse.clone();

        // Cache the fetched resource for future use
        caches.open(CACHE_NAME).then((cache) => {
          // Cache images, audio, js, css
          const url = event.request.url;
          if (
            url.includes('/assets/') ||
            url.includes('/images/') ||
            url.includes('/audio/') ||
            url.includes('/icons/') ||
            url.endsWith('.js') ||
            url.endsWith('.css') ||
            url.endsWith('.png') ||
            url.endsWith('.jpg') ||
            url.endsWith('.webp') ||
            url.endsWith('.ogg') ||
            url.endsWith('.mp3')
          ) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch((error) => {
        console.error('[SW] Fetch failed:', error);
        // Return a fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      });
    })
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
