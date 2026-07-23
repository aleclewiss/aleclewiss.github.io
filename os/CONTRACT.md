# AlecOS — build contract

We are building the personal site of **Alec Lewis** as a **real, usable desktop OS** in the browser.
Not a scroll movie. A desktop you can actually operate: boot → name on the monitor → push into the
screen → a live desktop with a menu bar, dock, and draggable/focusable windows. Each window is one of
Alec's real projects. Two windows launch his **actual interactive demos**. There's also a cinematic
**guided tour** that auto-drives the desktop for people who'd rather watch. It must feel like using a
beautiful computer, and the UI/UX must be impeccable.

Served from the repo root on GitHub Pages. Vanilla HTML/CSS/JS, no build step, no framework, no npm.

---

## Files & ownership (do NOT edit files you don't own)

- `index.html` — **INTEGRATOR (Alec's lead)** owns. Loads CSS then scripts in order:
  `os/tokens.css`, `os/wm.css`, `os/wm.js`, `os/app-freak.js`, `os/app-backline.js`, `os/app-media.js`.
- `os/tokens.css`, `os/wm.css`, `os/wm.js` — **SHELL agent**. Window manager, boot, desktop, menu bar,
  dock, cursor, focus/drag/z-order, the guided-tour engine, mobile + reduced-motion.
- `os/app-freak.js` — **FREAK agent**. The Ableton + Freak-Quencies window.
- `os/app-backline.js` — **BACKLINE agent**. The Backline window.
- `os/app-media.js` — **MEDIA agent**. Three windows: Aminal House (YouTube), Photos, Contact (Mail).

Each app file is ONE call to `AlecOS.registerApp({...})` (media file makes three calls). Nothing else.

---

## The window-manager API (SHELL implements, apps consume)

`wm.js` defines `window.AlecOS` before any app script runs. Apps call:

```js
AlecOS.registerApp({
  id: "backline",                       // unique slug
  name: "Backline",                     // titlebar + menu-bar app name
  accent: "#d3a24c",                    // this app's accent (see palette)
  dock: { glyph: "B", tone: "#d3a24c" },// dock icon: single glyph OR {img:"assets/..."} 
  rect: { x: 660, y: 90, w: 520, h: 420},// default position/size in DESKTOP px (desktop is 1440×900 design units, scales)
  minSize: { w: 380, h: 300 },
  build(ctx) {
    // ctx.body : empty DOM element to fill with this app's UI (position/scroll handled by WM)
    // ctx.win  : the window element (for rare cases)
    // ctx.launchDemo(url) : mounts an <iframe src=url> click-to-load safe (see DEMOS)
    // ctx.accent : the accent string
    // return optional hooks: { onOpen(), onFocus(), onBlur(), onClose(), onResize(w,h) }
  },
  tour: [                               // guided-tour beats for THIS app (WM drives them)
    { focus: ".bl-generate",            // CSS selector inside ctx.body to spotlight (optional)
      title: "Describe a sound",
      body: "Plain language in, real audio out.",
      click: true }                     // if true, WM shows a click ripple on the focus target
  ]
})
```

WM guarantees: apps are registered by the time `AlecOS.boot()` runs. WM builds each window lazily the
first time it opens (call `ctx.build` once), then keeps it. Windows can be opened from the dock, from
`AlecOS.open(id)`, or by the tour.

**Global helpers apps may use:** `AlecOS.open(id)`, `AlecOS.focus(id)`, `AlecOS.close(id)`,
`AlecOS.on(event, fn)` (events: `"open"`,`"focus"`,`"tour:beat"`). Keep app code self-contained otherwise.

---

## Design system (tokens.css — SHELL defines, everyone uses)

Dark, premium, tactile. Think a beautifully art-directed macOS, not a copy. CSS custom properties:

- `--bg:#08080B` desktop void · `--wall` a deep aurora wallpaper gradient (violet/charcoal)
- `--surface:#161619` window body · `--surface-2:#1E1E23` · `--titlebar:#212127`
- `--ink:#F2F0F5` · `--muted:#9A94A0` · `--dim:#6B6570` · `--line:#2A2A32`
- Per-app accents: **Ableton/Freak `--amber:#ecc270` + `--amber-2:#d3a24c`**,
  **Backline `--gold:#d3a24c`** (warm, matches the real demo), **Aminal/YouTube `--red:#ff0033`**,
  **Photos `--pink:#E1306C`**, **system/Contact `--amber`**.
- Type: system stack for UI (`-apple-system,"Segoe UI",Roboto,sans-serif`), a mono
  (`ui-monospace,"SF Mono",Menlo,monospace`) for labels/metadata/timestamps. A big display weight (800)
  for the name/boot. No webfonts required; if you add one, self-host or Google Fonts with `display=swap`.
- Radius: windows 12–14px, controls 6–8px. Shadows: soft, layered, big blur, low opacity.
- Motion: quick and physical. Windows open with a scale+fade (~220ms), focus raises + brightens.
  Everything respects `@media (prefers-reduced-motion: reduce)`.

Traffic-light window controls (close #FF5F57 / min #FEBC2E / zoom #28C840) are standard and expected.

---

## Boot & tour (SHELL)

1. **Boot:** open on the physical **monitor** (bezel, stand, desk, dark room). The screen shows
   **“Alec Lewis” / “AUDIO SOFTWARE · AUTOMATION”**. A hint: “click to wake” or auto-advance.
2. **Push in:** camera pushes toward the screen; the name dissolves; the live desktop is revealed
   underneath (menu bar, wallpaper, dock, a couple of windows already open). This is the wow moment —
   make the hand-off seamless.
3. **Usable desktop:** menu bar with live clock + current app name; dock that opens/bounces apps;
   windows drag by titlebar, focus on click (raise + subtle glow, others dim slightly), traffic lights
   work (close/minimize; zoom optional). A custom cursor is a nice touch but the real OS cursor is fine.
4. **Guided tour:** a persistent “▶ Take the tour” control. Running it auto-drives: opens each app in
   order, moves a visible cursor to it, shows a click ripple, focuses the window, and surfaces that
   app's `tour` beats as elegant captions, then moves on. Order: Freak → Backline → Aminal → Photos →
   Contact. The user can grab control at any time (any interaction cancels the tour).
5. **Mobile:** no free-drag desktop. Degrade to a clean full-screen app switcher — a dock/home grid of
   the apps; tapping opens one app full-screen with a back affordance. Keep it gorgeous and usable.
6. **A11y:** keyboard operable (Tab through dock + window controls, Esc closes focused window), visible
   focus rings, real `alt` text, honor reduced-motion (no auto-push; boot resolves to the desktop
   statically; tour still available but instant transitions).

---

## The apps (real content only — nothing invented except clearly-labeled flavor)

### 1 · Ableton + Freak-Quencies  (FREAK agent) — accent amber
The story: a guitar take that needs mixing, and the plugin that mixes it. Window titled
`Ableton Live 12 — bedroom-take.als`. Show a convincing DAW: a few named tracks
(1 Gtr DI, 2 Gtr Amp, 3 Drums, 4 Bass, 5 Keys, 6 Vox) with clip blocks + a playhead; below, a device
rack containing the **Freak-Quencies** plugin — a live 6-band EQ curve, labeled knobs
(LOW LMID MID HMID PRES AIR · THR RATIO ATK REL MIX OUT), and moving VU meters. A primary button
**“Launch the plugin demo”** calls `ctx.launchDemo("freak-demo/index.html?embed=1")`.
Stack: JUCE / C++ · PyTorch · Web Audio · Ableton Live. Source: github.com/aleclewiss/Freak-Quencies.
⚠️ **The freak demo CRASHES the tab if its iframe auto-loads. It MUST be click-to-load — never set the
iframe src on build. Use `ctx.launchDemo(...)` which the SHELL implements as click-to-load.**

### 2 · Backline  (BACKLINE agent) — accent warm gold
The co-producer next to Ableton. Window titled `Backline`. Match the real demo's warm palette
(gold #ecc270/#d3a24c on brown-black #161311, coral #e08167, ok-green #7bb98a). Composer field
“DESCRIBE THE SOUND”, BPM/KEY params, a gold **Generate** button, a **Takes** list, and a player bar.
Use the **real take data** below (waveforms can be stylized bars). A button **“Launch the real demo”**
calls `ctx.launchDemo("backline-demo/index.html")` (this one is safe to load, but still route through
launchDemo for consistency). Stack: Electron · React · ACE-Step · Max for Live.
Source: github.com/aleclewiss/backline. Real takes:
- acoustic guitar — “heartfelt acoustic guitar, warm fingerpicking, intimate” — 88 BPM · G maj · 0:27
- tropical house — “tropical house synth, sunny plucks, beach club groove” — 93 BPM · D maj · 0:25
- indie guitar — “jangly indie guitar, bright chiming strums, driving” — 135 BPM · E maj · 0:28
- pop lead synth — “modern pop lead synth, glossy hook, radio sheen” — 92 BPM · A maj · 0:26

### 3 · Aminal House  (MEDIA agent, window A) — accent red
A YouTube channel page. Header: 🐶 avatar, **Aminal House**, `@Aminal_House · 321 subscribers ·
108 videos`, tagline “you're in the aminal.house now 🐾”, white **Subscribe** button linking to
`https://www.youtube.com/@Aminal_House?sub_confirmation=1`. A **Shorts** row of the six real videos
(thumbnail `https://i.ytimg.com/vi/<ID>/hqdefault.jpg`, title, views) — each links to
`https://www.youtube.com/watch?v=<ID>`. A stats strip: **108** shorts · **177,653** views · **0** hands
on deck. One line: every short posted to YouTube/TikTok/Instagram/Facebook from a single job.
Real videos (ID · title · views):
`6_kjs4aNw_s` Goldens are so adorable 36K · `06zBHnTDSUQ` Dachshunds are built different 17K ·
`wqiywAoppdk` Dachshund 4.9K · `d6_QjHM7b6Q` Bear, Raven, and Wolf 4.8K ·
`0TQ_3SqfWJo` German shepherds 4.7K · `M3GPqLDo6t0` Pugs 4.1K. Pipeline stack: Python · CLIP ·
ElevenLabs · FFmpeg. Source: github.com/aleclewiss/aminal-house-pipeline.

### 4 · Photos  (MEDIA agent, window B) — accent pink
A photos/gallery app titled `alec lewis — photos`. Small profile header (avatar = gf-and-me.jpg crop,
“alec lewis”, “State College, PA · guitars, dogs, rocks”). A real grid from `assets/personal/`:
`gf-and-me.jpg`, `dogs.jpg`, `photo-trestle.jpg`, `photo-waterfall.jpg`, `photo-pines.jpg`,
`photo-lightpaint.jpg`, `photo-dachshund-field.jpg`, `photo-dachshund-fence.jpg`, `photo-duckling.jpg`,
`duck-gravel.jpg`, `photo-guitars.jpg`, `moto.jpg`. Use CSS `object-fit:cover` for square tiles; real
`alt` text. Two short videos exist too (`climbing.mp4`+`climbing-poster.jpg`,
`dogs-run.mp4`+`dogs-run-poster.jpg`) — include as poster tiles that play on click (muted loop);
`preload="none"`. Clicking a tile opens a simple lightbox within the window. Caption vibe, first person,
dry. This is the “off the clock” side: bouldering, photography, two dogs, one very patient girlfriend.

### 5 · Contact  (MEDIA agent, window C) — accent amber
A Mail “New Message” compose window. To: `aleclewis@psu.edu` (real mailto link on a Send button/row).
Subject: “say hi”. A short friendly draft in Alec's voice. Links: GitHub `github.com/aleclewiss`,
YouTube `@Aminal_House`. Bio facts: AI + IT at Penn State, BIS from Pitt '24, State College PA.

---

## Personal facts (retain everywhere, never invent beyond flavor captions)
Alec Lewis · State College, PA · girlfriend + two dogs (a scruffy terrier + a dachshund) · raised ducks
· bouldering · photography · guitar · a motorcycle · AI + IT at Penn State · BIS from Pitt '24 ·
email aleclewis@psu.edu · GitHub aleclewiss.

## Quality bar (everyone)
Real content only. No layout shift (set sizes / aspect-ratios). Lazy-load offscreen media. Keyboard +
focus states. Reduced-motion fallbacks. Cross-browser. It should look like something that would win an
Awwward — considered spacing, type hierarchy, restrained motion, cohesive across the five apps while
each keeps its own identity. When in doubt, make it calmer and more precise, not busier.

---

# REALISM PASS v2  (2026-07-21 — supersedes conflicting parts above)

Direction from Alec: *"No emojis. Genuine icons. A more realistic Mac feel. Ableton needs to look
so realistic. Freak-Quencies should be appearing. Make it actually feel like a desktop — look super
real, like real life. Scroll takes you through a desktop tour (NOT user-controlled). Start with me and
my galleries/hobbies. Best looking UI ever."*

## The five hard rules
1. **NO EMOJIS ANYWHERE.** Every glyph is a genuine hand-built SVG — app icons, dock, menu-bar status
   glyphs, avatars. A dog/avatar becomes a drawn SVG mark or a real photo crop, never an emoji. Audit
   your output for any remaining emoji before finishing.
2. **HYPER-REALISTIC macOS.** Not a stylized nod — it should read as a real Mac. Real menu bar (Apple
   logo mark, **bold active-app name**, that app's menus, right cluster: control-center / battery /
   wifi / spotlight / clock), a real **dock** (rounded-rect tiles with subtle top highlight + gradient
   + drop shadow + floor reflection; active/parked dot; label on the focused one), real **window chrome**
   (traffic lights showing ×/–/+ glyphs when you hover the cluster, 1px inner light border, layered
   soft shadows, faint titlebar gradient/vibrancy).
3. **SCROLL-DRIVEN CINEMATIC TOUR — not free control.** The visitor scrolls; a Van Wijk zoom-and-pan
   camera flies across a large fixed desktop plane and **holds** on each app with an elegant caption,
   eased travel between. Implement the camera as a CSS transform (translate+scale) on the work/desktop
   plane so DOM content stays crisp when zoomed. The menu bar + dock stay viewport-fixed (they don't
   move with the plane) — like a real OS. Free dragging is no longer the primary mode; you may keep it
   as a quiet bonus but scroll owns navigation. Respect reduced-motion (snap between stops, no push-in)
   and mobile (one app full-screen at a time, sw`ipe/scroll advances).
4. **Tour order starts PERSONAL:** `photos (me/hobbies) → freak (Ableton) → backline → aminal → contact`.
   Boot (monitor → "Alec Lewis / AUDIO SOFTWARE · AUTOMATION" → push into the screen) lands first on
   **Photos**.
5. **Freak-Quencies APPEARS.** At the Ableton beat, the Freak-Quencies device animates INTO the device
   chain (slide+fade+scale, ~500ms) as if just added to the rack — not statically present on load.

## Desktop plane & layout
Large fixed plane, design space **3200 × 2000** units. Windows are real DOM placed at authored `rect`s
(no overlap). Suggested spread so the tour path flows personal→work→contact:
- photos  → `rect:{x:140,  y:150,  w:1120, h:820}`
- freak   → `rect:{x:1420, y:120,  w:1500, h:1000}`  (the big centerpiece)
- backline→ `rect:{x:2360, y:1180, w:640,  h:720}`
- aminal  → `rect:{x:1180, y:1150, w:900,  h:720}`
- contact → `rect:{x:200,  y:1180, w:720,  h:560}`
(Shell may refine, but keep the personal→work→contact reading order and no overlaps.) Windows need not
drag; keep focus visuals. Demos stay **click-to-load buttons** at their stop (freak-crash rule stands).

## API addition (SHELL implements, apps provide)
`registerApp` now takes `dock:{ svg:"<svg viewBox=…>…</svg>", tone:"#rrggbb", label:"Ableton" }` — a
genuine SVG icon string the shell renders as a realistic dock tile. Everything else in the API is
unchanged. Camera stops are derived from each app's window rect in tour order; each app's `tour[0]`
title/body is the caption shown on its main hold (extra beats optional).

## Per-app realism bar
- **Photos — app-media.js — THE OPENER (most important).** A gorgeous macOS **Photos** app: left
  sidebar (Library / Memories / People / Places, then Albums: **Dogs, Climbing, Photography, Ducks**),
  a main justified grid of the real `assets/personal/` photos, a toolbar, and a header with Alec's real
  face (a crop of `gf-and-me.jpg`, rounded) — NOT an emoji. Clicking an album filters the grid; a
  lightbox for a photo (the two videos play muted-loop). First impression of the whole site — make it
  stunning and unmistakably Photos.
- **Ableton — app-freak.js.** Must read as real **Ableton Live 12** (Arrangement view): near-black
  `#1c1c1c` panels; left **browser sidebar** (Sounds, Drums, Instruments, Audio Effects, MIDI Effects,
  Max for Live, Plug-ins…); top **transport** (tempo 124.00, 4/4, metronome, play/stop/record, CPU
  meter); **arrangement** with horizontal tracks (1 Gtr DI … + returns/master) carrying real-looking
  audio **clips with waveforms** on a timeline + a moving playhead; track headers with mini mixer
  (vol/pan, solo/mute/arm). A bottom **device chain** on the selected track where **Freak-Quencies**
  (a Max-for-Live-style device: header "Freak-Quencies", 6-band EQ display, macro knobs, chain of
  EQ→Comp) **animates in** on the tour beat. Ableton logo as the dock `svg`. "Launch the plugin demo"
  → `ctx.launchDemo("freak-demo/index.html?embed=1")` (CLICK-TO-LOAD ONLY — it crashes the tab if the
  iframe src is set on load; see [[freak-demo-iframe-crash]]).
- **Backline — app-backline.js.** Keep the warm-gold identity; push fidelity: real window chrome (from
  shell), crisp type/spacing, real SVG transport icons (play/pause/scrub) not text glyphs, the four real
  takes. `ctx.launchDemo("backline-demo/index.html")`. Genuine SVG dock icon.
- **Aminal House — app-media.js.** Realistic YouTube: real red play-button logo SVG (no emoji), the dog
  avatar as a drawn SVG mark or photo, real thumbnails/stats/links exactly as before.
- **Contact — app-media.js.** Realistic macOS **Mail** compose window; real SVG toolbar icons; real
  mailto Send.

Quality bar unchanged (real content, no layout shift, a11y, reduced-motion). Goal: the best-looking,
most real desktop we can ship. When unsure, add realism and restraint, not decoration.

---

# PRESENTATION v3 — ONE APP AT A TIME + BUTTERY TRANSITIONS  (2026-07-21, supersedes the pan-across-plane camera)

Alec: "too much on the screen at once. lets do one at a time and then do a smooth transition to the next.
make the transitions smoother." So we drop the "pan across a plane of 5 open windows" model. New model:

## The model (macOS "Spaces")
- Exactly **ONE app is in focus and visible at a time**, presented large & centered on the (real aurora)
  wallpaper — like a full-screen macOS Space. No other windows visible behind it.
- **Scroll drives a smooth, premium transition to the next app** and back. Order stays personal-first:
  `photos → freak → backline → aminal → contact`.
- The transition must feel BUTTERY: eased, physical, no jank. Recommended = a horizontal "Spaces swipe"
  (the current app slides/scales out while the next slides/scales in, cross-dissolving, with a slight
  depth cue — outgoing app dips to ~0.94 scale + fades, incoming rises from ~0.96 to 1). Lerp the
  transform toward the scroll position (no hard snapping) so mid-scroll is smooth and controllable.
  You may instead use a refined cross-dissolve + gentle zoom if it feels better — pick what's smoothest.
- Menu bar (fixed) + dock (fixed) stay put like a real OS; the active-app name + dock active dot update
  to the focused app. Dock click / keyboard = smooth-transition to that app.
- The boot (photo monitor → zoom through the screen) hands off to app #1 (photos) already in focus.
- Sizing: each app is presented at a comfortable large size centered on the wallpaper (NOT necessarily
  edge-to-edge). Photos / Ableton / Aminal can be big (up to ~1180×760). Backline / Contact are smaller
  centered windows (~560–720 wide). Keep real window chrome (traffic lights, titlebar) — it reads real.
- The live demo for the focused app auto-loads (already implemented via autoLoadDemos on focus).
- Reduced-motion: instant switch between apps (no slide/scale), scroll still advances. Mobile: one app
  full-screen, scroll/swipe advances, dock becomes a bottom bar.
- Keep the beautiful aurora wallpaper (`assets/wallpaper.jpg`) + vibrancy chrome + dock magnification +
  the operating cursor (the pointer may glide + click the focused app as it settles — keep it subtle).

## Ownership for this pass (same files)
- **SHELL** (`os/wm.js`, `os/wm.css`, `os/tokens.css` if needed): replace the pan-camera presentation
  with the one-app-at-a-time Spaces engine + buttery scroll transitions above. Keep the whole public
  API (`registerApp/open/focus/close/on/boot/goTo/isMobile`), `ctx` shape, `launchDemo` click-to-load,
  boot photo sequence, menu bar, dock (magnify + click-to-go), cursor, reduced-motion, mobile. The apps
  don't change how they build — they still fill `ctx.body`; the shell just presents one at a time.
- **FREAK/BACKLINE/MEDIA** (`os/app-freak.js` / `os/app-backline.js` / `os/app-media.js`): make each app
  look its best at the larger, centered, one-at-a-time presentation — refine spacing/scale so it fills
  its presented size gracefully (responsive to the body size the shell gives it), and give a tasteful
  entrance (content can fade/rise in when the app becomes focused via the onFocus hook). No emoji (SVG
  only). Keep all real data + demo launch. Don't touch other files.

Goal: it should feel like smoothly switching between full-screen apps on a real, beautiful Mac — one
clean thing at a time, gorgeous transitions.

---

# v4 — EXPERT REVIEW & POLISH PASS  (2026-07-22)

Alec loves the build and wants domain experts to review + FIX (advise AND execute). His notes:
- **LOVED — do NOT change the feel of:** the aurora wallpaper, the dock icons, the window chrome, the
  Spaces transitions. Preserve these. Refine only with a light touch; never regress them.
- **FIX:** (1) the **real demos must actually SHOW** (Freak-Quencies + Backline running embedded, not
  just a launch button — auto-load on focus, and make it robust). (2) **content** reviewed again for
  accuracy + voice across every app. (3) **UX** made thorough + enriched (affordances, feedback,
  keyboard, focus, scroll clarity, empty/loading states, a11y, reduced-motion, mobile). (4) **UI** looked
  at & well-thought — spacing/type/hierarchy/detail, consistent across the 5 apps. (5) the generated
  **cursor is "eh" — replace or remove it** (prefer the real OS cursor, or a genuinely tasteful custom
  one; the current fake arrow must go). (6) the **start/boot page** made better — more considered.

Each expert owns ONE area/file (no cross-file edits — avoids collisions). Report a short PLAN then the
fixes you executed. Real content only. No emoji (SVG only). Keep the public AlecOS API + ctx shape +
launchDemo + boot photo + wallpaper + dock + one-at-a-time Spaces model intact.

- **SHELL / interaction+motion+boot expert** → `os/wm.js`, `os/wm.css`, `os/tokens.css`.
- **Ableton/Freak product+content** → `os/app-freak.js`.
- **Backline product+content** → `os/app-backline.js`.
- **Photos/Aminal/Contact product+content** → `os/app-media.js`.
