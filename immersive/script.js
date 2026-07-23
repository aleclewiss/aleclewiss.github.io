/* Immersive slice: eased smooth-scroll + scroll-driven scene crossfade.
   Motion is entirely scroll-driven (user-paced). Falls back to native
   scrolling on touch devices and when reduced-motion is requested. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var smooth = fine && !reduce;

  var scroll = document.getElementById("scroll");
  var scenes = [].slice.call(document.querySelectorAll(".scene"));
  var layers = [].slice.call(document.querySelectorAll(".layer"));
  var idxEl = document.getElementById("idx");

  var vh = window.innerHeight;
  var current = 0;
  var activeIdx = -1;

  function setHeights() {
    vh = window.innerHeight;
    if (smooth) {
      document.body.style.height = scroll.scrollHeight + "px";
    } else {
      document.body.style.height = "";
    }
  }

  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    for (var l = 0; l < layers.length; l++) layers[l].classList.toggle("is-active", l === i);
    for (var s = 0; s < scenes.length; s++) scenes[s].classList.toggle("is-active", s === i);
    if (idxEl) idxEl.textContent = ("0" + (i + 1)).slice(-2);
  }

  function render() {
    var sy = window.scrollY || window.pageYOffset || 0;
    if (smooth) {
      current += (sy - current) * 0.09;
      if (Math.abs(sy - current) < 0.4) current = sy;
      scroll.style.transform = "translate3d(0," + (-current).toFixed(2) + "px,0)";
    } else {
      current = sy;
    }

    var i = Math.round(current / vh);
    if (i < 0) i = 0;
    if (i > scenes.length - 1) i = scenes.length - 1;
    setActive(i);

    // subtle scale drift on the active photo/video → depth without spin
    var prog = (current - i * vh) / vh;
    if (prog > 0.5) prog = 0.5; else if (prog < -0.5) prog = -0.5;
    var active = layers[i];
    if (active) {
      var media = active.querySelector("img, video");
      if (media) media.style.setProperty("--z", (1.06 + prog * 0.06).toFixed(3));
    }
    requestAnimationFrame(render);
  }

  if (smooth) {
    document.documentElement.classList.add("js-smooth");
    document.documentElement.style.scrollBehavior = "auto";
  }

  // HUD name → back to top (works with the fixed/translated wrapper)
  var name = document.querySelector(".hud-name");
  if (name) name.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  window.addEventListener("resize", setHeights);
  window.addEventListener("load", setHeights);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeights);

  setHeights();
  setActive(0);
  requestAnimationFrame(render);
})();
