const cacheName = "klasa-live-public-v1";
const offlinePage = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.add(offlinePage)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("klasa-live-public-") && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || request.mode !== "navigate" || url.origin !== self.location.origin) return;
  if (!["/", "/demo", offlinePage].includes(url.pathname)) return;

  event.respondWith(fetch(request).catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(offlinePage) ?? Response.error();
  }));
});
