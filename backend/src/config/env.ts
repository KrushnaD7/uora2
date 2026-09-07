import dotenv from "dotenv";
import path from "path";

dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
};

const NODE_ENV = process.env.NODE_ENV || "development";

// Parse an env var as an integer with a fallback, rejecting absurd values.
const intEnv = (name: string, fallback: number, max = Number.MAX_SAFE_INTEGER): number => {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > max) {
    throw new Error(`Invalid environment variable: ${name} (expected positive integer <= ${max})`);
  }
  return n;
};

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: requireEnv("DATABASE_URL"),

  JWT_SECRET: requireEnv("JWT_SECRET"),

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  JWT_ISSUER: process.env.JWT_ISSUER || "uora-api",
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || "uora-client",

  // Refresh token lifetime in days.
  REFRESH_EXPIRES_DAYS: intEnv("REFRESH_EXPIRES_DAYS", 14, 90),

  // Password-reset token lifetime in minutes.
  PASSWORD_RESET_EXPIRES_MINUTES: intEnv("PASSWORD_RESET_EXPIRES_MINUTES", 60, 1440),

  // Email verification token lifetime in hours.
  EMAIL_VERIFY_EXPIRES_HOURS: intEnv("EMAIL_VERIFY_EXPIRES_HOURS", 24, 168),

  // JSON body size limit (bytes).
  BODY_LIMIT: process.env.BODY_LIMIT || "1mb",

  // Number of reverse-proxy hops in front of this app (Express "trust proxy").
  // Wrong values here make rate limiting/audit-log IPs unreliable — see
  // .env.example for how to determine the correct value for your host.
  TRUST_PROXY_HOPS: intEnv("TRUST_PROXY_HOPS", 1, 10),

  // List of allowed CORS origins. Never "*" when credentials are allowed.
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Directory where uploaded files are stored privately (never served statically).
  uploadsDir: path.join(process.cwd(), "uploads"),

  // ---------------------------------------------------------------------------
  // Email / SMTP  (optional — server starts without these; email is disabled)
  // Set all four (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM) to enable SMTP.
  //
  // Canonical names are SMTP_* (matches Hostinger / most hosting providers'
  // conventions). MAIL_* is accepted as a fallback alias for one release so an
  // existing deployment configured with the old names keeps working — prefer
  // SMTP_* for any new configuration.
  // ---------------------------------------------------------------------------
  MAIL_HOST: process.env.SMTP_HOST || process.env.MAIL_HOST || "",
  MAIL_PORT: intEnv("SMTP_PORT", intEnv("MAIL_PORT", 465, 65535), 65535),
  MAIL_SECURE:
    ((process.env.SMTP_SECURE ?? process.env.MAIL_SECURE) ?? "true") !== "false", // true = TLS (port 465)
  MAIL_USER: process.env.SMTP_USER || process.env.MAIL_USER || "",
  MAIL_PASS: process.env.SMTP_PASS || process.env.MAIL_PASS || "",
  MAIL_FROM: process.env.SMTP_FROM || process.env.MAIL_FROM || "",

  // ---------------------------------------------------------------------------
  // Admin bootstrap / recovery
  // ---------------------------------------------------------------------------
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@uora.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_NAME: process.env.ADMIN_NAME || "System Administrator",
  // When unset, POST /api/auth/bootstrap-admin is disabled (returns 404).
  ADMIN_BOOTSTRAP_SECRET: process.env.ADMIN_BOOTSTRAP_SECRET || "",
};

if (env.NODE_ENV === "production" && env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long in production."
  );
}

const allowedOrigins: string[] = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOrigins =
  allowedOrigins.length > 0 ? allowedOrigins : [env.FRONTEND_URL];
