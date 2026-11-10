// The offline worker. `vite.config.ts` fills in the two placeholders at build time and writes this to /sw.js.
// It keeps a copy of the whole app (about 2 MB) on the device, so the games open without a connection.
const VERSION = '__VERSION__'
const FILES = __FILES__
const CACHE = `lg-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES.map((url) => new Request(url, { cache: 'reload' })))))
})

// A new version waits until every open copy of the old one is closed, so a running game never loses its files.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('lg-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const withTimeout = (promise, ms) => Promise.race([promise, new Promise((_, reject) => setTimeout(reject, ms))])

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  // Only the app's own files. Analytics and anything else go straight to the network.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/_vercel/')) return

  if (request.mode === 'navigate') {
    // The page itself: the newest one when the network answers quickly, the saved one otherwise.
    event.respondWith(
      withTimeout(fetch(request), 3000).catch(() => caches.match('/index.html', { ignoreVary: true }).then((saved) => saved || fetch(request))),
    )
    return
  }

  // Everything else has its version in its name: the saved copy is always right.
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then(
      (saved) =>
        saved ||
        fetch(request).then((response) => {
          if (response.ok && url.pathname.startsWith('/assets/')) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
