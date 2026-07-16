# Alec Lewis — personal site · agent brief

Static personal portfolio. Vanilla HTML/CSS/JS, no framework, no build step.
Deploys to GitHub Pages. Three hand-written files: `index.html`, `styles.css`,
`script.js`, plus `assets/` and `backline-demo/`.

## Run it locally
```
npx serve -l 8734 .
```
Then open http://localhost:8734. Do NOT open index.html via file:// — the YouTube
embed and the Backline demo iframe need a real http origin.

## The design (SETTLED — do not re-explore)
Warm personal site (`--ground: #1c1814`), not a numbered portfolio template.
**Fraunces** + **Instrument Sans**. Hero is a name + sticky-note aside of projects.
Each project section has its own layout (Aminal story→cinema, Backline banner→
full demo, Mix copy beside video). Mixing video autoplays **with sound** when
scrolled into view after any page click (browser autoplay policy); otherwise
shows “Tap for sound.” YouTube cinema keeps a 16:9 shell. No fake app chrome.

Structure, top to bottom:
1. **Intro** — `Alec / Lewis`, role line, compact jump links, résumé.
2. **Aminal** — cinema first, story + stats, compact pipeline strip, quiet filmstrip.
3. **Backline** — story + points, full-bleed real demo iframe.
4. **Mixing** — large Live theater video first, then explanation + signal steps.

## Hard-won taste rules (respect these)
- Real content only. Never fabricate stats, videos, testimonials, or fake app chrome.
- Prefer art-directed portfolio moments over literal UI clones — clones read as
  "vibecoded." Keep YouTube/Ableton *associations* via color, type, and real media.
- Motion stays calm and scroll/interaction-driven. No constant ambient motion.
- No emojis anywhere in the UI.
- Owner iterates by feel; prefer previewing before large rewrites. Refine within
  the settled editorial direction.

## Accessibility / perf conventions already in place
- `.js` class gate for reveals; reduced-motion fully handled.
- YouTube player and the demo video are click/scroll-loaded, not eager.
- Real favicons + Open Graph/Twitter meta present.

## Real details
- Email: `aleclewis@psu.edu` · GitHub: `github.com/aleclewiss`
- Résumé source of truth: `C:\Users\alecl\Resume\latex\resume.tex`
- Local image generation (for any new art) via sd-cli, see the owner's setup.

## OUTSTANDING — the one thing left
Not yet deployed. Create a public GitHub repo named **`aleclewiss.github.io`**, push
this folder to `main`, enable Pages (main / root). Site goes live at
https://aleclewiss.github.io. Custom domain via a `CNAME` file when ready.
