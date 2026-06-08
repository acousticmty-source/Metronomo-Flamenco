const CACHE_NAME = "metronomo-flamenco-v34";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles-v34.css",
  "./app-v34.js",
  "./audio/samples/palma-acento.wav",
  "./audio/samples/palma-pulso.wav",
  "./audio/samples/cajon-agudo.wav",
  "./audio/samples/cajon-grave.wav",
  "./audio/samples/cajon-grave-2.wav",
  "./audio/samples/cajon-grave-3.wav",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
