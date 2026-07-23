# AlecOS — Portfolio Polish Brief (v5)

Goal: make AlecOS read as a **professional, clean portfolio that shows who Alec is.**
This is a POLISH pass on a settled design — elevate craft, fix inconsistencies,
sharpen copy. **Do NOT redesign.** Preserve what Alec loves: the aurora wallpaper,
the genuine SVG icons, the window chrome, and the horizontal Spaces transitions.

## Who Alec is (the through-line every window must serve)
Alec Lewis — builds **music software + automation** in State College, PA (Penn State).
He makes tools that do the tedious parts of making music so the human can stay creative:
- **Freak-Quencies** — an AI mixing plugin (Max for Live) that writes a live EQ/comp chain.
- **Backline** — a music generator that produces usable takes.
- **Aminal House** — an automated YouTube channel (108 videos, 321 subs, 177,653 views).
He also has a full life: bouldering/climbing, photography, two dachshunds, his girlfriend.
The desktop tour order is deliberate: **photos → freak → backline → aminal → contact**
= the person first, then the three things he builds, then how to reach him.
Tone: confident, plain-spoken, a little warm. A working engineer's portfolio, not a brochure.
No hype words ("revolutionary", "cutting-edge"), no emoji, no exclamation-point copy.

## Shared design system (use these EXACT values everywhere)
- **Type stack:** `-apple-system, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`.
  Mono (labels/data): `ui-monospace, "SF Mono", Menlo, monospace`.
- **Type scale (px):** 11 · 12.5 · 14 · 16 · 20 · 26 · 34. Stay on it.
  Headings weight 600–700, letter-spacing −0.02 to −0.03em, `text-wrap:balance`.
  Body 13–15px, line-height 1.5, muted neutral. Kickers/labels: mono, UPPERCASE, 11px, 0.2em tracking.
- **Spacing rhythm (px):** 4 · 8 · 12 · 16 · 24 · 32. Consistent window padding (24). Whitespace = clean.
- **Color discipline:** dark warm-neutral ground; exactly ONE accent per window, neutrals carry the rest.
  Accents: Photos `#E1306C`, Freak/Ableton amber `#ecc270`, Backline gold `#d3a24c`,
  Aminal red `#FF0033`, Contact blue `#3B82F6`. Neutrals biased slightly warm (never pure gray).
- **Motion:** restrained. Easing `cubic-bezier(.16,1,.3,1)`. Entrances play ONCE (already guarded — keep it).
  Hovers subtle (≤120ms). Respect `prefers-reduced-motion`.
- **Realism:** genuine macOS chrome (traffic lights, vibrancy, real menu bar, dock). Pixel-align. No emoji.

## LOCKED — do not regress (just fixed this session)
- Caption tour card: `setCaption` reset sequence in wm.js (swap→reflow→on) and the glass-card
  `.aos-caption` CSS. It must stay VISIBLE (opacity animates to 1) on every window.
- Entrance-once guards: `_mwPlayed` (media), `fqEntered` (freak), `blVisited` (backline). Keep them.
- Backline demo stays revealed on revisit (onBlur no longer hides it).

## File ownership (STRICT — do not touch files you don't own)
- Design/shell expert → `os/tokens.css`, `os/wm.css`, and shell-only parts of `os/wm.js`
  (boot, menu bar, dock, caption, Spaces transition feel). Owns the shared design system.
- Ableton/Freak expert → `os/app-freak.js` only.
- Backline expert → `os/app-backline.js` only.
- Personal/brand-story expert → `os/app-media.js` only (Photos, Aminal, Contact).

Every agent: keep `node --check` clean, zero console errors, no emoji, use the shared system above.
