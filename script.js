document.documentElement.classList.add("js");

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window) {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { obs.observe(el); });
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

// YouTube facade — also unlocks audio for the mix later.
var facade = document.querySelector(".player-facade");
if (facade) {
  facade.addEventListener("click", function (ev) {
    ev.preventDefault();
    unlockAudio();
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/ifkNxi9HW00?autoplay=1";
    f.title = "Aminal House — Dachshunds are built different";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    var shell = document.createElement("div");
    shell.className = "cinema-screen is-playing";
    shell.appendChild(f);
    facade.replaceWith(shell);
  }, { once: true });
}

var filmstrip = document.querySelector(".filmstrip");
if (filmstrip && !reduceMotion) {
  var dragging = false;
  var startX = 0;
  var startScroll = 0;
  filmstrip.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") return;
    dragging = true;
    startX = e.clientX;
    startScroll = filmstrip.scrollLeft;
    filmstrip.setPointerCapture(e.pointerId);
  });
  filmstrip.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    filmstrip.scrollLeft = startScroll - (e.clientX - startX);
  });
  var endDrag = function () { dragging = false; };
  filmstrip.addEventListener("pointerup", endDrag);
  filmstrip.addEventListener("pointercancel", endDrag);
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

var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
