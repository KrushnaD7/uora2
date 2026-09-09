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
// Choosing how to reach the database
// ---------------------------------------------------------------------------
// Reaching MySQL differs per host. On this one the app's TCP connections to
// the server are dropped -- they hang rather than refuse -- while the Unix
// socket works, which is how phpMyAdmin talks to the same server. Rather than
// assume either, each option is genuinely connected to (with a timeout) and
// the first that answers is used. The choice is reported through /__dbcheck so
// it is never a mystery which one is in play.
const dbLocationReport = { candidates: [] };

async function probeMysql(label, options, timeoutMs) {
  const started = Date.now();
  let conn;
  try {
    // Resolve by package name from the backend's node_modules. Requiring the
    // directory path directly fails for packages that declare "exports"
    // without a "main", which is the case here.
    const mariadb = require(require.resolve("mariadb", { paths: [BACKEND_DIR] }));
    conn = await Promise.race([
      mariadb.createConnection({ ...options, connectTimeout: timeoutMs }),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("timed out after " + timeoutMs + "ms")), timeoutMs)
      ),
    ]);
    await conn.query("SELECT 1");
    return { via: label, ok: true, ms: Date.now() - started };
  } catch (err) {
    return {
      via: label,
      ok: false,
      ms: Date.now() - started,
      error: String(err && err.message ? err.message : err),
    };
  } finally {
    try {
      if (conn && typeof conn.end === "function") await conn.end();
    } catch {
      /* closing a failed connection is not interesting */
    }
  }
}

/**
 * Find a working route to MySQL and export it as DB_SOCKET_PATH or DB_HOST,
 * which is what config/prisma.ts reads. Must run BEFORE the Prisma client is
 * required.
 */
async function chooseDatabaseConnection() {
  const url = new URL(process.env.DATABASE_URL);
  const creds = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };

  const socketPath = process.env.DB_SOCKET_PATH || "/var/lib/mysql/mysql.sock";
  const port = Number(url.port) || 3306;

  const candidates = [
    { label: "socket " + socketPath, options: { ...creds, socketPath }, apply: () => {
        process.env.DB_SOCKET_PATH = socketPath;
      } },
    { label: "tcp " + url.hostname + ":" + port, options: { ...creds, host: url.hostname, port }, apply: () => {
        delete process.env.DB_SOCKET_PATH;
        process.env.DB_HOST = url.hostname;
        process.env.DB_PORT = String(port);
      } },
    { label: "tcp localhost:" + port, options: { ...creds, host: "localhost", port }, apply: () => {
        delete process.env.DB_SOCKET_PATH;
        process.env.DB_HOST = "localhost";
        process.env.DB_PORT = String(port);
      } },
  ];

  for (const candidate of candidates) {
    const result = await probeMysql(candidate.label, candidate.options, 8000);
    dbLocationReport.candidates.push(result);
    if (result.ok) {
      candidate.apply();
      dbLocationReport.using = candidate.label;
      console.log("[api] database reachable via " + candidate.label);
      return;
    }
    console.error("[api] cannot reach database via " + candidate.label + ": " + result.error);
  }

  dbLocationReport.using = null;
  console.error("[api] no working route to the database");
}

// Diagnostic state, exposed at /__dbcheck.
let dbStatus = { checked: false };

async function main() {
  // Settle on a working database file first: config/prisma.ts reads
  // DATABASE_FILE when it builds the client, so this has to happen before
  // that module is required.
  await chooseDatabaseConnection();

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
