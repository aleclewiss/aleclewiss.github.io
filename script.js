// Hero name rises line by line on load.
document.querySelectorAll(".hero-title .line").forEach(function (line, i) {
  setTimeout(function () { line.classList.add("in"); }, 200 + i * 140);
});

// Footer year.
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
