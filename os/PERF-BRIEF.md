# AlecOS — Performance Audit Brief (desktop + mobile load speed)

Audit how fast this site LOADS and becomes usable, on BOTH desktop and mobile, and write a
findings report. You are a performance engineer doing an AUDIT — measure, identify the biggest
load bottlenecks, and document them precisely with a concrete, safe fix for each. A separate
developer will implement. Do NOT edit site code (only write the report).

## The site
Static, vanilla HTML/CSS/JS, hosted on GitHub Pages (so: NO server config / no custom HTTP
headers / no server-side compression control — GitHub already gzips text and sets caching).
Served locally at http://127.0.0.1:8777/ (confirm homepage <title> "Alec Lewis — audio software
& automation"; if wrong, port hijacked — run your own static server at repo root). Entry:
index.html loads os/tokens.css + os/wm.css + os/mobile.css, two ES-module <script> that
`import` Motion (motion.dev) and anime.js from cdn.jsdelivr.net, then defer-loads
os/wm.js + the app JS. `AlecOS.isMobile()` true ≤860px. Everything has `?v=NN` cache-busting.

## Already done (do NOT re-report these)
- Assets optimized: photos 1500→1280px re-encoded; videos scaled to 480px+crf32 (4.5MB→1.3MB);
  logo/wallpaper resized; dead files removed (assets ~10MB→5.4MB).
- Demo audio externalized: the demos embedded base64 audio in HTML (Backline 2.3MB, Freak 233KB);
  now real .mp3 files loaded on demand; demo HTML shells 56KB / 42KB.
- Demo iframes are lazy-loaded (src set only when opened). Coverflow images eager-load + async
  decode + fetchpriority. System fonts (no web-font download).

## What to audit (find the REMAINING wins, desktop 1440×900 AND mobile 390×844)
Measure with real tooling — use Chrome via CDP (`--remote-debugging-port`) or Node to capture the
NETWORK: total bytes + request count on first load, the critical-path waterfall, what's
render-blocking, Time-to-first-render, and what loads that isn't needed for first paint. Also read
the code. Investigate specifically:
- **Responsive images (likely the #1 remaining win):** the same 1280px photos are served to BOTH
  a ~1100px desktop coverflow AND a ~320–390px mobile carousel. Mobile downloads full 1280px it
  never needs. Quantify: total image bytes a phone downloads vs. what it displays. Consider
  `srcset`/`sizes` or per-mode smaller variants, and `<picture>`/WebP. (Note the fix may require
  generating smaller/WebP image variants — the developer has PIL + ffmpeg.)
- **Preload/preconnect hints:** is there `<link rel="preconnect">` to cdn.jsdelivr.net? Is the
  wallpaper / first hero photo preloaded? Are the CDN module imports delaying interactivity?
- **CDN dependency cost & risk:** Motion + anime.js are fetched from jsdelivr on every load
  (extra DNS/TLS/latency, and a availability dependency). Measure their transfer size + time.
  Would self-hosting (vendoring) them, or dropping/deferring, be faster? Are they needed for
  first paint or only for later flourishes?
- **What loads up front that could defer/lazy:** e.g. on the mobile home, do BOTH coverflow
  videos (preload="auto", ~1.3MB) download before the user swipes to them? Are all app DOMs +
  their images built at boot? Any offscreen images loading eagerly?
- **Boot/JS execution cost:** how long from HTML parsed → interactive (the desktop boot animation,
  building all windows, the coverflow layout). Any long tasks blocking first interaction?
- **Caching / repeat visits:** would a tiny service worker (cache-first for the static assets)
  make repeat visits near-instant? Note GitHub Pages caching behavior with the `?v=` scheme.
- **Anything else** a Lighthouse-style pass would flag (unused CSS/JS, image dimensions, LCP
  element, layout shift on load).

## Deliverable — write `C:\Users\alecl\Website\os\PERF-FINDINGS.md`
Structured + developer-actionable. Start with a measured baseline table: **first-load transfer
bytes + request count for DESKTOP and for MOBILE**, and the LCP/first-render timing you observed.
Then, for each finding: **ID (P1,P2,…), Title, Impact (est. bytes/ms saved, High/Med/Low),
Desktop/Mobile/Both, What & why (with measured evidence), Where (file), Suggested fix (concrete,
and note if it needs generating asset variants).** Rank by impact. Be honest about anything you
couldn't measure. Flag any fix that risks visual/functional regression so the dev is careful.

Do NOT edit any site file except creating PERF-FINDINGS.md. Clean up harness/screenshot files.
Chrome: "/c/Program Files/Google/Chrome/Application/chrome.exe". Node available.
