/* Alec Lewis — signal path.
   1) pinned rack scrollytelling (scroll-scrubbed SVG)
   2) continuous spine + section handoffs
   3) the real demos: Freak-Quencies iframe autofit, mixing video sound-on-scroll,
      Aminal inline YouTube player + count-up stats. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var SIG = "#E8B44A", CYAN = "#5BC8C0", OFF = "#1E252D";

  /* ============================================================
     1 · PINNED SIGNAL PATH
     ============================================================ */
  var track = document.getElementById("track");
  var rig = document.getElementById("rig");

  if (track && rig) (function () {
    var VW = 1000, WORLD = 4500, BGW = 5600;
    var $ = function (id) { return document.getElementById(id); };

    // ambient grid + dust
    (function () {
      var g = $("grid"), h = "", i;
      for (i = 0; i <= 20; i++) h += '<line x1="-40" y1="' + (i * 31) + '" x2="1040" y2="' + (i * 31) + '" stroke="#0F141A" stroke-width="1"/>';
      for (i = 0; i <= 34; i++) h += '<line x1="' + (i * 31) + '" y1="0" x2="' + (i * 31) + '" y2="620" stroke="#0F141A" stroke-width="1"/>';
      g.innerHTML = h;
    })();
    (function () {
      var g = $("dust"), h = "", i, s = 13;
      function r() { s = (s * 1103515245 + 12345) % 2147483647; return s / 2147483647; }
      for (i = 0; i < 46; i++) h += '<circle class="dt" cx="' + (r() * 1000).toFixed(1) + '" cy="' + (r() * 620).toFixed(1) + '" r="' + (.5 + r() * 1.1).toFixed(2) + '" fill="#E8D9BA" opacity="' + (.06 + r() * .14).toFixed(2) + '"/>';
      g.innerHTML = h;
    })();
    var dust = [].slice.call(document.querySelectorAll(".dt"));

    // deep background
    (function () {
      var g = $("bgContours"), h = "", c, i;
      for (c = 0; c < 9; c++) {
        var base = 120 + c * 54, amp = 16 + c * 4.5, d = "", N = 110;
        for (i = 0; i <= N; i++) {
          var q = i / N, x = q * BGW;
          var y = base + Math.sin(q * 7.5 + c * .8) * amp + Math.sin(q * 19 + c * 1.7) * amp * .32 + Math.sin(q * 3.1 + c * .4) * amp * .6;
          d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
        }
        h += '<path class="ct" d="' + d.trim() + '" fill="none" stroke="#1A2530" stroke-width="' + (.8 + c * .06).toFixed(2) + '" opacity="' + (.30 + c * .05).toFixed(2) + '"/>';
      }
      g.innerHTML = h;
    })();
    var contours = [].slice.call(document.querySelectorAll(".ct"));
    (function () {
      var g = $("bgWave"), d = "", i, N = 300;
      for (i = 0; i <= N; i++) {
        var q = i / N, x = q * BGW;
        var env = .4 + .6 * Math.pow(Math.sin(Math.PI * Math.min(q * 1.15, 1)), .5);
        var s = Math.sin(q * 46) * .55 + Math.sin(q * 17 + 1.2) * .3 + Math.sin(q * 97 + 2) * .14;
        d += (i ? "L" : "M") + x.toFixed(1) + " " + (430 - s * 80 * env).toFixed(1) + " ";
      }
      g.innerHTML = '<path id="ghostwave" d="' + d.trim() + '" fill="none" stroke="#151F2A" stroke-width="1.6"/>';
    })();
    (function () {
      var g = $("bgPatch"), h = "", i, j, k, s = 91;
      function r() { s = (s * 1103515245 + 12345) % 2147483647; return s / 2147483647; }
      for (i = 0; i < 13; i++) {
        var x = 140 + i * 430 + r() * 70, y = 96 + r() * 300, w = 150 + r() * 120, hh = 64 + r() * 54;
        h += '<g opacity="' + (.5 + r() * .5).toFixed(2) + '"><rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + hh.toFixed(0) + '" rx="4" fill="#0A0F14" stroke="#141C24" stroke-width="1"/>';
        var cols = Math.floor(w / 22), rows = Math.floor(hh / 22);
        for (j = 0; j < cols; j++) for (k = 0; k < rows; k++)
          h += '<circle cx="' + (x + 14 + j * 22).toFixed(0) + '" cy="' + (y + 16 + k * 22).toFixed(0) + '" r="2.6" fill="#0D141B" stroke="#16202A" stroke-width="0.9"/>';
        h += '</g>';
      }
      g.innerHTML = h;
    })();
    var bgContours = $("bgContours"), bgWave = $("bgWave"), bgPatch = $("bgPatch"),
        pulseLight = $("pulseLight"), ghostwave = $("ghostwave");

    // cable
    var lit = $("cableLit"), flow = $("cableFlow");
    var D = "M110 330 C 300 330, 360 300, 520 300 S 720 316, 880 300 S 1000 288, 1120 302 " +
            "S 1340 326, 1500 300 S 1600 288, 1700 300 S 1900 320, 2060 300 " +
            "S 2260 282, 2420 300 S 2500 294, 2560 300 S 2800 322, 2960 300 " +
            "S 3060 292, 3120 300 S 3340 300, 3480 300 S 3700 322, 3860 400 S 4120 500, 4400 468";
    $("cable").setAttribute("d", D); lit.setAttribute("d", D); flow.setAttribute("d", D);
    var L = lit.getTotalLength();
    lit.style.strokeDasharray = L; lit.style.strokeDashoffset = L;

    (function () {
      var g = $("backrack"), h = "", i;
      for (i = 0; i < 12; i++) {
        var x = 200 + i * 380, w = 150 + ((i * 53) % 90), y = 150 + ((i * 31) % 40);
        h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (70 + ((i * 17) % 50)) + '" rx="4" fill="#0B0F14" stroke="#11171E" stroke-width="1"/>';
      }
      g.innerHTML = h;
    })();

    $("rackLabels").innerHTML =
      '<g id="rl0"><line x1="380" y1="150" x2="1860" y2="150" stroke="#1C242D" stroke-width="1"/>' +
      '<text x="380" y="140" font-family="ui-monospace,monospace" font-size="11" letter-spacing="3.4" fill="#5E6771">RACK A &#160;/&#160; FREAK-QUENCIES &#160;&#183;&#160; AI MIXING</text></g>' +
      '<g id="rl1"><line x1="2420" y1="150" x2="3500" y2="150" stroke="#1C242D" stroke-width="1"/>' +
      '<text x="2420" y="140" font-family="ui-monospace,monospace" font-size="11" letter-spacing="3.4" fill="#4E6D6B">RACK B &#160;/&#160; AMINAL HOUSE &#160;&#183;&#160; CHANNEL AUTOMATION</text></g>' +
      '<g id="divider" opacity="0"><line x1="2180" y1="180" x2="2180" y2="440" stroke="#1A222A" stroke-width="1" stroke-dasharray="4 8"/>' +
      '<text x="2192" y="196" font-family="ui-monospace,monospace" font-size="9" letter-spacing="2" fill="#3E4750">SEPARATE SYSTEM</text></g>';
    var rl0 = $("rl0"), rl1 = $("rl1"), divider = $("divider");

    var MODS = [
      { x: 520,  w: 230, label: "DI  IN",    sub: "instrument",     rack: 0 },
      { x: 1120, w: 260, label: "ANALYZE",   sub: "cnn listener",   rack: 0 },
      { x: 1700, w: 280, label: "EQ + COMP", sub: "24 params",      rack: 0 },
      { x: 2560, w: 250, label: "CLIPS  IN", sub: "source video",   rack: 1 },
      { x: 3120, w: 270, label: "VERIFY",    sub: "clip + narrate", rack: 1 }
    ];
    (function () {
      var g = $("modules"), h = "", i, j;
      for (i = 0; i < MODS.length; i++) {
        var m = MODS[i], w = m.w, x = m.x - w / 2, y = 214, hh = 172;
        h += '<g class="mod" opacity="0">';
        h += '<rect x="' + (x - 16) + '" y="' + y + '" width="16" height="' + hh + '" rx="3" fill="#10151B" stroke="#1A222A" stroke-width="1"/>';
        h += '<rect x="' + (x + w) + '" y="' + y + '" width="16" height="' + hh + '" rx="3" fill="#10151B" stroke="#1A222A" stroke-width="1"/>';
        for (j = 0; j < 2; j++) { var sy = y + 22 + j * (hh - 44);
          h += '<circle cx="' + (x - 8) + '" cy="' + sy + '" r="2.6" fill="#0A0E12" stroke="#232C35" stroke-width="1"/>';
          h += '<circle cx="' + (x + w + 8) + '" cy="' + sy + '" r="2.6" fill="#0A0E12" stroke="#232C35" stroke-width="1"/>'; }
        h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="7" fill="url(#panelG)" stroke="#232C35" stroke-width="1.4"/>';
        h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="28" rx="7" fill="#171E26"/>';
        h += '<rect x="' + x + '" y="' + (y + 22) + '" width="' + w + '" height="6" fill="#171E26"/>';
        h += '<text x="' + (x + 13) + '" y="' + (y + 18) + '" font-family="ui-monospace,monospace" font-size="10.5" letter-spacing="2.4" fill="#8B949D">' + m.label + '</text>';
        h += '<circle class="led" cx="' + (x + w - 15) + '" cy="' + (y + 14) + '" r="3.6" fill="' + OFF + '"/>';
        h += '<rect x="' + (x + 13) + '" y="' + (y + 38) + '" width="' + (w - 26) + '" height="88" rx="4" fill="url(#screenG)" stroke="#1B232B" stroke-width="1"/>';
        for (j = 0; j < 3; j++) { var kx = x + 26 + j * 30, ky = y + 148;
          h += '<circle cx="' + kx + '" cy="' + ky + '" r="8.5" fill="#12181F" stroke="#2A343E" stroke-width="1.2"/>';
          h += '<line class="knob" x1="' + kx + '" y1="' + ky + '" x2="' + kx + '" y2="' + (ky - 6) + '" stroke="#7E8892" stroke-width="1.6" stroke-linecap="round"/>'; }
        for (j = 0; j < 7; j++) h += '<rect class="mtr" x="' + (x + w - 22 - j * 9) + '" y="' + (y + 142) + '" width="5" height="12" rx="1.5" fill="' + OFF + '"/>';
        h += '<circle cx="' + x + '" cy="300" r="5" fill="#080B0E" stroke="#2A343E" stroke-width="1.4"/>';
        h += '<circle cx="' + (x + w) + '" cy="300" r="5" fill="#080B0E" stroke="#2A343E" stroke-width="1.4"/>';
        h += '<text x="' + (x + 13) + '" y="' + (y + hh - 8) + '" font-family="ui-monospace,monospace" font-size="8" letter-spacing="1.6" fill="#4B545D">' + m.sub.toUpperCase() + '</text>';
        h += '</g>';
      }
      g.innerHTML = h;
    })();
    var mods = [].slice.call(document.querySelectorAll(".mod")),
        leds = [].slice.call(document.querySelectorAll(".led")),
        knobs = [].slice.call(document.querySelectorAll(".knob")),
        meters = [].slice.call(document.querySelectorAll(".mtr"));

    $("viz").innerHTML =
      '<g id="v0" opacity="0"><line x1="420" y1="300" x2="620" y2="300" stroke="#18202A" stroke-width="1"/>' +
      '<path id="wave" fill="none" stroke="#E8B44A" stroke-width="1.7" filter="url(#softbloom)"/>' +
      '<line id="scan" x1="520" y1="256" x2="520" y2="344" stroke="#FFE6B8" stroke-width="1" opacity=".35"/></g>' +
      '<g id="v1" opacity="0"><g id="bars"></g><g id="caps"></g>' +
      '<text id="conf" x="1002" y="264" font-family="ui-monospace,monospace" font-size="8.5" letter-spacing="1.4" fill="#5C666F">CONFIDENCE 0.00</text></g>' +
      '<g id="v2" opacity="0"><g id="eqgrid"></g><path id="eqArea" fill="url(#eqFill)"/>' +
      '<path id="eq" fill="none" stroke="#E8B44A" stroke-width="1.9" filter="url(#softbloom)"/><g id="handles"></g></g>' +
      '<g id="v3" opacity="0"><g clip-path="url(#cs3)"><g id="film"></g></g></g>' +
      '<g id="v4" opacity="0"><g id="frames"></g><g id="outs"></g></g>';

    (function () {
      var g = $("bars"), c = $("caps"), h = "", hc = "", i, NB = 26;
      for (i = 0; i < NB; i++) { var x = 1120 - 115 + i * 9;
        h += '<rect class="sb" x="' + x + '" y="298" width="5" height="3" rx="2" fill="url(#barG)"/>';
        hc += '<rect class="cap" x="' + x + '" y="290" width="5" height="1.6" rx="1" fill="#FFE6B8" opacity=".8"/>'; }
      g.innerHTML = h; c.innerHTML = hc;
    })();
    var sbars = [].slice.call(document.querySelectorAll(".sb")),
        caps = [].slice.call(document.querySelectorAll(".cap")), conf = $("conf");

    (function () {
      var g = $("eqgrid"), h = "", i;
      for (i = 0; i < 6; i++) { var x = 1700 - 120 + i * 48; h += '<line x1="' + x + '" y1="256" x2="' + x + '" y2="344" stroke="#161D25" stroke-width="1"/>'; }
      h += '<line x1="1580" y1="300" x2="1820" y2="300" stroke="#1C242D" stroke-width="1"/>'; g.innerHTML = h;
    })();
    (function () { var g = $("handles"), h = "", i;
      for (i = 0; i < 3; i++) h += '<circle class="hd" r="3.4" fill="#0A0E12" stroke="#E8B44A" stroke-width="1.5" opacity="0"/>';
      g.innerHTML = h; })();
    var handles = [].slice.call(document.querySelectorAll(".hd"));
    var eqPath = $("eq"), eqArea = $("eqArea"), wavePath = $("wave"), scan = $("scan");

    (function () { var g = $("film"), h = "", i;
      for (i = 0; i < 9; i++) { var x = 2455 + i * 58;
        h += '<g><rect x="' + x + '" y="272" width="50" height="46" rx="2" fill="#101820" stroke="#1F2A33" stroke-width="1"/>';
        for (var j = 0; j < 3; j++) {
          h += '<rect x="' + (x + 6 + j * 16) + '" y="266" width="6" height="4" rx="1" fill="#0B1218"/>';
          h += '<rect x="' + (x + 6 + j * 16) + '" y="320" width="6" height="4" rx="1" fill="#0B1218"/>'; }
        h += '<circle cx="' + (x + 25) + '" cy="295" r="9" fill="#16202A"/></g>'; }
      g.innerHTML = h; })();
    var film = $("film");

    (function () { var g = $("frames"), h = "", i;
      for (i = 0; i < 8; i++) { var col = i % 4, row = Math.floor(i / 4), x = 3000 + col * 58, y = 264 + row * 42;
        h += '<g><rect x="' + x + '" y="' + y + '" width="48" height="34" rx="2" fill="#101820" stroke="#1F2A33" stroke-width="1"/>' +
             '<path class="tick" d="M' + (x + 17) + ' ' + (y + 18) + ' l5 6 l10 -12" fill="none" stroke="#5BC8C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></g>'; }
      g.innerHTML = h; })();
    var ticks = [].slice.call(document.querySelectorAll(".tick"));

    (function () { var g = $("outs"), h = "", i, names = ["YOUTUBE", "TIKTOK", "INSTAGRAM", "FACEBOOK"];
      for (i = 0; i < 4; i++) { var y = 238 + i * 42;
        h += '<path class="out" d="M3255 300 C 3320 300, 3340 ' + y + ', 3420 ' + y + '" fill="none" stroke="#5BC8C0" stroke-width="1.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
             '<circle class="outd" cx="3420" cy="' + y + '" r="2.6" fill="#5BC8C0" opacity="0"/>' +
             '<text class="outt" x="3434" y="' + (y + 3.5) + '" font-family="ui-monospace,monospace" font-size="9.5" letter-spacing="1.6" fill="#7C858E" opacity="0">' + names[i] + '</text>'; }
      g.innerHTML = h; })();
    var outs = [].slice.call(document.querySelectorAll(".out")),
        outts = [].slice.call(document.querySelectorAll(".outt")),
        outds = [].slice.call(document.querySelectorAll(".outd"));

    function ridge(pts) {
      var P = pts.slice(); P.unshift([P[0][0] - 240, P[0][1]]); P.push([P[P.length - 1][0] + 240, P[P.length - 1][1]]);
      var d = "M" + P[1][0] + " " + P[1][1], i;
      for (i = 1; i < P.length - 2; i++) { var p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
        d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ", " +
                    (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ", " +
                    p2[0].toFixed(1) + " " + p2[1].toFixed(1); }
      d += " L" + P[P.length - 1][0] + " 700 L" + P[0][0] + " 700 Z"; return d;
    }
    $("ridgeC").setAttribute("d", ridge([[3700,452],[3860,410],[4020,442],[4180,398],[4340,436],[4500,414]]));
    $("ridgeB").setAttribute("d", ridge([[3700,508],[3880,470],[4040,500],[4200,462],[4360,494],[4520,476]]));
    $("ridgeA").setAttribute("d", ridge([[3700,566],[3900,534],[4060,562],[4220,528],[4380,556],[4540,540]]));
    (function () { var g = $("birds"), h = "", i;
      for (i = 0; i < 5; i++) { var x = 3980 + i * 46 + ((i % 2) * 18), y = 350 + ((i * 23) % 40);
        h += '<path class="bird" d="M' + x + ' ' + y + ' q6 -5 12 0 M' + (x + 12) + ' ' + y + ' q6 -5 12 0" fill="none" stroke="#5A6673" stroke-width="1.4" opacity="0"/>'; }
      g.innerHTML = h; })();
    var birds = [].slice.call(document.querySelectorAll(".bird"));

    var world = $("world"), pulse = $("pulse"), halo = $("pulseHalo"),
        skyA = $("skyA"), skyB = $("skyB"), grid = $("grid"),
        terrain = $("terrain"), backrack = $("backrack"),
        v0 = $("v0"), v1 = $("v1"), v2 = $("v2"), v3 = $("v3"), v4 = $("v4");
    var beats = [].slice.call(document.querySelectorAll(".beat"));
    var labels = ["input", "analyze", "process", "source", "publish", "out"];
    var stageLabel = document.getElementById("stageLabel");

    function mix(a, b, t) {
      var ar = parseInt(a.substr(1,2),16), ag = parseInt(a.substr(3,2),16), ab = parseInt(a.substr(5,2),16);
      var br = parseInt(b.substr(1,2),16), bg = parseInt(b.substr(3,2),16), bb = parseInt(b.substr(5,2),16);
      return "rgb(" + Math.round(ar+(br-ar)*t) + "," + Math.round(ag+(bg-ag)*t) + "," + Math.round(ab+(bb-ab)*t) + ")";
    }

    var cur = 0;
    function render(p, t) {
      var tp = clamp(p, 0, 1);
      lit.style.strokeDashoffset = (L * (1 - tp)).toFixed(1);
      flow.style.strokeDashoffset = (-t * 40).toFixed(1);
      flow.setAttribute("opacity", tp > .01 ? (.5 * clamp(tp * 4, 0, 1)).toFixed(2) : "0");
      var pt = lit.getPointAtLength(L * Math.max(tp, 1e-4));
      pulse.setAttribute("cx", pt.x.toFixed(1)); pulse.setAttribute("cy", pt.y.toFixed(1));
      halo.setAttribute("cx", pt.x.toFixed(1)); halo.setAttribute("cy", pt.y.toFixed(1));
      var vis = tp > .004 ? 1 : 0;
      pulse.setAttribute("opacity", vis);
      halo.setAttribute("opacity", (vis * (.85 + .15 * Math.sin(t * 4))).toFixed(2));

      var camX = clamp(pt.x - VW * .40, 0, WORLD - VW);
      world.setAttribute("transform", "translate(" + (-camX).toFixed(1) + ",0)");
      grid.setAttribute("transform", "translate(" + (-(camX * .22) % 31).toFixed(1) + ",0)");
      backrack.setAttribute("transform", "translate(" + (camX * .55).toFixed(1) + ",0)");
      bgContours.setAttribute("transform", "translate(" + (-camX * .10).toFixed(1) + "," + (Math.sin(t * .18) * 5).toFixed(2) + ")");
      bgWave.setAttribute("transform", "translate(" + (-camX * .20).toFixed(1) + "," + (Math.sin(t * .25 + 1) * 8).toFixed(2) + ")");
      bgPatch.setAttribute("transform", "translate(" + (-camX * .34).toFixed(1) + ",0)");
      for (var ci = 0; ci < contours.length; ci++)
        contours[ci].setAttribute("opacity", ((.30 + ci * .05) * (.75 + .25 * Math.sin(t * .5 + ci * .6))).toFixed(3));
      pulseLight.setAttribute("cx", (pt.x - camX).toFixed(1)); pulseLight.setAttribute("cy", pt.y.toFixed(1));
      pulseLight.setAttribute("opacity", (vis * (.85 + .15 * Math.sin(t * 3))).toFixed(2));
      for (var d0 = 0; d0 < dust.length; d0++)
        dust[d0].setAttribute("cx", ((((parseFloat(dust[d0].getAttribute("cx")) + t * (4 + (d0 % 5)) * .6) % 1040) - 20)).toFixed(1));

      rl0.setAttribute("opacity", clamp((pt.x - 260) / 200, 0, 1).toFixed(2));
      rl1.setAttribute("opacity", clamp((pt.x - 2180) / 200, 0, 1).toFixed(2));
      divider.setAttribute("opacity", (clamp((pt.x - 1960) / 160, 0, 1) * clamp((2700 - pt.x) / 220, 0, 1)).toFixed(2));

      for (var i = 0; i < mods.length; i++) {
        var mx = MODS[i].x, acc = MODS[i].rack ? CYAN : SIG;
        mods[i].setAttribute("opacity", clamp((pt.x - (mx - 500)) / 240, 0, 1).toFixed(2));
        var on = pt.x > mx - MODS[i].w / 2 - 10;
        leds[i].setAttribute("fill", on ? acc : OFF);
        leds[i].setAttribute("filter", on ? "url(#softbloom)" : "");
        for (var k = 0; k < 3; k++) { var kk = knobs[i * 3 + k];
          var turn = clamp((pt.x - (mx - 60)) / 180, 0, 1) * (120 + k * 40) - 60;
          kk.setAttribute("transform", "rotate(" + turn.toFixed(1) + "," + kk.getAttribute("x1") + "," + kk.getAttribute("y1") + ")"); }
        for (var mt = 0; mt < 7; mt++) { var mm = meters[i * 7 + mt];
          var lvl = on ? clamp((.55 + .45 * Math.sin(t * 5 + mt * .7 + i)) * 7 - mt, 0, 1) : 0;
          mm.setAttribute("fill", lvl > .4 ? (mt > 4 ? (MODS[i].rack ? "#9BE6DF" : "#FF9E5E") : acc) : OFF); }
      }

      var a0 = clamp((pt.x - 380) / 70, 0, 1) * clamp((1000 - pt.x) / 190, 0, 1);
      v0.setAttribute("opacity", a0.toFixed(2));
      if (a0 > .01) { var dd = "", n, N = 70;
        for (n = 0; n <= N; n++) { var q = n / N, x = 520 - 95 + q * 190, env = Math.pow(Math.sin(Math.PI * q), .55);
          var s = Math.sin(q * 30 + t * 2) * .55 + Math.sin(q * 13 + 1 + t) * .32 + Math.sin(q * 61) * .13;
          dd += (n ? "L" : "M") + x.toFixed(1) + " " + (300 - s * 36 * env).toFixed(1) + " "; }
        wavePath.setAttribute("d", dd.trim());
        var sx = (520 - 95 + ((t * 70) % 190)).toFixed(1); scan.setAttribute("x1", sx); scan.setAttribute("x2", sx); }

      var a1 = clamp((pt.x - 960) / 70, 0, 1) * clamp((1600 - pt.x) / 200, 0, 1);
      v1.setAttribute("opacity", a1.toFixed(2));
      for (var b1 = 0; b1 < sbars.length; b1++) {
        var q1 = b1 / (sbars.length - 1);
        var mag = (Math.sin(q1 * 8 + 1.1 + t * 1.6) * .5 + .5) * (.35 + .65 * Math.pow(Math.sin(Math.PI * q1), .6));
        var hh1 = 4 + mag * 74 * a1;
        sbars[b1].setAttribute("y", (300 - hh1 / 2).toFixed(1)); sbars[b1].setAttribute("height", hh1.toFixed(1));
        caps[b1].setAttribute("y", (300 - hh1 / 2 - 4).toFixed(1)); caps[b1].setAttribute("opacity", (.75 * a1).toFixed(2));
      }
      if (conf) conf.textContent = "CONFIDENCE " + (clamp((pt.x - 990) / 200, 0, 1) * .97).toFixed(2);

      var a2 = clamp((pt.x - 1520) / 70, 0, 1) * clamp((2200 - pt.x) / 200, 0, 1);
      v2.setAttribute("opacity", a2.toFixed(2));
      var sh = clamp((pt.x - 1565) / 210, 0, 1);
      if (a2 > .01) { var d2 = "", n2, N2 = 80, pts = [];
        for (n2 = 0; n2 <= N2; n2++) { var q2 = n2 / N2, x2 = 1700 - 120 + q2 * 240;
          var band = -Math.exp(-Math.pow((q2 - .20) / .11, 2)) * 26 + Math.exp(-Math.pow((q2 - .53) / .09, 2)) * 22 - Math.exp(-Math.pow((q2 - .84) / .13, 2)) * 17;
          var y2 = 300 + band * sh; d2 += (n2 ? "L" : "M") + x2.toFixed(1) + " " + y2.toFixed(1) + " "; pts.push([x2, y2]); }
        eqPath.setAttribute("d", d2.trim());
        eqArea.setAttribute("d", d2.trim() + "L1820 300 L1580 300 Z");
        var hp = [.20, .53, .84];
        for (var hI = 0; hI < 3; hI++) { var idx = Math.round(hp[hI] * N2);
          handles[hI].setAttribute("cx", pts[idx][0].toFixed(1)); handles[hI].setAttribute("cy", pts[idx][1].toFixed(1));
          handles[hI].setAttribute("opacity", (a2 * clamp(sh * 1.4, 0, 1)).toFixed(2)); } }

      var a3 = clamp((pt.x - 2400) / 70, 0, 1) * clamp((3000 - pt.x) / 200, 0, 1);
      v3.setAttribute("opacity", a3.toFixed(2));
      if (a3 > .01) film.setAttribute("transform", "translate(" + (-((t * 26) % 58)).toFixed(1) + ",0)");

      var a4 = clamp((pt.x - 2980) / 70, 0, 1);
      v4.setAttribute("opacity", a4.toFixed(2));
      for (var f = 0; f < ticks.length; f++) ticks[f].setAttribute("opacity", clamp((pt.x - 3010 - f * 16) / 45, 0, 1).toFixed(2));
      for (var o = 0; o < outs.length; o++) {
        var od = clamp((pt.x - 3170 - o * 40) / 140, 0, 1);
        outs[o].style.strokeDashoffset = (1 - od).toFixed(3);
        outds[o].setAttribute("opacity", clamp((od - .85) * 6, 0, 1).toFixed(2));
        outts[o].setAttribute("opacity", clamp((od - .8) * 5, 0, 1).toFixed(2));
      }

      var out = clamp((p - .76) / .24, 0, 1);
      skyA.setAttribute("stop-color", mix("#07080A", "#151D2B", ease(out)));
      skyB.setAttribute("stop-color", mix("#0D1013", "#4A2E28", ease(out)));
      grid.setAttribute("opacity", (.55 * (1 - out)).toFixed(2));
      backrack.setAttribute("opacity", (.5 * (1 - out)).toFixed(2));
      bgPatch.setAttribute("opacity", (.75 * (1 - out)).toFixed(2));
      bgWave.setAttribute("opacity", (.5 * (1 - out * .85)).toFixed(2));
      bgContours.setAttribute("opacity", (.85 * (1 - out * .45)).toFixed(2));
      if (ghostwave) ghostwave.setAttribute("stroke", mix("#151F2A", "#2A2230", ease(out)));
      terrain.setAttribute("opacity", out.toFixed(2));
      for (var bd = 0; bd < birds.length; bd++) {
        birds[bd].setAttribute("opacity", clamp((out - .45 - bd * .06) * 3, 0, 1).toFixed(2));
        birds[bd].setAttribute("transform", "translate(" + (Math.sin(t * .6 + bd) * 5).toFixed(1) + "," + (Math.sin(t * 1.1 + bd * 1.3) * 3).toFixed(1) + ")");
      }

      var active = "";
      for (var k2 = 0; k2 < beats.length; k2++) {
        var el = beats[k2], inP = +el.dataset.in, outP = +el.dataset.out;
        var mid = (inP + outP) / 2, half = (outP - inP) / 2, dist = Math.abs(p - mid) / half;
        var o2 = clamp(1.32 - dist * 1.32, 0, 1);
        el.style.opacity = o2.toFixed(3);
        el.style.transform = "translateY(" + ((1 - o2) * 16).toFixed(1) + "px)";
        if (o2 > .5) active = labels[k2];
      }
      if (active && stageLabel && stageLabel.textContent !== active) {
        stageLabel.textContent = active;
        stageLabel.style.color = (active === "source" || active === "publish") ? CYAN : SIG;
      }
    }

    window.__signalRender = function (ts) {
      var r = track.getBoundingClientRect(), range = track.offsetHeight - window.innerHeight;
      var raw = clamp((-r.top) / range, 0, 1);
      cur += (raw - cur) * (reduce ? 1 : .075);
      render(cur, ts / 1000);
    };
    render(0, 0);
  })();

  /* ============================================================
     2 · SPINE, PROGRESS, REVEALS, NAV
     ============================================================ */
  var spineFill = document.getElementById("spineFill");
  var topbar = document.getElementById("topbar");
  var revealEls = [].slice.call(document.querySelectorAll(".rv"));
  var navLinks = [].slice.call(document.querySelectorAll(".hud-nav a[href^='#']"));

  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); obs.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { obs.observe(el); });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["mixing", "backline", "aminal", "outside", "contact"].forEach(function (id) {
      var el = document.getElementById(id); if (el) spy.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("on"); });
  }

  /* ============================================================
     3 · MIXING VIDEO — play with sound when scrolled into view
     ============================================================ */
  var audioUnlocked = false, mixStarted = false, mixInView = false;
  var devVideo = document.querySelector(".dev-display");
  var mixPlay = document.querySelector(".mix-play");
  var mixHint = document.getElementById("mix-hint");

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try { var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { var ctx = new AC(); if (ctx.state === "suspended") ctx.resume(); } } catch (err) {}
    if (mixInView && !mixStarted) tryStartMix();
  }
  function tryStartMix() {
    if (!devVideo || mixStarted || reduce) return;
    devVideo.muted = false;
    var pr = devVideo.play();
    if (pr && typeof pr.then === "function") {
      pr.then(function () {
        mixStarted = true;
        if (mixPlay) mixPlay.hidden = true;
        if (mixHint) mixHint.textContent = "Playing with sound.";
      }).catch(function () {
        if (mixPlay) mixPlay.hidden = false;
        if (mixHint) mixHint.textContent = "Tap the video once for sound — browsers block autoplay until you interact.";
      });
    }
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });
  if (devVideo) {
    if (mixPlay) mixPlay.addEventListener("click", function () { unlockAudio(); mixStarted = false; tryStartMix(); });
    devVideo.addEventListener("play", function () { if (!devVideo.muted && mixPlay) mixPlay.hidden = true; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { mixInView = true; tryStartMix(); } });
      }, { threshold: .45 }).observe(devVideo);
    }
  }

  /* ============================================================
     4 · AMINAL — inline YouTube player + thumbnail strip
     ============================================================ */
  var cinemaScreen = document.querySelector(".cinema-screen");
  var cinemaFrame = cinemaScreen ? cinemaScreen.querySelector("iframe") : null;
  var nowTitle = document.querySelector(".cinema-title");
  var nowSub = document.querySelector(".cinema-sub");
  var vids = [].slice.call(document.querySelectorAll(".vid"));

  function ytEmbed(id, autoplay) {
    return "https://www.youtube-nocookie.com/embed/" + id +
      "?rel=0&modestbranding=1&playsinline=1" + (autoplay ? "&autoplay=1" : "");
  }
  vids.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!cinemaScreen) return;
      vids.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      unlockAudio();
      if (!cinemaFrame) {
        cinemaFrame = document.createElement("iframe");
        cinemaFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        cinemaFrame.allowFullscreen = true;
        cinemaFrame.referrerPolicy = "strict-origin-when-cross-origin";
        cinemaScreen.appendChild(cinemaFrame);
      }
      cinemaFrame.src = ytEmbed(btn.dataset.yt, true);
      cinemaFrame.title = btn.dataset.title || "Aminal House short";
      if (nowTitle) nowTitle.textContent = btn.dataset.title || "";
      if (nowSub) nowSub.textContent = (btn.dataset.meta || "") + " · now playing";
    });
  });

  /* ============================================================
     5 · COUNT-UP STATS
     ============================================================ */
  var statsGrid = document.querySelector("[data-countup]");
  function animateCount(el) {
    var to = parseInt(el.dataset.to, 10) || 0;
    var done = function () { el.textContent = to.toLocaleString(); };
    if (reduce) { done(); return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step); else done();
    }
    requestAnimationFrame(step);
  }
  if (statsGrid && "IntersectionObserver" in window) {
    var counted = false;
    new IntersectionObserver(function (entries, ob) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !counted) {
          counted = true;
          [].slice.call(statsGrid.querySelectorAll(".stat-num")).forEach(animateCount);
          ob.disconnect();
        }
      });
    }, { threshold: .4 }).observe(statsGrid);
  } else if (statsGrid) {
    [].slice.call(statsGrid.querySelectorAll(".stat-num")).forEach(function (el) {
      el.textContent = (parseInt(el.dataset.to, 10) || 0).toLocaleString();
    });
  }

  /* ============================================================
     6 · FREAK-QUENCIES iframe — auto-fit to its content (same-origin)
     ============================================================ */
  // Demos are click-to-load: the mixer spins up audio + canvas and must not run
  // on page load (it can take the whole tab down with it).
  [].slice.call(document.querySelectorAll(".demo-shell")).forEach(function (shell) {
    var btn = shell.querySelector(".demo-launch");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (shell.classList.contains("loaded")) return;
      var f = document.createElement("iframe");
      f.id = shell.dataset.frameId || "";
      f.src = shell.dataset.src;
      f.title = shell.dataset.title || "Interactive demo";
      f.setAttribute("scrolling", "no");
      shell.classList.add("loaded");
      shell.appendChild(f);
      if (f.id === "freak-frame") wireFreakFit(f);
    });
  });

  function wireFreakFit(freakFrame) {
    // Fit the same-origin demo to its content. Guarded: the embed sizes some of
    // its layout off the frame, so an unclamped observer feedback-loops the
    // height upward until the tab dies. Clamp, require a real delta, and never
    // re-observe the body.
    var MIN_H = 480, MAX_H = 1500, lastH = 0;
    var fitFreak = function () {
      try {
        var doc = freakFrame.contentWindow && freakFrame.contentWindow.document;
        if (!doc || !doc.body) return;
        var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
        if (!h) return;
        h = clamp(Math.ceil(h), MIN_H, MAX_H);
        if (Math.abs(h - lastH) < 12) return;   // ignore jitter → no runaway
        lastH = h;
        freakFrame.style.height = h + "px";
      } catch (err) { /* cross-origin or not ready — CSS fallback height */ }
    };
    freakFrame.addEventListener("load", function () {
      fitFreak();
      [300, 900].forEach(function (ms) { setTimeout(fitFreak, ms); });
    });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(fitFreak, 200); });
  }

  /* ============================================================
     7 · ONE RAF LOOP
     ============================================================ */
  function loop(ts) {
    if (window.__signalRender) window.__signalRender(ts);
    var sy = window.scrollY || window.pageYOffset || 0;
    var total = Math.max(1, document.body.scrollHeight - window.innerHeight);
    var pct = clamp(sy / total, 0, 1);
    if (spineFill) spineFill.style.height = (pct * 100) + "%";
    if (topbar) topbar.style.width = (pct * 100) + "%";
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
