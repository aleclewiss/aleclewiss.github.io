# AlecOS — Performance Findings (load-speed audit)

Audit of first-load speed on desktop (1440×900) and mobile (390×844). Measured via Chrome
DevTools Protocol (headless, `Network.setCacheDisabled` = cold cache, mobile emulated with
`Emulation.setDeviceMetricsOverride` 390×844 @ DPR 3 + touch). Bytes = `encodedDataLength`
(on-the-wire, matches what GitHub Pages ships after gzip). Timing from the Performance /
LCP PerformanceObserver APIs. This is an audit only — no site code was changed.

---

## Measured baseline (cold first load)

| Metric | Desktop 1440×900 | Mobile 390×844 (DPR 3) |
|---|---|---|
| **Total transfer** | **2.98 MB** (3,124,338 B) | **4.17 MB** (4,370,308 B) |
| **Requests** | 29 | 28 |
| Images | 2744 KB × 16 | 2717 KB × 15 |
| Video (media) | 64 KB × 2 (metadata only) | **1308 KB × 2 (full download)** |
| Script (JS) | 205 KB × 6 | 205 KB × 6 |
| CSS | 33 KB × 3 | 33 KB × 3 |
| HTML | 4.3 KB | 4.3 KB |
| First Paint / FCP | 532 ms / 532 ms | 532 ms / 1116 ms |
| DOMContentLoaded | 586 ms | 603 ms |
| load event | 951 ms | 1014 ms |
| **LCP** | **~9040 ms** (boot-animation dominated — see P7) | **~1196 ms** |

Notes on the numbers:
- **Render-blocking is already minimal.** 3 CSS files (33 KB total) in `<head>`; the two
  CDN libs load as `type="module"` (async, non-blocking); `wm.js` + app JS are `defer`.
  FCP at ~532 ms confirms first paint is not gated on JS or the CDN. Nothing here needs fixing.
- **Desktop LCP ~9 s is the intentional boot screen**, not a network stall — see P7. FCP is fast;
  the desktop just deliberately holds on the "scroll to wake" monitor for 4.2 s before revealing
  the desktop, and the largest photo finalizes after that reveal.
- **Mobile is heavier than desktop** (4.17 vs 2.98 MB) purely because the mobile Photos coverflow
  force-downloads both `<video preload="auto" autoplay>` clips (1.3 MB) that desktop only fetches
  metadata for. Everything else is near-identical.
- The local preview server speaks HTTP/1.0 (no multiplexing); GitHub Pages serves HTTP/2, so the
  28–29 requests multiplex fine in production. Request *count* is not a real bottleneck; **bytes are.**
- Photo natural size is **1280 px on the long edge** (JPEG). Posters are 720×1280. Wallpaper 1920×1280.

---

## Findings (ranked by impact)

### P1 — Mobile downloads full 1280 px photos it displays at ~330 px  ·  Impact: **High (~1.6 MB mobile)**  ·  Mobile (desktop benefits less)

**What & why.** The Photos coverflow serves the *same* 1280 px-wide JPEGs to the mobile carousel
that it serves to the desktop coverflow. On a 390 px phone the centered card renders at
`max-width:84vw` ≈ **328 CSS px** (`.moscf-card img` in `mobile.css`); even at DPR 3 the hero only
needs ~984 device px, and the dimmed side/off-screen cards are far smaller. The 1280 px source is
~1.7× the pixel area the hero can show and *many times* oversized for the rest. All 12 carousel
photos load eagerly at boot (the code deliberately avoids `loading="lazy"` here to prevent pop-in
on swipe — see `app-media.js` line ~407), so the phone pulls **~2.27 MB of photos to display a
single ~330 px card**.

**Measured evidence.** Mobile image payload = 2717 KB across 15 images. I generated real variants
with PIL (q80) on 7 representative photos (1710 KB original):

| Variant | Size | Savings |
|---|---|---|
| original 1280 px JPEG | 1710 KB | — |
| **720 px WebP** | 484 KB | **−72%** |
| 720 px JPEG | 599 KB | −65% |
| 960 px WebP | 786 KB | −54% |

