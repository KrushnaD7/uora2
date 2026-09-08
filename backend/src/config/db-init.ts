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
export async function initializeDatabase(): Promise<void> {
  const dbFile = resolveDbFile();
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  console.log("[db] SQLite file:", dbFile);

  // Create tables if the schema isn't there yet.
  const existing = (await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  )) as Array<{ name: string }>;

  if (existing.length === 0) {
    const sqlPath = path.join(__dirname, "..", "..", "prisma", "init-sqlite.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      // Drop chunks that are blank or only SQL comments.
      .filter((s) => s.length > 0 && s.replace(/--.*$/gm, "").trim().length > 0);

    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log(`[db] schema created (${statements.length} statements)`);
  } else {
    console.log("[db] schema already present");
  }

  // Ensure the admin account exists (idempotent).
  const adminEmail = process.env.ADMIN_EMAIL || "admin@uora.com";
  const adminCount = await prisma.users.count({ where: { email: adminEmail } });
  if (adminCount === 0) {
    const hashed = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin@123",
      12
    );
    await prisma.users.create({
      data: {
        name: process.env.ADMIN_NAME || "System Administrator",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    console.log("[db] admin account created:", adminEmail);
  } else {
    console.log("[db] admin account present:", adminEmail);
  }
}
