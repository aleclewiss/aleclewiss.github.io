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

// Animated background: a night sky. Stars twinkle at different depths
// and parallax as you scroll; amber constellation lines glow into
// existence while you're moving down the page. A meteor passes now
// and then.
const canvas = document.getElementById("bg-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas && !reducedMotion.matches) {
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W, H, stars, linkDist;

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      depth: 0.15 + Math.random() * 0.85, // far (dim, slow) → near (bright, fast)
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.5 + Math.random() * 1.4,
      drift: (Math.random() - 0.5) * 0.04,
      tint: Math.random(), // picks white / pink / violet
    };
  }

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.min(230, Math.floor((W * H) / 9000));
    stars = Array.from({ length: count }, makeStar);
    linkDist = Math.min(W, H) * 0.17;
  }

  const wrap = (v, max) => ((v % max) + max) % max;

  // Cursor: stars near the pointer link to it and lean toward it.
  const mouse = { x: -1e6, y: -1e6 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX * DPR;
    mouse.y = e.clientY * DPR;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    mouse.x = -1e6;
    mouse.y = -1e6;
  });

  let t = 0;
  let scrollCur = 0;
  let linkGlow = 0;
  let meteor = null;
  let nextMeteor = 240;

  function frame() {
    const scrollDelta = window.scrollY - scrollCur;
    scrollCur += scrollDelta * 0.08;
    t += 0.016;

    // Constellations brighten while you're scrolling, fade when you stop.
    const scrolling = Math.min(1, Math.abs(scrollDelta) * 0.015);
    linkGlow += (scrolling - linkGlow) * 0.05;

    // Transparent clear — the drifting nebula layer shows through.
    ctx.clearRect(0, 0, W, H);

    // Project stars: parallax by depth, wrapping at the edges,
    // with a gentle gravitational lean toward the cursor.
    const cursorReach = linkDist * 1.15;
    const pts = [];
    for (const s of stars) {
      s.x += s.drift * DPR;
      let px = wrap(s.x, W);
      let py = wrap(s.y - scrollCur * DPR * 0.35 * s.depth, H);
      const mdx = mouse.x - px;
      const mdy = mouse.y - py;
      const md = Math.hypot(mdx, mdy);
      let near = 0;
      if (md < cursorReach) {
        near = 1 - md / cursorReach;
        const pull = near * near * 22 * DPR * s.depth;
        px += (mdx / (md || 1)) * pull;
        py += (mdy / (md || 1)) * pull;
      }
      const glow = 0.55 + 0.45 * Math.sin(t * s.twinkle + s.phase);
      pts.push({ px, py, s, glow, near });
    }

    // Constellation lines between nearby stars.
    const reach = linkDist * (0.76 + linkGlow * 0.55);
    ctx.lineCap = "round";
    ctx.lineWidth = DPR * 0.8;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].px - pts[j].px;
        const dy = pts[i].py - pts[j].py;
        const d = Math.hypot(dx, dy);
        if (d > reach) continue;
        const boost = Math.max(pts[i].near, pts[j].near);
        const a = (1 - d / reach) * (0.09 + linkGlow * 0.26 + boost * 0.22);
        ctx.strokeStyle = `rgba(255, 122, 195, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pts[i].px, pts[i].py);
        ctx.lineTo(pts[j].px, pts[j].py);
        ctx.stroke();
      }
    }

    // Threads from nearby stars to the cursor itself.
    ctx.lineWidth = DPR * 0.7;
    for (const p of pts) {
      if (p.near <= 0.05) continue;
      const a = p.near * 0.3;
      ctx.strokeStyle = `rgba(255, 122, 195, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    // Stars on top: white core, pink and violet accents.
    for (const { px, py, s, glow, near } of pts) {
      const r = DPR * (0.5 + s.depth * 1.5) * (0.8 + glow * 0.4 + near * 0.5);
      const a = (0.25 + s.depth * 0.75) * glow;
      let color;
      if (s.depth > 0.88 || s.tint < 0.2) {
        color = `rgba(255, 122, 195, ${a.toFixed(3)})`;        // pink
      } else if (s.tint < 0.38) {
        color = `rgba(178, 141, 255, ${a.toFixed(3)})`;        // violet
      } else {
        color = `rgba(235, 233, 228, ${(a * 0.9).toFixed(3)})`; // white
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // The occasional meteor.
    if (meteor) {
      const m = meteor;
      const a = Math.sin(Math.PI * (m.life / m.maxLife)) * 0.8;
      ctx.strokeStyle = `rgba(255, 170, 220, ${a.toFixed(3)})`;
      ctx.lineWidth = DPR * 1.3;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
      ctx.stroke();
      m.x += m.vx;
      m.y += m.vy;
      if (--m.life <= 0) meteor = null;
    } else if (--nextMeteor <= 0) {
      const fromLeft = Math.random() < 0.5;
      meteor = {
        x: (fromLeft ? 0.1 : 0.9) * W + Math.random() * 0.2 * W,
        y: Math.random() * H * 0.35,
        vx: (fromLeft ? 1 : -1) * (2.6 + Math.random() * 2.5) * DPR,
        vy: (1.4 + Math.random() * 1.6) * DPR,
        life: 70,
        maxLife: 70,
      };
      nextMeteor = 400 + Math.random() * 600; // every ~7–17s
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
