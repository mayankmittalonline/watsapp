const CACHE_NAME = "mypwa-v1";
const OFFLINE_URL = "/404.html"; 
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/404.html",
  "/manifest.json",
  "/robots.txt",
  "/images/favicon.png"
];

// Install SW and pre-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate SW and clean old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch from cache or fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request).then(resp => resp || caches.match(OFFLINE_URL));
      })
  );
});
