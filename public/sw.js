/* Ledger offline copy — open instantly from the phone, then refresh. */
const CACHE = "ledger-offline-v4";
const FETCH_MS = 4000;

function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}

async function put(request, response, isDoc) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE);
  const copy = response.clone();
  if (isDoc) await cache.put(new Request("/"), copy);
  else await cache.put(request, copy);
}

async function refresh(request, isDoc) {
  try {
    const response = await fetch(request);
    await put(request, response, isDoc);
  } catch {
    /* keep the cached copy */
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/", "/keel", "/favicon.svg"]).catch(() => undefined)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js" || url.pathname.startsWith("/api/")) return;
  if (url.searchParams.get("install") === "1") return;

  const isAsset = url.pathname.startsWith("/assets/");
  const isDoc = request.mode === "navigate" || request.destination === "document";

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const home = isDoc ? await caches.match("/") : undefined;
      const stale = cached || home;

      if (isAsset && cached) return cached;
      if (isDoc && stale) {
        void refresh(request, true);
        return stale;
      }

      try {
        const response = await Promise.race([fetch(request), timeout(FETCH_MS)]);
        await put(request, response, isDoc);
        return response;
      } catch {
        if (stale) return stale;
        if (isDoc) {
          return new Response(
            `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ledger</title><style>body{margin:0;min-height:100dvh;background:#08090b;color:#e8eaed;font-family:-apple-system,sans-serif;display:grid;place-items:center;padding:24px;text-align:center}p{margin:0;max-width:20rem;line-height:1.45}</style></head><body><p>Ledger is opening from this phone. Close it and tap the icon again.</p></body></html>`,
            { headers: { "content-type": "text/html; charset=utf-8" } },
          );
        }
        return Response.error();
      }
    })(),
  );
});
