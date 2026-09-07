# Deploying UORA to Hostinger

This guide covers deploying the UORA Publications platform (Next.js frontend +
Express backend + MySQL) to Hostinger's **managed Node.js hosting**
(`uorapublications.com`, Node 20.x LTS recommended). A self-managed VPS path
using PM2 (`ecosystem.config.js`) is also covered further down.

> **Production notes**
> - Email (password reset / verification) **works** once SMTP vars are set in
>   hPanel — see [Email](#email) below.
> - The backend **refuses to start** in production without a valid
>   `DATABASE_URL` and a `JWT_SECRET` of **at least 32 characters**.
> - CORS only allows origins listed in `CORS_ORIGINS` / `FRONTEND_URL`. They
>   must exactly match your deployed domain, or every API call will be rejected.
> - Per-journal subdomains (e.g. `jar.uorapublications.com`) are supported —
>   see [Per-journal subdomains](#per-journal-subdomains) below.

---

## Architecture on Hostinger

Hostinger's Node.js app wizard only supports **one root directory, one build
command, and one entry file per app** — it cannot deploy the frontend and
backend as two separate apps sharing this same repo/zip. So this repo runs as
a **single Node.js app**: `start-all.js` (at the repo root) starts the
compiled Express API and the Next.js frontend **inside one process** and
binds Hostinger's assigned `PORT` directly — Phusion Passenger (Hostinger's
underlying Node hosting layer) requires the exact process it spawns to bind
the port itself, so this is not optional.

Inside that one process, requests to `/api/*` are handled by the Express app
directly (in-process — no network hop, no separate port); everything else is
handled by Next.js. The browser only ever talks to one origin, so there's no
CORS between frontend and backend, no `NEXT_PUBLIC_API_URL` to configure, and
no second app to deploy.

| Setting (hPanel → Hosting → Node.js → your app) | Value |
|---|---|
| Node.js version | 20.x LTS |
| Root directory | `./` (repo root — **not** `backend/` or `frontend/`) |
| Build command | `npm run build` (installs both apps' dependencies and builds both) |
| Application startup file | `start-all.js` |

---

## 1. Create the database in Hostinger

1. In hPanel → **Databases** → create a MySQL database (or use the one bundled
   with your plan). Note the hostname (often `localhost` on shared/managed
   plans).
2. Create a database user and grant it all privileges on that database.
3. Build your connection string:
   `mysql://USER:PASSWORD@HOST:PORT/DBNAME?connection_limit=5`
   (Hostinger managed plans typically: `mysql://USER:PASS@localhost:3306/DBNAME`)

---

## 2. Configure environment variables

In hPanel → Hosting → Node.js → your app → **Environment Variables**, set
**every** variable below (this is the **one and only** set of env vars this
app needs — both the API and the frontend read from it). `.env.example` at the
repo root has the same list with more detail per variable.

| Variable               | Required | Notes                                                        |
|------------------------|----------|--------------------------------------------------------------|
| `NODE_ENV`             | yes      | `production`                                                 |
| `DATABASE_URL`         | **yes**  | from step 1                                                  |
| `JWT_SECRET`           | **yes**  | **≥ 32 chars**. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN`       | no       | `1h`                                                         |
| `JWT_ISSUER`           | no       | `uora-api`                                                   |
| `JWT_AUDIENCE`         | no       | `uora-client`                                                |
| `REFRESH_EXPIRES_DAYS` | no       | `14`                                                         |
| `FRONTEND_URL`         | yes      | `https://uorapublications.com`                               |
| `CORS_ORIGINS`         | yes      | `https://uorapublications.com,https://www.uorapublications.com` |
| `ROOT_DOMAIN`          | no       | `uorapublications.com` — only needed if it differs from the built-in default; powers per-journal subdomain routing |
| `ADMIN_EMAIL`          | for seed | initial admin email                                          |
| `ADMIN_PASSWORD`       | for seed | initial admin password (strong!)                             |
| `ADMIN_NAME`           | for seed | admin display name                                           |
| `ADMIN_BOOTSTRAP_SECRET` | no     | long random secret enabling `POST /api/auth/bootstrap-admin` for emergency admin recovery — leave unset to disable it entirely |
| `TRUST_PROXY_HOPS`     | no       | `1` — number of reverse-proxy hops in front of this app; wrong values break per-IP rate limiting, confirm with Hostinger support if unsure |
| `SMTP_HOST`            | for email | `smtp.hostinger.com`                                        |
| `SMTP_PORT`            | for email | `465`                                                        |
| `SMTP_SECURE`          | for email | `true`                                                       |
| `SMTP_USER`            | for email | `no-reply@uorapublications.com`                             |
| `SMTP_PASS`            | for email | your Hostinger mailbox password                              |
| `SMTP_FROM`            | for email | `UORA Publications <no-reply@uorapublications.com>`         |
| `NODE_OPTIONS`         | no       | e.g. `--max-old-space-size=512` — caps this one process's V8 heap |

> **Set `PORT`.** On this Hostinger Node.js app product, the panel wants an
> explicit internal port declared (its own front layer proxies to it) rather
> than only injecting one — `3001` is what's confirmed working. `start-all.js`
> reads `process.env.PORT` directly and binds it immediately, so whatever you
> set here is what it listens on.
>
> **Do not set `NEXT_PUBLIC_API_URL` or `BACKEND_URL`.** They're for the old
> two-app split and are unused by `start-all.js` — the frontend and backend
> share one origin now.
>
> All `SMTP_*` vars must be set together. If any of `SMTP_HOST`/`SMTP_USER`/
> `SMTP_PASS` is missing, email is silently disabled but the server still
> starts normally.
>
> Append `?connection_limit=5` to `DATABASE_URL` (see the table above) to keep
> this app's DB connections comfortably under Hostinger MySQL's connection
> ceiling.

---

## 3. Deploy the app

1. In hPanel, create **one** Node.js app pointed at the **repo root** (not a
   subfolder) with the settings from the Architecture table above.
2. After the first build succeeds, run the database migration + seed once,
   from a machine with the production `DATABASE_URL` (or a one-off build hook
   if your plan supports it):
   ```bash
   cd backend
   npm run prisma:deploy        # applies migrations (prisma migrate deploy)
   npm run prisma:seed          # create the admin account (idempotent — safe to re-run)
   ```
   Use real migrations (`prisma migrate deploy`), not `prisma db push`, against
   production — see `backend/prisma/migrations/README.md` for the one-time
   baseline step if you haven't done it yet.
3. Set your **uploads directory** (`backend/uploads/`) to a **persistent** path
   that survives redeploys (Hostinger managed plans may reset the app folder on
   each deploy). Submissions attach manuscript files here — losing it loses files.
4. Restart the app from hPanel after the first deploy and after any env var
   change.

---

## 4. DNS / domain / HTTPS

- Both `uorapublications.com` and `www.uorapublications.com` resolve to your
  Hostinger IP. Point the `A` records (and `www` CNAME) there if not already set.
- There's no separate backend host to point DNS at — the single app serves
  both the site and `/api/*` on the same domain.

### Per-journal subdomains

Each journal can have its own subdomain (e.g. `jar.uorapublications.com`)
that behaves like its own independent journal site — home page, archives,
guidelines, ethics, volumes/issues — all reusing that journal's own content,
with login/dashboards/admin staying shared across every subdomain. To turn
this on:

1. In hPanel → Domains → Subdomains, add a **wildcard** subdomain (`*`)
   pointing at the same app/document root as the main site — this covers
   every journal without adding one subdomain at a time.
2. In hPanel → SSL, issue a **wildcard** SSL certificate for
   `*.uorapublications.com` (a single-domain cert won't cover subdomains).
3. Keep each journal's `subdomain` field equal to its `slug` in the admin
   panel — the app matches subdomain routing on that value. The "Add Journal"
   form already generates both from the journal name together, so this is
   automatic unless you hand-edit one afterward.

No app changes are needed beyond this — the routing logic is already built in.

---

## 5. Verify the deployed app

- Landing page loads over HTTPS.
- `Author Login`, registration, and the "Submit Manuscript" button work
  (i.e. no hard redirect to an admin page; the button routes anonymous users to
  login/register).
- Register a new account → it logs in as an AUTHOR.
- Log in as the seeded admin → admin dashboard loads.
- `GET /api/health` (same origin, e.g. `https://uorapublications.com/api/health`)
  returns healthy.
- Trigger "Forgot Password" → email arrives in the inbox (if SMTP is configured).
- If you set up a journal subdomain, visit it directly and confirm its own
  home page (not the main site) loads.

---

## Email

Email delivery is **fully implemented** via nodemailer (`backend/src/security/mailer.ts`).

**To enable:** set all six `SMTP_*` vars in hPanel (see step 2 table above).
When `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are all present, the server
automatically switches to the SMTP provider on startup.

**Hostinger SMTP settings:**

| Setting     | Value                           |
|-------------|----------------------------------|
| Host        | `smtp.hostinger.com`             |
| Port        | `465`                            |
| Encryption  | SSL/TLS (`SMTP_SECURE=true`)     |
| Username    | your full email address          |
| Password    | your Hostinger email password    |

Create the `no-reply@uorapublications.com` mailbox in hPanel → **Emails → Manage**
before deploying.

---

## Performance & resource tuning (2 vCPU / 3GB RAM plan)

What's already in place, and what to configure on your side:

- **One process instead of three.** `start-all.js` runs the API and frontend
  in a single Node process — no `child_process.spawn`, no extra `npx`
  process. On shared hosting, where your account has a hard cap on total OS
  processes (hPanel's "Max Processes"), this matters directly: it's roughly a
  3x reduction versus a supervisor that spawns separate backend/frontend
  children, and that reduction applies per app instance if Hostinger runs
  more than one.
- **Gzip compression** is on for all API responses (`compression()` in
  `app.ts`).
- **Public catalogue endpoints are bounded** (`take: 200` on
  `/api/public/articles` and `/api/public/issues`) so the catalogue growing
  over time can't turn into an unbounded query. If you cross ~200 published
  articles/issues, converting these to real `page`/`limit` pagination needs a
  matching frontend change — flag it if you want this done next.
- **PDF downloads** use a lightweight title+pdfUrl-only query instead of
  pulling the full article→journal→issue→volume→submission→authors graph.
- **File uploads** stream straight to disk (`multer.diskStorage`), not into
  memory.
- **`DATABASE_URL` connection_limit**: set `?connection_limit=5` (see step 2)
  so this app can never open more MySQL connections than your plan allows.
- **Node heap cap**: set `NODE_OPTIONS=--max-old-space-size=512` (or lower,
  e.g. 384, if this single process is the only Node app on the box — there's
  only one process to size now, not two) to keep this process from spiking
  RAM shared with MySQL and PHP workers.
- **Prisma query logging** is `["warn","error"]` only in production.
- **Admin/journal/volume/issue list endpoints already paginate and use
  `select`** to avoid over-fetching.

Not yet done (larger, higher-risk changes — call these out if you want them
next): a full N+1 pass over the submission/review workflow's remaining list
endpoints, and converting the two capped public endpoints above to real
pagination (requires a frontend contract change).

---

## Deployment checklist

```
[ ] MySQL DB created in hPanel → connection string built
[ ] One Node.js app created in hPanel, root directory "./", Node 20.x
[ ] Build command: npm run build
[ ] Application startup file: start-all.js
[ ] All env vars set from the table in step 2 (PORT=3001, no NEXT_PUBLIC_API_URL)
[ ] First build/deploy completed
[ ] cd backend && npm run prisma:deploy && npm run prisma:seed (creates admin account)
[ ] uploads/ folder mapped to a persistent volume
[ ] DNS A records → your Hostinger IP for uorapublications.com and www
[ ] (optional) wildcard subdomain + wildcard SSL for per-journal subdomains
[ ] GET /api/health returns 200
[ ] Login as admin → dashboard loads
[ ] Forgot Password email arrives (confirms SMTP is working)
```

---

## Self-managed VPS (alternative)

If you move to a root VPS instead of managed hosting, PM2 can run the
frontend and backend as two separate processes (Passenger's single-process
requirement doesn't apply there):

```bash
# On the server (Node 20 + MySQL installed)
npm install -g pm2
git clone <repo> uora && cd uora
npm --prefix backend install && npm --prefix frontend install
cp backend/.env.production.example backend/.env   # fill in all <<REPLACE_*>>, and set PORT=5000
npm run build:backend && npm run build:frontend
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

Then put nginx in front, terminate TLS, proxy `/` → `:3000` and `/api` →
`:5000`, and add the nginx client IP to the `trust proxy` handling (already
enabled in production). Note this VPS path uses the **old two-process split**
(it's the one place `ecosystem.config.js` and the `PORT`/
`NEXT_PUBLIC_API_URL` variables in `backend/.env.production.example` /
`frontend/.env.production.example` still apply) — it does **not** use
`start-all.js`. On Hostinger's managed plan, follow the steps above instead.

---

## Layout / scripts

| Path                              | Purpose                                        |
|-----------------------------------|------------------------------------------------|
| `start-all.js`                    | **Hostinger entry point** — single-process API + frontend |
| `package.json` (root)             | Convenience scripts (build/start/dev)          |
| `ecosystem.config.js`             | PM2 config (VPS path only, two-process split)  |
| `.env.example`                    | Env vars for the Hostinger single-app deploy, annotated |
| `backend/.env.example`            | Backend env example (local dev)                |
| `backend/.env.production.example` | VPS/PM2 two-process template (not used on Hostinger's managed plan) |
| `frontend/.env.example`           | Frontend env example (local dev)               |
| `frontend/.env.production.example`| VPS/PM2 two-process template (not used on Hostinger's managed plan) |
| `backend/prisma/seed.ts`          | Admin bootstrap (`ADMIN_*` env)                |
