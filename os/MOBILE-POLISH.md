# AlecOS — Mobile POLISH punch-list

The iPhone home-screen + app model is built and correct in STRUCTURE. This pass fixes VISUAL
QUALITY on a real phone. Do NOT change the model (Springboard home → tap icon → full-screen app;
Photos = touch 3D coverflow; Freak/Backline = writeup + embedded demo; Aminal/Contact panes).
Keep desktop byte-for-byte unchanged (only `is-mobile` paths). No emoji. `node --check` clean;
zero console errors mobile + desktop. Bump the mobile.css `?v=` in index.html.

## CRITICAL: how to actually SEE mobile (prior passes missed because they didn't)
Headless `--window-size=390` LIES — Chrome renders content at a wider innerWidth and crops the
screenshot, so overflow/squish looks fake-fine or fake-broken. You MUST verify with TRUE device
metrics over CDP: drive Chrome with `Emulation.setDeviceMetricsOverride` (width:390 AND width:360,
deviceScaleFactor:2, mobile:true) and screenshot THAT. Look at every screen with your own eyes at
true 390 and 360. Every fix below must be confirmed on a real-metrics screenshot, not structural
DOM checks and not a plain --window-size screenshot.

## The four problems to fix (user's words) + what "fixed" means
1. **"The apps look so squished."** Content is cramped / possibly overflowing horizontally at true
   phone width. FIX: every mobile screen must lay out to the ACTUAL viewport width using fluid
   units (%, vw, flex, max-width:100%), NEVER fixed desktop px widths. Generous iOS spacing,
   comfortable padding (safe-area aware), nothing cut off at the right edge, no horizontal scroll.
   Check Aminal especially (stats grid + pipeline were bleeding off-screen) and Contact.
2. **"The demos need adjusting — they are condensed."** The embedded Freak/Backline demos are
   cramped. FIX: give each demo a proper, phone-appropriate size — a comfortable framed area that
   fits the screen width, with the demo scaled to be usable (readable controls, tappable). If the
   demo's native layout can't shrink gracefully, size the iframe to a sensible aspect and let it
   fill the width; adjust freak-demo/index.html embed CSS if needed so it's not tiny/condensed.
3. **"The photos look bad."** The Photos coverflow presentation is off — the active photo isn't
   nicely centered/sized, there's an awkward gap under the title, neighbors look wrong. FIX: make
   the active photo the clear hero — well-sized (fills a comfortable portion of the screen),
   vertically centered in the available area (no big dead gap between the caption and the photo),
   neighbors peeking cleanly at the edges in 3D, caption + section label tidy above it, dots
   below. It should look premium, like an Apple photos demo.
4. **"Transitions need to be smoother."** FIX: the app open/close (icon→fullscreen) and the
   coverflow spin should be buttery — use transform/opacity only (GPU), good spring/ease curves
   and durations (~0.4–0.5s open), no jank, no layout-thrash. Respect prefers-reduced-motion.

## Files
`os/wm.js`, `os/mobile.css`, `os/app-media.js`, `os/app-freak.js`, `os/app-backline.js`,
`freak-demo/index.html` (embed CSS only, if needed for the demo fit), and the `?v=` bump in
`index.html`. Report each fix with a true-390 (and 360) screenshot description as evidence, and
confirm desktop 1440×900 unchanged.
