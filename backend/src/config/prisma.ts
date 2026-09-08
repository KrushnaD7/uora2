import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Build a MariaDB driver adapter for Prisma Client.
 *
 * With `driverAdapters` + `queryCompiler` enabled in schema.prisma, Prisma no
 * longer loads the native Rust query engine (which crashed with
 * "PANIC: timer has gone away" on Hostinger's process-capped shared hosting).
 * It uses an in-process WASM query compiler plus the `mariadb` JS driver.
 *
 * CONNECTION METHOD: on Hostinger shared hosting the account's firewall drops
 * TCP connections to MySQL (127.0.0.1:3306 just hangs), so we connect over the
 * MySQL Unix socket instead -- the same path phpMyAdmin uses. The socket path
 * is `/var/lib/mysql/mysql.sock` by default and can be overridden with
 * DB_SOCKET_PATH. Credentials still come from DATABASE_URL. Set DB_USE_TCP=1
 * to force TCP (host/port from DATABASE_URL) e.g. for local development.
 */
const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const url = new URL(process.env.DATABASE_URL as string);
  const connectionLimit = Number(url.searchParams.get("connection_limit")) || 2;

  const common = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
    // Fail fast instead of hanging if the connection can't be established.
    connectTimeout: 10_000,
    acquireTimeout: 10_000,
    idleTimeout: 60,
  };

  const useTcp = process.env.DB_USE_TCP === "1";
  const socketPath = process.env.DB_SOCKET_PATH || "/var/lib/mysql/mysql.sock";

  const adapter = useTcp
    ? new PrismaMariaDb({
        ...common,
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
      })
    : new PrismaMariaDb({
        ...common,
        socketPath,
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
