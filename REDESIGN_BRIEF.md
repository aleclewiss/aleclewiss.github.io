# Redesign brief — aleclewis.dev

You are redesigning a personal site. Read this whole file, then **propose a design concept before writing code** (see "Process" at the bottom). The current site works but looks generic/AI-generated. The goal is a **playful, personal, hand-made** site with a real point of view — personal life first, then the work.

---

## Who this is for

**Alec Lewis** — State College, PA. Builds music software and automation.
- Voice: casual, first-person, a little dry humor. Not corporate. Never "Let's build something amazing together."
- Contact: `aleclewis@psu.edu` · GitHub `aleclewiss` · site `aleclewis.dev` (GitHub Pages repo `aleclewiss.github.io`).
- Background line he likes: "AI + IT at Penn State · BIS from Pitt '24".

**Life (lead with this):** girlfriend, two dogs (a fluffy terrier + a dachshund), rock climbing / bouldering, photography, raising ducks, guitar, a motorcycle.

**Work (comes after the personal stuff):**
- **Aminal House** — an automated dog-shorts channel. Python finds clips, CLIP verifies them, AI narrates, one job posts to YouTube/TikTok/Instagram/Facebook. ~108 shorts, ~178K views, auto-posted. Links: YouTube `@Aminal_House`, GitHub `aleclewiss/aminal-house-pipeline`.
- **Backline** — an AI co-producer for music (Electron/React/ACE-Step/Max for Live). GitHub `aleclewiss/backline`.
- **Freak-Quencies** — a JUCE/C++ plugin with a CNN that hears a guitar DI and writes an EQ+compression chain live in Ableton (PyTorch, Web Audio). GitHub `aleclewiss/Freak-Quencies`.

---

## The problem (what "vibecoded" means here — AVOID these tells)

