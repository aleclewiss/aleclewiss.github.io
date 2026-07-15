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

// Animated background: a fluid flow field of amber particle trails.
// Particles drift along a smooth vector field; scrolling rotates the
// field, so the whole current swirls as you move down the page.
const canvas = document.getElementById("bg-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas && !reducedMotion.matches) {
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W, H, particles;

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      life: 150 + Math.random() * 350,
    };
  }

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.min(340, Math.floor((W * H) / 8000));
    particles = Array.from({ length: count }, spawn);
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, W, H);
  }

  let t = 0;
  let scrollCur = 0;

  function frame() {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const scrollTarget = window.scrollY / maxScroll;
    const scrollDelta = scrollTarget - scrollCur;
    scrollCur += scrollDelta * 0.05;
    t += 0.005;

    // Fade previous frame slightly — this is what creates the trails.
    ctx.fillStyle = "rgba(10, 10, 12, 0.035)";
    ctx.fillRect(0, 0, W, H);

    // Flow speeds up briefly while you're actually scrolling.
    const boost = Math.min(1, Math.abs(scrollDelta) * 60);
    const speed = (0.7 + boost * 1.6) * DPR;

    ctx.lineWidth = DPR * 1.1;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 180, 84, 0.32)";
    ctx.beginPath();

    for (const p of particles) {
      const nx = p.x / W;
      const ny = p.y / H;
      // Smooth pseudo-noise field; scroll position rotates the current.
      const angle =
        Math.sin(nx * 4.2 + t * 0.8) * 1.15 +
        Math.cos(ny * 3.4 - t * 0.55 + nx * 2.1) * 1.15 +
        scrollCur * Math.PI * 2.2;

      const x2 = p.x + Math.cos(angle) * speed;
      const y2 = p.y + Math.sin(angle) * speed;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x2, y2);

      p.x = x2;
      p.y = y2;
      p.life -= 1;
      if (p.life <= 0 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        Object.assign(p, spawn());
      }
    }

    ctx.stroke();
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
