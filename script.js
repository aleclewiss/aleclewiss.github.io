// Reveal animations only apply once JS is confirmed running (here, so the
// trigger and the payoff can't be split by a failed script load).
document.documentElement.classList.add("js");

// Scroll reveals: content fades up as it enters the viewport.
if ("IntersectionObserver" in window) {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal, .yt-hero").forEach(function (el) { obs.observe(el); });
} else {
  document.querySelectorAll(".reveal, .yt-hero").forEach(function (el) { el.classList.add("visible"); });
}

// Play the device demo when it scrolls into view — unless the user prefers
// reduced motion (they keep the poster + native controls).
var devVideo = document.querySelector(".dev-display");
if (devVideo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && "IntersectionObserver" in window) {
  new IntersectionObserver(function (entries, o) {
    if (entries.some(function (e) { return e.isIntersecting; })) {
      devVideo.play().catch(function () {});
      o.disconnect();
    }
  }, { threshold: 0.4 }).observe(devVideo);
}

// Click-to-load YouTube facade: inject the real player on demand.
var facade = document.querySelector(".player-facade");
if (facade) {
  facade.addEventListener("click", function (ev) {
    ev.preventDefault();
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/ifkNxi9HW00?autoplay=1";
    f.title = "Aminal House — Dachshunds are built different";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    facade.replaceWith(f);
  }, { once: true });
}

// Reading-progress line.
var progress = document.querySelector(".progress");
if (progress) {
  var ticking = false;
  var updateProgress = function () {
    ticking = false;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = "scaleX(" + Math.min(1, window.scrollY / max) + ")";
  };
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

// Nav highlights the section you're reading; clears back on the hero.
var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
if (navLinks.length && "IntersectionObserver" in window) {
  var byId = {};
  navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var link = byId[e.target.id];
      navLinks.forEach(function (a) { a.classList.remove("active"); });
      if (link) link.classList.add("active");
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
  var hero = document.querySelector(".hero");
  if (hero) spy.observe(hero);
}

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
