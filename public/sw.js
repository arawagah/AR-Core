/**
 * MirrorMe Service Worker
 * Caching strategy:
 * - CacheFirst: MediaPipe models, outfit images (large, rarely change)
 * - NetworkFirst: API calls (fresh data preferred)
 * - StaleWhileRevalidate: page shells (fast + fresh)
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  MODELS: `mirrorme-models-${CACHE_VERSION}`,
  ASSETS: `mirrorme-assets-${CACHE_VERSION}`,
  PAGES: `mirrorme-pages-${CACHE_VERSION}`,
  API: `mirrorme-api-${CACHE_VERSION}`,
};

const MODEL_FILES = [
  '/models/pose_landmarker_lite.task',
  '/models/mediapipe/vision_wasm_internal.js',
  '/models/mediapipe/vision_wasm_internal.wasm',
  '/models/mediapipe/vision_wasm_nosimd_internal.js',
  '/models/mediapipe/vision_wasm_nosimd_internal.wasm',
];

const APP_SHELL = [
  '/',
  '/catalog',
  '/manifest.json',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.PAGES).then((cache) => cache.addAll(APP_SHELL).catch(() => {})),
    ]).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !Object.values(CACHE_NAMES).includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  const path = url.pathname;

  // CacheFirst: MediaPipe model files
  if (path.startsWith('/models/')) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.MODELS));
    return;
  }

  // CacheFirst: Outfit images and static assets
  if (path.startsWith('/assets/') || path.match(/\.(png|jpg|jpeg|svg|webp|woff|woff2)$/)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.ASSETS));
    return;
  }

  // NetworkFirst: API calls
  if (path.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.API));
    return;
  }

  // StaleWhileRevalidate: page navigation
  if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.PAGES));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached ?? fetchPromise;
}
