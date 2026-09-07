import { Router } from "express";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";

const router = Router();

/**
 * Liveness: the process is up. Does NOT expose sensitive info.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness: verifies database connectivity.
 */
router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "up",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "down",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
