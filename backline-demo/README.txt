BACKLINE — PORTFOLIO DEMO
=========================

What this is
------------
A self-contained interactive demo of Backline (AI music co-producer for
Ableton Live). One file, no dependencies, works on any static host.
The four takes it "generates" are real ACE-Step output, embedded as MP3.

How to add it to your site
--------------------------
1. Copy this whole folder into your site, e.g. so it lives at:
       yoursite.com/backline-demo/

2. Embed it on any page with an iframe:

   <iframe src="/backline-demo/" width="760" height="580"
           style="border:1px solid rgba(255,255,255,.08); border-radius:12px; max-width:100%"
           title="Backline - interactive demo"
           loading="lazy"></iframe>

   - width can be anything from ~360px up; 700-900px looks best
   - loading="lazy" keeps the 2.2MB file from loading until scrolled to

3. Or link to it directly as a full page: /backline-demo/

Notes
-----
- Audio only plays after a visitor clicks a play button (browser rule).
- The demo runs its scripted intro on every page load; any click hands
  control to the visitor.
- Source lives in the repo at ableton-sidebar/demo/backline-demo.html
  (github.com/aleclewiss/backline).
