const CACHE_NAME = 'gch-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/jobs.html',
    '/news.html',
    '/blog.html',
    '/resources.html',
    '/success.html',
    '/donate.html',
    '/contact.html',
    '/about.html',
    '/faq.html',
    '/privacy.html',
    '/terms.html',
    '/icon-192.png',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    // This ensures that when you update CACHE_NAME (e.g., to 'gch-v2'), 
    // the old cache is deleted immediately.
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    // Skip intercepting requests to external APIs (CORS proxy)
    if (!e.request.url.startsWith(self.location.origin)) return;

    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});