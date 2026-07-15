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

// Animated background: a ribbon of golden light, rendered per-pixel
// by a WebGL shader — layered luminous strands with real bloom, like
// a long-exposure light painting. Scroll sweeps it right → left with
// spring inertia.
const canvas = document.getElementById("bg-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initRibbon() {
  if (!canvas || reducedMotion.matches) return false;
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return false;

  const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;    // slow idle drift
    uniform float uEased;   // eased scroll progress 0..1
    uniform float uBaseX;   // ribbon anchor, fraction of width

    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      float y = 1.0 - uv.y;               // 0 at top of screen
      float drift = uEased * 2.6 + uTime;

      // Shared centerline: layered waves, big and slow.
      float center = uBaseX
        + 0.075 * sin(y * 3.4 + drift * 1.6)
        + 0.100 * sin(y * 1.6 - drift)
        + 0.016 * sin(y * 6.5 + drift * 2.3);

      vec3 gold  = vec3(1.0, 0.70, 0.33);
      vec3 amber = vec3(1.0, 0.55, 0.18);
      vec3 col = vec3(0.0);

      // Nine luminous strands braided around the centerline. Each has
      // its own sway; brightness folds along its length, so strands
      // flare where they bunch — the light-painting look.
      for (int i = 0; i < 9; i++) {
        float fi = float(i);
        float u = fi / 8.0 - 0.5;
        float sway = u * (0.030 + 0.022 * sin(y * 4.2 + drift * 1.3 + fi * 1.9));
        float d = abs(uv.x - center - sway);
        float fold = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(y * 5.2 + drift * 2.0 + fi * 2.3), 2.0);
        float core = 0.00042 / (d + 0.0016);      // sharp bright line
        float halo = 0.0045 / (1.0 + d * d * 9000.0); // soft bloom around it
        col += mix(gold, amber, fold) * (core + halo) * fold;
      }

      // A wide, faint veil of light behind the strands.
      float dv = uv.x - center;
      col += gold * 0.06 * exp(-dv * dv * 160.0);

      // Filmic-ish tone map: lets crossings overexpose to near-white
      // without clipping harshly.
      col = 1.0 - exp(-col * 1.35);

      // Page background color underneath.
      vec3 bg = vec3(0.039, 0.039, 0.047);
      gl_FragColor = vec4(bg + col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  // Fullscreen triangle.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uEased = gl.getUniformLocation(prog, "uEased");
  const uBaseX = gl.getUniformLocation(prog, "uBaseX");

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  let t = 0;
  let scrollCur = window.scrollY;
  let scrollVel = 0;

  function frame() {
    // Critically-damped spring toward the real scroll position —
    // fluid inertia, glides to rest with no overshoot or lurch.
    scrollVel += (window.scrollY - scrollCur) * 0.0065;
    scrollVel *= 0.855;
    scrollCur += scrollVel;
    t += 0.0022;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollCur / maxScroll));
    const eased = progress * progress * (3 - 2 * progress);

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uEased, eased);
    gl.uniform1f(uBaseX, 0.8 - eased * 0.58);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
  return true;
}

if (!initRibbon() && canvas) {
  // No WebGL: hide the canvas and show the static glow instead.
  canvas.style.display = "none";
  const glowEl = document.querySelector(".glow");
  if (glowEl) glowEl.style.display = "block";
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
