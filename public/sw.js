// Brand Sport League — minimal service worker.
// Strategy:
//   - Precache the static shell (root + auth pages + manifest + logo).
//   - Stale-while-revalidate for same-origin static assets (Next.js bundles).
//   - Network-first for API and dynamic pages (no offline writes).

const CACHE = "bsl-shell-v1";
const SHELL = ["/", "/login", "/manifest.json", "/logo.svg", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Static Next.js bundles → stale-while-revalidate.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fresh = fetch(event.request)
          .then((res) => {
            if (res && res.status === 200) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      }),
    );
    return;
  }

  // Default: network-first, fall back to cache.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && SHELL.includes(url.pathname)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
