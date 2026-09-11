import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { prisma, resolveDbConnection } from "./prisma";
import { seedUjgsm } from "./seed-ujgsm";

/**
 * Progress log for the startup sequence below.
 *
 * Startup runs before anything can be inspected by hand, so when a step stalls
 * on the host there is otherwise nothing to go on. Each step is recorded with
 * its duration and surfaced through /__dbcheck, which turns "it timed out"
 * into "it timed out creating the schema".
 */
export const initSteps: Array<{ step: string; ms?: number; error?: string }> = [];

async function track<T>(step: string, fn: () => Promise<T> | T): Promise<T> {
  const started = Date.now();
  initSteps.push({ step });
  try {
    const result = await fn();
    initSteps[initSteps.length - 1].ms = Date.now() - started;
    console.log(`[db] ${step} (${Date.now() - started}ms)`);
    return result;
  } catch (err) {
    const entry = initSteps[initSteps.length - 1];
    entry.ms = Date.now() - started;
    entry.error = String(err && (err as Error).message ? (err as Error).message : err);
    console.error(`[db] ${step} FAILED:`, entry.error);
    throw err;
  }
}

/**
 * Prepare the database on startup.
 *
 * Creates the schema from a pre-generated DDL script when the tables are not
 * there yet, then ensures the admin account exists. Both are idempotent, so
 * this runs safely on every boot and there is no migration step to remember.
 */
export async function initializeDatabase(): Promise<void> {
  const conn = resolveDbConnection();
  initSteps.length = 0;
  initSteps.push({
    step: `database: ${conn.database} via ${conn.socketPath ? "socket " + conn.socketPath : conn.host + ":" + conn.port}`,
    ms: 0,
  });

  // Does the schema exist yet? Checking one known table is enough.
  const existing = (await track("connect and look for tables", () =>
    prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
    )
  )) as Array<Record<string, unknown>>;

  if (existing.length === 0) {
    const sqlPath = path.join(__dirname, "..", "..", "prisma", "init-mysql.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      // Drop chunks that are blank or only SQL comments.
      .filter((s) => s.length > 0 && s.replace(/--.*$/gm, "").trim().length > 0);

    await track(`create schema (${statements.length} statements)`, async () => {
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt);
      }
    });
  } else {
    initSteps.push({ step: "schema already present", ms: 0 });
    console.log("[db] schema already present");
  }

  // Ensure the admin account exists (idempotent).
  const adminEmail = process.env.ADMIN_EMAIL || "admin@uora.com";
  const adminCount = await track("count admin account", () =>
    prisma.users.count({ where: { email: adminEmail } })
  );

  if (adminCount === 0) {
    const hashed = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin@123",
      12
    );
    await track("create admin account", () =>
      prisma.users.create({
        data: {
          name: process.env.ADMIN_NAME || "System Administrator",
          email: adminEmail,
          password: hashed,
          role: "ADMIN",
          status: "ACTIVE",
          emailVerified: true,
        },
      })
    );
  } else {
    initSteps.push({ step: "admin account present", ms: 0 });
    console.log("[db] admin account present:", adminEmail);
  }

  // One-time content seed for the UJGSM journal + its first issue and articles.
  // Idempotent (skips once seeded) and non-fatal: a failure here must never
  // stop the app from serving, so it is logged and swallowed.
  try {
    const result = await track("seed ujgsm content", () => seedUjgsm());
    console.log("[db]", result);
  } catch (err) {
    console.error("[db] ujgsm seed skipped:", err);
  }
}
