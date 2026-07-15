// Signal that JS is running — reveal animations only apply with this class.
document.documentElement.classList.add("js");

// Hero name: each line rises out of its mask, staggered.
document.querySelectorAll(".hero-title .line").forEach((line, i) => {
  setTimeout(() => line.classList.add("in"), 200 + i * 140);
});

// Scroll progress bar.
const progressBar = document.querySelector(".progress");
if (progressBar) {
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${window.scrollY / max})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

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

// Animated background: a single silk ribbon of gold light.
// Dozens of fine strands weave around a shared centerline that
// undulates as you scroll; idle, it only breathes very slowly.
const canvas = document.getElementById("bg-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas && !reducedMotion.matches) {
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W, H;

  const SEGMENTS = 120;
  const FIBERS = 22;    // wispy strands that make up the ribbon body

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  let t = 0;
  let scrollCur = window.scrollY;
  let scrollVel = 0;

  // One source of truth for the ribbon's shape at height ny (0–1).
  // Everything derives from eased scroll progress + slow idle time,
  // so motion is always continuous — no lurches on direction change.
  function ribbonAt(ny, eased) {
    const drift = eased * 2.6 + t;
    const center =
      Math.sin(ny * 3.4 + drift * 1.6) * W * 0.07 +
      Math.sin(ny * 1.6 - drift) * W * 0.1 +
      Math.sin(ny * 6.3 + drift * 2.3) * W * 0.018;
    // Width pinches to near-zero at points — the "folds" in the light.
    const fold = Math.sin(ny * 3.9 + drift * 1.4);
    const halfW = W * 0.055 * (0.12 + 0.88 * Math.abs(fold));
    return { center, halfW };
  }

  function frame() {
    // Critically-damped spring toward the real scroll position —
    // fluid inertia, glides to rest with no overshoot or lurch.
    const target = window.scrollY;
    scrollVel += (target - scrollCur) * 0.0065;
    scrollVel *= 0.855;
    scrollCur += scrollVel;
    t += 0.0022;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";   // light adds up where fibers cross
    ctx.lineCap = "round";

    // The ribbon runs top-to-bottom. It hugs the right side of the
    // viewport at the top of the page and sweeps left as you scroll.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollCur / maxScroll));
    const eased = progress * progress * (3 - 2 * progress);  // smoothstep
    const baseX = W * (0.8 - eased * 0.58);

    // Sample the band edges once.
    const left = [], right = [], ys = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const ny = i / SEGMENTS;
      const y = ny * (H + 160 * DPR) - 80 * DPR;
      const { center, halfW } = ribbonAt(ny, eased);
      ys.push(y);
      left.push(baseX + center - halfW);
      right.push(baseX + center + halfW);
    }

    const strokePath = (u, style, width) => {
      ctx.beginPath();
      ctx.moveTo(left[0] * (1 - u) + right[0] * u, ys[0]);
      for (let i = 1; i <= SEGMENTS; i++) {
        ctx.lineTo(left[i] * (1 - u) + right[i] * u, ys[i]);
      }
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    // Wispy fibers — denser light toward the ribbon's core, like the
    // long-exposure light painting: glowing folds, soft edges.
    for (let k = 0; k < FIBERS; k++) {
      const u = k / (FIBERS - 1);
      const coreness = 1 - Math.abs(u - 0.5) * 2;   // 1 at core, 0 at edges
      const alpha = 0.02 + 0.055 * coreness * coreness;
      strokePath(u, `rgba(255, 180, 84, ${alpha.toFixed(3)})`, DPR * 1.3);
    }

    // Luminous core: three passes, wide-and-faint to thin-and-bright,
    // fakes the bloom of overexposed light.
    strokePath(0.5, "rgba(255, 190, 100, 0.05)", DPR * 10);
    strokePath(0.5, "rgba(255, 205, 130, 0.13)", DPR * 4);
    strokePath(0.5, "rgba(255, 226, 170, 0.4)", DPR * 1.4);

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
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
