// ============================================================
// UORA production entry point -- Hostinger Node.js Web App
// ============================================================
//
// Single-PROCESS design: Express API + Next.js frontend run inside this
// ONE process (no child_process.spawn) -- Hostinger/most shared hosts cap
// total OS processes per account, and Passenger requires the exact process
// it spawns to bind the port itself.
//
//   - The compiled Express app (backend/dist/app.js) is required directly
//     and used as a plain (req, res) request handler -- it never calls
//     .listen() itself.
//   - Next.js runs via its programmatic API (next({dev, dir}), the same one
//     Next's own custom-server docs describe) in this same process.
//   - Requests to /api/* go to Express; everything else goes to Next.
//
// Log immediately, before any require() at all, so Hostinger's log viewer
// captures at least this line even if something in the require chain itself
// throws before reaching our own try/catch logging further down.
process.stdout.write("=== UORA server starting (start-all.js) ===\n");
process.stdout.write("Node: " + process.version + " | CWD: " + process.cwd() + "\n");

// --- Node version guard -----------------------------------------------------
// The Prisma query engine (v6) supports Node <= 22. On Node 23/24 it panics
// with "PANIC: timer has gone away" on the FIRST query, which the app then
// surfaces as generic "Invalid email or password" / "Registration failed".
// This app is pinned to Node 20 (package.json engines + .nvmrc). If the host
// still runs a newer major, shout about it in the logs so it's unmistakable.
{
  const major = Number(process.versions.node.split(".")[0]);
  if (major > 22) {
    process.stdout.write(
      "\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n" +
        "[server] WARNING: Node " + process.version + " detected.\n" +
        "[server] Prisma 6 requires Node <= 22. Node " + major + " causes the\n" +
        "[server] 'timer has gone away' engine panic and breaks ALL database\n" +
        "[server] queries. Set the Node version to 20.x in hPanel -> Deploy\n" +
        "[server] Web App settings, then redeploy.\n" +
        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n"
    );
  } else {
    process.stdout.write("[server] Node major " + major + " is Prisma-compatible ✓\n");
  }
}

// Set BEFORE any other require() -- libuv reads this the first time its
// threadpool is actually used (fs, crypto, zlib, dns.lookup -- also what
// Prisma's native query-engine addon rides on).
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = "4";
}

const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = "0.0.0.0";
const BACKEND_DIR = path.join(__dirname, "backend");
const FRONTEND_DIR = path.join(__dirname, "frontend");

// --- Startup guard: verify critical build artifacts exist before going
// further. `next-build` (not the default `.next`) matches frontend/next.
// config.ts's `distDir` -- some managed hosts, Hostinger's Node.js app
// file-sync confirmed among them, silently omit dot-directories when
// deploying, which builds successfully but leaves nothing to serve at
// runtime. This check turns that into a clear, logged failure instead of
// a silent crash inside nextApp.prepare() with zero output anywhere.
const requiredArtifacts = [
  path.join(BACKEND_DIR, "dist", "app.js"),
  path.join(FRONTEND_DIR, "next-build", "BUILD_ID"),
];
console.log("[server] checking build artifacts in:", __dirname);
for (const f of requiredArtifacts) {
  if (!fs.existsSync(f)) {
    console.error("[server] MISSING build artifact:", f);
    console.error("[server] The build step did not complete successfully (or its output was not preserved).");
    console.error("[server] Re-deploy and check the BUILD logs in hPanel.");
    process.exit(1);
  }
}
console.log("[server] build artifacts verified ✓");

// --- Env-var guard: surface missing required vars clearly and immediately,
// rather than letting backend/dist/config/env.js throw a generic Error
// during require() further down.
const missingEnv = ["DATABASE_URL", "JWT_SECRET"].filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);
if (missingEnv.length > 0) {
  console.error("[server] MISSING required environment variables:", missingEnv.join(", "));
  console.error("[server] Set them in hPanel -> your Node.js app -> Environment variables, then restart.");
  process.exit(1);
}
console.log("[server] required env vars present ✓");
console.log("[server] PORT =", PORT);
console.log("[server] NODE_ENV =", process.env.NODE_ENV || "(not set)");

// --- Migration & seed moved to build step ---
// Do NOT spawn child processes (execSync) at startup. Hostinger's shared
// hosting has a 120-process limit; spawning prisma/node children during boot
// pushes the account over the cap, triggering cascading 503s and restarts.
// Migrations run during `npm run build` instead (see root package.json).
// The admin account is created via POST /api/auth/bootstrap-admin.

