// Service Worker v3 — Portfolio
// CACHE VERSION: bump this string to force all clients to update
const SW_VERSION = 'v3';
const CACHE_NAME = `portfolio-cache-${SW_VERSION}`;
const IMAGE_CACHE_NAME = `portfolio-images-${SW_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests — let all others (POST, etc.) pass through
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ── BYPASS LIST: Never intercept these — pass directly to the network ──
  // Firebase Firestore, Auth, Storage, and all Google APIs
  // Vite HMR websocket & module requests on localhost
  // Chrome extensions
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('storage.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.protocol === 'chrome-extension:' ||
    event.request.url.includes('/@vite/') ||
    event.request.url.includes('/@fs/') ||
    event.request.url.includes('/node_modules/')
  ) {
    return; // Do NOT call event.respondWith() — browser handles it natively
  }

  const isImageAsset =
    event.request.destination === 'image' ||
    /\.(png|jpg|jpeg|svg|webp|avif|gif|ico)$/i.test(url.pathname);

  const isStaticAsset =
    /\.(js|css|woff2?|ttf|otf)$/i.test(url.pathname) ||
    url.pathname.startsWith('/assets/');

  // Cache First for images — content-addressed so safe to cache forever
  if (isImageAsset) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return cached || new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // Cache First for JS/CSS/fonts — Vite hashes filenames so they are immutable
  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return cached || new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // Network First for HTML navigation — always get fresh shell, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Stale-While-Revalidate for everything else
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      });
    })
  );
});