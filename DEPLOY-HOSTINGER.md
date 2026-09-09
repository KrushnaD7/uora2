# Deploying UORA to Hostinger

## What runs

One Node process (`start-api.js`) serves everything:

- `/api/*` -> the Express API (SQLite via Prisma)
- everything else -> the pre-built React SPA in `web/dist`

Nothing is rendered on the server. The frontend is built ahead of time by
Vite, so serving it is just reading files. This is what keeps the app inside
Hostinger's 120-process cap — the old Next.js SSR setup could not.

## hPanel settings

**Deploy Web App -> Build configuration**

| Setting | Value |
|---|---|
| Framework preset | Other |
| Branch | `main` |
| Node version | **20.x** |
| Root directory | `./` |
| Build command | `npm run build` |
| Package manager | npm |
| Output directory | *(leave empty)* |
| Entry file | `start-api.js` |

## Environment variables

Import `.env.hostinger` (kept out of git — it holds secrets).

Two of them matter most, and both point **outside** the deploy directory,
which Hostinger replaces on every redeploy:

- `DATABASE_FILE=/home/u542251462/uora-data/uora.db`
- `UPLOADS_DIR=/home/u542251462/uora-data/uploads`

If those pointed inside the project, every deploy would wipe the database and
every uploaded manuscript.

## First start

On boot the app creates the SQLite schema if it's missing and seeds the admin
account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Both steps are idempotent, so
restarts are safe. No migration command to run.

## Checking a deploy

- `GET /api/health` -> `{"status":"ok",...}`
- `GET /__dbcheck` -> `{"ok":true,"userCount":1}` (diagnostic; safe to remove later)
- Runtime logs should show `database ready` and `serving SPA from ...`

If the app returns 503 right after a deploy, the account is likely at its
process ceiling from earlier deploys: hPanel -> Hosting Plan -> Resources
Usage -> Max Processes -> **Stop running processes**, then load the site again.

## Local development

```bash
npm run dev:api    # API on :5000
npm run dev:web    # Vite on :5173, proxies /api to :5000
```

`npm start` runs the production setup (SPA + API on one port) after a build.
