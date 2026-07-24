# AlecOS — Mobile QA Audit Brief

Audit the MOBILE experience of this portfolio site for UI/UX mistakes and quality issues, and
write a structured findings report. You are QA — FIND and DOCUMENT problems precisely; a separate
developer will fix them. Do NOT edit site code (only write the report file).

## The site
Vanilla HTML/CSS/JS, no build. Served at http://127.0.0.1:8777/ (confirm homepage <title> is
"Alec Lewis — audio software & automation"; if another site, the port was hijacked — start your
own static server at the repo root). Mobile activates at ≤860px wide (`AlecOS.isMobile()`).

Mobile experience = an iPhone-style home: status area removed (real OS shows time), a greeting
("Portfolio / Alec Lewis"), a **Photos 3D coverflow** (swipe to spin; videos autoplay), then an
**app dock** (Freak-Quencies, Backline, Aminal House, Mail). Tapping a dock app opens it
full-screen with a back chevron; Freak/Backline embed their real demos inline; Aminal is a
dashboard; Contact is a working form. Mobile code: os/wm.js (mobile shell), os/mobile.css, and
`AlecOS.isMobile()` branches in os/app-media.js / os/app-freak.js / os/app-backline.js. The demos
are freak-demo/index.html (?embed=1) and backline-demo/index.html.

## CRITICAL — how to actually SEE mobile (or your audit is worthless)
Headless `--window-size=390` LIES: Chrome clamps to ~500px min width and crops the screenshot, so
overflow/layout looks fake. You MUST audit at TRUE device metrics. Two reliable methods (use one,
verify it's really 390px via innerWidth):
1. CDP: launch chrome with `--remote-debugging-port=9222`, then a Node script over the DevTools
   websocket sends `Emulation.setDeviceMetricsOverride {width:390,height:844,deviceScaleFactor:2,
   mobile:true}` + `Emulation.setTouchEmulationEnabled` then `Page.captureScreenshot`. (Node has no
   ws module — implement the WS handshake with built-in net/crypto, OR use a fixed-size iframe
   wrapper: an in-repo .html with `<iframe width=390 src="/">` inside a wider window — the iframe
   lays out at true 390 CSS px and headless captures it faithfully.)
2. The iframe-wrapper method is simplest and reliable — use it. Test 390 AND 360 wide.
NOTE: the Freak/Backline demo canvases HANG a screenshot. For those, audit STRUCTURALLY (compare
scrollWidth vs innerWidth for horizontal overflow; check computed font-sizes ≥11px; check control
box sizes ≥44px; read the DOM) and note you couldn't get a pixel screenshot.

Chrome: "/c/Program Files/Google/Chrome/Application/chrome.exe". Node available.

## What to audit (UI/UX lens) — every mobile screen at 390 AND 360
Home (greeting + coverflow + dock), the Photos coverflow while swiping (glitch? caption/photo
alignment? video playing? spacing? dots?), each opened app (Freak demo, Backline demo, Aminal
dashboard, Contact form), the app-open/close transition, the back navigation. For each, check:
- **Overflow / clipping**: anything past the right edge, cut off, or causing horizontal scroll.
- **Alignment & spacing**: inconsistent gutters, things too close/cramped or floating with dead
  gaps, misaligned text vs. content, off-center elements.
- **Visual hierarchy**: is the important thing the hero? competing headings? illegible/tiny text
  (<11px)? poor contrast?
- **Touch targets**: interactive elements < ~44px; things hard to tap.
- **Consistency**: do the screens feel like one designed system (spacing scale, type, radius,
  color) or mismatched?
- **Motion/interaction**: janky/glitchy scroll, pop-in, layout shift, broken gestures.
- **Broken content**: images/videos not loading, empty states, placeholder text, dead controls.
- **The demos specifically**: do Freak-Quencies & Backline look phone-native and clean, or
  cramped/desktop-y? (structural audit if the canvas hangs screenshots.)
Also do a quick DESKTOP sanity check at 1440×900 that nothing mobile leaked and it's intact.

## Deliverable — write `C:\Users\alecl\Website\os\QA-FINDINGS.md`
A structured, developer-actionable report. For EACH finding:
- **ID** (F1, F2, …), **Screen**, **Severity** (blocker / major / minor / polish),
- **What's wrong** (specific, with the true-390 evidence: measured overflow px, computed size,
  screenshot observation),
- **Where** (the file + class/element likely responsible — you read the code, so point to it),
- **Suggested fix** (UI/UX-informed, concrete).
Rank most-severe first. Be precise and honest; if you couldn't verify something (e.g. freak canvas
pixels), say so. Confirm zero console errors or list any. This report is the developer's punch-list.

Do NOT edit any site file except creating QA-FINDINGS.md. Clean up harness/screenshot files you make.
