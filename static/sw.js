// Keeps the last page fetched, so the clock opens without a network.
const CACHE = "bohemian-day-clock";
const SHELL = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // The network first, so a new release shows at once; the cache when offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();

        caches.open(CACHE).then((cache) => cache.put(request, copy));

        return response;
      })
      .catch(async () => (await caches.match(request, { ignoreSearch: true })) ?? (await caches.match("./")) ?? Response.error()),
  );
});
