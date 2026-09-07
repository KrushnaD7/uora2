import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return new PrismaClient({
    log: isProduction ? ["warn", "error"] : ["query", "info", "warn", "error"],
  });
};

export const prisma =
  globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}