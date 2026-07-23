/* AlecOS — window manager (SHELL) · PRESENTATION v3 --------------------------
   macOS "Spaces": exactly ONE app is on screen at a time, presented large and
   centered on the real aurora wallpaper. Scrolling drives a BUTTERY horizontal
   Spaces-swipe between apps in order photos → freak → backline → aminal → contact
   (outgoing slides+scales+fades out, incoming slides+scales in — the transform is
   lerped toward the scroll position so mid-scroll stays smooth). Menu bar + dock
   are viewport-fixed like a real OS. Boot = a photo of a monitor you zoom through.
   Reduced-motion snaps between apps; mobile stacks them for native scroll.
   window.AlecOS is defined immediately; boot() runs last. */
(function () {
  "use strict";

  var ORDER = ["photos", "freak", "backline", "aminal", "contact"];
  var MENUS = { hello: "File Edit Font Note Window Help", photos: "File Edit Image View Window Help",
                freak: "File Edit Create View Options Help",
                backline: "File Edit Song Generate Window Help", aminal: "History Bookmarks Profiles Tab Window",
                contact: "File Edit View Mailbox Message Format" };
  // per-app presentation size (design px, centered on the wallpaper, scaled to fit)
  var SIZES = { hello: { w: 500, h: 400 }, photos: { w: 1460, h: 680 }, freak: { w: 1280, h: 760 },
                backline: { w: 960, h: 660 }, aminal: { w: 1300, h: 700 }, contact: { w: 980, h: 580 } };

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = matchMedia("(max-width: 860px)").matches || (matchMedia("(pointer: coarse)").matches && innerWidth < 1024);

  var apps = [], byId = {}, listeners = {}, live = [];   // live = registered ids in ORDER
  var root, menubar, stage, dockEl, captionEl, hintEl, progEl, bootEl, trackEl, appLabel, menuWordsEl, clockEl;
  var scrollPos = 0, aimPos = 0, activeId = null, raf = 0, entered = false;
  var UPP = 0.6;   // viewport-heights of scroll per app step (kept short so it's not a long scroll)

  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); }
  function emit(ev, d) { (listeners[ev] || []).forEach(function (fn) { try { fn(d); } catch (e) {} }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ================= PUBLIC API (unchanged surface) ================= */
  var AlecOS = window.AlecOS = {
    registerApp: function (spec) { if (spec && spec.id) apps.push(spec); return AlecOS; },
    open: function (id) { goTo(id); },
    focus: function (id) { setActive(id); },
    close: function () {},                       // one-at-a-time: apps stay in the deck
    goTo: function (id) { goTo(id); },
    on: function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return AlecOS; },
    boot: boot,
    isMobile: function () { return mobile; }
  };

  /* ================= ICONS (menu-bar system glyphs, SVG — no emoji) ===== */
  var ICON = {
    apple: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M16.36 12.9c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3-.79-1.54.02-2.96.9-3.75 2.28-1.6 2.78-.41 6.89 1.15 9.15.76 1.1 1.67 2.34 2.86 2.29 1.15-.05 1.58-.74 2.97-.74 1.39 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.78-2.23.88-1.28 1.24-2.52 1.26-2.58-.03-.01-2.42-.93-2.45-3.69zM14.13 6.18c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.69-1.11 1.79-.97 2.85 1.02.08 2.07-.52 2.71-1.3z"/></svg>',
    battery: '<svg viewBox="0 0 30 14" width="26" height="13" aria-hidden="true"><rect x="1" y="2" width="24" height="10" rx="3" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.2"/><rect x="2.6" y="3.6" width="17" height="6.8" rx="1.6" fill="currentColor"/><rect x="26.4" y="5" width="2.2" height="4" rx="1" fill="currentColor" fill-opacity=".55"/></svg>',
    wifi: '<svg viewBox="0 0 20 15" width="18" height="14" aria-hidden="true"><path fill="currentColor" d="M10 12.2a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2zM10 6.1c1.9 0 3.7.7 5 2l1.7-1.8A9.4 9.4 0 0010 5.6 9.4 9.4 0 003.3 6.3L5 8.1c1.3-1.3 3.1-2 5-2zM10 1.5c3.1 0 6 1.2 8.2 3.3L20 3A13 13 0 0010 .9 13 13 0 000 3l1.8 1.8A11.5 11.5 0 0110 1.5z"/></svg>',
    control: '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="3" y="6" width="18" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.3"/><circle cx="9" cy="8.5" r="1.7" fill="currentColor"/><rect x="3" y="14" width="18" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.3"/><circle cx="15" cy="16.5" r="1.7" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 22 22" width="16" height="16" aria-hidden="true"><circle cx="9.5" cy="9.5" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="14" y1="14" x2="19" y2="19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  /* ================= BOOT ================= */
  function boot() {
    root = document.getElementById("alecos") || document.body;
    root.className = "aos-root" + (reduce ? " no-anim" : "") + (mobile ? " is-mobile" : "");
    apps.forEach(function (s) { byId[s.id] = { spec: s, built: false, hooks: {} }; });
    live = ORDER.filter(function (id) { return byId[id]; });

    buildDesktop();
    buildAllWindows();
    buildDock();
    if (mobile) { buildMobile(); }          // iPhone-style home screen instead of the desktop
    else { buildTrack(); buildBoot(); }

    on(window, "resize", function () {
      mobile = matchMedia("(max-width: 860px)").matches || (matchMedia("(pointer: coarse)").matches && innerWidth < 1024);
      root.classList.toggle("is-mobile", mobile);
      buildTrack(); layoutAll(); if (!mobile) render(true);
    });
    on(window, "scroll", onScroll, { passive: true });
    // a live wheel/touch always wins over a running snap → scrolling never feels sticky
    on(window, "wheel", function () { if (entered) cancelSnap(); }, { passive: true });
    on(window, "touchmove", function () { if (entered) cancelSnap(); }, { passive: true });
    on(window, "keydown", onKey);
    startClock();
    layoutAll();
    if (!reduce && !mobile) raf = requestAnimationFrame(loop);
  }

  function buildBoot() {
    // A clean Mac-style startup: near-black screen, Apple logo, the name in big SF Pro,
    // a boot progress bar that fills, then "scroll to wake". Waking fades + zooms into the desktop.
    bootEl = el("div", "aos-boot");
    bootEl.innerHTML =
      '<div class="boot-stage">' +
        '<div class="boot-logo">' + ICON.apple + '</div>' +
        '<h1 class="boot-h1">Alec Lewis</h1>' +
        '<div class="boot-sub">Portfolio made by Alec</div>' +
        '<div class="boot-bar"><i></i></div>' +
        '<button class="boot-hint" type="button" aria-label="Enter">' +
          '<span>' + (mobile ? "tap to wake" : "scroll to wake") + '</span>' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>';
    root.appendChild(bootEl);
    var done = false;
    function enter() {
      if (done) return; done = true; entered = true;
      bootEl.classList.add("gone");
      root.classList.add("live");
      setActive(live[0]);           // land on Photos, in focus
      render(true);
      // curtain-up: wallpaper → menu bar → stage settles → dock rises → icons pop (last)
      setTimeout(revealDock, 520);
      setTimeout(function () { if (bootEl) bootEl.remove(); }, 1300);
    }
    on(bootEl, "click", enter);
    on(window, "wheel", function w() { enter(); window.removeEventListener("wheel", w); }, { passive: true, once: true });
    on(window, "touchmove", function t() { enter(); }, { passive: true, once: true });
    // reduced-motion resolves fast; otherwise hold on the boot a beat longer so it reads
    // as intentional, but still auto-wake so no one is ever stranded on the monitor.
    setTimeout(enter, reduce ? 350 : 4200);
  }

  /* ================= DESKTOP CHROME ================= */
  function buildDesktop() {
    root.appendChild(el("div", "aos-wall"));

    menubar = el("div", "aos-menubar");
    menubar.innerHTML =
      '<span class="mb-left">' +
        '<span class="mb-apple">' + ICON.apple + '</span>' +
        '<span class="mb-app" id="mbApp">Finder</span>' +
        '<span class="mb-menus" id="mbMenus">File Edit View Window Help</span>' +
      '</span>' +
      '<span class="mb-right">' +
        '<span class="mb-ico">' + ICON.control + '</span>' +
        '<span class="mb-ico">' + ICON.battery + '</span>' +
        '<span class="mb-ico">' + ICON.wifi + '</span>' +
        '<span class="mb-ico">' + ICON.search + '</span>' +
        '<span class="mb-clock" id="mbClock">--:--</span>' +
      '</span>';
    root.appendChild(menubar);
    appLabel = menubar.querySelector("#mbApp");
    menuWordsEl = menubar.querySelector("#mbMenus");
    clockEl = menubar.querySelector("#mbClock");

    // the stage holds every app-space; only one is visually front at a time.
    stage = el("div", "aos-stage"); stage.id = "aosStage";
    root.appendChild(stage);

    dockEl = el("div", "aos-dock"); root.appendChild(dockEl);

    captionEl = el("div", "aos-caption");
    captionEl.innerHTML = '<span class="cap-k"></span><h2></h2><p></p><div class="cap-how"></div>';
    root.appendChild(captionEl);

    hintEl = el("div", "aos-hint", '<span class="wheel"><span></span></span>scroll to explore');
    root.appendChild(hintEl);

    progEl = el("div", "aos-progress"); progEl.innerHTML = '<i></i>'; root.appendChild(progEl);
  }

  function startClock() {
    function t() {
      var d = new Date(), h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? "PM" : "AM", hh = h % 12 || 12;
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      if (clockEl) clockEl.textContent = days[d.getDay()] + "  " + hh + ":" + (m < 10 ? "0" : "") + m + " " + ap;
      if (mosTimeEl) mosTimeEl.textContent = hh + ":" + (m < 10 ? "0" : "") + m;   // iOS status-bar time
    }
    t(); setInterval(t, 20000);
  }

  /* ================= DOCK ================= */
  function buildDock() {
    live.forEach(function (id) {
      var st = byId[id]; var d = st.spec.dock || {};
      var it = el("button", "aos-dock-item"); it.dataset.id = id;
      it.setAttribute("aria-label", (d.label || st.spec.name));
      it.innerHTML = '<span class="tile" style="--tone:' + (d.tone || st.spec.accent || "#888") + '">' + (d.svg || "") + '</span>' +
                     '<span class="run"></span><span class="tip">' + (d.label || st.spec.name) + '</span>';
      on(it, "click", function () {
        it.classList.remove("launch"); void it.offsetWidth; it.classList.add("launch");
        goTo(id);
      });
      dockEl.appendChild(it); st.dockEl = it;
    });
  }

  /* ================= MOBILE (iPhone Springboard + full-screen apps) =================
     Phones get a real iOS-style home screen: the aurora wallpaper, a greeting, and a
     grid of large rounded app icons (built from each app's dock.svg + label). Tapping
     an icon opens that app FULL-SCREEN with an iOS scale/spring from the icon; a slim
     top bar carries a back chevron + the app title, and the content scrolls with
     momentum. The back chevron or the home indicator (tap / swipe-up) returns to the
     Springboard with the reverse animation.

     Each app still renders its mobile content by calling ctx.addPage(el) once during
     build(); the shell mounts that element inside the app's own full-screen view (so
     state — coverflow position, a running demo iframe, form input — persists between
     visits). Demo iframes are lazy-loaded only when their app is first opened. */
  var mosTimeEl = null, mosHome = null, activeMobId = null;
  var MOS_SIGNAL = '<svg viewBox="0 0 18 12" aria-hidden="true"><g fill="currentColor">' +
    '<rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/>' +
    '<rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>';
  var MOS_BACK = '<svg viewBox="0 0 24 24" width="27" height="27" aria-hidden="true">' +
    '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildMobile() {
    entered = true;   // no boot screen on mobile — the home screen is the entry point

    // ---- status bar (always visible): live time + signal / wifi / battery ----
    var sb = el("div", "mos-statusbar");
    sb.innerHTML = '<span class="mos-time" id="mosTime"></span>' +
      '<span class="mos-sbr">' + MOS_SIGNAL + ICON.wifi + ICON.battery + '</span>';
    root.appendChild(sb);
    mosTimeEl = sb.querySelector("#mosTime");

    // ---- Springboard home: greeting + a grid of large rounded app icons ----
    var home = el("div", "mos-home"); mosHome = home;
    // dock SVGs may define gradients by id; the (hidden) dock already uses those ids, so
    // namespace the springboard copy's ids to avoid duplicate-id paint-server clashes.
    function uniqSvg(svg) {
      return String(svg).replace(/id="([^"]+)"/g, 'id="$1-m"').replace(/url\(#([^)]+)\)/g, "url(#$1-m)");
    }
    // distinct suffix for the dock copy so its gradient ids don't clash with the grid's -m ids
    function uniqSvg2(svg) {
      return String(svg).replace(/id="([^"]+)"/g, 'id="$1-d"').replace(/url\(#([^)]+)\)/g, "url(#$1-d)");
    }
    var grid = "";
    live.forEach(function (id) {
      var st = byId[id], d = st.spec.dock || {};
      grid += '<button class="mos-icon" type="button" data-id="' + id + '" aria-label="' + (d.label || st.spec.name) + '">' +
          '<span class="mos-icon-tile" style="--tone:' + (d.tone || st.spec.accent || "#888") + '">' + uniqSvg(d.svg || "") + '</span>' +
          '<span class="mos-icon-lbl">' + (d.label || st.spec.name) + '</span>' +
        '</button>';
    });
    home.innerHTML =
      '<div class="mos-greet"><span class="mos-greet-k">Portfolio</span><h1>Alec Lewis</h1></div>' +
      '<div class="mos-grid">' + grid + '</div>';
    root.appendChild(home);

    // ---- one full-screen view per app (content persists between visits) ----
    live.forEach(function (id) {
      var st = byId[id];
      var view = el("div", "mos-appview"); view.dataset.id = id;
      view.style.setProperty("--m-accent", st.spec.accent || "#888");
      var bar = el("div", "mos-appbar");
      bar.innerHTML = '<button class="mos-back" type="button" aria-label="Back to home">' + MOS_BACK + '</button>' +
        '<span class="mos-apptitle">' + st.spec.name + '</span>';
      var scroll = el("div", "mos-appscroll");
      var fill = false;
      (st.pages || []).forEach(function (pg) { scroll.appendChild(pg); if (pg.classList.contains("mos-fill")) fill = true; });
      if (fill) scroll.classList.add("is-fill");
      view.appendChild(bar); view.appendChild(scroll);
      root.appendChild(view);
      st.mobView = view; st.mobScroll = scroll;
      on(bar.querySelector(".mos-back"), "click", function () { closeMobileApp(); });
    });

    // ---- icon taps open their app ----
    [].slice.call(home.querySelectorAll(".mos-icon")).forEach(function (icon) {
      on(icon, "click", function () { openMobileApp(icon.dataset.id, icon); });
    });

    // ---- bottom dock: quick app-switch bar (visible while inside an app) ----
    var dock = el("div", "mos-dock");
    var dockHTML = "";
    live.forEach(function (id) {
      var st = byId[id], d = st.spec.dock || {};
      dockHTML += '<button class="mos-dock-i" type="button" data-id="' + id + '" aria-label="' + (d.label || st.spec.name) + '">' +
        '<span class="mos-dock-tile" style="--tone:' + (d.tone || st.spec.accent || "#888") + '">' + uniqSvg2(d.svg || "") + '</span></button>';
    });
    dock.innerHTML = dockHTML;
    root.appendChild(dock);
    [].slice.call(dock.querySelectorAll(".mos-dock-i")).forEach(function (b) {
      on(b, "click", function () { if (b.dataset.id !== activeMobId) openMobileApp(b.dataset.id, b); });
    });

    // ---- home indicator: tap or swipe-up returns to the Springboard ----
    var hb = el("div", "mos-homebar"); hb.innerHTML = '<i></i>';
    root.appendChild(hb);
    var hy = 0;
    on(hb, "click", function () { if (activeMobId) closeMobileApp(); });
    on(hb, "touchstart", function (e) { hy = e.touches[0].clientY; }, { passive: true });
    on(hb, "touchend", function (e) {
      if (activeMobId && (e.changedTouches[0].clientY - hy) < -18) closeMobileApp();
    }, { passive: true });

    root.classList.add("mos-ready");
  }

  // open an app full-screen; the iOS zoom springs from the tapped icon's center
  function openMobileApp(id, iconEl) {
    var st = byId[id]; if (!st || !st.mobView) return;
    if (activeMobId && activeMobId !== id) closeMobileApp();
    var view = st.mobView;
    if (iconEl && iconEl.getBoundingClientRect) {
      var r = iconEl.getBoundingClientRect();
      view.style.transformOrigin = Math.round(r.left + r.width / 2) + "px " + Math.round(r.top + r.height / 2) + "px";
    }
    activeMobId = id;
    if (st.mobScroll) st.mobScroll.scrollTop = 0;
    root.classList.add("mos-inapp");
    view.classList.add("is-open");
    var dk = root.querySelector(".mos-dock");
    if (dk) [].forEach.call(dk.querySelectorAll(".mos-dock-i"), function (b) { b.classList.toggle("on", b.dataset.id === id); });
    activateMobView(st, true);
    if (appLabel) appLabel.textContent = st.spec.name;
    emit("focus", id);
  }

  function closeMobileApp() {
    if (!activeMobId) return;
    var st = byId[activeMobId];
    if (st) { activateMobView(st, false); if (st.mobView) st.mobView.classList.remove("is-open"); }
    root.classList.remove("mos-inapp");
    activeMobId = null;
  }

  // on open: lazy-load demo iframes, fire the app's onFocus, resume video.
  // on close: fire onBlur and pause any video so nothing plays behind the home screen.
  function activateMobView(st, opening) {
    var view = st.mobView; if (!view) return;
    var vids = view.querySelectorAll("video"), i;
    if (opening) {
      var frames = view.querySelectorAll("iframe[data-src]");
      for (i = 0; i < frames.length; i++) {
        if (!frames[i].getAttribute("src")) frames[i].src = frames[i].getAttribute("data-src");
      }
      if (st.hooks && st.hooks.onFocus) { try { st.hooks.onFocus(); } catch (e) {} }
    } else {
      if (st.hooks && st.hooks.onBlur) { try { st.hooks.onBlur(); } catch (e) {} }
      for (i = 0; i < vids.length; i++) { try { vids[i].pause(); } catch (e) {} }
    }
  }
  function markDock() {
    live.forEach(function (id) { var st = byId[id]; if (st.dockEl) st.dockEl.classList.toggle("active", id === activeId); });
  }

  /* ---- anime.js flourishes (feature-detected; skipped if the lib isn't loaded) ---- */
  var dockReady = false;
  function revealDock() {
    if (reduce || !dockEl) { dockReady = true; return; }
    if (window.anime && window.anime.animate) {
      try {
        window.anime.animate(dockEl.querySelectorAll(".aos-dock-item .tile"), {
          translateY: [28, 0], scale: [0.45, 1], opacity: [0, 1],
          delay: window.anime.stagger(52, { start: 180 }),
          duration: 640, ease: "outElastic(1, .62)"
        });
      } catch (e) {}
    }
    setTimeout(function () { dockReady = true; }, 950);   // let the reveal finish before bounces
  }
  function bounceDock(elItem) {
    if (reduce || !dockReady || !elItem || !(window.anime && window.anime.animate)) return;
    var tile = elItem.querySelector(".tile"); if (!tile) return;
    try { window.anime.animate(tile, { translateY: [0, -13, 0], duration: 560, ease: "outElastic(1, .5)" }); }
    catch (e) {}
  }

  /* ================= WINDOWS ================= */
  function buildAllWindows() { apps.forEach(function (s) { buildWin(s.id); }); }

  function buildWin(id) {
    var st = byId[id]; if (!st || st.built) return; var spec = st.spec;
    st.size = SIZES[id] || { w: (spec.rect && spec.rect.w) || 900, h: (spec.rect && spec.rect.h) || 620 };

    var w = el("div", "aos-win"); w.dataset.id = id;
    w.style.setProperty("--accent", spec.accent || "var(--amber)");
    w.style.width = st.size.w + "px"; w.style.height = st.size.h + "px";

    var bar = el("div", "aos-titlebar");
    var lights = el("div", "aos-lights");
    ["close", "min", "zoom"].forEach(function (k) {
      var b = el("span", "aos-light " + k);
      b.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12">' +
        (k === "close" ? '<path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#4d0000" stroke-width="1.3" stroke-linecap="round"/>'
        : k === "min" ? '<path d="M3 6h6" stroke="#5a3d00" stroke-width="1.3" stroke-linecap="round"/>'
        : '<path d="M4 4h4v4" fill="none" stroke="#0b3d0b" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 4l-4 4" stroke="#0b3d0b" stroke-width="1.3"/>') + '</svg>';
      lights.appendChild(b);
    });
    bar.appendChild(lights);
    bar.appendChild(el("div", "aos-title", spec.name));
    bar.appendChild(el("div", "aos-titlebar-spacer"));

    var body = el("div", "aos-body aos-scroll");
    w.appendChild(bar); w.appendChild(body);
    stage.appendChild(w);
    st.el = w; st.body = body;

    var ctx = {
      body: body, win: w, accent: spec.accent,
      isMobile: mobile,
      // MOBILE hand-off: an app appends its full-viewport .mos-page slide(s) here; the
      // shell strings every app's pages into one horizontal swipe track (see buildMobile).
      addPage: function (elm) { (st.pages || (st.pages = [])).push(elm); return elm; },
      launchDemo: function (url, opts) { return makeDemo(url, opts, spec.accent); },
      open: AlecOS.open, focus: AlecOS.focus, close: AlecOS.close
    };
    try { st.hooks = spec.build(ctx) || {}; } catch (e) { st.hooks = {}; console.error("[AlecOS] build " + id, e); }
    st.built = true;
  }

  /* size + center each window-space to the viewport (scaled to fit under the menu bar) */
  function layoutAll() {
    var topInset = 25, pad = mobile ? 12 : 30, dockRoom = mobile ? 0 : 76;
    // hero band above each window — kept compact so the app windows get the space
    // band must be tall enough to hold the full chapter heading (kicker+title+body+bridge)
    // so the window's own content starts BELOW it — otherwise they collide on short screens.
    var headH = mobile ? 0 : Math.max(150, Math.min(174, Math.round(innerHeight * 0.185)));
    var DROP = mobile ? 0 : 66;                 // nudge the whole composition down a bit
    var headTop = topInset + 12 + DROP;
    // COMFORT: windows never fill the whole available area — leave breathing room so the
    // composition reads spacious, not "zoomed in", especially on laptop-sized screens.
    var COMFORT = 0.78;
    var availW = innerWidth - pad * 2, availH = innerHeight - topInset - headH - dockRoom - pad;
    live.forEach(function (id) {
      var st = byId[id]; if (!st.el) return;
      if (mobile) { st.el.style.transform = ""; return; }   // CSS handles mobile stacking
      var s = Math.min(1, availW / st.size.w, availH / st.size.h) * COMFORT;
      st.scale = s;
      // position: horizontally centered; TOP-aligned just below the heading band (not
      // vertically centered) so the content sits right under its heading — no big gap.
      // Any leftover space collects harmlessly toward the dock.
      st.cx = innerWidth / 2;
      var region = innerHeight - topInset - headH - dockRoom;
      var half = (st.size.h * s) / 2;
      var cy = topInset + headH + DROP + Math.min(region / 2, half + 6);
      // hard clamp: the window bottom must never reach the dock, no matter the DROP
      var maxBottom = innerHeight - dockRoom - 6;
      st.cy = Math.min(cy, maxBottom - half);
      st.el.style.left = (st.cx - st.size.w / 2) + "px";
      st.el.style.top = (st.cy - st.size.h / 2) + "px";
      // on-screen box of the SCALED window — heading aligns to its left edge
      st.boxLeft = st.cx - (st.size.w * s) / 2;
      st.boxTop  = st.cy - (st.size.h * s) / 2;
      st.boxW    = st.size.w * s;
      st.headTop = headTop;
    });
    if (activeId && byId[activeId]) positionCaption(byId[activeId]);
  }

  /* anchor the big hero heading in the band above the active window, aligned to its left edge */
  function positionCaption(st) {
    if (!captionEl || !st || st.boxLeft == null) return;
    var left = Math.max(28, Math.round(st.boxLeft));
    var w = Math.max(st.boxW || 640, 640);
    captionEl.style.left = left + "px";
    captionEl.style.right = "auto";
    captionEl.style.width = "min(" + Math.round(w) + "px, " + Math.round(innerWidth - left - 40) + "px)";
    // Sit the heading just ABOVE its window (lower on screen, visually tied to the window),
    // but never let it clip up behind the menu bar on short screens — clamp the top.
    captionEl.style.bottom = "auto";
    var gap = 38, h = captionEl.offsetHeight || 120;   // clear separation between heading block and window
    var top = Math.max(Math.round(st.headTop || 40), Math.round((st.boxTop || 300) - gap - h));
    captionEl.style.top = top + "px";
  }

  /* ================= SCROLL → APP INDEX ================= */
  function buildTrack() {
    if (!trackEl) { trackEl = el("div", "aos-track"); document.body.appendChild(trackEl); }
    if (mobile) { trackEl.style.height = "0px"; return; }
    // one viewport of lead-in room + UPP viewports per step between apps
    trackEl.style.height = Math.round(innerHeight * (1 + (live.length - 1) * UPP + 0.4)) + "px";
  }
  function scrollFloat() {
    // returns a float in [0, N-1] = position across the app deck
    var max = Math.max(1, trackEl.offsetHeight - innerHeight);
    var t = clamp((window.scrollY || window.pageYOffset || 0) / max, 0, 1);
    return t * (live.length - 1);
  }
  function goTo(id) {
    var idx = live.indexOf(id); if (idx < 0) return;
    if (!entered && bootEl) { bootEl.click(); }
    if (mobile) { openMobileApp(id); return; }
    var max = Math.max(1, trackEl.offsetHeight - innerHeight);
    var y = (idx / (live.length - 1)) * max;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    if (reduce) { scrollPos = aimPos = idx; render(true); }
  }

  /* ================= SPACES RENDER (buttery one-at-a-time) ================= */
  var SPREAD = 0.62;   // how far offscreen (in viewport widths) a neighbouring app sits

  function placeSpace(st, rel) {
    // rel = signed distance from the focused app (…-1 = prev, 0 = current, +1 = next…)
    if (!st.el) return;
    var a = clamp(Math.abs(rel), 0, 1.4);
    // horizontal slide: current at 0, neighbours pushed off by SPREAD·viewport
    var tx = rel * innerWidth * SPREAD;
    // depth: focused app full; leaving apps dip back + fade
    var scale = (st.scale || 1) * (1 - 0.09 * a);
    var op = a >= 1 ? 0 : (1 - a * a * 0.9);
    var win = st.el;
    // transform + opacity are compositor-cheap → write every frame
    win.style.transform = "translate3d(" + tx.toFixed(1) + "px,0,0) scale(" + scale.toFixed(4) + ")";
    win.style.opacity = op.toFixed(3);
    // the rest trigger style recalc / paint → only write when the value ACTUALLY changes
    // (during most frames these are stable; caching skips the redundant writes = less work).
    var z = 100 - Math.round(a * 50);
    if (z !== st._z) { win.style.zIndex = String(z); st._z = z; }
    var pe = a < 0.35 ? "auto" : "none";
    if (pe !== st._pe) { win.style.pointerEvents = pe; st._pe = pe; }
    var front = a < 0.5;
    if (front !== st._front) { win.classList.toggle("front", front); st._front = front; }
    // depth cue via GPU-cheap dim/desaturate (NO per-frame blur). Quantized + cached so it
    // only repaints on a real step change, not every sub-pixel frame.
    var filt = a < 0.02 ? "none"
      : "brightness(" + (1 - a * 0.2).toFixed(2) + ") saturate(" + (1 - a * 0.18).toFixed(2) + ")";
    if (filt !== st._filter) { win.style.filter = filt; st._filter = filt; }
  }

  function render(snap) {
    if (mobile || !live.length) return;
    var aim = clamp(scrollFloat(), 0, live.length - 1);
    aimPos = aim;
    if (snap) scrollPos = aim;
    else scrollPos += (aim - scrollPos) * 0.14;   // lerp → buttery, controllable mid-scroll
    if (Math.abs(aim - scrollPos) < 0.0005) scrollPos = aim;

    for (var i = 0; i < live.length; i++) placeSpace(byId[live[i]], i - scrollPos);

    var idx = clamp(Math.round(scrollPos), 0, live.length - 1);
    var id = live[idx];
    if (id && id !== activeId) setActive(id);

    // heading crossfades + drifts IN SYNC with the window swipe (content swaps at the
    // midpoint, while it's invisible — so there's no pop). Driven per-frame, not by CSS.
    if (captionEl && !reduce) {
      var frac = scrollPos - Math.round(scrollPos);         // (-0.5 … 0.5], 0 = settled on an app
      var d = Math.min(1, Math.abs(frac) / 0.5);            // 0 at center, 1 at the swap
      captionEl.style.opacity = Math.max(0, 1 - d * d * 1.05).toFixed(3);
      // ride with the window: same direction it slides, a parallax fraction of its travel
      var winTx = -frac * innerWidth * SPREAD;              // the window's own horizontal offset
      captionEl.style.transform = "translateX(" + (winTx * 0.5).toFixed(1) + "px)";
    }

    if (progEl) {
      var pw = Math.round((live.length > 1 ? scrollPos / (live.length - 1) : 0) * 1000) / 10;
      if (pw !== render._pw) { progEl.firstChild.style.width = pw + "%"; render._pw = pw; }
    }
    if (hintEl) {
      var hide = (window.scrollY || 0) > innerHeight * 0.25;
      if (hide !== render._hide) { hintEl.classList.toggle("hide", hide); render._hide = hide; }
    }
  }

  function setActive(id) {
    var st = byId[id]; if (!st || id === activeId) return;
    if (activeId && byId[activeId] && byId[activeId].hooks.onBlur) try { byId[activeId].hooks.onBlur(); } catch (e) {}
    activeId = id;
    if (appLabel) appLabel.textContent = st.spec.name;
    if (menuWordsEl) menuWordsEl.textContent = MENUS[id] || "File Edit View Window Help";
    if (progEl) progEl.style.setProperty("--accent", st.spec.accent || "var(--amber)");   // progress tints to chapter
    setCaption(st);
    markDock();
    bounceDock(st.dockEl);          // the newly-active app's dock icon bounces (very macOS)
    if (st.hooks.onFocus) try { st.hooks.onFocus(); } catch (e) {}
    autoLoadDemos(st.el);
    emit("focus", id);
  }

  var scrollPending = false, snapTimer = 0, snapRelease = 0, snapping = false, snapAnim = null;
  var lastScrollY = 0, scrollDir = 0, snapAnchor = 0;
  // any real user input cancels an in-progress snap instantly — you're never fighting it
  function cancelSnap() {
    if (snapAnim && snapAnim.stop) { try { snapAnim.stop(); } catch (e) {} }
    snapAnim = null; snapping = false; clearTimeout(snapRelease);
  }
  function onScroll() {
    scrollPending = true; kick(); if (reduce) render(true);
    if (mobile || snapping) return;                 // ignore programmatic scroll while snapping
    var y = window.scrollY || 0;
    if (y > lastScrollY + 1) scrollDir = 1; else if (y < lastScrollY - 1) scrollDir = -1;
    lastScrollY = y;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearest, 200);     // settles after you clearly stop
  }
  // Settle onto an app — but DIRECTIONALLY: commit to the one you're heading toward once
  // you've moved ~30% of the way, so a small nudge never yanks you back (that felt sticky).
  function snapToNearest() {
    if (mobile || snapping || !entered || !trackEl) return;
    var max = Math.max(1, trackEl.offsetHeight - innerHeight);
    var f = clamp(scrollFloat(), 0, live.length - 1);
    var base = Math.floor(f), frac = f - base, i;
    if (scrollDir > 0)      i = frac > 0.30 ? base + 1 : base;   // heading forward: commit early
    else if (scrollDir < 0) i = frac < 0.70 ? base : base + 1;   // heading back: commit early
    else                    i = Math.round(f);                   // no clear direction: nearest
    i = clamp(i, 0, live.length - 1);
    var target = Math.round((i / (live.length - 1)) * max);
    var from = window.scrollY || 0;
    if (Math.abs(from - target) < 3) return;                     // already locked on
    snapping = true;
    clearTimeout(snapRelease);
    // Motion (if loaded) springs the scroll onto the app with real physics — a natural,
    // weighted settle. Falls back to the browser's smooth scroll if Motion isn't present.
    if (!reduce && window.Motion && window.Motion.animate) {
      if (snapAnim && snapAnim.stop) { try { snapAnim.stop(); } catch (e) {} }
      snapAnim = window.Motion.animate(from, target, {
        type: "spring", stiffness: 120, damping: 24, restDelta: 0.5,   // softer, less grabby settle
        onUpdate: function (v) { window.scrollTo(0, v); },
        onComplete: function () { snapping = false; }
      });
      snapRelease = setTimeout(function () { snapping = false; }, 1100);   // safety release
    } else {
      window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      snapRelease = setTimeout(function () { snapping = false; }, 650);
    }
  }
  var idleFrames = 0;
  function loop(now) {
    if (scrollPending || Math.abs(aimPos - scrollPos) > 0.0004) {
      render(false); scrollPending = false; idleFrames = 0;
    } else if (++idleFrames > 40) {          // ~0.6s settled → stop spinning the rAF
      raf = 0; return;                        // (saves CPU/battery; woken by kick() on scroll)
    }
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && !reduce && !mobile) { idleFrames = 0; raf = requestAnimationFrame(loop); } }

  /* ---- keyboard: move through the app deck like Spaces (⌃→/⌃←, arrows, space) ---- */
  function stepApp(dir) {
    var i = clamp(Math.round(scrollPos || 0), 0, live.length - 1) + dir;
    i = clamp(i, 0, live.length - 1);
    goTo(live[i]);
  }
  function onKey(e) {
    if (!entered) { if (["ArrowDown","ArrowRight"," ","PageDown","Enter"].indexOf(e.key) >= 0) { if (bootEl) bootEl.click(); e.preventDefault(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ": stepApp(1); e.preventDefault(); break;
      case "ArrowLeft":  case "ArrowUp":   case "PageUp": stepApp(-1); e.preventDefault(); break;
      case "Home": goTo(live[0]); e.preventDefault(); break;
      case "End":  goTo(live[live.length - 1]); e.preventDefault(); break;
    }
  }

  function setCaption(st) {
    if (!captionEl) return;
    if (st.spec.hero === false) { captionEl.style.display = "none"; return; }  // e.g. the Stickies opener
    captionEl.style.display = "";
    var beat = (st.spec.tour && st.spec.tour[0]) || { title: st.spec.name, body: "" };
    captionEl.style.setProperty("--accent", st.spec.accent || "var(--amber)");
    // chapter kicker (story frame) if the beat defines one; else the app's dock label
    captionEl.querySelector(".cap-k").textContent = beat.kicker || (st.spec.dock && st.spec.dock.label ? st.spec.dock.label : st.spec.name);
    captionEl.querySelector("h2").textContent = beat.title || st.spec.name;
    captionEl.querySelector("p").textContent = beat.body || "";
    var howEl = captionEl.querySelector(".cap-how");
    howEl.textContent = beat.how || "";
    howEl.style.display = beat.how ? "" : "none";   // a compact "how it was built" line
    positionCaption(st);   // re-anchor to this app's window (content swaps while invisible → no jump)
    // when the rAF loop isn't driving opacity (reduced-motion / mobile), just show it
    if (reduce || mobile) { captionEl.style.opacity = "1"; captionEl.style.transform = "none"; }
  }

  /* ================= LIVE DEMO (auto-loads on focus; click-safe) ================= */
  var demos = [];
  function makeDemo(url, opts, accent) {
    opts = opts || {};
    var wrap = el("div", "aos-demo"); wrap.dataset.demo = url;
    if (accent) wrap.style.setProperty("--accent", accent);
    var loaded = false;
    function load() {
      if (loaded) return; loaded = true;
      var f = document.createElement("iframe");
      f.title = opts.label || "Interactive demo";
      f.setAttribute("scrolling", opts.scrolling || "auto");
      f.setAttribute("loading", "eager");
      f.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen");
      var sp = el("div", "aos-demo-spin", "loading the real thing…");
      wrap.textContent = ""; wrap.classList.add("loaded"); wrap.appendChild(f); wrap.appendChild(sp);
      on(f, "load", function () { sp.remove(); });
      f.src = url;
    }
    wrap._load = load; demos.push(wrap);
    var btn = el("button", "aos-demo-launch");
    btn.innerHTML = '<span class="aos-demo-play"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg></span>' +
      '<span class="aos-demo-txt"><b>' + (opts.label || "Launch the demo") + '</b><i>' + (opts.note || "runs live in your browser") + '</i></span>';
    on(btn, "click", function (e) { e.stopPropagation(); load(); });
    (opts.mount || wrap).appendChild(btn);
    return wrap;
  }
  function autoLoadDemos(winEl) {
    if (!winEl) return;
    var list = winEl.querySelectorAll ? winEl.querySelectorAll(".aos-demo") : [];
    for (var i = 0; i < list.length; i++) {
      (function (w) { setTimeout(function () { if (w._load) w._load(); }, 480); })(list[i]);
    }
  }

})();
