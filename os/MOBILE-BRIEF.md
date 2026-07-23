# AlecOS — Mobile ("feels like an iPhone") Build Brief

Goal: on phones, replace the current cramped desktop-windows-in-a-column with a **genuine
iOS-feeling experience**. It should feel like picking up an iPhone: a status bar, a home
screen of app icons, tapping an icon opens that app full-screen with an iOS-style motion,
and a home indicator / swipe returns you home. Same content and story as desktop — just
presented natively for a thumb.

## The experience (what "good" is)
- **Status bar** (top): time (live), and signal/wifi/battery glyphs — iOS style, tiny, clean.
- **Home screen**: the aurora wallpaper, a grid of large rounded **app icons** (reuse each
  registered app's `dock.svg` + label): Photos, Freak-Quencies, Backline, Aminal House, Contact.
  Big friendly layout, iOS spacing. A **home indicator** bar at the very bottom.
- **Open an app**: tap an icon → it opens **full-screen** with an iOS open animation (icon
  scales up / view springs in). The app shows a large iOS title + its content, vertically
  scrollable with momentum.
- **Return home**: a home-indicator swipe-up affordance AND/OR a back control → app closes
  back to the home screen (reverse animation).
- iOS feel throughout: SF system font, large titles, rounded cards, generous touch targets
  (min ~44px), smooth spring/ease transitions, respect safe areas (`env(safe-area-inset-*)`).

## Architecture / CONTRACT (both agents build to this)
- `os/wm.js` already detects `mobile` (`AlecOS.isMobile()`), and each app is registered via
  `AlecOS.registerApp({id, name, accent, dock:{svg,label}, build(ctx), tour})`. `build(ctx)`
  populates `ctx.body` (the app's scrollable content), and `ctx.win` is the app's element.
- **Agent 1 (iOS shell)** owns the mobile SHELL in `wm.js` + a new `os/mobile.css`. On mobile,
  instead of the desktop Spaces layout, build: the status bar, the home screen (grid of the
  registered apps' icons/labels), and the open/close full-screen navigation + home indicator +
  transitions. Reuse each app's already-built `ctx.body`/window element as the full-screen
  screen (each app's content is provided by Agent 2). Keep the DESKTOP path 100% unchanged —
  only the `is-mobile` branch changes.
- **Agent 2 (mobile app content)** owns the app files. In each app's `build(ctx)`, when
  `AlecOS.isMobile()` is true, render **mobile-optimized** content into `ctx.body` (see below).
  Do NOT touch wm.js/mobile.css. Desktop content stays exactly as-is (branch on isMobile).

## Per-app mobile content (Agent 2)
- **Photos**: NOT the 3D coverflow (too heavy/awkward on touch). Instead a clean vertical,
  native feel: the sectioned photos (Me & my girlfriend / My doggies / My hobbies) as a
  swipeable horizontal strip per section OR a simple full-width stack — big images, caption
  under each, videos autoplay muted inline. Smooth, tappable.
- **Freak-Quencies** & **Backline**: do NOT embed the heavy demo iframes inline on mobile.
  Show a clean card: title, what it does, the spec line, and a big **"Open the demo ↗"** button
  that opens the full demo (freak-demo/index.html / backline-demo/index.html) — full screen
  (new view or _blank). Keep it light and fast.
- **Aminal House**: the automation dashboard reflowed to one narrow column — stats, the
  pipeline steps stacked, the "Watch on YouTube" button. No horizontal overflow.
- **Contact**: the working form full-width (To / From input / message / Send), GitHub + LinkedIn
  buttons, big touch targets. The Formsubmit send must still work.

## LOCKED — do not break
Desktop experience (only touch the mobile/`is-mobile` branch), all wording/copy, the working
Contact form (Formsubmit), real Aminal logo, autoplay video behavior, no emoji (use the SVG
icons), cache-busting `?v=` tags. `node --check` clean on every JS file; zero console errors on
both mobile AND desktop.

## QA
Local http://127.0.0.1:8777/. Emulate a phone with a narrow window + touch:
`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --window-size=390,844 --virtual-time-budget=3500 --screenshot=OUT.png URL`
(`AlecOS.isMobile()` is true at ≤860px wide.) Test the home screen, opening each app, and
returning home. NOTE: the Freak/Backline embedded demo canvases hang headless capture — on
mobile you're NOT embedding them anyway (button to open), so that's avoided; verify the button
+ links via DOM. Also test that DESKTOP (1440×900) is unchanged.

## File ownership (STRICT)
- **Agent 1 (iOS shell)** → `os/wm.js` + `os/mobile.css` (new file; remember to add it to
  index.html's <head> with a `?v=` tag — Agent 1 may edit index.html ONLY to add that one link).
- **Agent 2 (mobile content)** → `os/app-media.js` + `os/app-freak.js` + `os/app-backline.js`.

Be surgical + token-efficient. `node --check` once at the end. Report exactly what you built.
