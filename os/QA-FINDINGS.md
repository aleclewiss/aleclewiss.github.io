# AlecOS — Mobile QA Findings

**Audit method (per brief):** True device metrics via a fixed-size `<iframe>` wrapper page
(`qa-frame.html`, since removed) loaded inside a wide headless Chrome window. Verified
`contentWindow.innerWidth === 390` and `=== 360` before every measurement, and confirmed
`AlecOS.isMobile() === true`. Screenshots were captured with CDP `Page.captureScreenshot`
clipped to the iframe box. All numbers below are measured at **true 390 CSS px** (and 360
where noted), not the clamped ~500px headless viewport that would fake overflow.

**Screens audited:** Home (greeting + Photos coverflow + dock), coverflow swiped to mid/last,
Freak-Quencies demo, Backline demo, Aminal House, Contact — plus app open/close transitions,
back nav, and a desktop 1440×900 sanity pass.

**Screenshots captured (pixel evidence):** home, coverflow (mid + last), Aminal, Contact,
**Freak, Backline** (the demo canvases did NOT hang capture this run — I got real pixels for
both), desktop. The only thing I could NOT measure is the Freak plugin's *canvas-drawn* text
size (see F2 — verified illegible visually, not via DOM).

**Console:** ZERO console errors or exceptions on every mobile screen and on desktop.

**Global good news:** No horizontal overflow anywhere at 390 or 360
(`documentElement.scrollWidth === innerWidth` on home; `scrollWidth - clientWidth === 0` in
every app scroller and inside both demo iframes). Contact/Aminal/Backline are clean and
phone-native. Desktop is intact (`isMobile===false`, no `.mos-home` built, desktop dock
present, no overflow).

---

## F1 — Home: ~170px dead vertical gap between the coverflow dots and the dock — MAJOR
**Screen:** Home (390 and 360)
**What's wrong:** The Photos coverflow floats in the upper two-thirds and the app dock is
pinned near the bottom, leaving a large empty band of aurora wallpaper between them. Measured
gap from the pager-dots' bottom to the dock's top: **172px at 390**, **146px at 360**
(`dots.top === stage.bottom === 538`; `dock.top ≈ 710`). The stage bottom, the dots, and the
dock are visually disconnected — the screen reads "unfinished / content floating," not composed.
**Where:** `os/mobile.css` — `.moscf-stage{flex:0 0 46vh}` is a *fixed* height, so inside
`.mos-home-cf{flex:1 1 auto}` → `.moscf{justify-content:flex-start}` the stage + dots pack to
the top and all the leftover flex height collects as empty space below the dots. (The fixed
46vh was introduced to kill caption reflow, but on the tall home column it just relocates the
"cavern" to below the dots.)
**Suggested fix:** Let the stage consume the free space instead of a fixed vh — e.g.
`.moscf-stage{flex:1 1 auto; min-height:0}` and keep the head/dots `flex:none`, or set
`.moscf{justify-content:space-between}` so the dots sit just above the dock. Alternatively pull
the dock up and cap the coverflow block. Target: dots-to-dock gap ≈ 24–40px, consistent at both
widths. Re-verify caption 1↔2 line swaps still don't reflow (keep `.moscf-head` fixed height).

