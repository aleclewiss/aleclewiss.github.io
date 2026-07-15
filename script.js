// Hero name rises line by line.
document.querySelectorAll(".hero-title .line").forEach(function (line, i) {
  setTimeout(function () { line.classList.add("in"); }, 200 + i * 140);
});

// ---- DAW: clip launching loads the project into the device rack ----
var PROJECTS = {
  freak: {
    title: "Freak-Quencies",
    devices: ["CNN Listener", "EQ Eight", "Glue Compressor"],
    desc: "An AI mixing engineer for acoustic guitar. A convolutional neural network listens to your fingerpicked take and predicts a corrective EQ + compressor chain, applied in real time inside a JUCE app.",
    tags: "JUCE · PyTorch · DSP",
    link: "https://github.com/aleclewiss/Freak-Quencies",
  },
  backline: {
    title: "Backline",
    devices: ["ACE-Step Engine", "Live Link", "Electron Shell"],
    desc: "A standalone desktop music studio for the ACE-Step text-to-music model, patched straight into Ableton Live — generate stems with words, arrange them like any other clip.",
    tags: "Electron · React · Max for Live",
    link: "https://github.com/aleclewiss/backline",
  },
  site: {
    title: "This Site",
    devices: ["index.html", "styles.css", "script.js"],
    desc: "The page you're reading — a portfolio that dresses up as the software it describes. Hand-written, no framework, three costumes.",
    tags: "HTML · CSS · Vanilla JS",
    link: "https://github.com/aleclewiss",
  },
};

var daw = document.querySelector(".daw");
var rackTitle = document.getElementById("rack-title");
var rackDevices = document.getElementById("rack-devices");
var rackDesc = document.getElementById("rack-desc");
var rackTags = document.getElementById("rack-tags");
var rackLink = document.getElementById("rack-link");

function loadProject(key) {
  var p = PROJECTS[key];
  if (!p || !rackTitle) return;
  rackTitle.textContent = p.title;
  rackDesc.textContent = p.desc;
  rackTags.textContent = p.tags;
  rackLink.href = p.link;
  rackDevices.innerHTML = "";
  p.devices.forEach(function (name) {
    var d = document.createElement("span");
    d.className = "rack-device";
    d.textContent = name;
    rackDevices.appendChild(d);
  });
}

var clips = document.querySelectorAll(".clip");
clips.forEach(function (clip) {
  clip.addEventListener("click", function () {
    clips.forEach(function (c) { c.classList.remove("is-selected"); });
    clip.classList.add("is-selected");
    loadProject(clip.dataset.project);
    if (daw) daw.classList.add("playing");
    var play = document.getElementById("t-play");
    if (play) play.setAttribute("aria-pressed", "true");
  });
});

var playBtn = document.getElementById("t-play");
var stopBtn = document.getElementById("t-stop");
if (playBtn && daw) {
  playBtn.addEventListener("click", function () {
    var on = daw.classList.toggle("playing");
    playBtn.setAttribute("aria-pressed", String(on));
  });
}
if (stopBtn && daw) {
  stopBtn.addEventListener("click", function () {
    daw.classList.remove("playing");
    if (playBtn) playBtn.setAttribute("aria-pressed", "false");
  });
}

loadProject("freak");

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
