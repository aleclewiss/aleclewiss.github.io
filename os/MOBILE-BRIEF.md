# AlecOS — Mobile REBUILD Brief (iPhone home screen + app screens)

REPLACE the current mobile experience (single continuous horizontal swipe pager) with an
**iPhone-quality home-screen + app model**. Goal: it should look and feel like an Apple iPhone
demo — a real Springboard home screen of app icons, tap an icon to open that app full-screen with
iOS motion, a back/home gesture to return. Polished, premium, native.

## The model (what to build)
1. **iOS status bar** (top, safe-area aware): live time + signal/wifi/battery SVG glyphs.
2. **Home screen (Springboard)**: the aurora wallpaper + a clean grid of large **rounded app
   icons** with labels, built from each registered app's `dock.svg` + `label`
   (Photos, Freak-Quencies, Backline, Aminal House, Mail). iOS spacing/typography, a greeting
   ("Alec Lewis"), and a **home-indicator** bar at the bottom. This must look genuinely iOS —
   real icon sizing (~60px, 18px radius), even grid, correct gaps, NOTHING clipped at any phone
   width (test 390 AND 360 wide). The 5 icons should fit cleanly (a 3-wide grid = 2 rows).
3. **Open an app**: tap an icon → the app opens **full-screen** with an iOS open animation
   (icon → view scale/spring). A slim top bar with a **back chevron** + the app title. Content
   scrolls vertically with momentum. Safe areas respected.
4. **Return home**: tap the back chevron OR tap/swipe-up the home indicator → reverse animation
   back to the Springboard.

## Per-app mobile content
- **Photos**: a **3D coverflow carousel** (like the desktop) adapted for TOUCH — the center
  photo faces you, neighbors rotate/recede in 3D, and you **swipe left/right to spin** through
  them (touch drag + momentum/snap; also works with the on-screen dots). Section label + caption
  above/under the active photo. Videos autoplay muted only when centered. Keep it smooth on a
  phone (no per-frame blur; GPU transforms only).
- **Freak-Quencies** & **Backline**: the app screen shows a short title + what-it-does, and the
  **REAL demo runs EMBEDDED inline right there**, sized to fit the phone screen and touch-usable
  (freak-demo/index.html?embed=1, backline-demo/index.html). NOT a launch button. The demo should
  fit its area with no awkward internal scroll; make it as usable as possible on a small touch
  screen (the freak-demo has an embed mode — use/adjust it so it fits a phone). Lazy-load the
  iframe src when the app opens (not before) so the home screen stays light.
- **Aminal House**: the automation dashboard in one scrollable column — stats, pipeline steps
  stacked, "Watch on YouTube" button. No horizontal overflow.
- **Contact**: the working Formsubmit form full-width (To / From input / message / Send) + GitHub
  & LinkedIn buttons, 44px+ touch targets. Send must still work.

## LOCKED — do not break
Desktop experience 100% unchanged (only the mobile / `is-mobile` path changes), all wording/copy,
the working Contact form (Formsubmit), real Aminal logo, real photos/captions, no emoji (use SVG),
cache-busting `?v=` tags. `node --check` clean on every JS file; zero console errors on BOTH
mobile and desktop.

## Architecture
- `wm.js` detects mobile (`AlecOS.isMobile()`, true at ≤860px). Rebuild the mobile shell:
  Springboard home + open/close full-screen app navigation + status bar + home indicator + iOS
  transitions. Each registered app is opened full-screen showing its mobile content.
- Each app's `build(ctx)` branches on `AlecOS.isMobile()` to render mobile content (Photos =
  touch 3D coverflow; Freak/Backline = writeup + embedded demo; Aminal/Contact = single column).
  The shell shows the app's content full-screen when its icon is tapped.
- Perf: lazy-load a demo iframe only when its app opens; pause off-screen/closed videos; no
  per-frame blur; respect prefers-reduced-motion.

## QA
Local http://127.0.0.1:8777/ (server serves this repo). Phone widths: test 390×844 AND 360×780.
Headless may report a wider innerWidth and crop screenshots, and the freak/backline demo canvases
can hang a screenshot — so ALSO verify structurally via --dump-dom: home screen has 5 app icons
none clipped, tapping opens an app full-screen, Photos has the coverflow (cards + dots), Freak/
Backline app screens contain an <iframe> (embedded), Contact has the form, window.onerror empty,
`AlecOS.isMobile()` true. Use an in-repo harness (tokens.css+wm.css+mobile.css+wm.js+3 app JS,
AlecOS.boot()) if forcing mobile headless. Confirm DESKTOP 1440×900 is byte-unchanged (menu bar +
dock + coverflow present, no mobile leak, zero errors). Clean up harness/screenshot files.

## File ownership
ONE engineer owns all mobile code: `os/wm.js`, `os/mobile.css`, `os/app-media.js`,
`os/app-freak.js`, `os/app-backline.js`, and bump the mobile.css `?v=` in `index.html`. Rework
only the mobile paths; leave desktop byte-for-byte. `node --check` all touched JS once; report
what you built + how verified.
