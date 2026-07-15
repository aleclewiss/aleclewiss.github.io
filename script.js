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

  const STRANDS = 26;
  const SEGMENTS = 90;

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  let t = 0;
  let phase = 0;        // advances with scroll — the ribbon "travels"
  let scrollCur = window.scrollY;

  function frame() {
    const scrollDelta = window.scrollY - scrollCur;
    scrollCur += scrollDelta * 0.06;          // heavy easing = gentle motion
    phase += (scrollDelta * 0.06) * 0.0022;   // scroll feeds the ribbon
    t += 0.0016;                              // idle breathing, very slow

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    // The ribbon runs top-to-bottom. It hugs the right side of the
    // viewport at the top of the page and sweeps left as you scroll.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = scrollCur / maxScroll;   // 0 at top, 1 at bottom
    const eased = progress * progress * (3 - 2 * progress);  // smoothstep
    const baseX = W * (0.8 - eased * 0.58);

    for (let k = 0; k < STRANDS; k++) {
      const u = k / (STRANDS - 1) - 0.5;      // -0.5 … 0.5 across the ribbon
      // Strands near the middle are brightest — reads as a silk fold.
      const alpha = 0.028 + 0.05 * (1 - Math.abs(u) * 2) ** 2;
      ctx.strokeStyle = `rgba(255, 180, 84, ${alpha.toFixed(3)})`;
      ctx.lineWidth = DPR * 1.2;
      ctx.beginPath();

      for (let i = 0; i <= SEGMENTS; i++) {
        const y = (i / SEGMENTS) * (H + 160 * DPR) - 80 * DPR;
        const ny = i / SEGMENTS;

        // Shared centerline: two slow waves + scroll phase.
        const center =
          Math.sin(ny * 4.6 + phase * 6 + t * 2.0) * W * 0.055 +
          Math.sin(ny * 2.1 - phase * 4 - t * 1.3) * W * 0.08;

        // Ribbon width twists along its length — pinches and unfurls.
        const twist = Math.sin(ny * 5.8 + phase * 9 + t * 2.6 + u * 0.7);
        const spread = u * W * 0.042 * (0.35 + 0.65 * Math.abs(twist));

        const x = baseX + center + spread;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

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
