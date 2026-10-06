# Going live: API, admin portal, AgroSense360 subdomain

Three parts, all in this repo:

| Part | Folder | Host | Address |
|---|---|---|---|
| Public site | `/` | Vercel (existing project) | bloxio.tech, agrosense360.bloxio.tech |
| API | `server/` | Render (free plan, kept awake) | api.bloxio.tech |
| Admin portal | `admin/` | Vercel (new project) | admin.bloxio.tech |

Database: **Neon** (Postgres). Email: **Resend**, sent from `no-reply@bloxio.tech`. DNS: **Cloudflare**.

---

## 1. Neon (database)
1. Create a project at neon.tech (region: AWS Europe, Frankfurt is closest to Render).
2. Copy the **pooled connection string** (Connection details → Pooled). You'll paste it into Render as `DATABASE_URL`.

## 2. Resend (email)
1. Create an account at resend.com → Domains → Add `bloxio.tech`.
2. Resend shows DNS records (SPF, DKIM, and optionally DMARC). Add each one in **Cloudflare → DNS**, proxy **off** (grey cloud). Wait for Resend to show the domain as Verified.
3. API Keys → create a key with "Sending access". You'll paste it into Render as `RESEND_API_KEY`.

## 3. Render (API)
1. Render → **New → Blueprint** → connect this GitHub repo. It reads `render.yaml`.
2. Fill the secrets it asks for:
   - `DATABASE_URL`: the Neon pooled connection string
   - `RESEND_API_KEY`: from step 2
   - `VERCEL_DEPLOY_HOOK`: from step 5 (add it later if you like; Publish works without it but won't rebuild the site)
3. Deploy. On first start the API creates the tables, loads the site content and emails **owen@, austin@ and contact@bloxio.tech** a "set your password" link (valid 72 hours).
4. Settings → Custom Domains → add `api.bloxio.tech`. In **Cloudflare → DNS** add `CNAME api → <your-service>.onrender.com`, proxy **off**.
5. Check: https://api.bloxio.tech/health shows `{"ok":true}`.

Keeping it awake: `.github/workflows/keep-api-awake.yml` pings `/health` every 10 minutes (GitHub → Actions → make sure workflows are enabled). Render's free plan gives 750 hours a month, enough for one always-on service.

## 4. AgroSense360 subdomain
1. Vercel → main site project → Settings → Domains → add `agrosense360.bloxio.tech`.
2. Cloudflare → DNS: `CNAME agrosense360 → cname.vercel-dns.com`, proxy **off**.
Old links to bloxio.tech/products/agrosense360 redirect automatically.

## 5. Main site (existing Vercel project)
1. Settings → Environment Variables: `CONTENT_API_URL = https://api.bloxio.tech`
   (the build pulls published content from the API; if the API can't be reached the build uses the last content it had).
2. Settings → Git → **Deploy Hooks** → create one (branch `main`) → copy the URL into Render as `VERCEL_DEPLOY_HOOK`.
3. Redeploy.

## 6. Admin portal (new Vercel project)
1. Vercel → Add New → Project → same repo, **Root Directory: `admin`**.
2. Environment variable: `VITE_API_URL = https://api.bloxio.tech`
3. Domains → add `admin.bloxio.tech`; Cloudflare: `CNAME admin → cname.vercel-dns.com`, proxy **off**.
4. Each admin opens the set-password email, chooses a password and signs in.

## Day to day
- **Admins:** Owen and Austin can add or remove admins (Admins page). Everyone can reset their own password ("Forgot password?") and change it under Account.
- **Activity:** every change by any admin is listed on the Activity page with who, when and what changed.
- **Content:** edit sections under Content, then **Publish**. The site rebuilds and the change is live in about a minute.
- **Survey:** answers go to the API (Neon) **and** the Google Sheet as a backup.
- **Notifications:** every survey response and contact message emails contact@bloxio.tech; the visitor gets a confirmation from no-reply@bloxio.tech (survey: only if they gave an email).
- **Old sheet answers:** export the Google Sheet as CSV, then in Render → Shell: `python -m app.cli import-sheet responses.csv`.
- **Lost the invite email?** Render → Shell: `python -m app.cli invite owen@bloxio.tech`.

## Local development
```bash
cd server && python3.12 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
cp .env.example .env            # local Postgres, no email key = emails printed to the log
createdb bloxio_dev && .venv/bin/uvicorn app.main:app --port 8000
.venv/bin/python -m app.cli set-password owen@bloxio.tech 'YourPassword1'
createdb bloxio_test && .venv/bin/python -m pytest      # API tests
```
Site: `npm run dev` (localhost:5173; http://agrosense360.localhost:5173 for the subdomain).
Admin: `cd admin && npm install && npm run dev` (localhost:5174).
If you change `src/content/site.js` by hand, run `npm run content:export` so a fresh database starts from it. Once the site is live, edit content in the admin instead: published admin content takes priority over the code.
