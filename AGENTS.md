# Alec Lewis — personal site · agent brief

Static personal portfolio. Vanilla HTML/CSS/JS, no framework, no build step.
Deploys to GitHub Pages. Hand-written files: `index.html`, `styles.css`,
`script.js`, plus `assets/`, `backline-demo/`, and `freak-demo/`.

## Run it locally
```
npx serve -l 8734 .
```
Then open http://localhost:8734. Do NOT open index.html via file:// — the YouTube
embed and the demo iframes need a real http origin.

## The design (SETTLED — do not re-explore)
Bold near-black studio (`--ground: #09090b`), not a warm-brown editorial template.
**Syne** + **Outfit**. Hot pink accent (`#ff3d8a`); YouTube red only for Aminal
subscribe. Aminal cinema is a **preloaded** YouTube iframe (no custom play facade);
gallery thumbs use `hqdefault`. Motion is sleeker (blur/scale reveals, name
stagger, nav underlines) and respects reduced-motion. No fake app chrome, no
media collages.

Structure, top to bottom:
1. **Intro** — stacked name, personal line, email/GitHub, Lately list.
2. **Aminal** — cinema, story, filmstrip, metrics + pipeline.
3. **Backline** — banner, live demo iframe.
4. **Mixing** — banner, interactive `freak-demo` (embed mode), Ableton theater video.

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
- YouTube cinema is preloaded; Backline/Freak demos load lazy; mix video
  scroll-plays with sound after a user gesture.
- Freak demo supports `?embed=1` (hides its own intro/footer when iframed).
- Real favicons + Open Graph/Twitter meta present.

## Real details
- Email: `aleclewis@psu.edu` · GitHub: `github.com/aleclewiss`
- Résumé source of truth: `C:\Users\alecl\Resume\latex\resume.tex`
- Local image generation (for any new art) via sd-cli, see the owner's setup.

## OUTSTANDING — the one thing left
Not yet deployed. Create a public GitHub repo named **`aleclewiss.github.io`**, push
this folder to `main`, enable Pages (main / root). Site goes live at
https://aleclewiss.github.io. Custom domain via a `CNAME` file when ready.
