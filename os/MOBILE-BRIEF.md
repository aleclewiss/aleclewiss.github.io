# AlecOS — Mobile REBUILD Brief (continuous horizontal swipe)

REPLACE the current mobile experience (home-screen grid + tap-to-open) with a single
**continuous horizontal swipe pager** — the mobile mirror of the desktop's horizontal Spaces,
but touch-native. Same idea as desktop: one thing on screen at a time, swipe left/right (both
directions) to move through everything.

## The model (what to build)
- Mobile = ONE full-screen **horizontal scroll-snap pager** (native touch swipe + momentum,
  `scroll-snap-type: x mandatory`, each page = 100vw, `scroll-snap-align:start`). Swipes both
  directions. This is the whole experience — NO home-screen-of-icons, NO tap-to-open-a-screen.
- **Page order (one continuous swipe):**
  `[ photo 1 ][ photo 2 ] … [ photo N ]  →  [ Freak-Quencies ]  →  [ Backline ]  →  [ Aminal House ]  →  [ Contact ]`
  The **gallery is FIRST** — you swipe through each photo, then keep swiping into the projects.
- **Each photo** is its own full-screen slide: the image fills nicely, with its caption + the
  section label (Me & my girlfriend / My doggies / My hobbies). Videos autoplay muted when
  their slide is active (pause when off-screen for perf).
- **Freak-Quencies & Backline**: the real demo is **EMBEDDED INLINE** on the page (like desktop)
  — NOT a button that opens a new screen. Include a short title/desc above it. LAZY-LOAD the
  demo iframe (set its `src` only when that page is active or adjacent) so swiping stays smooth
  and heavy canvases don't all load at once.
- **Aminal House**: the automation dashboard as one full-screen page (stats, pipeline, Watch
  button), single column, no horizontal overflow.
- **Contact**: the working Formsubmit form as one full-screen page (To / From / message / Send,
  GitHub + LinkedIn), big touch targets, send still works.
- Keep an **iOS status bar** on top (live time + signal/wifi/battery) and add a slim **position
  indicator** (a progress bar or small dots — 18 pages, so a bar likely reads cleaner than dots),
  plus a home-indicator bar at the bottom if it fits the feel. Safe-area insets, SF font.

## LOCKED — do not break
Desktop experience stays 100% unchanged (only the mobile / `is-mobile` path changes), all
wording/copy, the working Contact form (Formsubmit), real Aminal logo, real photos/captions,
no emoji, cache-busting `?v=` tags. `node --check` clean on every JS file; zero console errors
on BOTH mobile and desktop.

## Architecture
- `wm.js` detects mobile (`AlecOS.isMobile()`). Rebuild `buildMobile()` to construct the
  horizontal scroll-snap pager and collect the page-slides from each app in ORDER (photos first).
- Each app's mobile `build()` should produce its slide(s) as full-viewport `.mos-page` elements
  the pager can place in the single track: **Photos → many slides (one per photo)**, the other
  apps → one slide each. (You own all the files, so pick a clean way to hand slides to the pager —
  e.g., the app appends its `.mos-page`(s) into a shared track element, or exposes them for the
  shell to append. Just keep it in ONE horizontal scroll-snap track so it's one continuous swipe.)
- Perf: lazy-load demo iframes; pause off-screen videos; use an IntersectionObserver or the
  scroll position to know the active page. Respect prefers-reduced-motion.

## QA
Local http://127.0.0.1:8777/. Phone width: `--window-size=390,844` (note: headless may report a
wider innerWidth and crop the screenshot — verify structurally via DOM/geometry as well as
screenshots). `AlecOS.isMobile()` is true at ≤860px. Verify: gallery is first and you can swipe
photo→photo→…→into the projects; demos are embedded (not buttons); Contact form present + send
wired; status bar + position indicator; and DESKTOP (1440×900) is completely unchanged.

## File ownership
ONE engineer owns ALL mobile code: `os/wm.js`, `os/mobile.css`, `os/app-media.js`,
`os/app-freak.js`, `os/app-backline.js`, and may bump the `?v=` on the mobile.css link in
`index.html`. Be surgical on the desktop paths (leave them byte-for-byte); rework only mobile.
`node --check` all touched JS once at the end; report what you built.
