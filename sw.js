/* Acanlar Kesim — çevrimdışı önbellek (index.html ile aynı klasöre koy) */
const CACHE = 'acanlar-kesim-v2.0.9';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin && u.pathname.endsWith('/ipad.html')) return;
  const ok = u.origin === location.origin || u.hostname === 'www.gstatic.com';
  if (!ok) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r, r.mode === 'navigate' ? { cache: 'no-cache' } : {}).then(res => {
      if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
      return res && (res.ok || res.type === 'opaque') ? res : (hit || res);
    }).catch(() => hit);
    return r.mode === 'navigate' ? (await net) || Response.error() : hit || net;
  }));
});
