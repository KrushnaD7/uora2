import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Build a MariaDB driver adapter from DATABASE_URL.
 *
 * With the `driverAdapters` + `queryCompiler` preview features enabled in
 * schema.prisma, Prisma Client no longer loads the native Rust query engine.
 * Instead it uses an in-process WASM query compiler plus this pure-JS driver
 * (the `mariadb` package) for the actual connection. That eliminates the
 * engine's Tokio thread pool, which is what crashed with
 * "PANIC: timer has gone away" on Hostinger's process-capped shared hosting.
 *
 * The URL is parsed with the standard URL API (the password is now plain
 * alphanumeric, so no percent-encoding pitfalls) and passed to the adapter as
 * discrete connection options.
 */
const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const url = new URL(process.env.DATABASE_URL as string);
  const connectionLimit = Number(url.searchParams.get("connection_limit")) || 3;

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
    // Keep the connection pool small and let idle connections drop so the
    // process footprint stays well under the shared-hosting limit.
    idleTimeout: 60,
  });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["warn", "error"] : ["query", "info", "warn", "error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
