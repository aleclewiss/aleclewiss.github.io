/* AlecOS · app-hello.js — the personal opener.
   Not a real app window: a Stickies note pinned to the desktop, the first thing you
   meet when the machine wakes. It sets the tone — a person, not a product — before you
   ever reach the work. The hero heading is suppressed for this space (hero:false); the
   note IS the message. Copy is Alec's own voice; edit freely. */
(function () {
  "use strict";
  if (!window.AlecOS || typeof AlecOS.registerApp !== "function") return;

  // dock icon — a little yellow sticky with a curled corner
  var STICKY_ICON =
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path d="M12 10h40v32L42 52H12z" fill="#fbdf5e"/>' +
      '<path d="M42 52V42h10z" fill="#e6c23f"/>' +
      '<g stroke="#8a7320" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M20 22h24"/><path d="M20 30h24"/><path d="M20 38h14"/></g>' +
    '</svg>';

  function inject() {
    if (document.getElementById("hello-styles")) return;
    var css = [
      /* strip the mac window chrome — this space is a bare sticky on the wallpaper */
      ".aos-win.hello-win{background:transparent!important;box-shadow:none!important;",
      "  outline:none!important;border-radius:0!important;overflow:visible!important;}",
      ".aos-win.hello-win .aos-titlebar{display:none;}",
      ".aos-win.hello-win .aos-body{overflow:visible!important;background:transparent!important;}",

      ".hello-sticky{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;",
      "  padding:40px 42px 34px;transform:rotate(-1.7deg);border-radius:4px;color:#4a3f1c;",
      "  background:linear-gradient(158deg,#fdf08c 0%,#fbdf5e 62%,#f4d24a 100%);",
      "  box-shadow:0 30px 60px -20px rgba(0,0,0,.62),0 3px 0 rgba(0,0,0,.05),",
      "    inset 0 1px 0 rgba(255,255,255,.55),inset 0 -22px 40px -30px rgba(140,110,20,.6);",
      "  font-family:-apple-system,'SF Pro Text','Inter',system-ui,sans-serif;}",
      /* a real pushpin holding it to the desktop */
      ".hello-pin{position:absolute;top:-13px;left:50%;transform:translateX(-50%);width:26px;height:26px;",
      "  filter:drop-shadow(0 4px 5px rgba(0,0,0,.45));}",
      ".hello-sticky h2{font-size:27px;font-weight:700;letter-spacing:-.02em;margin:0 0 16px;color:#3c3316;}",
      ".hello-sticky p{font-size:15.5px;line-height:1.62;margin:0 0 13px;color:#4f431f;max-width:34ch;}",
      ".hello-sticky p b{font-weight:600;color:#3c3316;}",
      ".hello-sign{margin-top:8px;font-size:27px;color:#5a4a1a;",
      "  font-family:'Segoe Script','Bradley Hand','Snell Roundhand',cursive;transform:rotate(-1deg);}",
      "@media (prefers-reduced-motion: reduce){.hello-sticky{transform:none;}.hello-sign{transform:none;}}"
    ].join("");
    var s = document.createElement("style"); s.id = "hello-styles"; s.textContent = css;
    document.head.appendChild(s);
  }

  AlecOS.registerApp({
    id: "hello",
    name: "Stickies",
    accent: "#e6c23f",
    hero: false,                                   // no big heading over this space
    dock: { svg: STICKY_ICON, tone: "#e6c23f", label: "Stickies" },
    build: function (ctx) {
      inject();
      ctx.win.classList.add("hello-win");
      var note = document.createElement("div");
      note.className = "hello-sticky";
      note.innerHTML =
        '<svg class="hello-pin" viewBox="0 0 24 24" aria-hidden="true">' +
          '<circle cx="12" cy="9" r="7" fill="#e0483f"/>' +
          '<circle cx="9.6" cy="6.6" r="2.2" fill="#ff8a80"/>' +
          '<rect x="11.2" y="14" width="1.6" height="8" rx=".8" fill="#7a1a15"/>' +
        '</svg>' +
        '<h2>Hey &mdash; I&rsquo;m Alec.</h2>' +
        '<p>This is basically my computer. I build <b>music software</b> and little <b>automations</b> that handle the boring parts for me.</p>' +
        '<p>Scroll to look around &mdash; you&rsquo;ll meet me first, then the things I&rsquo;ve made.</p>' +
        '<div class="hello-sign">&mdash; Alec</div>';
      ctx.body.appendChild(note);
      return {};
    },
    tour: [{ title: "", body: "" }]                // hero suppressed; kept for API shape
  });
})();
