import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { prisma, resolveDbFile } from "./prisma";

/**
 * Prepare the SQLite database on startup.
 *
 * SQLite is a plain file, so there's no migration engine to run at runtime.
 * We create the schema from a pre-generated DDL script the first time the file
 * is empty, then ensure the admin account exists. Both steps are idempotent
 * and fast (local file, no network), so this is safe to run on every boot.
 */
/**
 * Progress log for the startup sequence below.
 *
 * Startup runs before anything can be inspected by hand, so when a step stalls
 * on the host there is otherwise nothing to go on. Each step is recorded with
 * its duration and surfaced through /__dbcheck, which turns "it timed out"
 * into "it timed out opening the database file".
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

export async function initializeDatabase(): Promise<void> {
  const dbFile = resolveDbFile();
  initSteps.length = 0;
  initSteps.push({ step: `path: ${dbFile}`, ms: 0 });

  await track("create data directory", () => {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  });

  await track("check directory is writable", () => {
    const probe = path.join(path.dirname(dbFile), ".write-probe");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
  });

  // Create tables if the schema isn't there yet.
  const existing = (await track("open database and read schema", () =>
    prisma.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    )
  )) as Array<{ name: string }>;

  if (existing.length === 0) {
    const sqlPath = path.join(__dirname, "..", "..", "prisma", "init-sqlite.sql");
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
    console.log("[db] admin account present:", adminEmail);
  }
}
