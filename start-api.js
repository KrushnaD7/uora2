// ============================================================
// UORA API server -- Hostinger Node.js Web App entry point
// ============================================================
//
// Serves the Express API plus the pre-built React SPA as static files.
// Unlike the old start-all.js there is NO server-side rendering here: the
// frontend was built ahead of time by Vite, so requests for it are just file
// reads. Keeping both on one origin also means the browser calls /api
// same-origin, so no CORS setup is needed.
//
// That is the whole point of the rebuild: Next.js server-side rendering was
// what pushed the account past Hostinger's 120-process cap and left the app
// stuck in a 503 crash-restart loop. A lone Express + SQLite process has a
// tiny footprint and stays comfortably under that ceiling.
//
// Log before any require() so Hostinger's log viewer captures something even
// if the require chain itself throws.
process.stdout.write("=== UORA API starting (start-api.js) ===\n");
process.stdout.write("Node: " + process.version + " | CWD: " + process.cwd() + "\n");

// Set BEFORE any other require() -- libuv reads this the first time its
// threadpool is actually used. Keeps the thread count small on shared hosting.
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = "4";
}

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = "0.0.0.0";
const BACKEND_DIR = path.join(__dirname, "backend");
const WEB_DIST = process.env.WEB_DIST || path.join(__dirname, "web", "dist");

// --- Startup guard: the compiled backend must exist ---
const APP_JS = path.join(BACKEND_DIR, "dist", "app.js");
if (!fs.existsSync(APP_JS)) {
  console.error("[api] MISSING build artifact:", APP_JS);
  console.error("[api] The build step did not complete. Check the BUILD logs in hPanel.");
  process.exit(1);
}
console.log("[api] build artifact verified ✓");

// The SPA is optional at boot: the API is still useful without it, and saying
// so plainly beats serving a blank page with no explanation.
const HAS_WEB = fs.existsSync(path.join(WEB_DIST, "index.html"));
if (HAS_WEB) {
  console.log("[api] serving SPA from:", WEB_DIST);
} else {
  console.warn("[api] NO SPA BUILD at", WEB_DIST, "-- serving API only.");
  console.warn("[api] Run `npm --prefix web run build` (the root build does this).");
}

// --- Env-var guard: fail loudly and immediately, not deep inside a require ---
const missingEnv = ["DATABASE_URL", "JWT_SECRET"].filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);
if (missingEnv.length > 0) {
  console.error("[api] MISSING required environment variables:", missingEnv.join(", "));
  console.error("[api] Set them in hPanel -> Environment variables, then redeploy.");
  process.exit(1);
}
console.log("[api] required env vars present ✓");
console.log("[api] PORT =", PORT, "| NODE_ENV =", process.env.NODE_ENV || "(not set)");

process.on("uncaughtException", (error) => {
  console.error("[api] uncaught exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[api] unhandled rejection:", reason);
  process.exit(1);
});

// Some backend modules resolve paths off process.cwd() (uploads, stored PDFs),
// a holdover from when the backend always ran with cwd=backend/. Pin it.
process.chdir(BACKEND_DIR);

// ---------------------------------------------------------------------------
// Static file serving for the built SPA
// ---------------------------------------------------------------------------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".map": "application/json; charset=utf-8",
};

function sendFile(res, filePath, cacheControl) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-Content-Type-Options", "nosniff");
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    res.statusCode = 500;
    res.end("Internal Server Error");
  });
  stream.pipe(res);
}

/**
 * Serve the built SPA.
 *
 * Files under /assets carry a content hash in their name, so they can be
 * cached forever; index.html must never be cached or visitors would keep
 * loading an old build after a deploy. Anything that isn't a real file falls
 * back to index.html, which is what makes client-side routes work on refresh.
 */
function serveStatic(req, res) {
  const indexFile = path.join(WEB_DIST, "index.html");

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  // Resolve inside WEB_DIST and confirm it stayed there (path traversal).
  const resolved = path.resolve(WEB_DIST, "." + pathname);
  const root = path.resolve(WEB_DIST);
  const inside = resolved === root || resolved.startsWith(root + path.sep);

  if (inside && resolved !== root) {
    try {
      const stat = fs.statSync(resolved);
      if (stat.isFile()) {
        const immutable = pathname.startsWith("/assets/");
        return sendFile(
          res,
          resolved,
          immutable
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600"
        );
      }
    } catch {
      // Not a file -- fall through to the SPA entry point below.
    }
  }

  return sendFile(res, indexFile, "no-cache");
}

// ---------------------------------------------------------------------------
// Choosing where the SQLite file lives
// ---------------------------------------------------------------------------
// The preferred location is outside the deployment so redeploys don't delete
// the data. That directory can be created and written to on this host, but
// SQLite itself hung opening a database there -- opening a database needs file
// LOCKING, which a plain write test doesn't exercise and which network-mounted
// home directories often don't support.
//
// So rather than assume, each candidate is opened for real (with a timeout)
// and the first one that actually works is used. The fallback lives inside the
// deployment: it works, but a redeploy replaces that directory, so the result
// is reported prominently rather than passed over in silence.
const dbLocationReport = { candidates: [] };

