import path from "path";
import os from "os";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Resolve the SQLite database file path.
 *
 * The file MUST live outside the deployment directory, which Hostinger's Web
 * App replaces on every redeploy (that would wipe the data). We put it under
 * the account home directory (persistent across deploys) unless DATABASE_FILE
 * overrides it.
 */
export function resolveDbFile(): string {
  if (process.env.DATABASE_FILE) return process.env.DATABASE_FILE;
  const home = process.env.HOME || os.homedir() || process.cwd();
  return path.join(home, "uora-data", "uora.db");
}

/**
 * Prisma Client backed by SQLite via the libsql driver adapter.
 *
 * With `driverAdapters` + `queryCompiler`, Prisma uses an in-process WASM
 * query compiler plus this pure-JS driver -- no native Rust engine, no Tokio
 * threads. SQLite itself is a single file: no DB server, no socket, no TCP,
 * no connection pool. This removes the entire class of connection/threading
 * problems that MySQL hit on Hostinger shared hosting.
 */
const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const dbFile = resolveDbFile();

  const adapter = new PrismaLibSQL({ url: `file:${dbFile}` });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["warn", "error"] : ["query", "info", "warn", "error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
