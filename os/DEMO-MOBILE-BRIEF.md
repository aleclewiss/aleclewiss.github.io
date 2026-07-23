# Make the Freak-Quencies & Backline demos phone-native (mobile)

Two interactive demos are embedded inline on the mobile version of a portfolio site:
- `freak-demo/index.html` — an AI EQ/mixing plugin (canvas EQ curve + controls). Embedded via
  `?embed=1`. ~706 lines, self-contained (inline CSS + JS + canvas).
- `backline-demo/index.html` — a music generator (prompt → generated take, waveform/player).
  ~1236 lines, self-contained.

On DESKTOP they look great. On a PHONE (embedded in the site's mobile app view) they look
desktop-y / cramped — the interfaces are wide landscape layouts (freak canvas is aspect 1280/680)
that shrink to unusable on a portrait phone, and controls are laid out for a mouse.

GOAL: when viewed on a phone (narrow width / touch), each demo should look and feel like it was
designed for the phone — reflowed for portrait, controls stacked and touch-sized (44px+ targets),
the canvas/visual sized to be readable and usable with a finger, no tiny text, no horizontal
overflow, no awkward internal scroll. Keep the demo fully FUNCTIONAL (the interaction still works).

## How they're shown on mobile (context, do not change the host)
The site's mobile shell (os/wm.js + os/mobile.css) opens each demo full-screen in an app view and
embeds the demo in an `<iframe>` that fills the area below a slim top bar. So the demo's own page
is what needs to be responsive. The freak demo already has an `html.embed` mode and some
`@media (max-width:600px)` / `max-aspect-ratio` rules — extend/fix these so it's genuinely
phone-native, don't just tweak.

## What to do
- Add/ís improve responsive CSS (media queries on width and/or `html.embed` + narrow) in EACH demo
  so at phone widths (≤600px, portrait): the layout stacks vertically, the primary visual (EQ
  canvas / waveform) is a comfortable size that fits the width, control rows wrap/stack, buttons
  and sliders are finger-sized (min 44px), text is legible (no sub-11px), and everything fits with
  NO horizontal scroll and minimal/again no awkward vertical scroll (it should mostly fit the
  screen; a little vertical scroll is OK if needed).
- If a canvas has a fixed pixel size / coordinate math, make sure it still renders correctly when
  the CSS box is portrait/narrow (the canvas can keep its internal resolution and be scaled via
  CSS to fit width; verify the interaction hit-testing still maps correctly — if the demo maps
  pointer coords to canvas coords using getBoundingClientRect, it'll keep working when CSS-scaled).
- Touch: ensure controls respond to touch (most do via click/pointer; verify drag interactions on
  the EQ nodes work with touch — add touch handlers or pointer events if it's mouse-only).
- Keep DESKTOP appearance/behaviour identical — gate all changes behind mobile media queries /
  embed+narrow selectors. Don't regress the desktop demo.

## Constraints
- Only edit `freak-demo/index.html` and `backline-demo/index.html`. Do NOT touch os/*.js, os/*.css,
  or index.html.
- No emoji. Keep each file a valid standalone HTML doc (balanced tags). Zero console errors.
- These are heavy canvases — don't make them heavier; responsive CSS + minimal JS for touch only.

## QA
Local server: http://127.0.0.1:8777/ (serving this repo). Open each demo directly at phone width
to see the embed/mobile layout:
`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --user-data-dir=$(mktemp -d) --window-size=390,844 --virtual-time-budget=4000 --screenshot=OUT.png "http://127.0.0.1:8777/freak-demo/index.html?embed=1"`
(and the backline one). NOTE: these canvases can HANG a screenshot — if so, verify structurally
(no element wider than the viewport: check scrollWidth vs clientWidth; controls stacked; font
sizes) via --dump-dom, and use CDP device-emulation at true 390px if you can. Also confirm the
DESKTOP view (wide) is unchanged. Report what you changed in each demo and how you verified phone
+ desktop.
