const CACHE = "ta-investor-v023";
const STATIC_ASSETS = [
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(
      keys
        .filter(k=>k.startsWith("ta-investor-") && k!==CACHE)
        .map(k=>caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req=event.request;
  const url=new URL(req.url);

  if(url.hostname==="api.twelvedata.com") return;

  if(req.mode==="navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:"no-store"});
        if(fresh&&fresh.ok){
          const cache=await caches.open(CACHE);
          cache.put("./index.html",fresh.clone()).catch(()=>{});
        }
        return fresh;
      }catch(e){
        const cache=await caches.open(CACHE);
        return (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if(url.pathname.includes("service-worker")){
    event.respondWith(fetch(req,{cache:"no-store"}));
    return;
  }

  event.respondWith((async()=>{
    const hit=await caches.match(req);
    if(hit) return hit;
    const fresh=await fetch(req);
    if(fresh&&fresh.ok){
      const cache=await caches.open(CACHE);
      cache.put(req,fresh.clone()).catch(()=>{});
    }
    return fresh;
  })());
});
