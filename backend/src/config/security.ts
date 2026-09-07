/**
 * Centralized security configuration.
 *
 * All rate limits, body limits and upload limits are defined here and can be
 * overridden through environment variables. This avoids scattering security
 * constants across dozens of files.
 */

const intEnv = (name: string, fallback: number, max = Number.MAX_SAFE_INTEGER): number => {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > max) {
    throw new Error(`Invalid environment variable: ${name} (expected positive integer <= ${max})`);
  }
  return n;
};

export const security = {
  /** Generic API limit: every request (per IP) over this window. */
  generalWindowMs: intEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  generalMaxRequests: intEnv("RATE_LIMIT_MAX", 600),

  /** Authentication limit (login/register/refresh/reset/verify). */
  authWindowMs: intEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  authMaxRequests: intEnv("AUTH_RATE_LIMIT_MAX", 50),

  /** Login-specific brute-force protection: tighter per-IP window. */
  loginWindowMs: intEnv("LOGIN_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  loginMaxRequests: intEnv("LOGIN_RATE_LIMIT_MAX", 10),

  /** Per-account progressive lockout after repeated failed logins. */
  loginMaxFailedAttempts: intEnv("LOGIN_MAX_FAILED_ATTEMPTS", 5),
  loginLockoutMinutes: intEnv("LOGIN_LOCKOUT_MINUTES", 15),

  /** Password-reset request throttling. */
  resetWindowMs: intEnv("RESET_RATE_LIMIT_WINDOW_MS", 60 * 60 * 1000),
  resetMaxRequests: intEnv("RESET_RATE_LIMIT_MAX", 5),

  /** Sensitive operations (upload, review, decisions, assignment, user mgmt). */
  sensitiveWindowMs: intEnv("SENSITIVE_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  sensitiveMaxRequests: intEnv("SENSITIVE_RATE_LIMIT_MAX", 100),

  /** Maximum upload size in bytes. */
  maxUploadBytes: intEnv("MAX_UPLOAD_BYTES", 20 * 1024 * 1024, 1024 * 1024 * 1024),
} as const;
