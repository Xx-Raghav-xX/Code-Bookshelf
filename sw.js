/**
 * Code Bookshelf - Service Worker (PWA Offline Engine)
 * Caches static app shell assets for instant load and offline execution support.
 */

const CACHE_NAME = 'code-bookshelf-v1.1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/header.css',
  './css/sidebar.css',
  './css/notes.css',
  './js/app.js',
  './js/notes.js',
  './js/compiler.js',
  './js/auth.js',
  './js/db.js',
  './html/header.html',
  './html/sidebar.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Event: Cache App Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache First for static assets, Network First for APIs
self.addEventListener('fetch', (event) => {
  const reqUrl = event.request.url;

  // Skip caching for external API endpoints (Judge0, Firebase, Google Identity)
  if (
    reqUrl.includes('judge0.com') ||
    reqUrl.includes('firestore.googleapis.com') ||
    reqUrl.includes('accounts.google.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache First Strategy for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {/* Offline fallback */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Offline Fallback to index.html if navigation fails
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