The current site is the cliché AI look. Do **not** reach for:
- Near-black background + one neon accent (it's currently `#ff3d8a` pink) + big blurry radial-gradient glow blobs.
- A giant centered `clamp()` hero name with a generic one-line subtitle.
- A wall of identical rounded cards in an even grid that all fade-up-and-blur on scroll.
- Gradient text, glassmorphism-for-no-reason, emoji used as icons, filler copy.

Alec explicitly dislikes the pink-on-black neon look. Move somewhere with a **distinct, opinionated identity.**

---

## Direction: playful, made-by-a-person

Commit to a coherent concept, not a theme sampler. Some strong directions (pick/blend one, don't do all):

- **Scrapbook / desk**: photos as physical objects — taped or polaroid prints, slightly rotated, handwritten-style captions, a corkboard/zine feel. His hobbies pinned to a board.
- **Editorial zine**: strong characterful type, big pull quotes, asymmetric columns, page-number/marginalia details, intentional white space.
- **Warm & tactile**: off-white "paper" or a bold non-generic palette (warm gold/amber was a look he's liked before), real paper/grain texture, ink-like type — the opposite of flat dark neon.

Whatever you choose, it should have:
- A real **design system**: CSS custom properties for palette, a deliberate type scale, spacing rhythm, and 2–3 named motion principles. Comment the rationale at the top of the CSS.
- **Distinctive typography** — a characterful display face paired with a clean text face (self-host or Google Fonts; keep it fast). Not the default sans stack.
- **Personality in the details**: hand-drawn arrows/annotations, a marquee of hobbies, sticker/tilt/peel hover states, maybe a custom cursor near photos, tasteful scroll-driven motion that isn't the generic fade. Restraint > gimmick pile.
- **Copy in Alec's voice** — witty section intros and photo captions, first person.
- **Intentional asymmetry** — layouts that look composed, not templated.

---

## Structure (personal-first)

1. **Opening** — his name, the photo of him + his girlfriend, a short first-person About. Should feel like meeting a person, not a landing page.
2. **Photography** — his hobby, shown as a portfolio. **Professional/artistic shots ONLY** (see asset list). This is the "show off the craft" section — give it the most refined treatment.
3. **Climbing** — the bouldering video, featured (it's portrait/vertical — design around that, e.g. video one side, copy the other).
4. **The dogs** — a warm section for the pups (the two dachshund shots, the both-dogs photo, the running clip).
5. **The ducks** — he raised ducks; the duckling shots (+ clips if usable).
6. **Off-hours** — guitar (playing in a guitar shop) + the motorcycle.
7. **The work** — Aminal House, Backline, Freak-Quencies. Restyle these to match the new identity but **keep the interactive pieces working** (see "Preserve").

Nav should be simple and match the new vibe (not necessarily the current text links).

---

## Assets

**Web-ready, use these (already compressed, in `assets/personal/`):**
| File | What it is | Section | Dimensions |
|---|---|---|---|
| `gf-and-me.jpg` | Alec + girlfriend, riverside in autumn | Opening | 1500×1125 |
| `photo-trestle.jpg` | Railroad trestle vanishing into a valley | **Photography** | 1500×1001 |
| `photo-pines.jpg` | Looking straight up tall pines | **Photography** | 1500×1000 |
| `photo-waterfall.jpg` | Waterfall in golden light | **Photography** | 1500×1001 |
| `photo-lightpaint.jpg` | Light-painting lightning bolt (long exposure) | **Photography** | 1500×1000 |
| `climbing.mp4` + `climbing-poster.jpg` | Bouldering at a gym (portrait, silent, ~1.6MB) | Climbing | 720×1280 |
| `dogs.jpg` | Both dogs (terrier + dachshund) at a doorway | Dogs | 1500×1125 |
| `photo-dachshund-field.jpg` | Dachshund grinning in a golden field | Dogs | 1500×1000 |
| `photo-dachshund-fence.jpg` | Dachshund alert by a fence | Dogs | 1500×1000 |
| `photo-duckling.jpg` | Duckling portrait, soft bokeh | Ducks | 1500×1000 |
| `photo-guitars.jpg` | Alec playing acoustic in a guitar shop | Off-hours | 1500×1124 |

**Not yet processed** — originals live in `Pics For Personal/` (this folder is gitignored; do NOT commit it). If you want these, transcode/resize them into `assets/personal/` first (they're huge iPhone originals):
- Motorcycle photo (`IMG_1528.JPG`), two more duckling shots (`D0C573F3…`, `F4039FE0…`), a "running with the dog" clip (`IMG_1206.MP4`), and two **very dark** night duck videos (`MVI_4997`, `MVI_4998`) that need heavy brightening and may not be worth it.
- Resize recipe: `ffmpeg -i in.JPG -vf "scale=1600:1600:force_original_aspect_ratio=decrease" -q:v 3 out.jpg`
- Video recipe: `ffmpeg -i in.MP4 -vf "scale=1280:1280:force_original_aspect_ratio=decrease" -c:v libx264 -crf 28 -pix_fmt yuv420p -an -movflags +faststart out.mp4`
- `IMG_4391.CR3` is a camera RAW file — unusable on the web. Skip unless Alec exports a JPG.

Keep new images compressed and reasonably sized; the whole `assets/personal/` set should stay a few MB.

---

## Preserve (do not break these)

- **Backline demo**: `backline-demo/index.html`, embedded via `<iframe>`. It's the real UI.
- **Freak-Quencies demo**: `freak-demo/index.html?embed=1`, embedded via iframe; `script.js` auto-fits its height (same-origin). Keep that working.
- **Mixing video**: `assets/ai-mix-demo.mp4` + `assets/demo-poster.jpg` — plays with sound when scrolled into view after a user gesture. Keep the behavior.
- **Aminal**: inline YouTube player + a thumbnail strip that swaps the player, plus animated count-up stats. Keep the interactivity; restyle the shell.
- Meta/OG/favicon tags in `<head>`, and the `assets/` icons.

---

## Technical constraints

- **Static site, no build step.** Vanilla HTML/CSS/JS only (the files are `index.html`, `styles.css`, `script.js`). No framework, no bundler, no npm. Inline small helpers; keep JS dependency-free.
- **Relative paths** (GitHub Pages, served from repo root).
- **Performance**: lazy-load offscreen images, set `width`/`height` (or `aspect-ratio`) to prevent layout shift, keep fonts fast (preconnect/`font-display: swap`), don't ship megabytes.
- **Accessibility**: semantic landmarks, real `alt` text, visible focus states, keyboard-operable, honor `prefers-reduced-motion` (all the playful motion must have a reduced-motion fallback), sufficient contrast.
- **Responsive, mobile-first.** The portrait climbing video and portrait phone photos must look intentional on mobile. Hover-only affordances need a touch fallback.
- Cross-browser (Chrome/Safari/Firefox). No experimental-only CSS without a fallback.

---

## Process (do this, in order)

1. **Propose first.** Before touching code, give Alec a short concept: the chosen direction, palette (with hex), type pairing, layout principle, motion principles, and 1–2 signature interactions. One paragraph + a bullet list. Get a quick thumbs-up or adjust.
2. Set up the **design tokens** (CSS custom properties) and base styles first.
3. Build **section by section, top to bottom**, wiring real assets from the table above. Write the copy in Alec's voice (he'll edit).
4. Keep the **interactive/preserved** pieces functional throughout.
5. End with an accessibility + responsive pass and a quick self-review against the "AVOID" list — if any of those tells crept back in, fix them.

Ask Alec anything ambiguous rather than guessing on taste.
