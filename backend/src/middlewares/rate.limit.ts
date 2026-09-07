import rateLimit, { Options } from "express-rate-limit";
import { security } from "../config/security";

/**
 * Build a rate limiter with sensible defaults. Keyed by IP. Returns HTTP 429
 * with a safe message when the limit is exceeded.
 */
export function createLimiter(
  windowMs: number,
  limit: number,
  message = "Too many requests, please try again later."
) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  } as Partial<Options>);
}

export const generalLimiter = () =>
  createLimiter(security.generalWindowMs, security.generalMaxRequests);

export const authLimiter = () =>
  createLimiter(security.authWindowMs, security.authMaxRequests);

export const loginLimiter = () =>
  createLimiter(security.loginWindowMs, security.loginMaxRequests);

export const resetLimiter = () =>
  createLimiter(security.resetWindowMs, security.resetMaxRequests);

export const sensitiveLimiter = () =>
  createLimiter(security.sensitiveWindowMs, security.sensitiveMaxRequests);
