import crypto from "crypto";

/**
 * Generate a cryptographically-secure opaque token (for refresh tokens,
 * password-reset tokens, and email-verification tokens). Raw tokens are given
 * to the client ONLY; only their SHA-256 hashes are ever stored in the DB.
 */
export function generateOpaqueToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/** SHA-256 hash of a token, for storage comparison. Never reversible. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison of a raw token against a stored hash.
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const candidate = hashToken(token);
  const a = Buffer.from(candidate);
  const b = Buffer.from(hash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
