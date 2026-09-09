// ============================================================
// UORA API server -- Hostinger Node.js Web App entry point
// ============================================================
//
// API-ONLY. Unlike the old start-all.js, this does NOT run Next.js in the
// same process. The frontend is now a static React build served directly by
// the web server, so this process only has to run the Express API.
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
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = "0.0.0.0";
const BACKEND_DIR = path.join(__dirname, "backend");

// --- Startup guard: the compiled backend must exist ---
const APP_JS = path.join(BACKEND_DIR, "dist", "app.js");
if (!fs.existsSync(APP_JS)) {
  console.error("[api] MISSING build artifact:", APP_JS);
  console.error("[api] The build step did not complete. Check the BUILD logs in hPanel.");
  process.exit(1);
}
console.log("[api] build artifact verified ✓");

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

// Diagnostic state, exposed at /__dbcheck.
let dbStatus = { checked: false };

async function main() {
  const app = require(path.join(BACKEND_DIR, "dist", "app")).default;
  const { startScheduler } = require(path.join(BACKEND_DIR, "dist", "scheduler"));
  const { prisma } = require(path.join(BACKEND_DIR, "dist", "config", "prisma"));
  const { initializeDatabase } = require(path.join(BACKEND_DIR, "dist", "config", "db-init"));

  // --- Database: SQLite file. Create the schema on first run and ensure the
  // admin account exists. Local file, no network, so awaiting this is safe.
  try {
    await initializeDatabase();
    const users = await prisma.users.count();
    dbStatus = { checked: true, ok: true, userCount: users };
    console.log("[api] database ready ✓  users:", users);
  } catch (err) {
    dbStatus = {
      checked: true,
      ok: false,
      error: String(err && err.message ? err.message : err),
      stack: err && err.stack ? err.stack.split("\n").slice(0, 4) : undefined,
    };
    console.error("[api] DATABASE INIT FAILED:", dbStatus.error);
    // Keep serving so the diagnostic endpoint stays reachable.
  }

  const server = http.createServer((req, res) => {
    if ((req.url || "") === "/__dbcheck") {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(dbStatus));
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
