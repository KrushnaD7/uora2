# Business Rules

Version: 2.0

---

# 1. General Rules

1. Every user must have a unique account.
2. Every authenticated action requires a valid JWT.
3. Every user may have one or more platform roles.
4. Every journal is managed independently.
5. Every action must be logged.

---

# 2. Journal Rules

- Every journal has one unique slug.
- Every journal has one Editor-in-Chief.
- Every journal contains multiple volumes.
- Every volume contains multiple issues.
- Every issue contains multiple articles.

---

# 3. Author Rules

- Authors must complete profile before submitting.
- Authors may submit to multiple journals.
- Draft submissions may be edited.
- Submitted manuscripts cannot be modified directly.
- Revisions are submitted as new versions.

---

# 4. Reviewer Rules

- Reviewers only access assigned manuscripts.
- One reviewer cannot review the same version twice.
- Reviews remain confidential.
- Review deadlines are mandatory.

---

# 5. Editor Rules

- Editors cannot review their own assigned manuscripts.
- Editors assign reviewers.
- Editors cannot publish without approval (if journal policy requires).
- Editors record editorial decisions.

---

# 6. Managing Editor Rules

- Managing Editors manage publication schedules.
- Managing Editors supervise Editors.
- Managing Editors verify issue readiness before publication.

---

# 7. Editor-in-Chief Rules

- Final publication approval belongs to Editor-in-Chief.
- Editor-in-Chief may override editorial recommendations.
- Editorial decisions are final once published.

---

# 8. Publication Rules

A manuscript must complete the following stages:

Submitted

↓

Editorial Screening

↓

Peer Review

↓

Editorial Decision

↓

Acceptance

↓

Publication

No manuscript may skip workflow stages.

---

# 9. User Rules

Users may belong to multiple journals.

Example

User A

Author → Journal A

Reviewer → Journal B

Editor → Journal C

Role assignment is journal-specific.

---

# 10. Article Rules

- Every published article belongs to one journal.
- Every article belongs to one volume.
- Every article belongs to one issue.
- Every article has one publication date.
- Every article has one status.

---

# 11. Status Rules

Submission

Draft

Submitted

Under Review

Revision

Accepted

Rejected

Published

Archived

Transitions must follow the defined workflow.

---

# 12. Security Rules

- Passwords are never stored in plain text.
- Authorization is enforced through RBAC.
- Unauthorized requests return HTTP 401/403.
- File uploads are validated.
- API requests are validated before processing.

---

# 13. Audit Rules

The system records:

- Login
- Logout
- Submission
- Review
- Decision
- Publication
- User Management
- Journal Management

Audit logs cannot be modified by standard users.

---

# 14. Data Integrity Rules

- No duplicate journal slug.
- No duplicate email.
- Foreign keys must remain valid.
- Soft delete preferred for business records.
- Published articles cannot be deleted directly.

---

# 15. Future Business Rules

- DOI assignment after publication.
- ORCID verification.
- Plagiarism threshold enforcement.
- Automated reviewer matching.
- Citation tracking.
- Institutional access policies.