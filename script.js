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

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
