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

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
