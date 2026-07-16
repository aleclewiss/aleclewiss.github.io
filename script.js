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

// Reduced motion: don't autoplay the demo video; give controls instead.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("video[autoplay]").forEach(function (v) {
    v.removeAttribute("autoplay");
    v.setAttribute("controls", "");
    v.pause();
  });
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

// Nav highlights the section you're reading.
var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
if (navLinks.length && "IntersectionObserver" in window) {
  var byId = {};
  navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var link = byId[e.target.id];
      if (!link) return;
      if (e.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.remove("active"); });
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
