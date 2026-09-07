import { UserRole } from "../middlewares/role.middleware";

export const PERMISSIONS = {
  // Dashboard
  view_dashboard: "view_dashboard",

  // Submissions / Manuscripts
  submit_manuscript: "submit_manuscript",
  view_manuscript: "view_manuscript",
  view_all_manuscripts: "view_all_manuscripts",
  edit_manuscript: "edit_manuscript",
  withdraw_manuscript: "withdraw_manuscript",
  upload_manuscript: "upload_manuscript",
  download_manuscript: "download_manuscript",
  transition_manuscript_status: "transition_manuscript_status",
  override_manuscript_status: "override_manuscript_status",
  request_reviewer: "request_reviewer",

  // Reviewer assignment & reviews
  assign_reviewer: "assign_reviewer",
  unassign_reviewer: "unassign_reviewer",
  view_reviewer_assignments: "view_reviewer_assignments",
  submit_review: "submit_review",
  update_review: "update_review",
  view_review: "view_review",

  // Editorial decisions
  make_editorial_decision: "make_editorial_decision",
  view_status_history: "view_status_history",

  // Articles
  publish_article: "publish_article",
  view_article: "view_article",
  edit_article: "edit_article",
  delete_article: "delete_article",

  // Journals / Volumes / Issues
  create_journal: "create_journal",
  edit_journal: "edit_journal",
  delete_journal: "delete_journal",
  manage_volumes: "manage_volumes",
  manage_issues: "manage_issues",

  // Users
  create_user: "create_user",
  view_users: "view_users",
  edit_user: "edit_user",
  delete_user: "delete_user",

  // Reviewer management
  view_reviewer_applications: "view_reviewer_applications",
  approve_reviewer_application: "approve_reviewer_application",
  reject_reviewer_application: "reject_reviewer_application",
  view_reviewers: "view_reviewers",
  edit_reviewer: "edit_reviewer",
  delete_reviewer: "delete_reviewer",

  // Journal suggestions
  create_suggestion: "create_suggestion",
  view_suggestions: "view_suggestions",
  evaluate_suggestion: "evaluate_suggestion",
  decide_suggestion: "decide_suggestion",

  // Notifications
  view_notifications: "view_notifications",
  mark_notifications_read: "mark_notifications_read",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] =
  Object.values(PERMISSIONS) as Permission[];

const EDITORIAL_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.view_dashboard,

  PERMISSIONS.view_manuscript,
  PERMISSIONS.view_all_manuscripts,
  PERMISSIONS.download_manuscript,
  PERMISSIONS.transition_manuscript_status,

  PERMISSIONS.assign_reviewer,
  PERMISSIONS.unassign_reviewer,
  PERMISSIONS.view_reviewer_assignments,
  PERMISSIONS.view_review,

  PERMISSIONS.make_editorial_decision,
  PERMISSIONS.view_status_history,

  PERMISSIONS.view_article,
  PERMISSIONS.edit_article,
  PERMISSIONS.publish_article,

  PERMISSIONS.create_journal,
  PERMISSIONS.edit_journal,
  PERMISSIONS.delete_journal,
  PERMISSIONS.manage_volumes,
  PERMISSIONS.manage_issues,

  PERMISSIONS.view_reviewers,
  PERMISSIONS.edit_reviewer,
  PERMISSIONS.view_reviewer_applications,
  PERMISSIONS.approve_reviewer_application,
  PERMISSIONS.reject_reviewer_application,

  PERMISSIONS.view_suggestions,
  PERMISSIONS.evaluate_suggestion,

  PERMISSIONS.view_notifications,
  PERMISSIONS.mark_notifications_read,
];

const SUB_ADMIN_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.view_dashboard,

  PERMISSIONS.view_manuscript,
  PERMISSIONS.view_all_manuscripts,
  PERMISSIONS.download_manuscript,
  PERMISSIONS.transition_manuscript_status,

  PERMISSIONS.assign_reviewer,
  PERMISSIONS.unassign_reviewer,
  PERMISSIONS.view_reviewer_assignments,
  PERMISSIONS.view_review,

  PERMISSIONS.make_editorial_decision,
  PERMISSIONS.view_status_history,

  PERMISSIONS.view_article,
  PERMISSIONS.edit_article,
  PERMISSIONS.publish_article,

  PERMISSIONS.create_journal,
  PERMISSIONS.edit_journal,
  PERMISSIONS.delete_journal,
  PERMISSIONS.manage_volumes,
  PERMISSIONS.manage_issues,

  PERMISSIONS.view_reviewers,
  PERMISSIONS.edit_reviewer,

  PERMISSIONS.view_suggestions,

  PERMISSIONS.view_notifications,
  PERMISSIONS.mark_notifications_read,
];

const REVIEWER_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.view_dashboard,

  PERMISSIONS.view_manuscript,
  PERMISSIONS.download_manuscript,
  PERMISSIONS.view_reviewer_assignments,
  PERMISSIONS.submit_review,
  PERMISSIONS.update_review,
  PERMISSIONS.view_review,
  PERMISSIONS.view_status_history,

  PERMISSIONS.edit_reviewer,

  PERMISSIONS.view_notifications,
  PERMISSIONS.mark_notifications_read,
];

const AUTHOR_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.view_dashboard,

  PERMISSIONS.submit_manuscript,
  PERMISSIONS.view_manuscript,
  PERMISSIONS.edit_manuscript,
  PERMISSIONS.withdraw_manuscript,
  PERMISSIONS.upload_manuscript,
  PERMISSIONS.download_manuscript,
  PERMISSIONS.transition_manuscript_status,
  PERMISSIONS.request_reviewer,

  PERMISSIONS.view_reviewer_assignments,
  PERMISSIONS.view_review,
  PERMISSIONS.view_status_history,

  PERMISSIONS.create_suggestion,
  PERMISSIONS.view_suggestions,

  PERMISSIONS.view_notifications,
  PERMISSIONS.mark_notifications_read,
];

export const ROLE_PERMISSIONS: Record<
  UserRole,
  readonly Permission[]
> = {
  ADMIN: ALL_PERMISSIONS,
  SUB_ADMIN: SUB_ADMIN_PERMISSIONS,
  EDITOR: EDITORIAL_PERMISSIONS,
  REVIEWER: REVIEWER_PERMISSIONS,
  AUTHOR: AUTHOR_PERMISSIONS,
};

export function getPermissionsForRole(
  role: string | undefined
): readonly Permission[] {
  if (!role) return [];
  const normalized = role.toUpperCase() as UserRole;
  return ROLE_PERMISSIONS[normalized] ?? [];
}

export function hasPermission(
  role: string | undefined,
  permission: Permission
): boolean {
  return getPermissionsForRole(role).includes(permission);
}
