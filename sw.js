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

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});