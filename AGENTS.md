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
Frosted-glass identity on a mid-dark gray ground (`--ground: #7f7f88`), warm-white
text, blue accent `#0071e3`, left-aligned, Apple-adjacent. Pastel blurred washes sit
behind the glass. Content fades up on scroll (IntersectionObserver, one-shot).

Structure, top to bottom:
1. **Intro** — name, one-liner, Email/GitHub buttons, résumé strip (glass).
2. **Aminal House** — a faithful **YouTube dark watch page** recreation (real Roboto
   font via Google Fonts): masthead, 16:9 player (click-to-load facade → real embed),
   title/channel/Subscribe, description, related rail. Real channel: @Aminal_House,
   109 uploads, 177,653 views, 321 subs — a pipeline-run dog-shorts channel.
3. **Backline** — the **real interactive demo** embedded as an iframe from
   `backline-demo/` (Alec built this; 2.25MB self-contained, real ACE-Step audio).
4. **AI Mixing (Freak-Quencies)** — a clean **Ableton Live device** frame around the
   real screen-recording (`assets/ai-mix-demo.mp4`). NOTE: an earlier version had
   fake CSS knobs — they were removed for reading "vibecoded." Keep it real: the
   recording is the content, frame it minimally.

## Hard-won taste rules (respect these — a full day of iteration produced them)
- Real content only. Never fabricate stats, videos, testimonials, or fake app chrome.
- App recreations must look authentic (real fonts, real colors, real proportions) or
  be dropped. "Vibecoded" = the instant-reject signal.
- Motion stays calm and scroll/interaction-driven. No constant ambient motion
  (it caused motion sickness). Idle screen ≈ still.
- No emojis anywhere in the UI.
- Owner iterates by feel and reverses often; prefer previewing a change before large
  rewrites. Don't relitigate the settled design — refine within it.

## Accessibility / perf conventions already in place
- `.js` class gate for reveals; reduced-motion fully handled.
- YouTube player and the demo video are click/scroll-loaded, not eager (keeps initial
  load light). Contrast tuned to WCAG AA on the gray ground (`--dim-ground: #17171b`).
- Real favicons + Open Graph/Twitter meta present.

## Real details
- Email: `aleclewis@psu.edu` · GitHub: `github.com/aleclewiss`
- Résumé source of truth: `C:\Users\alecl\Resume\latex\resume.tex`
- Local image generation (for any new art) via sd-cli, see the owner's setup.

## OUTSTANDING — the one thing left
Not yet deployed. Create a public GitHub repo named **`aleclewiss.github.io`**, push
this folder to `main`, enable Pages (main / root). Site goes live at
https://aleclewiss.github.io. Custom domain via a `CNAME` file when ready.
