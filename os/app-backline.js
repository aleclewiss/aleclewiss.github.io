/* AlecOS · app-backline.js
   The Backline window — a music generator that produces usable takes. Warm gold on
   brown-black, matched to the real demo. Self-contained: injects its own scoped (.bl-)
   styles, builds the UI in ctx.body, animates the selected take's waveform, and frames
   the real demo. One accent only: gold #d3a24c (light tint #e6bd6f). Real take data
   per CONTRACT.md. */
(function () {
  "use strict";

  // ---- real take data (from the shipped demo) --------------------------------
  var TAKES = [
    { name: "acoustic guitar", prompt: "heartfelt acoustic guitar, warm fingerpicking, intimate", bpm: 88,  key: "G maj", dur: "0:27", secs: 27, seed: 7 },
    { name: "tropical house",  prompt: "tropical house synth, sunny plucks, beach club groove",    bpm: 93,  key: "D maj", dur: "0:25", secs: 25, seed: 31 },
    { name: "indie guitar",    prompt: "jangly indie guitar, bright chiming strums, driving",       bpm: 135, key: "E maj", dur: "0:28", secs: 28, seed: 53 },
    { name: "pop lead synth",  prompt: "modern pop lead synth, glossy hook, radio sheen",           bpm: 92,  key: "A maj", dur: "0:26", secs: 26, seed: 97 }
  ];
  var NBARS = 46;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // deterministic per-take waveform magnitudes (0..1) with a soft envelope
  function magnitudes(seed) {
    var a = [], s = seed >>> 0, i;
    for (i = 0; i < NBARS; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var r = s / 0x7fffffff;
      var env = Math.pow(Math.sin(Math.PI * i / (NBARS - 1)), 0.5);
      a.push(0.16 + (0.28 + 0.72 * r) * env * 0.84);
    }
    return a;
  }
  TAKES.forEach(function (t) { t.mags = magnitudes(t.seed); });

  // ---- scoped styles (injected once) -----------------------------------------
  function injectStyles() {
    if (document.getElementById("bl-styles")) return;
    var css = `
    .bl-app{position:absolute;inset:0;display:flex;flex-direction:column;height:100%;
      background:linear-gradient(180deg,#191512,#161311 40%);color:#ece6da;
      font-family:-apple-system,"SF Pro Display","SF Pro Text","Inter",system-ui,sans-serif;overflow:hidden;}
    .bl-mono{font-family:ui-monospace,"SF Mono",Menlo,monospace;}
    /* header */
    .bl-head{display:flex;align-items:center;gap:12px;padding:20px 24px 12px;flex:0 0 auto;}
    .bl-logo{width:28px;height:28px;border-radius:8px;flex:0 0 auto;
      background:radial-gradient(circle at 32% 28%,#e6bd6f,#d3a24c 70%);
      box-shadow:0 0 0 1px rgba(230,189,111,.25),0 6px 14px -6px rgba(211,162,76,.7);
      display:grid;place-items:center;}
    .bl-brand{font-size:16px;font-weight:700;letter-spacing:-.02em;white-space:nowrap;}
    .bl-sub{font-size:11px;letter-spacing:.2em;color:#6f665a;text-transform:uppercase;margin-top:2px;
      font-family:ui-monospace,"SF Mono",Menlo,monospace;white-space:nowrap;}
    .bl-dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
    .bl-pill{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:11px;
      padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid #3a3227;color:#a89d8c;
      font-family:ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.04em;white-space:nowrap;transition:.3s;}
    .bl-pill .bl-dot{background:#8a7f6c;}
    .bl-pill.is-working{background:#241d10;border-color:#4a3a1c;color:#e6bd6f;}
    .bl-pill.is-working .bl-dot{background:#e6bd6f;box-shadow:0 0 7px #e6bd6f;}
    /* composer */
    .bl-composer{margin:0 24px;border:1px solid #322d28;border-radius:12px;
      background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0));padding:16px;flex:0 0 auto;}
    .bl-label{font-size:11px;letter-spacing:.2em;color:#6f665a;text-transform:uppercase;font-family:ui-monospace,"SF Mono",Menlo,monospace;}
    .bl-prompt{font-size:15px;color:#ece6da;margin-top:8px;line-height:1.5;min-height:22px;}
    .bl-prompt .bl-caret{display:inline-block;width:1.5px;height:16px;background:#e6bd6f;margin-left:1px;
      vertical-align:-2px;animation:bl-blink 1.05s steps(1) infinite;}
    @keyframes bl-blink{50%{opacity:0;}}
    .bl-row{display:flex;align-items:center;gap:8px;margin-top:16px;flex-wrap:nowrap;}
    .bl-chip{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#a89d8c;background:rgba(0,0,0,.24);
      border:1px solid #322d28;border-radius:8px;padding:7px 12px;letter-spacing:.04em;
      white-space:nowrap;flex:0 0 auto;}
    .bl-chip b{color:#ece6da;font-weight:600;}
    .bl-generate{margin-left:auto;border:0;cursor:pointer;font:inherit;font-size:13px;font-weight:700;color:#241d10;
      padding:9px 20px;border-radius:9px;background:linear-gradient(180deg,#e6bd6f,#d3a24c);
      box-shadow:0 6px 16px -8px rgba(211,162,76,.9);transition:transform .12s,filter .12s;}
    .bl-generate:hover{filter:brightness(1.06);}
    .bl-generate:active{transform:translateY(1px);}
    .bl-generate:focus-visible{outline:2px solid #e6bd6f;outline-offset:3px;}
    /* takes */
    .bl-takes-head{display:flex;align-items:baseline;gap:10px;padding:20px 24px 10px;flex:0 0 auto;}
    .bl-takes-head h3{font-size:14px;font-weight:600;letter-spacing:-.01em;}
    .bl-count{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#6f665a;}
    .bl-takes{flex:1 1 auto;overflow-y:auto;padding:0 24px 8px;min-height:0;}
    .bl-take{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;cursor:pointer;
      border:1px solid #262019;background:#191512;margin-bottom:8px;transition:background .12s,border-color .12s;}
    .bl-take:hover{background:#1d1813;}
    .bl-take.is-sel{background:#221c15;border-color:#d3a24c;}
    .bl-take:focus-visible{outline:2px solid #e6bd6f;outline-offset:2px;}
    .bl-play{width:28px;height:28px;flex:0 0 auto;border-radius:50%;border:1px solid #3a332a;
      display:grid;place-items:center;color:#8a7f6c;transition:.12s;}
    .bl-take.is-sel .bl-play{border-color:#e6bd6f;color:#e6bd6f;}
    .bl-play svg{width:11px;height:11px;display:block;margin-left:1px;}
    .bl-tk-name{font-size:12.5px;font-weight:600;color:#a89d8c;min-width:112px;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .bl-take.is-sel .bl-tk-name{color:#ece6da;}
    .bl-tk-meta{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#6f665a;min-width:104px;flex:0 0 auto;white-space:nowrap;letter-spacing:.02em;}
    .bl-wave{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:2px;height:30px;overflow:hidden;}
    .bl-bar{flex:1 1 0;min-width:2px;height:100%;border-radius:2px;background:#3d362d;
      transform:scaleY(.3);transform-origin:center;transition:background .25s;}
    .bl-take.is-sel .bl-bar{background:#6b5a3a;}
    .bl-tk-dur{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#5e564b;min-width:32px;text-align:right;}
    .bl-kept{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;letter-spacing:.14em;color:#e6bd6f;opacity:0;
      transition:opacity .3s;}
    .bl-take.is-sel .bl-kept{opacity:1;}
    /* player bar */
    .bl-player{flex:0 0 auto;display:flex;align-items:center;gap:14px;margin:8px 24px;padding:12px 16px;
      border:1px solid #262019;border-radius:12px;background:#141110;}
    .bl-pbtn{width:36px;height:36px;flex:0 0 auto;border-radius:50%;border:1px solid #e6bd6f;color:#e6bd6f;
      display:grid;place-items:center;cursor:pointer;background:none;transition:.12s;}
    .bl-pbtn:hover{background:rgba(230,189,111,.1);}
    .bl-pbtn:focus-visible{outline:2px solid #e6bd6f;outline-offset:2px;}
    .bl-pbtn svg{width:13px;height:13px;}
    .bl-pmeta{min-width:140px;}
    .bl-pname{font-size:12.5px;font-weight:600;color:#ece6da;}
    .bl-psub{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#6f665a;margin-top:3px;}
    .bl-track{flex:1 1 auto;height:5px;border-radius:3px;background:#2a241d;position:relative;}
    .bl-fill{position:absolute;inset:0 auto 0 0;width:0;border-radius:3px;background:#e6bd6f;}
    .bl-head-dot{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;background:#e6bd6f;
      transform:translate(-50%,-50%);box-shadow:0 0 8px rgba(230,189,111,.8);}
    .bl-time{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#6f665a;min-width:66px;text-align:right;}
    /* footer */
    .bl-foot{flex:0 0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:4px 24px 24px;}
    .bl-launch{border:0;cursor:pointer;font:inherit;font-size:12.5px;font-weight:700;color:#241d10;
      padding:10px 16px;border-radius:9px;background:linear-gradient(180deg,#e6bd6f,#d3a24c);
      box-shadow:0 6px 16px -8px rgba(211,162,76,.9);transition:transform .12s,filter .12s;display:inline-flex;align-items:center;gap:7px;}
    .bl-launch svg{width:11px;height:11px;}
    .bl-logo svg{display:block;}
    .bl-launch:hover{filter:brightness(1.06);}
    .bl-launch:active{transform:translateY(1px);}
    .bl-launch:focus-visible{outline:2px solid #e6bd6f;outline-offset:3px;}
    .bl-tags{display:flex;gap:6px;flex-wrap:wrap;}
    .bl-tag{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#8a7f6c;border:1px solid #322d28;
      border-radius:7px;padding:4px 9px;letter-spacing:.03em;}
    .bl-src{margin-left:auto;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;color:#8a7f6c;text-decoration:none;
      border-bottom:1px solid transparent;transition:.12s;white-space:nowrap;}
    .bl-src:hover{color:#e6bd6f;border-bottom-color:#e6bd6f;}
    /* live-demo panel — the REAL Backline, framed; slides over the mock on focus */
    .bl-demo-overlay{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;
      background:linear-gradient(180deg,#141110,#0e0b0a);opacity:0;visibility:hidden;transform:translateY(10px);
      transition:opacity .42s cubic-bezier(.16,1,.3,1),transform .42s cubic-bezier(.16,1,.3,1),visibility .42s;}
    .bl-demo-overlay.is-open{opacity:1;visibility:visible;transform:none;}
    .bl-demo-bar{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #262019;
      background:linear-gradient(180deg,#1a1512,#141110);}
    .bl-back{border:0;background:none;cursor:pointer;font:inherit;color:#a89d8c;font-size:12.5px;display:inline-flex;
      align-items:center;gap:6px;padding:6px 10px;border-radius:8px;transition:.12s;}
    .bl-back:hover{background:#221c15;color:#ece6da;}
    .bl-back:focus-visible{outline:2px solid #e6bd6f;outline-offset:2px;}
    .bl-back svg{width:12px;height:12px;}
    .bl-demo-title{font-size:12.5px;font-weight:600;color:#ece6da;}
    .bl-demo-title span{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11px;letter-spacing:.14em;color:#e6bd6f;
      text-transform:uppercase;margin-left:10px;display:inline-flex;align-items:center;gap:6px;}
    .bl-demo-title .bl-dot{width:5px;height:5px;background:#e6bd6f;box-shadow:0 0 6px #e6bd6f;}
    .bl-demo-host{flex:1 1 auto;min-height:0;display:flex;}
    .bl-demo-host .aos-demo{flex:1;min-height:0;border:0;border-radius:0;background:#161311;}
    .bl-demo-host .aos-demo iframe{height:100%;}
    .bl-demo-host .aos-demo iframe{height:100%;min-height:0;}
    @media (prefers-reduced-motion: reduce){ .bl-demo-overlay{transition:none;} }
    /* tasteful entrance — sections rise + fade in when the app takes focus */
    .bl-app.bl-enter .bl-head,.bl-app.bl-enter .bl-composer,.bl-app.bl-enter .bl-takes-head,
    .bl-app.bl-enter .bl-takes,.bl-app.bl-enter .bl-player,.bl-app.bl-enter .bl-foot{
      opacity:0;transform:translateY(12px);animation:bl-rise .55s cubic-bezier(.16,1,.3,1) forwards;}
    .bl-app.bl-enter .bl-head{animation-delay:.02s;}
    .bl-app.bl-enter .bl-composer{animation-delay:.08s;}
    .bl-app.bl-enter .bl-takes-head{animation-delay:.14s;}
    .bl-app.bl-enter .bl-takes{animation-delay:.19s;}
    .bl-app.bl-enter .bl-player{animation-delay:.25s;}
    .bl-app.bl-enter .bl-foot{animation-delay:.30s;}
    @keyframes bl-rise{to{opacity:1;transform:none;}}
    @media (prefers-reduced-motion: reduce){
      .bl-caret{animation:none;} .bl-bar{transition:none;} .bl-generate,.bl-launch,.bl-take{transition:none;}
      .bl-app.bl-enter .bl-head,.bl-app.bl-enter .bl-composer,.bl-app.bl-enter .bl-takes-head,
      .bl-app.bl-enter .bl-takes,.bl-app.bl-enter .bl-player,.bl-app.bl-enter .bl-foot{
        animation:none;opacity:1;transform:none;}
    }`;
    var el = document.createElement("style");
    el.id = "bl-styles";
    el.textContent = css;
    document.head.appendChild(el);
  }

  var PLAY_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1 L11 6 L2 11 Z" fill="currentColor"/></svg>';
  var BACK_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 2 L3.5 6 L7.5 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // genuine Backline mark — a stacked audio-waveform (no emoji, no letter glyph)
  function blBars(fill, id) {
    return '<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">' +
      (id ? '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#f2cd82"/><stop offset="1" stop-color="#cf9b43"/></linearGradient></defs>' : '') +
      '<g fill="' + fill + '">' +
      '<rect x="5.4" y="16" width="4.4" height="8"  rx="2.2"/>' +
      '<rect x="12.2" y="10" width="4.4" height="20" rx="2.2"/>' +
      '<rect x="19"  y="5"  width="4.4" height="30" rx="2.2"/>' +
      '<rect x="25.8" y="12" width="4.4" height="16" rx="2.2"/>' +
      '<rect x="32.6" y="17" width="4.4" height="6"  rx="2.2"/>' +
      '</g></svg>';
  }
  var BL_ICON = blBars("url(#blDock)", "blDock");     // gold mark for the dock tile
  var BL_LOGO_MARK = blBars("#241d10");               // dark mark for the in-window gold chip

  AlecOS.registerApp({
    id: "backline",
    name: "Backline",
    accent: "#d3a24c",
    dock: { svg: BL_ICON, tone: "#d3a24c", label: "Backline" },
    rect: { x: 660, y: 84, w: 600, h: 600 },
    minSize: { w: 420, h: 360 },

    build: function (ctx) {
      injectStyles();

      var sel = 0;                 // selected take index
      var progress = 0;            // 0..1 playhead of the selected take
      var playing = !reduce;       // auto-audition unless reduced motion
      var raf = 0, last = 0, running = false;

      var app = document.createElement("div");
      app.className = "bl-app";
      app.innerHTML =
        '<div class="bl-head">' +
          '<div class="bl-logo"><span style="width:15px;height:15px;display:block">' + BL_LOGO_MARK + '</span></div>' +
          '<div><div class="bl-brand">Backline</div><div class="bl-sub">Local music generation</div></div>' +
          '<div class="bl-pill" id="bl-pill"><span class="bl-dot"></span><span id="bl-pill-t">Ready</span></div>' +
        '</div>' +
        '<div class="bl-composer">' +
          '<div class="bl-label">Describe the sound</div>' +
          '<div class="bl-prompt"><span id="bl-prompt-t"></span><span class="bl-caret" id="bl-caret"></span></div>' +
          '<div class="bl-row">' +
            '<span class="bl-chip">BPM <b id="bl-bpm">88</b></span>' +
            '<span class="bl-chip">KEY <b id="bl-key">G maj</b></span>' +
            '<button class="bl-generate" id="bl-generate" type="button">Generate</button>' +
          '</div>' +
        '</div>' +
        '<div class="bl-takes-head"><h3>Takes</h3><span class="bl-count" id="bl-count">4 / 4</span></div>' +
        '<div class="bl-takes" id="bl-takes" role="listbox" aria-label="Generated takes"></div>' +
        '<div class="bl-player">' +
          '<button class="bl-pbtn" id="bl-pbtn" type="button" aria-label="Play / pause">' + PLAY_SVG + '</button>' +
          '<div class="bl-pmeta"><div class="bl-pname" id="bl-pname">acoustic guitar</div>' +
            '<div class="bl-psub" id="bl-psub">88 BPM · G maj · ACE-Step</div></div>' +
          '<div class="bl-track"><div class="bl-fill" id="bl-fill"></div><div class="bl-head-dot" id="bl-headdot" style="left:0"></div></div>' +
          '<div class="bl-time" id="bl-time">0:00 / 0:27</div>' +
        '</div>' +
        '<div class="bl-foot">' +
          '<button class="bl-launch" id="bl-launch" type="button">' + PLAY_SVG + 'Launch the real demo</button>' +
          '<div class="bl-tags"><span class="bl-tag">Electron</span><span class="bl-tag">React</span>' +
            '<span class="bl-tag">ACE-Step</span></div>' +
          '<a class="bl-src" href="https://github.com/aleclewiss/backline" target="_blank" rel="noopener">github.com/aleclewiss/backline ↗</a>' +
        '</div>';
      ctx.body.appendChild(app);

      var $ = function (id) { return app.querySelector(id); };
      var takesEl = $("#bl-takes");
      var promptT = $("#bl-prompt-t"), caret = $("#bl-caret");
      var bpmEl = $("#bl-bpm"), keyEl = $("#bl-key");
      var pnameEl = $("#bl-pname"), psubEl = $("#bl-psub");
      var fillEl = $("#bl-fill"), headDot = $("#bl-headdot"), timeEl = $("#bl-time");
      var pillEl = $("#bl-pill"), pillT = $("#bl-pill-t"), countEl = $("#bl-count");
      var pbtn = $("#bl-pbtn");

      // ---- build take rows ----
      var rows = [];
      TAKES.forEach(function (t, i) {
        var row = document.createElement("div");
        row.className = "bl-take" + (i === 0 ? " is-sel" : "");
        row.tabIndex = 0;
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", i === 0 ? "true" : "false");
        var barsHTML = "";
        for (var b = 0; b < NBARS; b++) barsHTML += '<span class="bl-bar"></span>';
        row.innerHTML =
          '<span class="bl-play">' + PLAY_SVG + '</span>' +
          '<span class="bl-tk-name">' + t.name + '</span>' +
          '<span class="bl-tk-meta">' + t.bpm + " BPM · " + t.key + '</span>' +
          '<span class="bl-wave">' + barsHTML + '</span>' +
          '<span class="bl-kept">KEPT</span>' +
          '<span class="bl-tk-dur">' + t.dur + '</span>';
        takesEl.appendChild(row);
        var bars = [].slice.call(row.querySelectorAll(".bl-bar"));
        // paint static magnitudes now
        bars.forEach(function (bar, bi) { bar.style.transform = "scaleY(" + t.mags[bi].toFixed(3) + ")"; });
        rows.push({ el: row, bars: bars });
        row.addEventListener("click", function () { select(i, true); });
        row.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i, true); }
        });
      });

      function paintPrompt() {
        // instant text (typing effect handled by tour/generate); keep caret only while focused-feel
        promptT.textContent = TAKES[sel].prompt;
      }

      function select(i, restart) {
        sel = i; if (restart) progress = 0;
        rows.forEach(function (r, ri) {
          r.el.classList.toggle("is-sel", ri === i);
          r.el.setAttribute("aria-selected", ri === i ? "true" : "false");
        });
        var t = TAKES[i];
        bpmEl.textContent = t.bpm; keyEl.textContent = t.key;
        pnameEl.textContent = t.name; psubEl.textContent = t.bpm + " BPM · " + t.key + " · ACE-Step";
        paintPrompt();
        if (reduce) { drawStatic(); updateScrub(); }
      }

      function fmt(sec) { var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ":" + (s < 10 ? "0" : "") + s; }

      function updateScrub() {
        var t = TAKES[sel];
        fillEl.style.width = (progress * 100).toFixed(2) + "%";
        headDot.style.left = (progress * 100).toFixed(2) + "%";
        timeEl.textContent = fmt(progress * t.secs) + " / " + t.dur;
      }

      // static render (reduced motion / paused): selected bars split gold at playhead
      function drawStatic() {
        rows.forEach(function (r, ri) {
          var t = TAKES[ri], isSel = ri === sel;
          r.bars.forEach(function (bar, bi) {
            bar.style.transform = "scaleY(" + t.mags[bi].toFixed(3) + ")";
            bar.style.background = isSel ? (bi / NBARS <= progress ? "#e6bd6f" : "#6b5a3a") : "#3d362d";
          });
        });
      }

      // animation loop — only the selected take is live
      function loop(ts) {
        if (!running) return;
        if (!last) last = ts;
        var dt = (ts - last) / 1000; last = ts;
        var t = TAKES[sel];
        if (playing) { progress += dt / t.secs; if (progress >= 1) progress = 0; }
        var time = ts / 1000;
        rows.forEach(function (r, ri) {
          var isSel = ri === sel, tk = TAKES[ri];
          if (!isSel) return; // non-selected stay static (painted once)
          r.bars.forEach(function (bar, bi) {
            var base = tk.mags[bi];
            var q = bi / (NBARS - 1);
            var shimmer = playing ? (0.86 + 0.14 * Math.abs(Math.sin(q * 11 + time * 6))) : 1;
            bar.style.transform = "scaleY(" + (base * shimmer).toFixed(3) + ")";
            bar.style.background = (q <= progress) ? "#e6bd6f" : "#6b5a3a";
          });
        });
        updateScrub();
        raf = requestAnimationFrame(loop);
      }

      function start() {
        if (reduce) { drawStatic(); updateScrub(); return; }
        if (running) return;
        running = true; last = 0; raf = requestAnimationFrame(loop);
      }
      function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

      // play/pause
      pbtn.addEventListener("click", function () {
        if (reduce) return;
        playing = !playing;
        pbtn.innerHTML = playing ? PLAY_SVG
          : '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="1.5" width="2.6" height="9" fill="currentColor"/><rect x="6.9" y="1.5" width="2.6" height="9" fill="currentColor"/></svg>';
      });

      // generate — brief working state + re-reveal shimmer, matches the tour beat
      var genTimer = 0;
      $("#bl-generate").addEventListener("click", function () {
        clearTimeout(genTimer);
        pillEl.classList.add("is-working");
        pillT.textContent = "Generating…"; countEl.textContent = "…";
        if (reduce) { pillEl.classList.remove("is-working"); pillT.textContent = "4 takes"; countEl.textContent = "4 / 4"; return; }
        var stages = [[350, "rendering 2/4"], [650, "rendering 4/4"], [900, "decoding"]];
        stages.forEach(function (s) { setTimeout(function () { countEl.textContent = s[1]; }, s[0]); });
        genTimer = setTimeout(function () {
          pillEl.classList.remove("is-working");
          pillT.textContent = "4 takes"; countEl.textContent = "4 / 4";
          select(0, true);
        }, 1150);
      });

      // ---- the REAL Backline demo, framed as its own panel ----
      // Mount the launchDemo node into a dedicated overlay so (a) it lives in the DOM
      // and the shell auto-loads it the moment Backline becomes the focused Space, and
      // (b) it presents at full window size, usable. "Overview" returns to the mock.
      var demoNode = ctx.launchDemo("backline-demo/index.html", {
        label: "Launch the real Backline",
        note: "the actual app — describe a sound, generate, audition, live in your browser"
      });
      var overlay = document.createElement("div");
      overlay.className = "bl-demo-overlay";
      var host = document.createElement("div");
      host.className = "bl-demo-host";
      host.appendChild(demoNode);
      overlay.appendChild(host);   // no chrome bar — the real app fills the panel
      app.appendChild(overlay);
      var demoShown = false;
      function showDemo() { overlay.classList.add("is-open"); demoShown = true; }
      function hideDemo() { overlay.classList.remove("is-open"); demoShown = false; }
      // footer button opens the framed live demo
      $("#bl-launch").addEventListener("click", showDemo);

      // init
      paintPrompt();
      select(0, true);
      drawStatic();
      updateScrub();

      // replay the staggered entrance when the app becomes the focused one
      function playEntrance() {
        if (reduce) return;
        app.classList.remove("bl-enter"); void app.offsetWidth; app.classList.add("bl-enter");
      }

      // reveal the real demo once the entrance has played, so it's actually SHOWING
      var revealTimer = 0;
      var blVisited = false;
      function focusIn() {
        start();
        if (blVisited) { showDemo(); return; }   // returning: keep state, no entrance replay (no "reload")
        blVisited = true;
        playEntrance();
        clearTimeout(revealTimer);
        revealTimer = setTimeout(showDemo, reduce ? 250 : 1200);
      }
      return {
        onOpen: focusIn,
        onFocus: focusIn,
        onBlur: function () { stop(); clearTimeout(revealTimer); },  // keep the demo revealed for next visit (no reload)
        onClose: function () { stop(); clearTimeout(genTimer); clearTimeout(revealTimer); hideDemo(); }
      };
    },

    // ---- guided-tour beats ----
    tour: [
      { kicker: "03 — Generative audio", focus: ".bl-composer", title: "Type it. Hear it.",
        body: "Backline, a music generator. Describe a sound in plain words and it renders real, usable audio in seconds — a full desktop app wrapped around a diffusion model I run locally.",
        how: "ACE-Step diffusion · Electron + React  —  generative AI + product engineering" },
      { focus: ".bl-generate", title: "Generate real audio", click: true,
        body: "ACE-Step runs locally on my machine. Every take is actual audio — not a preset, not a loop." },
      { focus: ".bl-take.is-sel", title: "Audition, keep the one that earns it",
        body: "Most takes miss, and that's the point — each costs seconds. I keep the one that fits and move on." },
      { focus: ".bl-launch", title: "Try it yourself", click: true,
        body: "This opens the real Backline, running right here in the page." }
    ]
  });
})();
