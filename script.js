// Signal that JS is running — reveal animations only apply with this class.
document.documentElement.classList.add("js");

// Scroll-reveal: fade sections in as they enter the viewport.
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Animated background: crossfade each section's artwork as it
// reaches the middle of the viewport, with a gentle scroll parallax.
const arts = {};
document.querySelectorAll(".bg-art").forEach((el) => {
  arts[el.dataset.section] = el;
});

const sectionMap = [
  [".hero", "top"],
  ["#work", "work"],
  ["#about", "about"],
  ["#contact", "contact"],
];

let activeArt = null;
function setArt(name) {
  const next = arts[name];
  if (!next || next === activeArt) return;
  if (activeArt) activeArt.classList.remove("active");
  next.classList.add("active");
  activeArt = next;
}

const bgObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) setArt(entry.target.dataset.bg);
    }
  },
  { rootMargin: "-40% 0px -40% 0px" }
);

for (const [selector, name] of sectionMap) {
  const el = document.querySelector(selector);
  if (el) {
    el.dataset.bg = name;
    bgObserver.observe(el);
  }
}
setArt("top");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const bgLayer = document.querySelector(".bg-layer");
if (bgLayer && !reducedMotion.matches) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      bgLayer.style.transform = `translateY(${window.scrollY * -0.05}px)`;
      ticking = false;
    });
  }, { passive: true });
}

// Live local time in the hero.
const timeEl = document.getElementById("local-time");
function updateTime() {
  timeEl.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }) + " local";
}
updateTime();
setInterval(updateTime, 30000);

// Keep the footer year current.
document.getElementById("year").textContent = new Date().getFullYear();