async function probeSqlite(file, timeoutMs) {
  const started = Date.now();
  let client;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const { createClient } = require(
      path.join(BACKEND_DIR, "node_modules", "@libsql/client")
    );
    client = createClient({ url: "file:" + file });
    await Promise.race([
      client.execute("SELECT 1"),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("timed out after " + timeoutMs + "ms")), timeoutMs)
      ),
    ]);
    return { file, ok: true, ms: Date.now() - started };
  } catch (err) {
    return {
      file,
      ok: false,
      ms: Date.now() - started,
      error: String(err && err.message ? err.message : err),
    };
  } finally {
    try {
      if (client && typeof client.close === "function") client.close();
    } catch {
      /* closing a failed client is not interesting */
    }
  }
}

/**
 * Pick a usable database file and expose it through DATABASE_FILE, which is
 * what config/prisma.ts reads. Must run BEFORE the Prisma client is required.
 */
async function chooseDatabaseFile() {
  const home = process.env.HOME || os.homedir() || __dirname;
  const preferred =
    process.env.DATABASE_FILE || path.join(home, "uora-data", "uora.db");
  const fallback = path.join(__dirname, "data", "uora.db");

  const candidates = preferred === fallback ? [preferred] : [preferred, fallback];

  for (const candidate of candidates) {
    const result = await probeSqlite(candidate, 8000);
    dbLocationReport.candidates.push(result);
    if (result.ok) {
      process.env.DATABASE_FILE = candidate;
      dbLocationReport.using = candidate;
      dbLocationReport.persistent = candidate === preferred;
      if (!dbLocationReport.persistent) {
        console.warn(
          "[api] WARNING: using a database inside the deployment (" +
            candidate +
            "). It works, but a redeploy will replace it."
        );
      } else {
        console.log("[api] database file:", candidate);
      }
      return;
    }
    console.error("[api] cannot use " + candidate + ": " + result.error);
  }

  dbLocationReport.using = null;
  console.error("[api] no usable database location found");
}

// Diagnostic state, exposed at /__dbcheck.
let dbStatus = { checked: false };

async function main() {
  // Settle on a working database file first: config/prisma.ts reads
  // DATABASE_FILE when it builds the client, so this has to happen before
  // that module is required.
  await chooseDatabaseFile();

  const app = require(path.join(BACKEND_DIR, "dist", "app")).default;
  const { startScheduler } = require(path.join(BACKEND_DIR, "dist", "scheduler"));
  const { prisma } = require(path.join(BACKEND_DIR, "dist", "config", "prisma"));
  const { initializeDatabase, initSteps } = require(path.join(BACKEND_DIR, "dist", "config", "db-init"));

  // --- Database: create the SQLite schema on first run and ensure the admin
  // account exists.
  //
  // Deliberately NOT awaited before listening. If this ever stalls, awaiting
  // it here would mean the port is never opened -- the host then holds every
  // request until it times out, which looks like a dead site with no clue as
  // to why. Starting the listener first keeps the app reachable (and
  // /__dbcheck readable) whatever the database is doing. The timeout turns a
  // hang into a reported error instead of silence.
  const DB_INIT_TIMEOUT_MS = 20000;
  const initDatabase = async () => {
    try {
      await Promise.race([
        (async () => {
          await initializeDatabase();
          const users = await prisma.users.count();
          dbStatus = { checked: true, ok: true, userCount: users, location: dbLocationReport, steps: initSteps };
          console.log("[api] database ready, users:", users);
        })(),
        new Promise((_resolve, reject) =>
          setTimeout(
            () => reject(new Error("database init timed out after " + DB_INIT_TIMEOUT_MS + "ms")),
            DB_INIT_TIMEOUT_MS
          )
        ),
      ]);
    } catch (err) {
      dbStatus = {
        checked: true,
        ok: false,
        error: String(err && err.message ? err.message : err),
        stack: err && err.stack ? String(err.stack).slice(0, 400) : undefined,
        // Which step it reached tells us what actually stalled.
        location: dbLocationReport,
        steps: initSteps,
      };
      console.error("[api] DATABASE INIT FAILED:", dbStatus.error);
    }
  };

  const server = http.createServer((req, res) => {
    const url = req.url || "/";

    if (url === "/__dbcheck") {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(dbStatus));
    }

    // The API owns /api/*; everything else is the frontend.
    if (url === "/api" || url.startsWith("/api/")) {
      return app(req, res);
    }

    if (HAS_WEB) {
      return serveStatic(req, res);
    }
    return app(req, res);
  });

  server.on("error", (err) => {
    console.error("[api] fatal server error:", err);
    process.exit(1);
  });

  server.listen(PORT, HOSTNAME, () => {
    console.log("====================================");
    console.log("🚀 UORA API Started");
    console.log(`🌐 http://${HOSTNAME}:${PORT}`);
    console.log(`🌍 ${process.env.NODE_ENV || "production"}`);
    console.log("====================================");
    // Port is open; now prepare the database in the background.
    void initDatabase();
  });

  startScheduler();

  // Graceful shutdown: Hostinger sends SIGTERM on redeploy/restart. Exiting
  // cleanly here is what stops old processes piling up toward the 120 cap.
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[api] ${signal} received, shutting down gracefully...`);
    const force = setTimeout(() => {
      console.error("[api] shutdown timed out, forcing exit");
      process.exit(1);
    }, 10_000);
    force.unref();
    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch (e) {
        console.error("[api] error disconnecting Prisma:", e);
      }
      clearTimeout(force);
      console.log("[api] shutdown complete");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("[api] startup failed:", err);
  process.exit(1);
});
