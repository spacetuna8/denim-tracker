// Bump CACHE whenever you deploy so iPhones drop the old app shell.
// Clearing caches never touches localStorage, so your denim data is safe.
const CACHE = 'denim-v41';
// K5: on a weak connection, show the cached app after this long instead of waiting for the network to give up.
const NAV_TIMEOUT_MS = 3000;
// N10: only the app page itself is stored as the offline copy.
const isApp = url => { const p = new URL(url).pathname, s = new URL(self.registration.scope).pathname; return p === s || p === s + 'index.html'; };

self.addEventListener('install', e => {
  // cache:'reload' skips the browser's HTTP cache, so the new version never caches an older page.
  // The app page is required; icons/manifest are optional so a missing file can't block updates.
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

  // App page: network first (revalidating past GitHub Pages' 10-min HTTP cache) so updates arrive; cached copy when offline.
  if (req.mode === 'navigate') {
    const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(res => { if (res.ok && isApp(req.url)) { const copy = res.clone(); return caches.open(CACHE).then(c => c.put('./index.html', copy)).then(() => res, () => res); } return res; });
    e.waitUntil(net.catch(() => {})); // a late response still refreshes the cached copy for next time
    e.respondWith((async () => {
      try {
        const res = await Promise.race([net, new Promise(r => setTimeout(r, NAV_TIMEOUT_MS, null))]);
        if (res && res.ok) return res;
        // K5: timeout, or a 404/5xx from the server: use the cached app if there is one.
        const hit = await caches.match('./index.html');
        return hit || res || await net;
      } catch (err) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
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
