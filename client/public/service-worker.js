const CACHE_NAME = "foodlink-cache-v2";
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", event => {
  // Take control immediately without waiting
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // For navigation requests (page loads like /login, /dashboard),
  // always serve index.html so React Router handles routing
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then(cached => {
        return cached || fetch("/index.html");
      })
    );
    return;
  }

  // For everything else (API calls, assets), try cache then network
  event.respondWith(
    caches.match(request).then(res => res || fetch(request))
  );
});