## F2 — Freak-Quencies demo is a shrunk DESKTOP layout, not phone-native — MAJOR
**Screen:** Freak demo (390 and 360)
**What's wrong:** Unlike Backline (which reflows to a clean single column), the embedded
Freak-Quencies plugin renders its **desktop two-pane layout** crammed into the phone: the EQ
graph and the "Compressor" panel sit side-by-side, so both are tiny; the plugin's title-bar and
knob labels (canvas-drawn) are far below legible size; the compressor knobs are too small to
operate by thumb. There is also a **~115px vertical dead band at the top of the demo area**
(black gap between the amber header divider and the plugin) because the demo centers/pushes its
content down inside the 669px frame. Net: the portfolio's flagship ML demo looks cramped and
desktop-y on a phone.
**Evidence / honesty note:** Verified from the pixel screenshot. I could NOT quantify the
illegible text: the plugin chrome is rendered to `<canvas>`, so a DOM scan found **0 text nodes
<11px and 0 sub-44px buttons** — the small text is painted, not styled elements, so structural
metrics can't catch it. Overflow is clean (iframe `scrollWidth === innerWidth === 390`), so this
is a *layout-density/legibility* problem, not a clipping one.
**Where:** `freak-demo/index.html` (`?embed=1`) — its internal layout is not responsive at
≤390px; the AlecOS wrapper (`os/app-freak.js` `.mos-demo-frame`, `os/mobile.css .mos-demo`) is
fine. Compare `backline-demo/index.html` which does reflow.
**Suggested fix:** Add a phone breakpoint to the Freak demo: stack EQ over compressor (or hide
the compressor pane behind a tab), enlarge controls to ≥44px, and top-align content to kill the
dead band. If the plugin genuinely can't reflow, present a phone-tailored control strip instead
of the shrunk desktop plugin.

## F3 — Dock app labels are truncated ("Freak-Que…", "Aminal Ho…") — MAJOR
**Screen:** Home dock (390 and 360)
**What's wrong:** Two of the four dock labels are ellipsis-clipped and unreadable as names.
Measured `scrollWidth > clientWidth`: **"Freak-Quencies" 75px into 64px** (renders
"Freak-Que…"), **"Aminal House" 65px into 64px** (renders "Aminal Ho…"). Backline and Mail fit.
A portfolio home whose two headline projects show clipped names reads as broken.
**Where:** `os/mobile.css` — `.mos-dock-lbl{max-width:64px;white-space:nowrap;overflow:hidden;
text-overflow:ellipsis}` combined with `.mos-dock{gap:16px}` and a 52px tile leaves too little
label width.
**Suggested fix:** Give labels room — reduce `.mos-dock` gap, raise `.mos-dock-lbl` max-width
(≈76–84px), allow two lines (`white-space:normal; -webkit-line-clamp:2`), and/or shorten labels
in the dock config (e.g. "Freak-Q." → better: "Freak" / "Aminal"). Ensure the four-up row still
fits 360 without overflow after widening.

## F4 — Dock label type is 10.5px — below the 11px legibility floor — MINOR
**Screen:** Home dock (390 and 360)
**What's wrong:** `.mos-dock-lbl` computes to **10.5px**, under the brief's ≥11px minimum, and
the labels are already low-contrast (`rgba(255,255,255,.8)` on wallpaper).
**Where:** `os/mobile.css` `.mos-dock-lbl{font-size:10.5px}`.
**Suggested fix:** Bump to ≥11px (11–12px reads well at this size); pairs naturally with the F3
width fix.

## F5 — Coverflow pager: 14 dots at 8px — tiny, sub-44px, visually busy — MINOR
**Screen:** Home coverflow (390 and 360)
**What's wrong:** There are **14** pager dots (one per photo), each **8px** visual / ~12px hit
box — far below the 44px touch target and hard to tap precisely; 14 dots in a row also reads as
cluttered for a casual carousel.
**Where:** `os/mobile.css` `.moscf-dots` / `.moscf-dot{width:8px;height:8px}`;
`os/app-media.js` builds one dot per `MITEMS` entry (14).
**Suggested fix:** Keep dots small visually but expand the tap area (transparent padding to ≥28–
44px per dot), or reduce to a compact/segmented indicator. Given dots double as the only
non-swipe way to jump, larger hit areas matter.

