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

  const SEGMENTS = 110;
  const THREADS = 7;    // faint highlight strands inside the band

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  let t = 0;
  let scrollCur = window.scrollY;

  // One source of truth for the ribbon's shape at height ny (0–1).
  // Everything derives from eased scroll progress + slow idle time,
  // so motion is always continuous — no lurches on direction change.
  function ribbonAt(ny, eased) {
    const drift = eased * 2.4 + t;
    const center =
      Math.sin(ny * 3.1 + drift * 1.6) * W * 0.06 +
      Math.sin(ny * 1.7 - drift) * W * 0.09;
    const halfW = W * 0.05 * (0.62 + 0.38 * Math.sin(ny * 2.6 + drift * 1.2));
    return { center, halfW };
  }

  function frame() {
    const scrollDelta = window.scrollY - scrollCur;
    scrollCur += scrollDelta * 0.045;   // heavy easing = gentle motion
    t += 0.0022;                        // idle breathing, very slow

    ctx.clearRect(0, 0, W, H);

    // The ribbon runs top-to-bottom. It hugs the right side of the
    // viewport at the top of the page and sweeps left as you scroll.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollCur / maxScroll));
    const eased = progress * progress * (3 - 2 * progress);  // smoothstep
    const baseX = W * (0.8 - eased * 0.58);

    // Sample both edges of the band once.
    const left = [], right = [], ys = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const ny = i / SEGMENTS;
      const y = ny * (H + 160 * DPR) - 80 * DPR;
      const { center, halfW } = ribbonAt(ny, eased);
      ys.push(y);
      left.push(baseX + center - halfW);
      right.push(baseX + center + halfW);
    }

    // Solid silk body: filled band with a soft cross-fade gradient.
    const grad = ctx.createLinearGradient(baseX - W * 0.1, 0, baseX + W * 0.1, 0);
    grad.addColorStop(0, "rgba(255, 180, 84, 0.05)");
    grad.addColorStop(0.5, "rgba(255, 196, 116, 0.16)");
    grad.addColorStop(1, "rgba(255, 180, 84, 0.05)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(left[0], ys[0]);
    for (let i = 1; i <= SEGMENTS; i++) ctx.lineTo(left[i], ys[i]);
    for (let i = SEGMENTS; i >= 0; i--) ctx.lineTo(right[i], ys[i]);
    ctx.closePath();
    ctx.fill();

    // Bright inner core for depth.
    ctx.beginPath();
    ctx.moveTo(left[0] * 0.35 + right[0] * 0.65, ys[0]);
    for (let i = 1; i <= SEGMENTS; i++) {
      ctx.lineTo(left[i] * 0.35 + right[i] * 0.65, ys[i]);
    }
    ctx.strokeStyle = "rgba(255, 214, 150, 0.22)";
    ctx.lineWidth = DPR * 2.2;
    ctx.lineCap = "round";
    ctx.stroke();

    // A few faint threads across the band — the silk texture.
    for (let k = 0; k < THREADS; k++) {
      const u = (k + 1) / (THREADS + 1);
      ctx.beginPath();
      ctx.moveTo(left[0] * (1 - u) + right[0] * u, ys[0]);
      for (let i = 1; i <= SEGMENTS; i++) {
        ctx.lineTo(left[i] * (1 - u) + right[i] * u, ys[i]);
      }
      ctx.strokeStyle = "rgba(255, 190, 100, 0.07)";
      ctx.lineWidth = DPR;
      ctx.stroke();
    }

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
