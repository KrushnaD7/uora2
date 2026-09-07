# Database Relationships

Version: 2.0

Status: Planning

---

# Authentication

User

M:N

Role

↓

Role

M:N

Permission

↓

User

1:1

Profile

────────────────────────────

# Journals

Journal

1:N

Volume

↓

Volume

1:N

Issue

↓

Issue

1:N

Article

────────────────────────────

# Journal Membership

User

M:N

Journal

using

JournalMember

A user can belong to multiple journals.

Each journal can have multiple users.

Role is journal-specific.

────────────────────────────

# Article

Article

M:N

Author

using

ArticleAuthor

Article

M:N

Keyword

using

ArticleKeyword

Article

1:N

Files

────────────────────────────

# Submission

Submission

M:N

Author

using

SubmissionAuthor

Submission

1:N

SubmissionVersion

Submission

1:N

SubmissionFile

────────────────────────────

# Review

Submission

1:N

ReviewerAssignment

↓

ReviewerAssignment

1:1

Review

↓

Review

1:N

ReviewComment

────────────────────────────

# Editorial

Submission

1:1

EditorialDecision

↓

EditorialDecision

↓

Article

(after acceptance)

────────────────────────────

# Notifications

User

1:N

Notifications

────────────────────────────

# Logs

User

1:N

AuditLogs

────────────────────────────

# Settings

Journal

1:1

JournalSettings

────────────────────────────

# Future

User

1:1

ORCID

Article

1:1

DOI

Article

1:N

Citation

Institution

1:N

Users




🔥 Now the Most Important Part (Database Redesign)

After analyzing everything, I would change the original database design before writing a single Prisma model.

❌ Don't do this
users

id
name
email
role

This is too limiting.

✅ Instead
users

id
name
email

↓

user_roles

↓

roles

↓

permissions

Even better:

users

↓

journal_members

↓

journals

↓

roles

Example:

User	Journal	Role
Dr. A	UJGSM	Author
Dr. A	Medical Journal	Reviewer
Dr. A	Humanities Journal	Editor

The same person can participate differently in different journals.

Another important improvement

Avoid storing only the current state of a submission.

Instead, model the history:

Submission

↓

Submission Version 1

↓

Revision 1

↓

Revision 2

↓

Accepted Version

↓

Published Article

This preserves the full editorial history and supports revision tracking without overwriting earlier versions.

My recommendation before Prisma

I would not write the Prisma schema immediately.

Instead, the next step should be:

Design every SQL table in detail (columns, types, constraints, indexes).
Review the complete schema.
Then generate the Prisma models from that design.

That approach minimizes schema churn and gives you a much more stable foundation for development.





