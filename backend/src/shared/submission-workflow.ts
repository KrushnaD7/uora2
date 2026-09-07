import { UserRole } from "../middlewares/role.middleware";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "INITIAL_SCREENING"
  | "UNDER_REVIEW"
  | "REVISION_REQUIRED"
  | "REVISED_SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "PUBLISHED";

type AllowedRole = "AUTHOR" | "EDITOR" | "ADMIN" | "SUB_ADMIN";

/**
 * Centralized submission status transition rules.
 * Returns true if the given role may move a submission from `from` to `to`.
 */
export function canTransition(
  from: SubmissionStatus,
  to: SubmissionStatus,
  role: string | undefined
): boolean {
  const normalizedRole = (role || "").toUpperCase();
  const actor = normalizedRole as UserRole;

  if (actor === "AUTHOR") {
    return (
      (from === "DRAFT" && to === "SUBMITTED") ||
      (from === "REVISION_REQUIRED" && to === "REVISED_SUBMITTED")
    );
  }

  if (isEditorialRole(actor)) {
    return editorialTransitions(from, to);
  }

  return false;
}

export function isEditorialRole(role: UserRole): boolean {
  return role === "EDITOR" || role === "ADMIN" || role === "SUB_ADMIN";
}

function editorialTransitions(
  from: SubmissionStatus,
  to: SubmissionStatus
): boolean {
  switch (from) {
    case "SUBMITTED":
      return to === "INITIAL_SCREENING" || to === "REJECTED";
    case "INITIAL_SCREENING":
      return to === "UNDER_REVIEW" || to === "REJECTED";
    case "UNDER_REVIEW":
      return (
        to === "REVISION_REQUIRED" ||
        to === "ACCEPTED" ||
        to === "REJECTED"
      );
    case "REVISION_REQUIRED":
      return to === "UNDER_REVIEW" || to === "ACCEPTED" || to === "REJECTED";
    case "REVISED_SUBMITTED":
      return to === "UNDER_REVIEW" || to === "ACCEPTED" || to === "REJECTED";
    case "ACCEPTED":
      return to === "PUBLISHED";
    default:
      return false;
  }
}
