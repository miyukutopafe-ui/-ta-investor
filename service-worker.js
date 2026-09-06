const CACHE = "ta-investor-v017";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.hostname === "api.twelvedata.com") return;
  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request))
  );
});
