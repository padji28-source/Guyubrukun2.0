// Simple Service Worker to satisfy PWA install requirements
const CACHE_NAME = 'guyub-rukun-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Satisfies the PWA install fetch listener requirement while preserving dev server flexibility
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
