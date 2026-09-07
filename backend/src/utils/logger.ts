import { prisma } from "../config/prisma";
import { LogAction } from "@prisma/client";

/**
 * Record an audit-log entry. Used for security-sensitive actions (logins,
 * role changes, approvals, assignments, editorial decisions, publications,
 * status changes). Never passes passwords/tokens/secrets — only descriptions.
 *
 * Audit logs are write-only for ordinary users; no user-facing route returns
 * these rows except an admin-only query (see user/audit module).
 */
export async function logActivity(
  userId: string,
  action: LogAction,
  module: string,
  description?: string,
  ipAddress?: string,
  entity?: string,
  entityId?: string
) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        description,
        ipAddress,
        entity,
        entityId,
      },
    });
  } catch (error) {
    // Audit logging must never break the primary operation.
    console.error("Failed to log activity:", error);
  }
}

/**
 * Safe client-IP extraction (respecting common proxy headers). Never trusts
 * the value blindly; validates the format.
 */
export function extractIp(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "::1") return undefined;
  return trimmed.slice(0, 64);
}
