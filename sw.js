/* AlecOS — service worker (P6)
   Goal: near-instant repeat visits without ever pinning a stale site.

   Strategy (deliberately conservative so a bad deploy can't strand users):
     • HTML / navigations  → NETWORK-FIRST (falls back to cached shell only when offline).
       This guarantees a version bump is picked up the next time the user is online, because
       the fresh index.html carries the new ?v=NN asset URLs.
     • Same-origin static assets (CSS/JS/img/media, all ?v=NN-versioned or content-named)
       → CACHE-FIRST, runtime-cached on first use. Safe because a version bump changes the
       URL, so it can never serve an old asset for a new URL.
     • Cross-origin (CDN, Formsubmit, YouTube) → never touched, never cached (no opaque
       responses in the cache).

   Correctness: the cache name is keyed on VERSION; skipWaiting()+clients.claim() activate a
   new worker immediately; every cache whose name != current is deleted on activate. Bump
   VERSION (and the ?v= tags in index.html) together to ship a clean update. */

"use strict";

var VERSION = "40";
var CACHE = "alecos-v" + VERSION;

// The shell — everything needed to render the desktop, all version-pinned.
var PRECACHE = [
  "./",
  "os/tokens.css?v=40",
  "os/wm.css?v=40",
  "os/mobile.css?v=40",
  "os/wm.js?v=40",
  "os/app-freak.js?v=40",
  "os/app-backline.js?v=40",
  "os/app-media.js?v=40",
  "os/vendor/motion.js?v=40",
  "os/vendor/anime.js?v=40"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // addAll is atomic-ish; if one fails the install fails, so keep this list to real assets.
      return c.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);   // evict every older version's cache
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isHTML(req) {
  if (req.mode === "navigate") return true;
  var a = req.headers.get("accept") || "";
  return a.indexOf("text/html") !== -1;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;                         // never cache non-GET (form POSTs)

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // cross-origin → straight to network, never cached

  // HTML / navigations: network-first so a new deploy is always picked up when online.
  if (isHTML(req)) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match("./"); });
      })
    );
    return;
  }

  // Same-origin static assets: cache-first, populate runtime cache on first use.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        // Only cache complete, same-origin (basic) 200s — never opaque, never 206 partials.
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
