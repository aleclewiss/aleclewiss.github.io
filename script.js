document.documentElement.classList.add("js");

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hero reveals fire on load so the first viewport reads as one entrance.
var heroReveals = document.querySelectorAll(".hero .reveal");
if (reduceMotion) {
  heroReveals.forEach(function (el) { el.classList.add("visible"); });
} else {
  requestAnimationFrame(function () {
    heroReveals.forEach(function (el) { el.classList.add("visible"); });
  });
}

if ("IntersectionObserver" in window) {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (el.closest(".hero")) return; // already handled above
    obs.observe(el);
  });
} else {
  document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
}

// --- Mix video: play with sound on scroll (after any user gesture unlocks audio) ---
var audioUnlocked = false;
var mixStarted = false;
var mixInView = false;
var devVideo = document.querySelector(".dev-display");
var mixPlay = document.querySelector(".mix-play");
var mixHint = document.getElementById("mix-hint");

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Warm up a silent context so later unmuted play is allowed.
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      var ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
    }
  } catch (err) {}
  if (mixInView && !mixStarted) tryStartMix();
}

function tryStartMix() {
  if (!devVideo || mixStarted || reduceMotion) return;
  devVideo.muted = false;
  var p = devVideo.play();
  if (p && typeof p.then === "function") {
    p.then(function () {
      mixStarted = true;
      if (mixPlay) mixPlay.hidden = true;
      if (mixHint) {
        mixHint.textContent = "Playing with sound.";
      }
    }).catch(function () {
      // Browser still blocked unmuted autoplay — show tap fallback.
      if (mixPlay) mixPlay.hidden = false;
      if (mixHint) {
        mixHint.textContent = "Tap the video once for sound — browsers block autoplay until you interact.";
      }
    });
  }
}

["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
  window.addEventListener(evt, unlockAudio, { once: true, passive: true });
});

if (devVideo) {
  if (mixPlay) {
    mixPlay.addEventListener("click", function () {
      unlockAudio();
      mixStarted = false;
      tryStartMix();
    });
  }
  devVideo.addEventListener("play", function () {
    if (!devVideo.muted && mixPlay) mixPlay.hidden = true;
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        mixInView = true;
        tryStartMix();
      });
    }, { threshold: 0.45 }).observe(devVideo);
  }
}

// --- Aminal inline player + video gallery (stays on the page) ---
var cinemaScreen = document.querySelector(".cinema-screen");
var cinemaFrame = cinemaScreen ? cinemaScreen.querySelector("iframe") : null;
var nowTitle = document.querySelector(".cinema-title");
var nowSub = document.querySelector(".cinema-sub");
var vids = document.querySelectorAll(".vid");

function ytEmbed(id, autoplay) {
  return "https://www.youtube-nocookie.com/embed/" + id +
    "?rel=0&modestbranding=1&playsinline=1" + (autoplay ? "&autoplay=1" : "");
}

function playInScreen(id, title, meta, autoplay) {
  if (!cinemaScreen || !id) return;
  unlockAudio();
  if (!cinemaFrame) {
    cinemaFrame = document.createElement("iframe");
    cinemaFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    cinemaFrame.allowFullscreen = true;
    cinemaFrame.referrerPolicy = "strict-origin-when-cross-origin";
    cinemaScreen.appendChild(cinemaFrame);
  }
  cinemaFrame.src = ytEmbed(id, !!autoplay);
  cinemaFrame.title = title || "Aminal House short";
  cinemaScreen.dataset.yt = id;
  cinemaScreen.classList.add("is-playing");
  if (nowTitle && title) nowTitle.textContent = title;
  if (nowSub && meta) nowSub.textContent = meta + (autoplay ? " · now playing" : " · tap a thumbnail to switch");
}

vids.forEach(function (btn) {
  btn.addEventListener("click", function () {
    vids.forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    if (cinemaScreen) {
      cinemaScreen.dataset.yt = btn.dataset.yt;
      cinemaScreen.dataset.title = btn.dataset.title;
      cinemaScreen.dataset.meta = btn.dataset.meta;
      cinemaScreen.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    playInScreen(btn.dataset.yt, btn.dataset.title, btn.dataset.meta, true);
  });
});

// --- Stat count-up when the numbers scroll into view ---
var statsGrid = document.querySelector("[data-countup]");
function animateCount(el) {
  var to = parseInt(el.dataset.to, 10) || 0;
  var prefix = el.dataset.prefix || "";
  var done = function () { el.textContent = prefix + to.toLocaleString(); };
  if (reduceMotion) { done(); return; }
  var start = null;
  var dur = 1400;
  function step(ts) {
    if (start === null) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(to * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else done();
  }
  requestAnimationFrame(step);
}
if (statsGrid && "IntersectionObserver" in window) {
  var counted = false;
  new IntersectionObserver(function (entries, ob) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !counted) {
        counted = true;
        statsGrid.querySelectorAll(".stat-num").forEach(animateCount);
        ob.disconnect();
      }
    });
  }, { threshold: 0.4 }).observe(statsGrid);
} else if (statsGrid) {
  statsGrid.querySelectorAll(".stat-num").forEach(function (el) {
    el.textContent = (el.dataset.prefix || "") + (parseInt(el.dataset.to, 10) || 0).toLocaleString();
  });
}

var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
if (navLinks.length && "IntersectionObserver" in window) {
  var byId = {};
  navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var link = byId[e.target.id];
      navLinks.forEach(function (a) { a.classList.remove("active"); });
      if (link) link.classList.add("active");
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

// --- Freak-Quencies demo: auto-fit the iframe to its content (same-origin) ---
var freakFrame = document.getElementById("freak-frame");
if (freakFrame) {
  var fitFreak = function () {
    try {
      var doc = freakFrame.contentWindow && freakFrame.contentWindow.document;
      if (!doc || !doc.body) return;
      var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      if (h > 0) freakFrame.style.height = h + "px";
    } catch (err) {
      // cross-origin or not ready — keep the CSS fallback height
    }
  };
  freakFrame.addEventListener("load", function () {
    fitFreak();
    // the demo lays out a canvas after load; re-measure a couple of times
    setTimeout(fitFreak, 250);
    setTimeout(fitFreak, 800);
  });
  var freakResizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(freakResizeTimer);
    freakResizeTimer = setTimeout(fitFreak, 150);
  });
}

var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
