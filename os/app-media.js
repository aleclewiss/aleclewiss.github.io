/* AlecOS · app-media.js  — REALISM PASS v2
   Three windows: Photos (the hero opener — "me"), Aminal House (YouTube), Contact (Mail).
   Each is one AlecOS.registerApp(...) call. Real content only. ZERO emoji — every glyph is SVG. */
(function () {
  "use strict";
  if (!window.AlecOS || typeof AlecOS.registerApp !== "function") {
    console.error("[app-media] AlecOS not present — check script order in index.html");
    return;
  }

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  // replay the staggered entrance of a .mw-root's sections when the app is focused
  var _mwPlayed = new WeakSet();
  function playIn(rootEl) {
    if (!rootEl || _mwPlayed.has(rootEl)) return;   // entrance plays once per app; revisits are instant (no "reload")
    _mwPlayed.add(rootEl);
    rootEl.classList.remove("mw-play");
    void rootEl.offsetWidth;            // force reflow so the animation restarts
    rootEl.classList.add("mw-play");
  }

  /* ---------------- genuine SVG icons (no emoji anywhere) ---------------- */
  // stroke icons inherit currentColor; sized by the container.
  function stroke(d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (extra || "") + d + '</svg>';
  }
  var IC = {
    library:  stroke('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.3" cy="9" r="1.5"/><path d="M4 17l4.5-4.5L12 16l3.5-4L20 16.5"/>'),
    memories: stroke('<path d="M12 20C5 15 4.5 8.5 8.2 7.1 10.3 6.3 12 8.2 12 8.2s1.7-1.9 3.8-1.1C19.5 8.5 19 15 12 20Z"/>'),
    people:   stroke('<circle cx="12" cy="8" r="3.3"/><path d="M5.5 19.5c.6-3.6 3.4-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/>'),
    places:   stroke('<path d="M12 21s6.5-5.9 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.1 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.2"/>'),
    dogs:     stroke('<ellipse cx="12" cy="15.5" rx="4" ry="3"/><circle cx="6.7" cy="11" r="1.7"/><circle cx="17.3" cy="11" r="1.7"/><circle cx="9.2" cy="7.7" r="1.6"/><circle cx="14.8" cy="7.7" r="1.6"/>'),
    climbing: stroke('<path d="M3 19l5.5-9 3.2 4.4L15 9l6 10Z"/>'),
    camera:   stroke('<path d="M4 8h3l1.4-2h7.2L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8Z"/><circle cx="12" cy="12.6" r="3.2"/>'),
    ducks:    stroke('<path d="M15.5 7.2a2.2 2.2 0 1 0-2 3.3H8c-2.2 0-4 1.6-4 4 0 .6.5 1 1 1h7.5c3 0 5-2 5.2-4.8"/><path d="M17.7 9.7l2.6-.5-1.8 1.9"/>'),
    close:    stroke('<path d="M6 6l12 12M18 6L6 18"/>'),
    prev:     stroke('<path d="M15 5l-7 7 7 7"/>'),
    next:     stroke('<path d="M9 5l7 7-7 7"/>'),
    play:     stroke('<path d="M8 6.5v11l9-5.5z" fill="currentColor" stroke="none"/>'),
    send:     stroke('<path d="M21.5 3.2 2.6 10.4c-.7.3-.7 1.2 0 1.4l7 2.1 2.1 7c.2.7 1.1.7 1.4 0z"/><path d="M21.5 3.2 11 14"/>'),
    reply:    stroke('<path d="M9 8 4 12l5 4"/><path d="M4 12h9a6 6 0 0 1 6 6"/>'),
    archive:  stroke('<rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V8.5"/><path d="M10 12h4"/>'),
    trash:    stroke('<path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6.5 7l1 12.5A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>'),
    flag:     stroke('<path d="M6 21V4M6 5h10l-2 3 2 3H6"/>'),
    search:   stroke('<circle cx="11" cy="11" r="6.2"/><path d="M20 20l-3.6-3.6"/>')
  };

  // Photos app dock icon: the multicolour pinwheel, built programmatically.
  var pinCols = ["#F7C948", "#F79A3E", "#EE5D6C", "#D14FB0", "#8A63F4", "#4C8DFF", "#33C4B3", "#57C84D"];
  var petals = pinCols.map(function (c, i) {
    return '<ellipse cx="32" cy="19" rx="7.6" ry="14.5" fill="' + c + '" opacity=".92" transform="rotate(' + (i * 45) + " 32 32)" + '"/>';
  }).join("");
  var ICON_PHOTOS = '<svg viewBox="0 0 64 64" aria-hidden="true"><g style="mix-blend-mode:screen">' + petals +
    '</g><circle cx="32" cy="32" r="4.4" fill="#fff"/></svg>';
  var ICON_YOUTUBE = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="16" width="48" height="32" rx="9" fill="#ff0033"/>' +
    '<path d="M27 25.5 42 32 27 38.5z" fill="#fff"/></svg>';
  var ICON_MAIL = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="mailg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#5ca0ff"/><stop offset="1" stop-color="#2f6fe0"/></linearGradient></defs>' +
    '<rect x="8" y="14" width="48" height="36" rx="8" fill="url(#mailg)"/>' +
    '<path d="M12 20 32 35 52 20" fill="none" stroke="#eaf2ff" stroke-width="2.6" stroke-linejoin="round"/></svg>';

  // small SVG dog mark for the channel avatar (no emoji)
  var DOG_AVATAR = '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#c9c9cf" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M20 18 14 12 13 24"/><path d="M44 18 50 12 51 24"/>' +
    '<path d="M20 20c-3 4-4 9-4 14 0 8 7 14 16 14s16-6 16-14c0-5-1-10-4-14"/>' +
    '<circle cx="26" cy="33" r="1.8" fill="#c9c9cf"/><circle cx="38" cy="33" r="1.8" fill="#c9c9cf"/>' +
    '<path d="M32 38v3M28 43c1.5 1.4 6.5 1.4 8 0" /></svg>';

  /* ---------------- shared styles (injected once) ---------------- */
  if (!document.getElementById("am-media-styles")) {
    var st = document.createElement("style");
    st.id = "am-media-styles";
    st.textContent = [
      ".mw-root{position:absolute;inset:0;display:flex;overflow:hidden;",
      "  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}",
      ".mw-col{display:flex;flex-direction:column;min-width:0;flex:1}",
      ".mw-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}",
      ".mw-scroll::-webkit-scrollbar{width:10px;height:10px}",
      ".mw-scroll::-webkit-scrollbar-thumb{background:#3a3a42;border-radius:6px;border:2px solid transparent;background-clip:content-box}",
      ".mw-scroll::-webkit-scrollbar-track{background:transparent}",
      ".mw-mono{font-family:ui-monospace,'SF Mono','Cascadia Code',Menlo,Consolas,monospace}",
      ".mw-ic{display:inline-flex;width:1em;height:1em}.mw-ic svg{width:100%;height:100%}",
      /* entrance: sections fade/rise in when the app becomes focused (one-at-a-time) */
      ".mw-anim{opacity:1}",
      ".mw-root.mw-play .mw-anim{animation:mw-rise .55s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d,0s)}",
      "@keyframes mw-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
      "@media (prefers-reduced-motion: reduce){.mw-root.mw-play .mw-anim{animation:none}}",

      /* ============ PHOTOS (macOS Photos) ============ */
      ".ph-root{background:#141416;color:#ECECF0}",
      ".ph-side{width:236px;flex:none;background:#1b1b1f;border-right:1px solid #000;display:flex;flex-direction:column;padding:16px 0}",
      ".ph-acct{display:flex;align-items:center;gap:11px;padding:6px 16px 16px}",
      ".ph-av{width:42px;height:42px;border-radius:50%;object-fit:cover;object-position:62% 28%;border:1.5px solid #E1306C;flex:none}",
      ".ph-an{font-size:13.5px;font-weight:600;letter-spacing:-.01em}",
      ".ph-al{font-size:11px;color:#8b8790;margin-top:2px}",
      ".ph-navsec{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#6b6772;padding:12px 18px 6px}",
      ".ph-nav{list-style:none;margin:0;padding:0 8px}",
      ".ph-nav li{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:7px;font-size:13.5px;color:#d6d4db;cursor:pointer;transition:background .12s}",
      ".ph-nav li .mw-ic{width:17px;height:17px;color:#9a96a2;flex:none}",
      ".ph-nav li .ct{margin-left:auto;font-size:11.5px;color:#6b6772}",
      ".ph-nav li:hover{background:#26262c}",
      ".ph-nav li.on{background:#E1306C;color:#fff}",
      ".ph-nav li.on .mw-ic,.ph-nav li.on .ct{color:#fff}",
      ".ph-bar{height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid #000;background:#1b1b1f}",
      ".ph-title{font-size:15px;font-weight:700;letter-spacing:-.01em}",
      ".ph-count{font-size:12px;color:#8b8790}",
      ".ph-seg{margin-left:auto;display:flex;background:#0f0f11;border:1px solid #2a2a30;border-radius:8px;overflow:hidden}",
      ".ph-seg span{padding:5px 12px;font-size:12px;color:#8b8790}.ph-seg span.on{background:#33333c;color:#fff}",
      ".ph-grid{display:flex;flex-direction:column;padding:6px 28px 30px}",
      ".ph-sec-h{display:flex;align-items:baseline;gap:11px;font-size:18px;font-weight:700;letter-spacing:-.02em;color:#f4f2f7;padding:26px 2px 13px}",
      ".ph-sec-h:first-child{padding-top:14px}",
      ".ph-sec-h span{font-size:11.5px;font-weight:500;color:#8b8790;font-family:ui-monospace,Menlo,monospace}",
      ".ph-row{display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start}",
      ".ph-vrow{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}",
      ".ph-tile.is-video{height:360px;width:203px;flex:0 0 auto}",   /* featured 9:16 video card, autoplaying */
      ".ph-tile.is-video .vbadge{position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:50%;",
      "  background:rgba(0,0,0,.5);color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}",
      ".ph-tile.is-video .vbadge .mw-ic{width:12px;height:12px}",

      /* ===== PHOTOS — 3D coverflow FLOATING on the wallpaper (no window; scroll to spin) ===== */
      ".aos-win.pc-win{background:transparent!important;box-shadow:none!important;outline:none!important;border-radius:0!important;overflow:visible!important}",
      ".aos-win.pc-win .aos-titlebar{display:none!important}",
      ".aos-win.pc-win .aos-body{background:transparent!important;overflow:visible!important}",
      ".pc-root{position:absolute;inset:0;display:flex;flex-direction:column;background:transparent;",
      "  color:#f2f0f5;font-family:-apple-system,'SF Pro Display','Inter',system-ui,sans-serif;padding:4px 4px 0}",
      ".pc-head{flex:0 0 auto;text-align:center;display:flex;flex-direction:column;gap:8px;min-height:58px;justify-content:center;position:relative;z-index:20}",
      ".pc-sec{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#ff5c86;text-shadow:0 1px 3px rgba(0,0,0,.95),0 2px 12px rgba(0,0,0,.8)}",
      ".pc-desc{font-size:clamp(17px,1.9vw,25px);font-weight:600;letter-spacing:-.02em;line-height:1.12;margin:0;color:#f0eef4;text-wrap:balance;text-shadow:0 2px 24px rgba(0,0,0,.7)}",
      ".pc-stage{flex:1;min-height:0;position:relative;perspective:1600px;overflow:visible;cursor:grab}",
      ".pc-card{position:absolute;left:50%;top:50%;height:80%;display:flex;align-items:center;justify-content:center;",
      "  transform-style:preserve-3d;will-change:transform,opacity;",
      "  transition:transform .62s cubic-bezier(.22,1,.36,1),opacity .5s ease}",
      ".pc-card img,.pc-card video{max-height:100%;max-width:46vw;width:auto;border-radius:16px;object-fit:contain;display:block;",
      "  box-shadow:0 44px 100px -40px #000,0 0 0 1px rgba(255,255,255,.08)}",
      ".pc-card.is-side img,.pc-card.is-side video{filter:brightness(.62) saturate(.9)}",
      ".pc-dots{flex:0 0 auto;display:flex;gap:9px;justify-content:center;flex-wrap:wrap;padding:14px 0 4px;position:relative;z-index:20}",
      ".pc-dot{width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;background:rgba(255,255,255,.28);transition:.2s}",
      ".pc-dot.on{background:#E1306C;transform:scale(1.35)}",
      ".pc-dot:hover{background:rgba(255,255,255,.6)}",
      ".pc-swap{animation:pc-swapk .45s cubic-bezier(.16,1,.3,1)}",
      "@keyframes pc-swapk{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}",
      "@media (prefers-reduced-motion: reduce){.pc-card{transition:opacity .3s}.pc-swap{animation:none}}",
      ".ph-tile{position:relative;overflow:hidden;background:#0f0f11;border:0;padding:0;cursor:pointer;border-radius:11px;height:258px;flex:0 0 auto;",
      "  box-shadow:0 2px 10px -4px rgba(0,0,0,.5);transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}",
      ".ph-tile img,.ph-tile video{width:100%;height:100%;object-fit:cover;display:block;",
      "  filter:brightness(1.05) saturate(1.06);transition:transform .5s cubic-bezier(.22,1,.36,1)}",
      ".ph-tile:hover{transform:translateY(-3px);box-shadow:0 14px 30px -12px rgba(0,0,0,.7)}",
      ".ph-tile:hover img,.ph-tile:hover video{transform:scale(1.05)}",
      ".ph-tile:focus-visible{outline:3px solid #E1306C;outline-offset:2px}",
      ".ph-tile .cap{position:absolute;left:0;right:0;bottom:0;padding:26px 13px 11px;text-align:left;font-size:12.5px;font-weight:500;color:#fff;",
      "  opacity:0;transition:opacity .22s;background:linear-gradient(0deg,rgba(0,0,0,.82),transparent)}",
      ".ph-tile:hover .cap,.ph-tile:focus-visible .cap{opacity:1}",
      ".ph-tile .pl{position:absolute;left:8px;bottom:8px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}",
      ".ph-tile .pl .mw-ic{width:12px;height:12px}",
      ".ph-lb{position:absolute;inset:0;z-index:20;background:rgba(8,8,10,.95);display:none;align-items:center;justify-content:center}",
      ".ph-lb.on{display:flex}",
      ".ph-lb figure{margin:0;max-width:90%;max-height:86%;display:flex;flex-direction:column;align-items:center;gap:12px}",
      ".ph-lbstage img,.ph-lbstage video{max-width:100%;max-height:74vh;border-radius:8px;box-shadow:0 30px 90px -30px #000;display:block}",
      ".ph-lb figcaption{font-size:13px;color:#c9c6cf}",
      ".ph-lbx,.ph-lbn,.ph-lbp{position:absolute;background:rgba(28,28,34,.72);border:1px solid #35353d;color:#fff;",
      "  border-radius:50%;width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center}",
      ".ph-lbx .mw-ic,.ph-lbn .mw-ic,.ph-lbp .mw-ic{width:20px;height:20px}",
      ".ph-lbx{top:16px;right:16px}.ph-lbp{left:16px;top:50%;transform:translateY(-50%)}.ph-lbn{right:16px;top:50%;transform:translateY(-50%)}",
      ".ph-lbx:hover,.ph-lbn:hover,.ph-lbp:hover{background:rgba(225,48,108,.9)}",
      "@media (max-width:640px){.ph-side{display:none}}",

      /* ============ AMINAL / YOUTUBE ============ */
      ".am-root{background:#0F0F0F;color:#fff;flex-direction:column}",
      ".am-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:14px;padding:11px 20px;",
      "  background:rgba(15,15,15,.96);backdrop-filter:blur(8px);border-bottom:1px solid #222}",
      ".am-logo{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px;letter-spacing:-.03em}",
      ".am-logo .yt{width:30px;height:21px}.am-logo .yt svg{width:100%;height:100%}",
      ".am-search{flex:1;max-width:440px;margin:0 auto;display:flex;align-items:center;gap:8px;background:#121212;",
      "  border:1px solid #303030;border-radius:20px;padding:6px 15px;color:#8a8a8a;font-size:13px}",
      ".am-search .mw-ic{width:15px;height:15px}",
      ".am-hero{display:flex;align-items:center;gap:22px;padding:26px 26px 18px}",
      ".am-av{width:104px;height:104px;border-radius:50%;background:#1f1f1f;border:1px solid #303030;flex:none;overflow:hidden}",
      ".am-av svg{width:100%;height:100%}",
      ".am-meta h1{font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:-.02em;line-height:1.1}",
      ".am-sub{color:#aaa;font-size:13.5px;margin-top:5px}",
      ".am-tag{color:#8a8a8a;font-size:13px;margin-top:3px;display:flex;align-items:center;gap:6px}",
      ".am-tag .mw-ic{width:14px;height:14px;color:#ff6b81}",
      ".am-subscribe{margin-left:auto;flex:none;background:#fff;color:#0f0f0f;font-weight:700;font-size:13.5px;",
      "  border:0;border-radius:20px;padding:10px 20px;text-decoration:none;cursor:pointer;transition:transform .15s,background .15s}",
      ".am-subscribe:hover{background:#e8e8e8;transform:translateY(-1px)}",
      ".am-subscribe:focus-visible{outline:2px solid #ff4d6a;outline-offset:3px}",
      ".am-tabs{display:flex;gap:26px;padding:0 26px;border-bottom:1px solid #272727;font-size:14px;color:#aaa}",
      ".am-tabs span{padding:12px 0;position:relative}",
      ".am-tabs span.on{color:#fff;font-weight:600}",
      ".am-tabs span.on::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#fff}",
      ".am-sec{padding:20px 26px 8px;font-size:15px;font-weight:600}",
      ".am-shorts{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px;padding:4px 26px 8px}",
      ".am-vid{text-decoration:none;color:inherit;display:block;transition:transform .18s}",
      ".am-vid:hover{transform:translateY(-3px)}",
      ".am-vid:focus-visible{outline:2px solid #ff4d6a;outline-offset:3px;border-radius:12px}",
      ".am-thumb{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#1a1a1a}",
      ".am-thumb img{width:100%;height:100%;object-fit:cover;display:block}",
      ".am-thumb .dur{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.85);border-radius:4px;font-size:11px;padding:1px 5px;font-weight:600}",
      ".am-vt{display:-webkit-box;font-size:13px;font-weight:600;margin-top:8px;line-height:1.3;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
      ".am-vv{display:block;font-size:12px;color:#aaa;margin-top:3px}",
      ".am-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 26px;background:#141414;border:1px solid #272727;border-radius:14px;padding:22px}",
      ".am-stat b{display:block;font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}",
      ".am-stat.zero b{color:#ff0033}",
      ".am-stat span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#888;margin-top:4px;display:block}",
      ".am-foot{padding:0 26px 26px;color:#8a8a8a;font-size:13px;line-height:1.6;max-width:64ch}",
      ".am-foot a{color:#ff6b81;text-decoration:none}.am-foot a:hover{text-decoration:underline}",

      /* ===== AMINAL — the process, the numbers, a link out (overrides YouTube styles above) ===== */
      ".am-root{background:radial-gradient(125% 80% at 50% -6%,#200c12,#0c0a0b 60%)!important;color:#f3eef0!important}",
      ".am-wrap{padding:28px 40px 32px;max-width:1120px;margin:0 auto;width:100%;box-sizing:border-box}",
      ".am-hd{display:flex;align-items:center;gap:15px;margin-bottom:26px}",
      ".am-avm{width:50px;height:50px;border-radius:14px;background:#1c1416;border:1px solid #3a2429;flex:none;display:grid;place-items:center;overflow:hidden}",
      ".am-avm img{width:100%;height:100%;object-fit:cover;display:block}",
      ".am-avm svg{width:34px;height:34px}",
      ".am-id h1{font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.1}",
      ".am-id .h{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:#a2878e;margin-top:4px;letter-spacing:.02em}",
      ".am-yt{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:9px;text-decoration:none;",
      "  background:#fff;color:#0d0a0b;font-weight:700;font-size:13.5px;border-radius:11px;padding:10px 17px;",
      "  box-shadow:0 8px 22px -10px rgba(0,0,0,.7);transition:transform .15s,box-shadow .15s,background .15s}",
      ".am-yt:hover{transform:translateY(-1px);background:#fff;box-shadow:0 12px 26px -10px rgba(255,0,51,.55)}",
      ".am-yt:focus-visible{outline:2px solid #ff6b81;outline-offset:3px}",
      ".am-yt .yt{width:26px;height:19px}.am-yt .yt svg{width:100%;height:100%}",
      /* the numbers — the headline */
      ".am-stats{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px;margin-bottom:28px}",
      ".am-stat{border:1px solid #2a1a1e;border-radius:16px;background:linear-gradient(180deg,#160f11,#110c0d);padding:18px 20px}",
      ".am-stat.hero{background:linear-gradient(150deg,#2a0c14,#140b0d 70%);border-color:#4a1a24}",
      ".am-stat b{display:block;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1;",
      "  font-size:clamp(26px,3.4vw,40px);color:#fff}",
      ".am-stat.hero b{color:#ff5870;font-size:clamp(34px,4.6vw,54px)}",
      ".am-stat span{display:block;margin-top:9px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#9a828a}",
      ".am-stat.zero b{color:#ff5870}",
      /* the process — the centerpiece */
      ".am-plbl{font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#8a747a;",
      "  display:flex;align-items:center;gap:9px;margin-bottom:16px}",
      ".am-plbl::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#3a2429,transparent)}",
      ".am-flow{display:flex;align-items:stretch;gap:0}",
      ".am-step{flex:1;display:flex;flex-direction:column;gap:9px;padding:2px 4px}",
      ".am-sic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#ff6b81;",
      "  background:#1d1315;border:1px solid #3a2429;",
      "  animation:am-glow 5.2s ease-in-out infinite;animation-delay:calc(var(--si,0)*.62s)}",
      ".am-sic svg{width:20px;height:20px}",
      "@keyframes am-glow{0%,100%{border-color:#3a2429;color:#d98a97;box-shadow:none}",
      "  7%,15%{border-color:#ff3355;color:#ff9caa;box-shadow:0 0 22px -3px rgba(255,0,51,.6)}}",
      ".am-arrow svg{transition:color .3s}",
      ".am-arrow{animation:am-arr 5.2s ease-in-out infinite;animation-delay:calc(var(--si,0)*.62s + .3s)}",
      "@keyframes am-arr{0%,100%{color:#5a3a42}9%,17%{color:#ff506b}}",
      ".am-step b{font-size:13.5px;font-weight:600;color:#f2e8ea;letter-spacing:-.01em}",
      ".am-step p{font-size:12px;color:#a2878e;line-height:1.45;margin:0}",
      ".am-step em{font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:#7a666c;letter-spacing:.02em}",
      ".am-arrow{flex:0 0 30px;display:flex;align-items:center;justify-content:center;color:#5a3a42;padding-top:9px}",
      ".am-arrow svg{width:18px;height:18px}",
      ".am-stack{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#8a747a;margin-top:28px;",
      "  padding-top:18px;border-top:1px solid #2a1a1e;letter-spacing:.03em;line-height:1.6}",
      ".am-stack a{color:#ff6b81;text-decoration:none}.am-stack a:hover{text-decoration:underline}",
      "@media (max-width:720px){.am-stats{grid-template-columns:1fr 1fr}.am-flow{flex-direction:column;gap:14px}",
      "  .am-step{flex-direction:row;align-items:center}.am-arrow{display:none}}",
      "@media (prefers-reduced-motion: reduce){.am-sic,.am-arrow{animation:none!important}}",

      /* ============ CONTACT / MAIL ============ */
      ".ct-root{background:#1a1a1e;color:#F2F0F5;flex-direction:column}",
      ".ct-toolbar{display:flex;align-items:center;gap:6px;padding:9px 16px;border-bottom:1px solid #000;background:#232329}",
      ".ct-tb{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#b7b3bf}",
      ".ct-tb .mw-ic{width:16px;height:16px}",
      ".ct-tb.send{background:linear-gradient(180deg,#5c9dff,#3B82F6);color:#fff;width:auto;padding:0 14px;gap:7px;font-size:13px;font-weight:700;text-decoration:none;border:0;cursor:pointer;font-family:inherit;height:30px}",
      ".ct-tb.send:disabled{opacity:.55;cursor:default}",
      ".ct-in{flex:1;min-width:0;background:none;border:0;outline:none;color:#f2f0f5;font:inherit;font-size:15px}",
      ".ct-in::placeholder{color:#6b6570}",
      ".ct-msg{width:100%;box-sizing:border-box;min-height:120px;flex:1 1 auto;resize:none;background:none;border:0;outline:none;",
      "  color:#e6e3ea;font:inherit;font-size:15px;line-height:1.6;padding:18px 24px;display:block}",
      ".ct-msg::placeholder{color:#6b6570}",
      ".ct-status{padding:4px 24px 0;font-size:13px;min-height:20px;color:#8a8590}",
      ".ct-status.ok{color:#49c46b}.ct-status.err{color:#ff6b81}",
      ".ct-tb.send .mw-ic{width:14px;height:14px}",
      ".ct-tb.send:hover{filter:brightness(1.05)}",
      ".ct-tb.plain:hover{background:#31313a;color:#fff}",
      ".ct-sp{flex:1}",
      ".ct-field{display:flex;gap:14px;align-items:baseline;padding:11px 24px;border-bottom:1px solid #26262b}",
      ".ct-field .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6570;width:70px;flex:none}",
      ".ct-field .v{font-size:15px}.ct-field .v a{color:#3B82F6;text-decoration:none}.ct-field .v a:hover{text-decoration:underline}",
      ".ct-body{padding:20px 24px;font-size:15px;line-height:1.65;color:#cfccd4;max-width:60ch}.ct-body p{margin:0 0 14px}",
      ".ct-sign{color:#8a8590;font-size:13.5px}",
      ".ct-who{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;letter-spacing:.03em;color:#8a8590;padding:8px 24px 0}",
      ".ct-links{display:flex;gap:12px;padding:18px 24px 8px;flex-wrap:wrap}",
      ".ct-link{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:600;color:#f2f0f5;text-decoration:none;",
      "  padding:11px 18px;border-radius:11px;border:1px solid #34343c;background:#26262c;transition:transform .15s,background .15s,border-color .15s}",
      ".ct-link svg{opacity:.9}",
      ".ct-link:hover{background:#31313a;border-color:#3B82F6;transform:translateY(-1px)}",
      ".ct-link:focus-visible{outline:2px solid #3B82F6;outline-offset:3px}",
      ".ct-note{font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#57535d;padding:2px 24px 24px}",

      /* ================= MOBILE — native iOS-feel app screens (shared .m-*) ================= */
      ".m-screen{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;",
      "  background:#0d0c10;color:#f3f1f6;font-family:-apple-system,'SF Pro Text','SF Pro Display',system-ui,sans-serif;",
      "  padding:6px 18px calc(30px + env(safe-area-inset-bottom))}",
      ".m-hd{padding:6px 2px 14px}",
      ".m-title{font-size:28px;font-weight:700;letter-spacing:-.03em;margin:0;line-height:1.05}",
      ".m-sub{font-size:15px;color:#a7a3af;margin:5px 0 0;line-height:1.45}",
      ".m-sec-h{font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#8b8790;text-transform:uppercase;margin:24px 2px 11px}",
      ".m-photo{margin:0 0 18px}",
      ".m-photo img,.m-photo video{width:100%;display:block;border-radius:18px;background:#1a1a1e}",
      ".m-cap{font-size:14.5px;color:#d3d0d8;margin:9px 4px 0}",
      ".m-proj{--m-accent:#888}",
      ".m-card{background:#161519;border:1px solid #262630;border-radius:22px;padding:22px 20px;display:flex;flex-direction:column;gap:16px}",
      ".m-lead{font-size:16.5px;line-height:1.5;color:#e8e5ec;margin:0}",
      ".m-spec{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#8b8790;letter-spacing:.02em;line-height:1.5}",
      ".m-btn{display:flex;align-items:center;justify-content:center;gap:8px;min-height:54px;border-radius:15px;",
      "  font-size:16px;font-weight:600;text-decoration:none;border:1px solid #34343c;color:#f3f1f6;background:#26262c;transition:transform .12s}",
      ".m-btn-primary{background:var(--m-accent);color:#111;border-color:transparent}",
      ".m-btn:active{transform:scale(.98)}",
      ".m-astats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:2px 0 6px}",
      ".m-astat{background:#161519;border:1px solid #262630;border-radius:16px;padding:16px 16px 14px}",
      ".m-astat b{display:block;font-size:27px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-.02em}",
      ".m-astat span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#8b8790;margin-top:4px;display:block}",
      ".m-astat.hero b{color:#ff5870}.m-astat.zero b{color:#ff5870}",
      ".m-astep{display:flex;gap:13px;align-items:flex-start;background:#141317;border:1px solid #242329;border-radius:15px;padding:14px;margin-bottom:10px}",
      ".m-astep .ic{width:36px;height:36px;flex:none;border-radius:11px;display:grid;place-items:center;color:#ff6b81;background:#211416;border:1px solid #3a2429}",
      ".m-astep .ic svg{width:19px;height:19px}",
      ".m-astep b{font-size:15px;color:#f2e8ea}",
      ".m-astep p{font-size:13px;color:#a2878e;margin:3px 0 0;line-height:1.4}",
      ".m-astep em{font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#7a666c;display:block;margin-top:4px}",
      ".m-field{display:flex;flex-direction:column;gap:7px;padding:14px 0;border-bottom:1px solid #24242a}",
      ".m-field .k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6570}",
      ".m-field .v{font-size:16px;color:#f3f1f6}",
      ".m-input,.m-textarea{width:100%;box-sizing:border-box;background:#161519;border:1px solid #2a2a30;border-radius:12px;",
      "  color:#f3f1f6;font:inherit;font-size:16px;padding:14px;outline:none}",   /* 16px = no iOS focus-zoom */
      ".m-input:focus,.m-textarea:focus{border-color:#3B82F6}",
      ".m-textarea{min-height:150px;resize:vertical;line-height:1.5;margin-top:4px}",
      ".m-send{min-height:54px;border-radius:15px;border:0;background:#3B82F6;color:#fff;font-size:16px;font-weight:700;margin-top:18px;cursor:pointer;width:100%}",
      ".m-send:disabled{opacity:.5}",
      ".m-status{font-size:14px;min-height:20px;padding-top:11px;color:#8a8590}",
      ".m-status.ok{color:#49c46b}.m-status.err{color:#ff6b81}",
      ".m-links{display:flex;gap:12px;margin-top:20px}",
      ".m-links a{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;min-height:54px;border-radius:15px;",
      "  border:1px solid #34343c;background:#26262c;color:#f3f1f6;text-decoration:none;font-size:15px;font-weight:600}",
      ".m-links a svg{width:18px;height:18px}",
      ".m-note{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#57535d;margin-top:22px}",
      "@media (prefers-reduced-motion: reduce){.am-vid,.ph-tile img,.ph-tile video,.am-subscribe,.ct-tb.send{transition:none!important}}"
    ].join("\n");
    document.head.appendChild(st);
  }

  var BASE = "assets/personal/";

  /* ============================================================
     1 · PHOTOS  — the hero opener ("me")
     ============================================================ */
  // {file, alt, cap, album, video?, poster?, people?, place?}
  var SHOTS = [
    { f: "gf-and-me.jpg", alt: "Alec and his girlfriend by a river in autumn", cap: "My girlfriend and I", album: "People", people: true, mem: true },
    { f: "dogs.jpg", alt: "A terrier and a dachshund at a doorway", cap: "the welcoming committee", album: "Dogs", mem: true },
    { f: "photo-dachshund-field.jpg", alt: "A dachshund grinning in a golden field", cap: "he thinks he's a big dog", album: "Dogs" },
    { f: "dogs-run.mp4", alt: "Running across a field with a dog", cap: "zoomies", album: "Dogs", video: true, poster: "dogs-run-poster.jpg" },
    { f: "photo-dachshund-fence.jpg", alt: "A dachshund alert by a fence", cap: "on patrol", album: "Dogs" },
    { f: "climbing.mp4", alt: "Alec bouldering at an indoor gym", cap: "still bad at it, still hooked", album: "Climbing", video: true, poster: "climbing-poster.jpg", mem: true },
    { f: "photo-trestle.jpg", alt: "An old railroad trestle over a wooded valley", cap: "Photos on my Canon", album: "Photography", place: true, mem: true },
    { f: "photo-waterfall.jpg", alt: "A small waterfall in golden light", cap: "Photos on my Canon", album: "Photography", place: true, mem: true },
    { f: "photo-pines.jpg", alt: "Looking straight up tall pines", cap: "Photos on my Canon", album: "Photography", place: true },
    { f: "photo-lightpaint.jpg", alt: "Light-painting a shape in the dark", cap: "Photos on my Canon", album: "Photography" },
    { f: "photo-guitars.jpg", alt: "Alec playing acoustic in a guitar shop", cap: "where the music thing started", album: "Photography", mem: true },
    { f: "moto.jpg", alt: "Alec on a motorcycle", cap: "Just got my license this year", album: "Photography" },
    { f: "photo-duckling.jpg", alt: "Close-up of a duckling", cap: "Photos on my Canon", album: "Ducks", mem: true },
    { f: "duck-gravel.jpg", alt: "A duckling on gravel", cap: "Photos on my Canon", album: "Ducks" }
  ];
  var ALBUMS = [
    { id: "Dogs", icon: IC.dogs }, { id: "Climbing", icon: IC.climbing },
    { id: "Photography", icon: IC.camera }, { id: "Ducks", icon: IC.ducks }
  ];
  function countAlbum(a) { return SHOTS.filter(function (s) { return s.album === a; }).length; }
  function inView(s, view) {
    if (view === "Library") return true;
    if (view === "Memories") return !!s.mem;   // a curated highlight reel, not a dup of Library
    if (view === "People") return !!s.people;
    if (view === "Places") return !!s.place;
    return s.album === view;
  }

  AlecOS.registerApp({
    id: "photos",
    name: "Photos",
    accent: "#E1306C",
    dock: { svg: ICON_PHOTOS, tone: "#E1306C", label: "Photos", glyph: "P" },
    rect: { x: 140, y: 150, w: 1120, h: 820 },
    minSize: { w: 520, h: 420 },
    build: function (ctx) {
      // Ordered carousel: me → my dogs → my hobbies. One item at a time, description above.
      var ORDERK = ["personal", "dogs", "hobbies"];
      var SECT = { personal: "Me & my girlfriend", dogs: "My doggies", hobbies: "My hobbies" };
      function secOf(s) {
        if (["gf-and-me.jpg", "photo-guitars.jpg", "moto.jpg"].indexOf(s.f) >= 0) return "personal";
        if (s.album === "Dogs") return "dogs";
        return "hobbies";
      }

      /* ---- MOBILE: a TOUCH 3D coverflow — swipe/drag to spin, dots to jump ---- */
      if (AlecOS.isMobile()) {
        var MITEMS = [];
        ORDERK.forEach(function (k) {
          SHOTS.filter(function (s) { return secOf(s) === k; }).forEach(function (s) { MITEMS.push(s); });
        });
        var cfReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var cardsHTML = MITEMS.map(function (s, i) {
          // hero + first neighbours load with high priority; the rest still load (not lazy,
          // so no pop-in when you swipe) but don't compete with the first paint.
          var pr = i === 0 ? ' fetchpriority="high"' : (i <= 2 ? "" : ' fetchpriority="low"');
          var m = s.video
            ? '<video src="' + BASE + s.f + '" poster="' + BASE + esc(s.poster) + '" muted loop playsinline autoplay preload="auto"></video>'
            : '<img src="' + BASE + s.f + '" alt="' + esc(s.alt) + '" decoding="async"' + pr + '>';
          return '<div class="moscf-card">' + m + '</div>';
        }).join("");
        var page = document.createElement("div");
        page.className = "mos-page mos-fill moscf";
        page.innerHTML =
          '<div class="moscf-head"><div class="moscf-sec"></div><h2 class="moscf-cap"></h2></div>' +
          '<div class="moscf-stage">' + cardsHTML + '</div>' +
          '<div class="moscf-dots">' + MITEMS.map(function (_, i) {
            return '<button class="moscf-dot" type="button" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
          }).join("") + '</div>';
        ctx.addPage(page);

        var secEl = page.querySelector(".moscf-sec");
        var capEl = page.querySelector(".moscf-cap");
        var stageEl = page.querySelector(".moscf-stage");
        var cards = [].slice.call(stageEl.querySelectorAll(".moscf-card"));
        var dots = [].slice.call(page.querySelectorAll(".moscf-dot"));
        var pos = 0, center = -1, dragging = false, startX = 0, startPos = 0;
        var N = MITEMS.length;

        // wider spacing => clear air between the hero and its neighbours (no cramped overlap)
        function spacing() { return Math.min((stageEl.clientWidth || window.innerWidth) * 0.72, 300); }
        function place(p) {
          var sp = spacing();
          cards.forEach(function (card, i) {
            var off = i - p, abs = Math.abs(off), cl = Math.min(abs, 3);
            var offc = Math.max(-3, Math.min(3, off));
            var tx = off * sp, tz = -cl * 80, ry = -offc * 30, sc = Math.max(0.7, 1 - cl * 0.11);
            // F8: only the centered (±1) video is alive; off-screen ones stay paused (battery/
            // decoder). The centered one auto-plays with no tap, mirroring desktop layout().
            var vid = card.querySelector("video");
            if (vid) {
              if (abs <= 1.2) { if (vid.paused) vid.play().catch(function () {}); }
              else if (!vid.paused) { try { vid.pause(); } catch (e) {} }
            }
            // far cards don't paint/composite — only ~5 layers live at once (perf on phones)
            var far = abs > 2.6;
            card.classList.toggle("far", far);
            card.classList.toggle("near", !far);
            if (far) { return; }
            card.style.opacity = Math.max(0, 1 - abs * 0.34).toFixed(2);
            card.style.zIndex = String(100 - Math.round(abs * 10));
            card.style.transform = "translate(-50%,-50%) translateX(" + tx.toFixed(1) + "px) translateZ(" +
              tz.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
            card.classList.toggle("is-side", abs > 0.5);
            card.style.pointerEvents = abs < 0.5 ? "auto" : "none";
          });
          var c = Math.max(0, Math.min(N - 1, Math.round(p)));
          if (c !== center) { center = c; updateMeta(); }
        }
        function updateMeta() {
          var s = MITEMS[center];
          secEl.textContent = SECT[secOf(s)];
          capEl.textContent = s.cap;
          warm(center);   // decode the cards around wherever we've landed
          dots.forEach(function (d, di) { d.classList.toggle("on", di === center); });
        }
        // video play/pause is managed per-frame in place() (F8): only the centered video runs.
        function go(i) { pos = Math.max(0, Math.min(N - 1, i)); stageEl.classList.remove("is-dragging"); place(pos); }

        // rAF-throttle the drag: touchmove can fire 120×/s, and each place() loops every card —
        // updating at most once per frame keeps the spin buttery on a phone.
        var dragRaf = 0;
        stageEl.addEventListener("touchstart", function (e) {
          dragging = true; startX = e.touches[0].clientX; startPos = pos; stageEl.classList.add("is-dragging");
        }, { passive: true });
        stageEl.addEventListener("touchmove", function (e) {
          if (!dragging) return;
          var dx = e.touches[0].clientX - startX;
          pos = Math.max(-0.4, Math.min(N - 1 + 0.4, startPos - dx / spacing()));
          if (!dragRaf) dragRaf = requestAnimationFrame(function () { dragRaf = 0; place(pos); });
        }, { passive: true });
        stageEl.addEventListener("touchend", function () {
          dragging = false;
          var moved = pos - startPos, target;
          if (Math.abs(moved) > 0.18 && Math.abs(moved) < 0.5) target = startPos + (moved > 0 ? 1 : -1);
          else target = Math.round(pos);
          go(Math.max(0, Math.min(N - 1, target)));
        }, { passive: true });

        dots.forEach(function (d) { d.addEventListener("click", function () { go(+d.dataset.i); }); });

        place(0);   // initial paint (recomputed on open when the stage has real dimensions)
        // decode only the visible cards up front (not all 12 — bulk decode janks first paint);
        // the rest decode lazily as they come into view during a spin.
        function warm(idx) {
          for (var d = -2; d <= 2; d++) {
            var c = cards[idx + d]; if (!c) continue;
            var img = c.querySelector("img");
            if (img && img.decode && !img.dataset.warm) { img.dataset.warm = "1"; img.decode().catch(function () {}); }
          }
        }
        setTimeout(function () { warm(0); }, 40);
        // The view opens with a spring transform, so the stage may not have its real width on
        // the first frame — re-layout a few times after open so the hero lands dead-centered.
        function relayout() { pos = Math.round(pos); place(pos); }
        return {
          onFocus: function () {
            requestAnimationFrame(relayout);
            setTimeout(relayout, 80);
            setTimeout(relayout, 260);
          },
          onBlur: function () {
            cards.forEach(function (card) { var v = card.querySelector("video"); if (v) { try { v.pause(); } catch (e) {} } });
          }
        };
      }
      var ITEMS = [];
      ORDERK.forEach(function (k) {
        SHOTS.filter(function (s) { return secOf(s) === k; }).forEach(function (s) { ITEMS.push(s); });
      });

      var cardsHTML = ITEMS.map(function (s) {
        var m = s.video
          ? '<video src="' + BASE + s.f + '" poster="' + BASE + s.poster + '" muted loop playsinline></video>'
          : '<img src="' + BASE + s.f + '" alt="' + esc(s.alt) + '" loading="lazy">';
        return '<div class="pc-card">' + m + '</div>';
      }).join("");
      ctx.body.innerHTML =
        '<div class="mw-root pc-root">' +
          '<div class="pc-head"><div class="pc-sec"></div><h2 class="pc-desc"></h2></div>' +
          '<div class="pc-stage">' + cardsHTML + '</div>' +
          '<div class="pc-dots"></div>' +
        '</div>';

      ctx.win.classList.add("pc-win");   // strip the Mac window chrome — a gallery floating on the wallpaper
      var root = ctx.body.querySelector(".pc-root");
      var secEl = root.querySelector(".pc-sec");
      var descEl = root.querySelector(".pc-desc");
      var stageEl = root.querySelector(".pc-stage");
      var dotsEl = root.querySelector(".pc-dots");
      var cards = [].slice.call(stageEl.querySelectorAll(".pc-card"));
      var cur = 0, auto = 0, hovering = false;
      var reduceM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      dotsEl.innerHTML = ITEMS.map(function (_, i) {
        return '<button class="pc-dot" data-i="' + i + '" aria-label="Go to ' + (i + 1) + '"></button>';
      }).join("");
      var dots = [].slice.call(dotsEl.querySelectorAll(".pc-dot"));

      // arrange the cards in 3D around the current one (coverflow)
      function layout() {
        cards.forEach(function (card, i) {
          var off = i - cur, abs = Math.abs(off), sign = off < 0 ? -1 : 1;
          var vis = abs <= 3;
          card.style.opacity = vis ? (abs === 0 ? 1 : Math.max(0, 1 - abs * 0.28)).toFixed(2) : "0";
          card.style.zIndex = String(100 - abs);
          card.style.pointerEvents = abs === 0 ? "auto" : "none";
          card.classList.toggle("is-side", abs !== 0);
          var tx = off * 300;                        // slide out to the sides
          var tz = -abs * 240;                       // recede into depth
          var ry = -sign * Math.min(abs, 3) * 42;    // rotate to face center
          var sc = Math.max(0.55, 1 - abs * 0.14);
          card.style.transform = "translate(-50%,-50%) translateX(" + tx + "px) translateZ(" + tz + "px) rotateY(" + ry + "deg) scale(" + sc + ")";
        });
        var s = ITEMS[cur];
        secEl.textContent = SECT[secOf(s)];
        descEl.textContent = s.cap;
        if (!reduceM) { [secEl, descEl].forEach(function (el) { el.classList.remove("pc-swap"); void el.offsetWidth; el.classList.add("pc-swap"); }); }
        dots.forEach(function (d, di) { d.classList.toggle("on", di === cur); });
        // only the centered card's video plays
        cards.forEach(function (card, i) {
          var v = card.querySelector("video"); if (!v) return;
          if (i === cur) { try { v.play(); } catch (e) {} } else { try { v.pause(); } catch (e) {} }
        });
      }
      function go(i) { cur = Math.max(0, Math.min(ITEMS.length - 1, i)); layout(); }

      // SCROLL TO SPIN: wheel while hovering rotates the coverflow. At the ends we let the
      // wheel through so the page keeps scrolling to the next/previous app (never trapped).
      var accum = 0, cool = false;
      stageEl.addEventListener("wheel", function (e) {
        var dir = e.deltaY > 0 ? 1 : -1;
        if ((cur === ITEMS.length - 1 && dir > 0) || (cur === 0 && dir < 0)) return;  // release at ends
        e.preventDefault();
        if (cool) return;
        accum += e.deltaY;
        if (Math.abs(accum) > 26) {
          go(cur + (accum > 0 ? 1 : -1));
          accum = 0; cool = true; setTimeout(function () { cool = false; }, 340);
        }
      }, { passive: false });

      dots.forEach(function (d) { d.addEventListener("click", function () { go(+d.dataset.i); }); });
      stageEl.addEventListener("mouseenter", function () { hovering = true; stopAuto(); });
      stageEl.addEventListener("mouseleave", function () { hovering = false; startAuto(); });

      // gentle idle auto-spin when you're NOT hovering (pauses the moment you are)
      function startAuto() { if (reduceM || hovering) return; stopAuto(); auto = setInterval(function () {
        go(cur >= ITEMS.length - 1 ? 0 : cur + 1);
      }, 4200); }
      function stopAuto() { if (auto) { clearInterval(auto); auto = 0; } }

      layout();
      return {
        onFocus: function () { layout(); startAuto(); },
        onBlur: stopAuto,
        onClose: stopAuto
      };
    },
    tour: [
      { kicker: "01 — Who I am", title: "First, me.", body: "Figured I'd say hi first. I'm in State College, PA — making music, climbing, shooting photos. The rest of this is stuff I've built.", how: "Next: three builds · what they do · what they took →" }
    ]
  });

  /* ============================================================
     2 · AMINAL HOUSE  (YouTube)
     ============================================================ */
  var VIDS = [
    ["6_kjs4aNw_s", "Goldens are so adorable", "36K views", "0:14"],
    ["06zBHnTDSUQ", "Dachshunds are built different", "17K views", "0:11"],
    ["wqiywAoppdk", "Dachshund", "4.9K views", "0:09"],
    ["d6_QjHM7b6Q", "Bear, Raven, and Wolf", "4.8K views", "0:16"],
    ["0TQ_3SqfWJo", "German shepherds", "4.7K views", "0:12"],
    ["M3GPqLDo6t0", "Pugs", "4.1K views", "0:10"]
  ];
  AlecOS.registerApp({
    id: "aminal",
    name: "Aminal House",
    accent: "#ff0033",
    dock: { svg: ICON_YOUTUBE, tone: "#ff0033", label: "Aminal House", glyph: "A" },
    rect: { x: 1180, y: 1150, w: 900, h: 720 },
    minSize: { w: 460, h: 400 },
    build: function (ctx) {
      var SV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
      var IC_SCRAPE = SV + '<path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"/></svg>';
      var IC_VERIFY = SV + '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>';
      var IC_NARR = SV + '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
      var IC_PUB = SV + '<path d="M12 20V8m0 0 4 4m-4-4-4 4M5 4h14"/></svg>';
      var ARROW = SV + '<path d="M5 12h14m0 0-5-5m5 5-5 5"/></svg>';

      /* ---- MOBILE: single-column automation dashboard as one full-screen page ---- */
      if (AlecOS.isMobile()) {
        var mastep = function (svg, name, desc, note) {
          return '<div class="m-astep"><div class="ic">' + svg + '</div><div><b>' + name + '</b>' +
            '<p>' + desc + '</p><em>' + note + '</em></div></div>';
        };
        var pg = document.createElement("div");
        pg.className = "mos-page mos-pane m-aminal";
        pg.innerHTML =
          '<div class="mos-inner">' +
            '<div class="m-hd"><h1 class="m-title">It runs itself.</h1>' +
              '<p class="m-sub">@Aminal_House — a dog-shorts channel that posts on its own.</p></div>' +
            '<a class="m-btn m-btn-primary" style="--m-accent:#ff0033;color:#fff;margin-bottom:20px" href="https://www.youtube.com/@Aminal_House" target="_blank" rel="noopener">' +
              /* F6: monochrome WHITE YouTube glyph (outline + play) — the red-fill ICON_YOUTUBE
                 vanished on the red button and left a stray white triangle. */
              '<span style="width:22px;height:16px;display:inline-flex" aria-hidden="true">' +
                '<svg viewBox="0 0 24 17" width="22" height="16"><rect x="1" y="1" width="22" height="15" rx="4.6" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M9.6 5 15.2 8.5 9.6 12z" fill="#fff"/></svg>' +
              '</span>Watch on YouTube</a>' +
            '<div class="m-astats">' +
              '<div class="m-astat hero"><b>177,653</b><span>total views</span></div>' +
              '<div class="m-astat"><b>321</b><span>subscribers</span></div>' +
              '<div class="m-astat"><b>108</b><span>videos</span></div>' +
              '<div class="m-astat zero"><b>0</b><span>hands on deck</span></div>' +
            '</div>' +
            '<div class="m-sec-h">How every video gets made — nobody at the wheel</div>' +
            mastep(IC_SCRAPE, "Scrape", "Pulls fresh candidate dog clips from the web.", "Python · ~24/day") +
            mastep(IC_VERIFY, "Verify", "CLIP checks each clip is actually on-brief.", "OpenAI CLIP") +
            mastep(IC_NARR, "Narrate", "Writes a caption, voices it, renders 9:16.", "ElevenLabs · FFmpeg") +
            mastep(IC_PUB, "Publish", "Posts to four platforms, 4× a day.", "YT · TikTok · IG · FB") +
            '<div class="m-note">Built with Python · CLIP · ElevenLabs · FFmpeg</div>' +
          '</div>';
        ctx.addPage(pg);
        return {};
      }

      function step(i, svg, name, desc, note) {
        return '<div class="am-step"><div class="am-sic" style="--si:' + i + '">' + svg + '</div>' +
          '<b>' + name + '</b><p>' + desc + '</p><em>' + note + '</em></div>';
      }
      function stat(num, label, cls) {
        return '<div class="am-stat' + (cls ? " " + cls : "") + '">' +
          '<b data-to="' + num.replace(/[^0-9]/g, "") + '">' + num + '</b><span>' + label + '</span></div>';
      }

      ctx.body.innerHTML =
        '<div class="mw-root am-root">' +
          '<div class="mw-scroll"><div class="am-wrap">' +
            '<div class="am-hd mw-anim" style="--d:.04s">' +
              '<div class="am-avm"><img src="assets/aminal-logo.jpg" alt="Aminal House logo"></div>' +
              '<div class="am-id"><h1>Aminal House</h1>' +
                '<div class="h">@Aminal_House · a dog-shorts channel that runs itself</div></div>' +
              '<a class="am-yt" href="https://www.youtube.com/@Aminal_House" target="_blank" rel="noopener">' +
                '<span class="yt">' + ICON_YOUTUBE + '</span>Watch on YouTube</a>' +
            '</div>' +

            '<div class="am-stats mw-anim" style="--d:.1s">' +
              stat("177,653", "total views", "hero") +
              stat("321", "subscribers") +
              stat("108", "videos") +
              stat("0", "hands on deck", "zero") +
            '</div>' +

            '<div class="am-plbl mw-anim" style="--d:.16s">How every video gets made — with nobody at the wheel</div>' +
            '<div class="am-flow mw-anim" style="--d:.2s">' +
              step(0, IC_SCRAPE, "Scrape", "Pulls fresh candidate dog clips from the web.", "Python · ~24/day") +
              '<div class="am-arrow" style="--si:0">' + ARROW + '</div>' +
              step(1, IC_VERIFY, "Verify", "CLIP checks each clip is actually on-brief.", "OpenAI CLIP") +
              '<div class="am-arrow" style="--si:1">' + ARROW + '</div>' +
              step(2, IC_NARR, "Narrate", "Writes a caption, voices it, renders 9:16.", "ElevenLabs · FFmpeg") +
              '<div class="am-arrow" style="--si:2">' + ARROW + '</div>' +
              step(3, IC_PUB, "Publish", "Posts to four platforms, 4× a day.", "YT · TikTok · IG · FB") +
            '</div>' +
          '</div></div>' +
        '</div>';

      var rootEl = ctx.body.querySelector(".am-root");
      // the stat numbers count up on arrival (anime.js if present; otherwise they just show)
      var amReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var counted = false;
      function countUp() {
        if (counted || !rootEl) return; counted = true;
        var nums = rootEl.querySelectorAll(".am-stat b[data-to]");
        nums.forEach(function (b) {
          var to = +b.getAttribute("data-to"); if (!to) return;
          var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };
          if (amReduce || !(window.anime && window.anime.animate)) { b.textContent = fmt(to); return; }
          var obj = { v: 0 };
          window.anime.animate(obj, { v: to, duration: 1250, ease: "out(3)",
            onUpdate: function () { b.textContent = fmt(obj.v); } });
        });
      }
      return { onFocus: function () { playIn(rootEl); countUp(); } };
    },
    tour: [
      { kicker: "04 — Automation", title: "It runs itself.", body: "Aminal House, a YouTube channel that posts on its own — 108 videos, 177,653 views, and I've never uploaded one by hand. It scrapes, verifies, narrates and publishes, four times a day.", how: "Python · CLIP · ElevenLabs · FFmpeg  —  the skill: automation + systems design", focus: ".am-hero" },
      { title: "177,653 views. Zero hands.", body: "Scrape → CLIP verify → narrate → post ×4.", focus: ".am-stats" }
    ]
  });

  /* ============================================================
     3 · CONTACT / MAIL
     ============================================================ */
  AlecOS.registerApp({
    id: "contact",
    name: "Mail",
    accent: "#3B82F6",
    dock: { svg: ICON_MAIL, tone: "#3B82F6", label: "Mail", glyph: "M" },
    rect: { x: 200, y: 1180, w: 720, h: 560 },
    minSize: { w: 380, h: 340 },
    build: function (ctx) {
      // A real, working contact form: the visitor adds their From email + message and hits
      // Send — it posts to Formsubmit (no backend needed) which emails aleclewis@psu.edu.
      var ENDPOINT = "https://formsubmit.co/ajax/aleclewis@psu.edu";

      /* ---- MOBILE: full-width native form (same working Formsubmit send) ---- */
      if (AlecOS.isMobile()) {
        var GH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>';
        var LI = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.4h3.1V21H3.4V8.4Zm5.06 0h2.97v1.72h.04c.41-.78 1.42-1.6 2.92-1.6 3.13 0 3.71 2.06 3.71 4.73V21h-3.1v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94V21h-3.1V8.4Z"/></svg>';
        var pg = document.createElement("div");
        pg.className = "mos-page mos-pane m-contact";
        pg.innerHTML =
          '<div class="mos-inner">' +
            '<div class="m-hd"><h1 class="m-title">Say hi.</h1>' +
              '<p class="m-sub">A real inbox — I read and answer everything.</p></div>' +
            '<form id="mCtForm" novalidate>' +
              '<div class="m-field"><span class="k">To</span><span class="v">Alec Lewis &lt;aleclewis@psu.edu&gt;</span></div>' +
              '<div class="m-field"><span class="k">From</span><input class="m-input" id="mFrom" type="email" autocomplete="email" placeholder="your email"></div>' +
              '<div class="m-field"><span class="k">Message</span>' +
                '<textarea class="m-textarea" id="mMsg" placeholder="Write your message…">Saw your work and wanted to reach out. Would love to talk.</textarea></div>' +
              '<div class="m-status" id="mStatus" role="status"></div>' +
              '<button class="m-send" id="mSend" type="submit">Send</button>' +
              '<div class="m-links">' +
                '<a href="https://github.com/aleclewiss" target="_blank" rel="noopener">' + GH + 'GitHub</a>' +
                '<a href="https://www.linkedin.com/in/aleclewiss/" target="_blank" rel="noopener">' + LI + 'LinkedIn</a>' +
              '</div>' +
              '<div class="m-note">Sent from a website pretending to be a computer.</div>' +
            '</form>' +
          '</div>';
        ctx.addPage(pg);
        var mFrom = pg.querySelector("#mFrom"), mMsg = pg.querySelector("#mMsg");
        var mStatus = pg.querySelector("#mStatus"), mSend = pg.querySelector("#mSend");
        var mForm = pg.querySelector("#mCtForm"), mSending = false;
        function mSet(t, cls) { mStatus.textContent = t; mStatus.className = "m-status" + (cls ? " " + cls : ""); }
        function mSendFn() {
          if (mSending) return;
          var email = (mFrom.value || "").trim(), message = (mMsg.value || "").trim();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { mSet("Add a valid email in the From field.", "err"); mFrom.focus(); return; }
          if (!message) { mSet("Write a message first.", "err"); mMsg.focus(); return; }
          mSending = true; mSend.disabled = true; mSet("Sending…", "");
          fetch(ENDPOINT, {
            method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ email: email, message: message, _subject: "Portfolio site — new message", _template: "table", _captcha: "false" })
          }).then(function (r) { return r.json(); }).then(function (d) {
            if (d && (d.success === true || d.success === "true")) { mSet("Sent — thanks, I'll get back to you.", "ok"); mMsg.value = ""; mFrom.value = ""; }
            else { mSet("Couldn't send. Email me directly at aleclewis@psu.edu", "err"); }
          }).catch(function () { mSet("Couldn't send. Email me directly at aleclewis@psu.edu", "err"); })
            .then(function () { mSending = false; mSend.disabled = false; });
        }
        mForm.addEventListener("submit", function (e) { e.preventDefault(); mSendFn(); });
        return {};
      }

      function tb(ic, label) { return '<span class="ct-tb plain" title="' + label + '"><span class="mw-ic">' + ic + '</span></span>'; }
      ctx.body.innerHTML =
        '<div class="mw-root ct-root">' +
          '<div class="ct-toolbar">' +
            '<button class="ct-tb send" id="ctSend" type="button"><span class="mw-ic">' + IC.send + '</span>Send</button>' +
            tb(IC.archive, "Archive") + tb(IC.trash, "Delete") + tb(IC.reply, "Reply") + tb(IC.flag, "Flag") +
            '<span class="ct-sp"></span><span class="mw-mono" style="font-size:11px;color:#6b6570">NEW MESSAGE</span>' +
          '</div>' +
          '<form class="mw-col mw-scroll" id="ctForm" novalidate>' +
            '<div class="ct-field mw-anim" style="--d:.04s"><span class="k">To</span><span class="v">Alec Lewis &lt;aleclewis@psu.edu&gt;</span></div>' +
            '<div class="ct-field mw-anim" style="--d:.08s"><span class="k">From</span><input class="ct-in" id="ctFrom" type="email" autocomplete="email" placeholder="your email"></div>' +
            '<div class="ct-field mw-anim" style="--d:.1s"><span class="k">Subject</span><span class="v">Saw your work</span></div>' +
            '<textarea class="ct-msg mw-anim" id="ctMsg" style="--d:.12s" placeholder="Write your message…">Saw your work and wanted to reach out. Would love to talk.</textarea>' +
            '<div class="ct-status" id="ctStatus" role="status"></div>' +
            '<div class="ct-links mw-anim" style="--d:.16s">' +
              '<a class="ct-link" href="https://github.com/aleclewiss" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>' +
                'GitHub</a>' +
              '<a class="ct-link" href="https://www.linkedin.com/in/aleclewiss/" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.4h3.1V21H3.4V8.4Zm5.06 0h2.97v1.72h.04c.41-.78 1.42-1.6 2.92-1.6 3.13 0 3.71 2.06 3.71 4.73V21h-3.1v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94V21h-3.1V8.4Z"/></svg>' +
                'LinkedIn</a>' +
            '</div>' +
            '<div class="ct-note mw-anim" style="--d:.22s">Sent from a website pretending to be a computer.</div>' +
          '</form>' +
        '</div>';
      var rootEl = ctx.body.querySelector(".ct-root");
      var fromEl = rootEl.querySelector("#ctFrom");
      var msgEl = rootEl.querySelector("#ctMsg");
      var statusEl = rootEl.querySelector("#ctStatus");
      var sendBtn = rootEl.querySelector("#ctSend");
      var formEl = rootEl.querySelector("#ctForm");
      var sending = false;
      function setStatus(t, cls) { statusEl.textContent = t; statusEl.className = "ct-status" + (cls ? " " + cls : ""); }
      function send() {
        if (sending) return;
        var email = (fromEl.value || "").trim(), message = (msgEl.value || "").trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus("Add a valid email in the From field.", "err"); fromEl.focus(); return; }
        if (!message) { setStatus("Write a message first.", "err"); msgEl.focus(); return; }
        sending = true; sendBtn.disabled = true; setStatus("Sending…", "");
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email, message: message, _subject: "Portfolio site — new message", _template: "table", _captcha: "false" })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && (d.success === true || d.success === "true")) { setStatus("Sent — thanks, I'll get back to you.", "ok"); msgEl.value = ""; fromEl.value = ""; }
          else { setStatus("Couldn't send. Email me directly at aleclewis@psu.edu", "err"); }
        }).catch(function () { setStatus("Couldn't send. Email me directly at aleclewis@psu.edu", "err"); })
          .then(function () { sending = false; sendBtn.disabled = false; });
      }
      sendBtn.addEventListener("click", send);
      formEl.addEventListener("submit", function (e) { e.preventDefault(); send(); });
      return { onFocus: function () { playIn(rootEl); } };
    },
    tour: [
      { kicker: "05 — What's next", title: "Let's build something.", body: "That's the tour: the person, then machine learning, generative audio, and automation. Same guy built all of it — and answers every message. Music software, a hard problem, or just to talk shop." }
    ]
  });
})();
