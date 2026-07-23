# AlecOS — Targeted Fixes Brief

Three specific issues to fix. This is a settled, LIVE site (GitHub Pages) — surgical fixes
only, do NOT redesign, rename, or rewrite copy. Preserve the look, wording, transitions,
coverflow, contact form, logo, and the spacious 100% composition.

## The three issues
1. **PERFORMANCE — still not smooth enough on other/weaker devices.** It improved (we already
   removed a per-frame `blur()` and idle-pause the rAF loop), but push further. Suspects: the
   backdrop-filter vibrancy blur on the menu bar (blur 18px saturate) and dock (blur 22px+
   magnification), large `box-shadow`s that repaint, the per-frame `filter`/`transform`/`opacity`
   writes in `render()`/`placeSpace()`, the coverflow card `box-shadow`s + `is-side` brightness
   filter, autoplay videos. Reduce paint/composite cost, add GPU-compositing hints where they
   help (`transform: translateZ(0)` / `will-change` used sparingly), avoid layout thrash. Goal:
   smoother scroll + spin on mid/low-end hardware without changing the look.
2. **TEXT COLLIDING WITH WINDOWS — Backline tags run INTO the window.** In the Backline window,
   some tag/label text overflows or overlaps the window content/edges. Find it and fix the
   layout so nothing collides or spills. (Look at the composer chips / tech tags / take metadata.)
3. **FREAK DEMO SCROLLS — must not.** The embedded Freak-Quencies demo (freak-demo/index.html?embed=1,
   mounted in `#fqStage`) shows an internal scrollbar / scrolls. The demo must FIT its frame with
   NO internal scrolling. Fix by making the embed fit (freak-demo embed CSS) and/or sizing the
   stage so the demo's content fits without overflow. The Freak window is currently 1280×760.

## LOCKED — do not change
Wording/copy, section structure, the coverflow scroll-to-spin, autoplay videos, working Contact
form, real Aminal logo, transitions feel, wallpaper/dock/menu-bar LOOK (you may reduce blur radius
for perf but keep the vibrancy feel), cache-busting `?v=` tags. No emoji. Keep `node --check`
clean on every JS file. Zero console errors.

## QA
Local server http://127.0.0.1:8777/. Screenshot recipe (force reduced-motion + no-anim so the
stage renders; focus an app):
`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --force-prefers-reduced-motion --user-data-dir=$(mktemp -d) --window-size=1920,953 --virtual-time-budget=3000 --screenshot=OUT.png URL`
Harness: loads tokens.css+wm.css+wm.js+app JS, `AlecOS.boot()`, add class `no-anim` to `.aos-root`,
`AlecOS.focus('<id>')`, `scrollTo(0,0)`. Test 1366×768 AND 1920×953.
NOTE: the Freak/Backline embedded demo canvases HANG headless screenshots — for those, verify via
computed styles / `getBoundingClientRect` / `scrollHeight` vs `clientHeight` (to detect overflow),
not screenshots.

## File ownership (STRICT)
- **Performance expert** → `os/wm.js` + `os/wm.css` ONLY.
- **Bug-fix expert** → `os/app-freak.js` + `os/app-backline.js` + `freak-demo/index.html` ONLY.

Be surgical + token-efficient: targeted edits, `node --check` once at the end, minimal screenshots,
then stop and report exactly what changed (values before→after) and how you verified.
