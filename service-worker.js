const CACHE_NAME = 'playback-cifras-plus-business-beta-v1';
const ASSETS = [
  './', './index.html', './player.html', './landing.css', './styles.css', './app.js', './manifest.webmanifest',
  './about.html', './help.html', './privacy.html', './terms.html', './capture.html',
  './logo-playback-cifras.jpg', './assets/playback-cifras-plus-logo.jpg', './assets/icon-192.png', './assets/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.filter(Boolean))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k.startsWith('playback-cifras')).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.pathname.endsWith('/config.js') || url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) return;
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
    return res;
  }).catch(()=>cached)));
});