## F6 — Aminal "Watch on YouTube" button: red YouTube icon on red button = stray white triangle — MINOR
**Screen:** Aminal House (390 and 360)
**What's wrong:** The primary button is red (`#ff0033`) and uses `ICON_YOUTUBE` (a **red**
rounded rect with a white play triangle). Red-on-red makes the icon body invisible, leaving a
lone white triangle floating left of the text that reads as a rendering artifact/dot.
**Where:** `os/app-media.js` (mobile Aminal branch) — `.m-btn-primary` with inline
`ICON_YOUTUBE` `<span>`.
**Suggested fix:** Use a monochrome white play/YT glyph on the red button (or drop the icon).
The desktop `.am-yt` button gets this right by being white-bg.

## F7 — Back chevron hit height is 36px (<44px) — MINOR
**Screen:** Every opened app (app bar)
**What's wrong:** The back button measures **44×36px** — width is fine but height (36px) is
under the 44px touch-target minimum for the primary nav control.
**Where:** `os/mobile.css` `.mos-back{min-width:44px;min-height:36px}`.
**Suggested fix:** Raise `min-height` to 44px (increase vertical padding on `.mos-back`); the
44px-tall app bar has room.

## F8 — Both coverflow videos autoplay simultaneously behind the home screen — POLISH
**Screen:** Home coverflow
**What's wrong:** `dogs-run.mp4` and `climbing.mp4` are both `playing` (readyState 4,
`paused:false`) at once, even while off-center and faded, and even before the user swipes to
them. Minor battery/decoder cost and slightly against the "only the visible one is alive" intent
elsewhere in the codebase.
**Where:** `os/app-media.js` mobile coverflow — `cards.forEach(... v.play())` plays every video
unconditionally (desktop version only plays the centered card).
**Suggested fix:** Play only the centered (and maybe ±1) video; pause the rest, mirroring the
desktop `layout()` behavior. Videos are already `muted loop playsinline`.

## F9 — Hero type scale is inconsistent across mobile screens — POLISH
**Screen:** Cross-screen (Home vs apps vs demos)
**What's wrong:** The "hero" title size differs per screen with no clear hierarchy rule: Home
greeting `h1` = **24px**, Aminal/Contact `.m-title` = **32px**, Freak/Backline `.mos-demo-h` =
**22px**. Three hero sizes make the set feel less like one system, and the home greeting (the
entry point) is the smallest.
**Where:** `os/mobile.css` `.mos-greet h1` (24px); `os/app-media.js` `.m-title` (32px);
`os/mobile.css` `.mos-demo-h` (22px).
**Suggested fix:** Adopt one hero step (e.g. 28–32px) for screen titles and treat the demo
titles consistently; at minimum lift the home greeting so it doesn't read as the smallest hero.

---

## Verified working / not issues
- **No horizontal overflow** at 390 or 360 on any screen or inside either demo iframe.
- **Open/close transition + back nav**: iOS-style scale-spring open, back chevron and
  home-indicator return both function; no layout shift or broken gesture observed.
- **Coverflow reflow "glitch"** the code comments worried about is handled — `.moscf-head` and
  `.moscf-stage` are fixed-height, so a 1↔2 line caption swap does not reflow the carousel.
- **Contact form**: inputs are 16px (no iOS focus-zoom), Send/links are 54px targets, real
  Formsubmit wiring intact.
- **Media loads**: all 12 coverflow images `complete` with `naturalWidth 1500`; both videos
  decoded (readyState 4). No placeholders/broken assets.
- **Backline demo** reflows to a clean single-column, phone-native layout (contrast with F2).
- **Desktop 1440×900**: intact, no mobile CSS/DOM leaked, zero console errors.

## Severity summary
- **MAJOR:** F1 (home dead gap), F2 (Freak demo desktop-y/illegible), F3 (dock labels truncated)
- **MINOR:** F4 (10.5px labels), F5 (tiny 14-dot pager), F6 (Aminal YT icon artifact),
  F7 (back chevron 36px tall)
- **POLISH:** F8 (dual video autoplay), F9 (hero type-scale inconsistency)