Extrapolated to all 12 carousel photos (~2.27 MB): a **720 px WebP** set is **~640 KB** — a
**~1.6 MB mobile saving**. (The two 720 px posters are already sized correctly and don't shrink.)

**Where.** `os/app-media.js` — mobile branch of the `photos` app build (`cardsHTML`, lines ~404–412);
CSS sizing `.moscf-card img` in `os/mobile.css` line ~145.

**Suggested fix (needs generating asset variants — dev has PIL).** Generate `-720.webp` (and a
`-720.jpg` fallback, though WebP is universally supported now) for each carousel photo and emit a
responsive `srcset`/`sizes` or `<picture>`. Because the mobile and desktop coverflows are separate
code branches, the simplest safe change is: **in the mobile branch only, point `src` at the 720 px
WebP variant.** Keep the 1280 px originals for desktop (P3). Concretely:
```
<img src="assets/personal/720/gf-and-me.webp" sizes="330px"
     srcset="assets/personal/720/gf-and-me.webp 720w, assets/personal/960/gf-and-me.webp 960w" ...>
```
**Regression risk: low.** WebP q80 at 720 px is visually indistinguishable at this display size.
Do a side-by-side on the highest-detail shot (`photo-pines`) before shipping.

---

### P2 — Both mobile coverflow videos fully download at boot (preload=auto)  ·  Impact: **High (~1.3 MB mobile)**  ·  Mobile

**What & why.** In the mobile coverflow, video cards are emitted as
`<video ... autoplay preload="auto">` (`app-media.js` line ~409). `preload="auto"` +
`autoplay` makes the browser download the *entire* clip at boot — for **both** videos, even though
`dogs-run.mp4` is the 4th card and `climbing.mp4` the 6th, several swipes away and off-screen at
first paint. The per-frame `place()` logic already pauses non-centered videos, but pausing does not
stop the initial download that `preload="auto"` kicks off.

**Measured evidence.** Mobile media = **1308 KB** downloaded at boot: `dogs-run.mp4` 848 KB +
`climbing.mp4` 461 KB. On desktop the same cards use `<video>` with no preload attribute, so only
**64 KB** of metadata is fetched — confirming `preload="auto"` is the cause. This single change would
cut mobile first-load from 4.17 MB to ~2.9 MB.

**Where.** `os/app-media.js`, mobile `photos` branch, line ~409 (video card template).

**Suggested fix.** Change mobile video cards to `preload="none"` (or `"metadata"` to keep the poster
crisp) and set/play the video only when the card becomes centered — the `place()` function
(line ~442) already knows when `abs <= 1.2`; have it assign `vid.src`/call `vid.load()` on first
centering. The posters already render the card, so nothing is visually missing before the swipe.
**Regression risk: low-to-medium** — verify the centered video still autoplays instantly on swipe;
you may want to warm the *next* card's video (`preload="metadata"`) one ahead to hide latency.

---

### P3 — Desktop ships 1280 px JPEGs where WebP would be ~25% smaller  ·  Impact: **Med (~0.6 MB desktop)**  ·  Desktop (+ mobile)

**What & why.** Desktop genuinely needs ~1280 px for the large coverflow on retina, so P1's resize
doesn't apply — but the photos are JPEG, and re-encoding to WebP at the *same* dimensions is
lossless-to-the-eye and meaningfully smaller.

**Measured evidence (PIL, q80, same 1280 px):** `dogs.jpg` 162→91 KB (−44%), `photo-guitars`
283→216 KB (−24%), `gf-and-me` 254→188 KB (−26%), `moto` 256→212 KB (−18%), `photo-pines`
373→351 KB (−6%, already dense). Average ≈ **−25%** → desktop image payload ~2744 KB → **~2050 KB**,
a **~0.6–0.7 MB desktop saving** (mobile also benefits if it falls back to these).

**Where.** `os/app-media.js` desktop `photos` branch (`cardsHTML`, line ~523).

**Suggested fix (needs generating variants).** Emit `<picture>` with a `image/webp` source and the
existing JPEG as fallback, or a `srcset` with `type`. Generate `*.webp` (1280 px, q80) alongside the
JPEGs. **Regression risk: low.** Spot-check `photo-pines` (least compressible) at q80–q82.

---

### P4 — No `preconnect` to the CDN; Motion + anime.js load cross-origin every visit  ·  Impact: **Med (~100–200 ms; removes a 3rd-party dependency)**  ·  Both

**What & why.** `index.html` imports `motion@11` and `animejs@4` from `cdn.jsdelivr.net` on every
load. There is **no `<link rel="preconnect">`**, so the browser pays a fresh DNS + TLS handshake to
jsdelivr before it can fetch them. Neither library is needed for first paint — both are
feature-detected flourishes (Motion springs the scroll-snap; anime.js does dock stagger/bounce and
the stat count-up). They also add an availability/privacy dependency on a third party.

**Measured evidence.** `motion@11` 24.4 KB + `animejs@4` 43.1 KB = **~68 KB** over a separate HTTPS
connection to jsdelivr (the only cross-origin, non-render-blocking requests in the trace). FCP
(532 ms) already proves they don't block first paint, but the connection setup delays *when the
scroll-snap physics and dock animation become available* after boot.

**Where.** `index.html` lines 47–56 (`<head>` has no resource hints).

**Suggested fix.** Two options, in order of preference:
1. **Vendor them** — download the two `+esm` bundles into `os/vendor/` and import locally. Removes the
   cross-origin DNS/TLS entirely, drops the third-party dependency, and lets the `?v=` cache scheme +
   GitHub Pages caching cover them. ~68 KB added to the origin, fetched over the already-open HTTP/2
   connection. **This is the faster and more robust choice.**
2. If you keep the CDN, add `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` in
   `<head>` so the handshake overlaps with CSS/JS parsing.

**Regression risk: low** (both are already feature-detected with graceful fallback).

---

### P5 — Preload the two known-critical assets (wallpaper + first hero photo)  ·  Impact: **Low–Med (~100–300 ms to first meaningful paint)**  ·  Both

**What & why.** The wallpaper is referenced only inside CSS (`--wall: url("../assets/wallpaper.jpg")`
in `tokens.css`), so the browser can't discover it until CSS is fetched and parsed — yet it's the
full-viewport background behind everything (a de-facto LCP contributor). The first coverflow photo
(`gf-and-me.jpg`, 254 KB) is likewise the hero of the first app but is only discovered when the JS
builds the DOM.

**Measured evidence.** `wallpaper.jpg` (127 KB) and `gf-and-me.jpg` (254 KB) both appear mid-waterfall
rather than at the front, because neither is in the initial HTML. Preloading pulls them onto the
critical path immediately after the HTML parses.

**Where.** `index.html` `<head>`.

**Suggested fix.** Add, after the stylesheet links:
```
<link rel="preload" as="image" href="assets/wallpaper.jpg">
<link rel="preload" as="image" href="assets/personal/gf-and-me.jpg" fetchpriority="high">
```
If P1/P3 land, preload the *WebP* variant instead. **Regression risk: none** (pure hint). Only
preload assets you're certain load on every visit (these two do).

---

### P6 — No service worker; repeat visits re-validate every asset  ·  Impact: **Med (near-instant repeat visits; enables offline)**  ·  Both (repeat visitors)

**What & why.** Every asset carries a `?v=39` cache-buster and GitHub Pages sets caching headers, so
a warm cache is decent — but there's still a network round-trip per asset to revalidate, and a hard
reload / new session re-downloads everything. A tiny cache-first service worker would make repeat
visits load from disk with zero network, and the `?v=NN` scheme is *ideal* for it: bump the version,
the SW fetches the new URL, old entries are evicted.

**Where.** New file `sw.js` at repo root + a registration line in `index.html`.

**Suggested fix.** Ship a minimal cache-first-with-network-fallback SW that precaches the shell
(HTML, 3 CSS, `wm.js` + 3 app JS) and runtime-caches images/media on first use. Key the cache name on
the `v` number so a deploy invalidates cleanly. **Regression risk: medium if done carelessly** — a
buggy SW can pin stale assets. Mitigate: cache-key on version, `skipWaiting()` + `clients.claim()`,
and never cache the CDN modules with an opaque response. Test the update path (bump `?v=`) before
shipping. This is the only finding that touches caching correctness, so treat it carefully.

---

### P7 — Desktop "time to usable" is gated by a 4.2 s boot hold (LCP ~9 s)  ·  Impact: **Low (perf) / UX call**  ·  Desktop

**What & why.** The desktop boot screen (`buildBoot` in `wm.js`) auto-wakes after **4200 ms**
(`setTimeout(enter, reduce ? 350 : 4200)`), and only then reveals the desktop and the large photo
that becomes the LCP element — which is why measured LCP is ~9 s despite a 532 ms FCP. This is an
*intentional* cinematic boot, not a network problem, and a user can skip it by scrolling/clicking.
Flagging it only because a Lighthouse/CrUX LCP score will look alarming and it delays interactivity
for a passive visitor who doesn't touch anything.

**Where.** `os/wm.js` `buildBoot()`, the `setTimeout(enter, ... 4200)` line (~116).

**Suggested fix (optional, product decision).** Trim the auto-wake to ~2.0–2.5 s, or begin the reveal
as soon as the wallpaper + first photo have decoded. Mobile is unaffected (no boot screen; LCP already
~1.2 s). **Regression risk: none functionally** — purely tunes the intro pacing. Don't change if the
long boot is a deliberate brand moment.

---

### P8 — (Optional) Lazy-load off-screen coverflow cards on desktop  ·  Impact: **Med (~1.3 MB desktop first-load) but with a tradeoff**  ·  Desktop

**What & why.** The desktop coverflow shows ~5–7 cards in 3D but builds and loads **all 12** photos at
boot. `loading="lazy"` is set on the desktop `<img>`s, but because every card is absolutely
positioned at the stage center (in-viewport), lazy loading never actually defers them — all 12 load
immediately. Only ~3–4 are visible; the rest are behind the front card or off to the sides.

**Measured evidence.** All 12 personal photos appear in the desktop trace at boot (~2.3 MB) though the
coverflow front + first neighbors are the only sharp, visible cards.

**Where.** `os/app-media.js` desktop `photos` branch (line ~523); layout in `layout()` (line ~552).

**Suggested fix.** Load only the front card ± 3 up front; lazily assign `src` to further cards as they
approach center during the scroll-spin (mirror the mobile `warm()` pattern). **Regression risk: medium
— this reintroduces the exact pop-in the author deliberately avoided.** Only pursue if the desktop
first-load number matters more than a flawless first spin; otherwise P1/P3 already cut desktop bytes
without touching the eager-load behavior. Listed last for that reason.

---

## Summary — projected impact if applied

| Fix | Desktop saved | Mobile saved | Effort | Risk |
|---|---|---|---|---|
| **P1** 720 px WebP for mobile carousel | — | **~1.6 MB** | Med (gen variants) | Low |
| **P2** Defer mobile coverflow videos | — | **~1.3 MB** | Low | Low–Med |
| **P3** WebP for desktop photos | ~0.6 MB | (fallback) | Med (gen variants) | Low |
| **P4** Vendor / preconnect CDN libs | ~100–200 ms | ~100–200 ms | Low | Low |
| **P5** Preload wallpaper + first photo | ~100–300 ms | ~100–300 ms | Trivial | None |
| **P6** Service worker (repeat visits) | near-instant repeats | near-instant repeats | Med | Med |
| **P7** Trim 4.2 s boot hold | faster "usable" | n/a | Trivial | None (UX) |
| **P8** Lazy off-screen desktop cards | ~1.3 MB | n/a | Med | Med (pop-in) |

**Headline:** P1 + P2 together cut the **mobile** cold load from **4.17 MB → ~1.2 MB** (~70% less).
P3 + P5 + P4 cut the **desktop** cold load from **2.98 MB → ~2.2 MB** while making the CDN faster and
more robust. All of the top four are low-regression; the image work (P1/P3) is the single biggest win
and requires generating resized/WebP variants (PIL + the existing 1280 px originals).

### Honest limitations of this audit
- Measurements are single cold runs against the local HTTP/1.0 preview server; production GitHub Pages
  (HTTP/2 + gzip) will differ slightly in per-request overhead but not in the byte totals above
  (bytes are already post-compression `encodedDataLength`).
- Desktop LCP (~9 s) is inflated by the intentional boot animation and shouldn't be read as a network
  regression (see P7). FCP is the more honest "first paint" figure (~532 ms).
- Projected savings for P1/P3 extrapolate a 7-image PIL sample to all 12 photos; per-image results
  vary (dense shots like `photo-pines` compress less). Regenerate and re-measure before finalizing.
- P6 (service worker) impact is qualitative — not measured here, as it only benefits repeat visits.
