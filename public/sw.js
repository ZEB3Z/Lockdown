const V = 'lockdown-v2-switch'; // bump to evict old caches after a redeploy
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
// The page sends the list of resources it loaded; we cache them so the game runs offline after one visit.
self.addEventListener('message', (e) => {
  if (e.data?.precache) e.waitUntil(caches.open(V).then((c) => Promise.all(e.data.precache.map((u) => c.add(u).catch(() => {})))));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(r.mode === 'navigate' ? nav(r, u.pathname) : assetFirst(r));
});
async function nav(req, key) { // network first, but fall back to cache after 2.5s on bad wifi
  const c = await caches.open(V), cached = await c.match(key);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(rej, cached ? 2500 : 20000))]);
    if (res.ok) c.put(key, res.clone());
    return res;
  } catch { return cached || Response.error(); }
}
async function assetFirst(req) {
  const c = await caches.open(V), hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) c.put(req, res.clone());
  return res;
}