process.on("uncaughtException", (error) => {
  console.error("[server] uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandled rejection:", reason);
  process.exit(1);
});

// A couple of backend modules resolve paths (uploads directory, stored PDF
// files) off process.cwd() rather than __dirname, because the backend was
// historically always run as its own process launched with cwd=backend/.
// Pin cwd to backend/ for this process's whole lifetime so those paths
// still resolve correctly now that everything runs from the repo root.
// Next.js is given its project directory explicitly below, so it is
// unaffected by this.
process.chdir(BACKEND_DIR);

// Diagnostic: filled in by the startup DB ping below, exposed at /__dbcheck.
// Lets us read the exact DB connection error remotely instead of guessing.
let dbStatus = { checked: false };

async function main() {
  // --- Backend: import the compiled Express app as a request handler ---
  const backendApp = require(path.join(BACKEND_DIR, "dist", "app")).default;
  const { startScheduler } = require(path.join(BACKEND_DIR, "dist", "scheduler"));
  const { prisma } = require(path.join(BACKEND_DIR, "dist", "config", "prisma"));

  // --- DB connectivity check: log the EXACT error so we stop guessing ---
  // NON-BLOCKING: runs in the background so it can never delay server.listen().
  // Masks the password but shows the host/user/db actually being used.
  const rawUrl = process.env.DATABASE_URL || "";
  const maskedUrl = rawUrl.replace(/:\/\/([^:]+):[^@]*@/, "://$1:***@");
  console.log("[server] DB check using:", maskedUrl);
  (async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const users = await prisma.users.count();
      dbStatus = { checked: true, ok: true, userCount: users, url: maskedUrl };
      console.log("[server] DB connection OK ✓  users in table:", users);
    } catch (err) {
      dbStatus = {
        checked: true,
        ok: false,
        url: maskedUrl,
        error: String(err && err.message ? err.message : err),
        code: err && err.code ? err.code : undefined,
      };
      console.error("[server] DB CONNECTION FAILED:", dbStatus.error);
    }
  })();

  // --- Frontend: run Next.js programmatically in this same process ---
  const next = require(path.join(FRONTEND_DIR, "node_modules", "next"));
  const nextApp = next({
    dev: false,
    hostname: HOSTNAME,
    port: PORT,
    dir: FRONTEND_DIR,
  });
  const handleNext = nextApp.getRequestHandler();
  await nextApp.prepare();

  const server = http.createServer((req, res) => {
    const url = req.url || "/";
    // Diagnostic endpoint (handled here, before Express/Next) -- runs a LIVE
    // DB query with a hard 6s timeout so it always returns something (result
    // or the exact error) instead of hanging forever.
    if (url === "/__dbcheck") {
      res.setHeader("Content-Type", "application/json");
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error("CHECK_TIMEOUT_6s")), 6000)
      );
      Promise.race([
        (async () => {
          const users = await prisma.users.count();
          return { ok: true, users, startupCheck: dbStatus };
        })(),
        timeout,
      ])
        .then((r) => res.end(JSON.stringify(r)))
        .catch((e) =>
          res.end(
            JSON.stringify({
              ok: false,
              error: String(e && e.message ? e.message : e),
              stack: e && e.stack ? e.stack.split("\n").slice(0, 4) : undefined,
              startupCheck: dbStatus,
            })
          )
        );
      return;
    }
    if (url === "/api" || url.startsWith("/api/")) {
      return backendApp(req, res);
    }
    return handleNext(req, res);
  });

  server.on("error", (err) => {
    console.error("[server] fatal error:", err);
    process.exit(1);
  });

  server.listen(PORT, HOSTNAME, () => {
    console.log("====================================");
    console.log("🚀 UORA Production Server Started");
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
    console.log("====================================");
  });

  startScheduler();

  // Graceful shutdown: Hostinger (and any process manager) sends SIGTERM on
  // redeploy/restart. Without handling it, a restart just leaves the old
  // process to be force-killed once its shutdown grace period elapses,
  // holding its DB connections and the HTTP port open in the meantime --
  // across repeated deploys/restarts while iterating, that piles up exactly
  // the kind of lingering processes and connections that exhaust a
  // resource-capped hosting plan's process cap. Handling it lets the old
  // process exit cleanly and immediately instead.
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received, shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
      console.error("[server] shutdown timed out, forcing exit");
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.error("[server] error disconnecting Prisma:", error);
      }
      clearTimeout(forceExitTimer);
      console.log("[server] shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("[server] startup failed:", err);
  process.exit(1);
});
