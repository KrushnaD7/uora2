import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export interface DbConnection {
  /** Unix socket path, when connecting that way. */
  socketPath?: string;
  host?: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

/**
 * Build the connection settings from DATABASE_URL.
 *
 * How to reach the server differs per host: TCP works in most places, but on
 * this shared host the app's TCP connections to MySQL are dropped, so a Unix
 * socket is used instead. start-api.js probes the options and exports the one
 * that actually connects as DB_SOCKET_PATH / DB_HOST, which is what the
 * overrides below read.
 */
export function resolveDbConnection(): DbConnection {
  const url = new URL(process.env.DATABASE_URL as string);
  const connectionLimit =
    Number(url.searchParams.get("connection_limit")) ||
    Number(process.env.DB_CONNECTION_LIMIT) ||
    3;

  const common = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit,
  };

  const socketPath = process.env.DB_SOCKET_PATH;
  if (socketPath) {
    return { ...common, socketPath };
  }

  return {
    ...common,
    host: process.env.DB_HOST || url.hostname,
    port: Number(process.env.DB_PORT || url.port) || 3306,
  };
}

/**
 * Prisma Client over MySQL/MariaDB.
 *
 * Uses the driver adapter (with queryCompiler) rather than Prisma's native
 * engine: that engine spawns a thread pool this host cannot provide, and
 * panicked with "timer has gone away" on every query. The JS driver has no
 * such requirement.
 */
const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const conn = resolveDbConnection();

  const adapter = new PrismaMariaDb({
    ...conn,
    // Fail rather than hang if the server cannot be reached.
    connectTimeout: 10_000,
    acquireTimeout: 10_000,
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
