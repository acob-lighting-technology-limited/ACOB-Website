// ACOB Lighting Service Worker
// Provides offline fallback page when the user has no internet connection.

const CACHE_NAME = 'acob-offline-v2';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache for offline use.
// NOTE: cache.addAll rejects if ANY asset 404s, which silently blocks the
// whole service worker from installing — only list files that exist.
const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/favicon.ico',
    '/images/acob-logo-dark.png',
];

// Install: pre-cache the offline page and essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }),
    );
    // Activate immediately without waiting for existing clients to close
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name)),
            );
        }),
    );
    // Take control of all open tabs immediately
    self.clients.claim();
});

// Fetch: serve offline page when navigation requests fail
self.addEventListener('fetch', (event) => {
    // Only handle navigation requests (page loads, not API calls or assets)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            }),
        );
    }
});
