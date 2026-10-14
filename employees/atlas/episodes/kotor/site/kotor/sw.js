// Kotor walk: serves the saved page and tracks when there is no signal.
// Pages: network first, cache when offline. Audio: cache first, with byte ranges so iPhone Safari can play it.
const CACHE = "ktr-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/kotor/")) return;
  const isAudio = url.pathname.endsWith(".mp3");
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = new Request(url.origin + url.pathname);
    if (!isAudio) {
      try { return await fetch(e.request); } catch (err) {
        return (await cache.match(key)) || (await cache.match(url.origin + "/kotor/")) || new Response("You're offline.", { status: 503 });
      }
    }
    const hit = await cache.match(key);
    if (!hit) {
      try { return await fetch(e.request); } catch (err) { return new Response("", { status: 503 }); }
    }
    const range = e.request.headers.get("range");
    if (!range) return hit;
    const buf = await hit.arrayBuffer();
    const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    const size = buf.byteLength;
    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end = m[2] ? parseInt(m[2], 10) : size - 1;
    if (!m[1] && m[2]) { start = size - parseInt(m[2], 10); end = size - 1; }
    end = Math.min(end, size - 1);
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type": hit.headers.get("Content-Type") || "audio/mpeg",
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes",
      },
    });
  })());
});
