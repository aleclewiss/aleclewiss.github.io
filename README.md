# Personal site

Plain HTML/CSS/JS — no build step. Open `index.html` in a browser to preview.

## Editing

- **Content** lives in `index.html` (projects, bio, links — placeholders are marked).
- **Look & feel** lives in `styles.css`. Change `--accent` at the top to re-theme everything.
- **Motion & clock** live in `script.js`.

## Deploying to GitHub Pages

1. Create a repo on GitHub named `<your-username>.github.io` (public).
2. Push this folder to it:
   ```
   git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
   git push -u origin main
   ```
3. The site goes live at `https://<your-username>.github.io` within a minute or two.

## Connecting a custom domain

1. In the repo: **Settings → Pages → Custom domain** — enter your domain and save
   (this creates a `CNAME` file in the repo).
2. At your domain registrar, add DNS records:
   - **Apex domain** (`example.com`): four `A` records pointing to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **www subdomain**: a `CNAME` record pointing to `<your-username>.github.io`
3. Back in **Settings → Pages**, tick **Enforce HTTPS** once the DNS check passes
   (can take up to a day, usually much faster).
