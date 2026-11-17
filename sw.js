// Bump CACHE whenever you deploy so iPhones drop the old app shell. Keep APP_VERSION in index.html equal to it.
// Clearing caches never touches localStorage, so your denim data is safe.
const CACHE = 'denim-v41';
// With bad signal, show the cached app after this long instead of waiting for the network to give up.
const NAV_TIMEOUT = 3000;

self.addEventListener('install', e => {
  // The app page is required; icons/manifest are optional so a missing file can't block updates.
  // cache:'reload' skips GitHub Pages' 10-min HTTP cache, so a new CACHE never stores the previous index.html.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'].map(u => new Request(u, { cache: 'reload' })))
    .then(() => Promise.all(['./icon-180.png', './icon-512.png', './manifest.json', './fonts/Phosphor.woff2', './fonts/Phosphor-Fill.woff2', './fonts/BarlowCondensed-500.woff2', './fonts/BarlowCondensed-600.woff2', './fonts/BarlowCondensed-700.woff2', './fonts/JetBrainsMono-400.woff2'].map(u => c.add(u).catch(() => {}))))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // App page: network first (revalidating past GitHub Pages' 10-min HTTP cache) so updates arrive.
  // Falls back to the cached copy when offline, on an error page (e.g. a 404 mid-deploy), or after NAV_TIMEOUT.
  // A network copy that arrives late still lands in the cache, so the next launch has it.
  if (req.mode === 'navigate') {
    let stored; e.waitUntil(new Promise(r => { stored = r; }));
    const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)).then(stored, stored); } else stored();
      return res;
    }, err => { stored(); throw err; });
    const cached = () => caches.match('./index.html');
    e.respondWith(new Promise(resolve => {
      let done = false; const finish = r => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
      const timer = setTimeout(() => cached().then(hit => hit && finish(hit)), NAV_TIMEOUT);
      net.then(res => res.ok ? finish(res) : cached().then(hit => finish(hit || res)),
        () => cached().then(hit => finish(hit || Response.error())));
    }));
    return;
  }

  // Fonts, icons, manifest: serve from cache, refresh in background.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || Response.error());
      return hit || net;
    })
  );
});
