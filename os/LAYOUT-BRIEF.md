# AlecOS — Sizing & Positioning Polish Brief

Goal: a UI/UX pass on the **sizing, proportion, and positioning** of every screen so the
desktop composition feels deliberate, balanced, and consistent. This is refinement of a
settled design — **do NOT redesign, rename, or rewrite copy.** Tune sizes/positions only.

## Context (how the layout works)
- Scroll-driven macOS "Spaces": ONE app on screen at a time, on the aurora wallpaper.
- `os/wm.js` `layoutAll()` sizes each app's window from a `SIZES` map (design px) scaled to
  fit the viewport, times a `COMFORT` factor (currently 0.72) so windows never fill the
  screen (breathing room). Windows are TOP-aligned just below a reserved heading band
  (`headH`). Each app's chapter heading (`.aos-caption`) is positioned by `positionCaption()`
  just above its window, left-aligned to the window's left edge.
- Per-app content lives in `ctx.body` inside each window.

## What "good" means here
1. **Balanced at both 1366×768 (laptop) and 1920×953 (desktop).** Test both. Nothing clipped,
   nothing tiny, nothing dominating/edge-to-edge. Should read spacious, like the reference.
2. **Consistent across apps** — the heading→content gap, window scale, and left margin should
   feel the same on Photos, Freak, Backline, Aminal, Contact. No app should feel oddly
   bigger/smaller/off-center vs the others.
3. **Content sits directly under its heading** (small, even gap — no big empty vertical gap).
4. **Each app's INTERNAL content is well-proportioned** within its scaled window — not cramped,
   not swimming in empty space.

## LOCKED — do not change
- Wording/copy, section structure, the coverflow interaction (scroll-to-spin), autoplay videos,
  the working Contact form, the real Aminal logo, Motion/anime flourishes, transitions feel,
  the wallpaper/dock/menu-bar look, cache-busting `?v=` tags in index.html.
- The heading must never clip behind the menu bar on short screens (there's a clamp — keep it).
- No emoji. Keep `node --check` clean on every JS file. Zero console errors.

## QA (both agents)
Local server: http://127.0.0.1:8777/. Headless screenshot recipe (force reduced-motion so the
stage renders and use no-anim; focus an app directly):
`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --force-prefers-reduced-motion --user-data-dir=$(mktemp -d) --window-size=1920,953 --virtual-time-budget=3000 --screenshot=OUT.png URL`
Harness: a page that loads tokens.css+wm.css+wm.js+the app JS, calls `AlecOS.boot()`, adds
class `no-anim` to `.aos-root`, then `AlecOS.focus('<id>')` and `scrollTo(0,0)`.
NOTE: the Freak/Backline embedded demo canvases hang headless screenshots — verify those
structurally / via computed styles, or screenshot a different app. Test at BOTH 1366 and 1920.

## File ownership (STRICT — do not touch files you don't own)
- **Composition expert** → `os/wm.js` + `os/wm.css` ONLY. Owns: `SIZES` map, `COMFORT`, `headH`,
  `positionCaption` (heading placement/size), the heading typography, dock, menu bar, progress
  bar, the per-app window scale/position. Make the global composition balanced & consistent.
- **Per-app content expert** → `os/app-freak.js`, `os/app-backline.js`, `os/app-media.js` ONLY.
  Owns each app's INTERNAL layout/proportions (Photos coverflow card size + vertical placement,
  Freak plugin/demo framing, Backline composer/takes/demo, Aminal dashboard, Contact form).
  Do NOT touch wm.js/wm.css.

Be surgical and token-efficient: make targeted edits, `node --check` once at the end, at most a
couple of screenshots, then stop and report exactly what you changed (values before→after).
