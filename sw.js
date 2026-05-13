const CACHE = 'petsgo-v2';
const SYNC_ORIGIN = 'https://petsgo-sync.andarilhodigital92.workers.dev';

const PRECACHE = [
  '/petsgo-crm-light.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Sync API → network-first, sem cache
  if (url.origin === SYNC_ORIGIN) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response('{"ok":false,"error":"offline"}', { headers: {'Content-Type':'application/json'} })
      )
    );
    return;
  }

  // HTML principal e demo → network-first com fallback para cache
  if (url.pathname === '/petsgo-crm-light.html' || url.pathname === '/petsgo-demo-live.html' || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/petsgo-crm-light.html'))
    );
    return;
  }

  // Demais assets → cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
