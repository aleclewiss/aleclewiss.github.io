/* AlecOS · app-freak.js — Freak-Quencies
   A clean plugin window: the real Freak-Quencies demo framed as the product itself.
   The demo carries its own sample examples (Bedroom / Bright / Condenser / Off-axis,
   each raw vs. AI-corrected). No Ableton. One AlecOS.registerApp call. Namespaced .fq-*.
   The heading + description live ABOVE the window (wm.js reads tour[0]). */
(function () {
  "use strict";

  var AMBER = "#ecc270";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // amber dock icon — an EQ curve on a rounded tile (not the Ableton logo)
  var FQ_ICON =
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<rect x="7" y="7" width="50" height="50" rx="14" fill="#1c170d"/>' +
      '<rect x="7" y="7" width="50" height="50" rx="14" fill="none" stroke="#ecc270" stroke-opacity=".3" stroke-width="1.5"/>' +
      '<path d="M12 40C22 40 22 22 32 22s10 18 20 18" fill="none" stroke="#ecc270" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="32" cy="22" r="3" fill="#ecc270"/>' +
      '<g fill="#ecc270" fill-opacity=".5"><circle cx="18" cy="47" r="1.7"/><circle cx="32" cy="47" r="1.7"/><circle cx="46" cy="47" r="1.7"/></g>' +
    '</svg>';

  function inject() {
    if (document.getElementById("fq-styles")) return;
    var css = [
      ".fq-root{--fq:#ecc270;--fq2:#d3a24c;position:absolute;inset:0;display:flex;flex-direction:column;height:100%;",
      "  background:radial-gradient(130% 90% at 50% 0%,#211a10,#161310 62%);color:#e9e3d6;",
      "  font:13px/1.4 -apple-system,'SF Pro Display','SF Pro Text','Inter',system-ui,sans-serif;overflow:hidden}",

      /* device header */
      ".fq-bar{flex:none;display:flex;align-items:center;gap:13px;padding:16px 24px;border-bottom:1px solid #2b2519;",
      "  background:linear-gradient(180deg,rgba(255,255,255,.03),transparent)}",
      ".fq-mark{width:34px;height:34px;flex:none;border-radius:9px;display:grid;place-items:center;",
      "  background:radial-gradient(circle at 32% 28%,#f4d58c,#d3a24c 72%);",
      "  box-shadow:0 0 0 1px rgba(236,194,112,.3),0 7px 16px -7px rgba(211,162,76,.8)}",
      ".fq-mark svg{width:19px;height:19px;display:block}",
      ".fq-name{font-size:16px;font-weight:700;letter-spacing:-.02em}",
      ".fq-tag{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a7f6a;margin-top:3px;",
      "  font-family:ui-monospace,'SF Mono',Menlo,monospace}",
      ".fq-live{margin-left:auto;display:inline-flex;align-items:center;gap:7px;",
      "  font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:.06em;color:#ecc270;",
      "  padding:6px 13px;border-radius:999px;background:#241d10;border:1px solid #4a3a1c;white-space:nowrap}",
      ".fq-live i{width:6px;height:6px;border-radius:50%;background:#ecc270;box-shadow:0 0 7px #ecc270}",
      REDUCE ? "" : "@keyframes fq-pulse{50%{opacity:.35}}.fq-live i{animation:fq-pulse 1.6s ease-in-out infinite}",

      /* the demo stage — the real plugin, with its own sample examples */
      ".fq-stage{position:relative;flex:1;min-height:0;display:flex;background:#0d0b08}",
      ".fq-stage .aos-demo{flex:1;border:0;border-radius:0;min-height:0}",
      ".fq-stage .aos-demo iframe{height:100%}",

      /* footer */
      ".fq-foot{flex:none;display:flex;align-items:center;gap:14px;padding:11px 24px;border-top:1px solid #2b2519;",
      "  background:#141109}",
      ".fq-tags{display:flex;gap:7px;flex-wrap:wrap}",
      ".fq-tags i{font-style:normal;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10.5px;color:#a89d8c;",
      "  background:rgba(0,0,0,.3);border:1px solid #322b1d;border-radius:7px;padding:5px 10px;letter-spacing:.03em}",
      ".fq-foot .sp{margin-left:auto}",
      ".fq-src{color:#a89d8c;text-decoration:none;font-family:ui-monospace,'SF Mono',Menlo,monospace;",
      "  font-size:11px;letter-spacing:.04em}",
      ".fq-src:hover{color:#ecc270}",
      ".fq-btn{display:inline-flex;align-items:center;gap:7px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;",
      "  color:#241d10;border:0;padding:8px 15px;border-radius:8px;background:linear-gradient(180deg,#ecc270,#d3a24c);",
      "  box-shadow:0 6px 15px -8px rgba(211,162,76,.9);transition:filter .12s,transform .12s}",
      ".fq-btn:hover{filter:brightness(1.06)}.fq-btn:active{transform:translateY(1px)}",
      ".fq-btn:focus-visible{outline:2px solid #ecc270;outline-offset:3px}",

      /* entrance — plays once per visit */
      ".fq-enter .fq-bar,.fq-enter .fq-stage,.fq-enter .fq-foot{opacity:0;transform:translateY(14px);",
      "  animation:fq-rise .55s cubic-bezier(.16,1,.3,1) forwards}",
      ".fq-enter .fq-bar{animation-delay:.02s}.fq-enter .fq-stage{animation-delay:.09s}.fq-enter .fq-foot{animation-delay:.16s}",
      "@keyframes fq-rise{to{opacity:1;transform:none}}",
      REDUCE ? ".fq-enter .fq-bar,.fq-enter .fq-stage,.fq-enter .fq-foot{animation:none;opacity:1;transform:none}" : ""
    ].join("");
    var s = document.createElement("style"); s.id = "fq-styles"; s.textContent = css;
    document.head.appendChild(s);
  }

  AlecOS.registerApp({
    id: "freak",
    name: "Freak-Quencies",
    accent: AMBER,
    dock: { svg: FQ_ICON, tone: AMBER, label: "Freak-Quencies" },

    build: function (ctx) {
      inject();
      var root = document.createElement("div");
      root.className = "fq-root";
      root.innerHTML =
        '<div class="fq-bar">' +
          '<span class="fq-mark">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#241d10" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15c4.5 0 4.5-9 9-9s4.5 9 9 9"/></svg>' +
          '</span>' +
          '<div><div class="fq-name">Freak-Quencies</div><div class="fq-tag">AI mixing assistant</div></div>' +
        '</div>' +
        '<div class="fq-stage" id="fqStage"></div>' +
        '<div class="fq-foot">' +
          '<span class="sp"></span>' +
          '<a class="fq-src" href="https://github.com/aleclewiss/Freak-Quencies" target="_blank" rel="noopener">Source &#8599;</a>' +
          '<button class="fq-btn" type="button" id="fqLaunch">' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 4h6v6M20 4l-9 9M10 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5"/></svg>' +
            ' Full-screen</button>' +
        '</div>';
      ctx.body.appendChild(root);

      /* ---- the real plugin demo ----
         Built once, mounted into the stage, and left for the shell to auto-load when
         this app becomes the focused Space. Full-screen button opens it un-cropped. */
      var stage = root.querySelector("#fqStage");
      var demoEl = ctx.launchDemo
        ? ctx.launchDemo("freak-demo/index.html?embed=1", {
            label: "Launch the plugin",
            note: "the real Freak-Quencies plugin — pick a sample, hear raw vs. the AI-corrected mix"
          })
        : null;
      var mounted = false;
      function mountDemo() {
        if (mounted || !demoEl || !stage) return;
        mounted = true;
        stage.appendChild(demoEl);
      }
      root.querySelector("#fqLaunch").addEventListener("click", function () {
        window.open("freak-demo/index.html", "_blank", "noopener");
      });

      /* entrance plays once; revisiting the app is instant (no "reload" feel) */
      var fqEntered = false;
      function playEnter() {
        if (REDUCE || fqEntered) return;
        fqEntered = true;
        root.classList.remove("fq-enter");
        void root.offsetWidth;            // reflow so the animation restarts
        root.classList.add("fq-enter");
      }

      return {
        onOpen:  function () { mountDemo(); playEnter(); },
        onFocus: function () { mountDemo(); playEnter(); },   // demo mounts before the shell auto-loads it
        onBlur:  function () {},
        onClose: function () {}
      };
    },

    // tour[0] becomes the heading (title) + description shown above the window
    tour: [
      { kicker: "02 — Machine learning",
        title: "It mixes like I do.",
        body: "Freak-Quencies, an AI mixing plugin. Drop it on a raw guitar take and a neural net writes a corrective EQ and compressor in real time — the exact moves I'd make by ear.",
        how: "PyTorch CNN · JUCE / C++ · Web Audio  —  applied ML + real-time DSP" }
    ]
  });
})();
