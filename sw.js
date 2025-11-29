self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("lwess-cache-v1").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/admin.html",
                "/login.html",
                "/styles.css",
                "/script.js",
                "/favicon.png"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});
