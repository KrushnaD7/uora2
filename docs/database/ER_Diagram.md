# Entity Relationship Diagram (ERD)

Version: 2.0

Status: Planning

Database

PostgreSQL

ORM

Prisma

---

# Overview

The UORA Platform follows a relational database architecture supporting multiple journals, multiple editorial boards, multiple user roles, and the complete scholarly publishing lifecycle.

The ER Diagram is divided into logical domains.

Authentication

↓

Organization

↓

Publication

↓

Editorial Workflow

↓

Administration

↓

Notifications

↓

Audit

---

# High-Level ER Diagram

User
 │
 ├──────────────┐
 │              │
 ▼              ▼
UserRole     UserProfile
 │
 ▼
Role
 │
 ▼
Permission

────────────────────────────

Journal
 │
 ├───────► JournalMember
 │               │
 │               ▼
 │             User
 │
 ▼
Volume
 │
 ▼
Issue
 │
 ▼
Article
 │
 ▼
ArticleFile

────────────────────────────

Submission
 │
 ├────────► SubmissionAuthor
 │
 ├────────► SubmissionFile
 │
 ├────────► ReviewerAssignment
 │                 │
 │                 ▼
 │              Review
 │
 ▼
EditorialDecision

────────────────────────────

Notification

AuditLog

Settings

Announcement

────────────────────────────

Future

DOI

Citation

ORCID

Payments

Analytics

Institution

Conference

---

# Core Relationships

User

↓

JournalMember

↓

Journal

↓

Volume

↓

Issue

↓

Article

Submission

↓

Reviewer Assignment

↓

Review

↓

Editorial Decision

↓

Publication

---

# Relationship Types

User
1:N
Notifications

User
1:N
Audit Logs

Journal
1:N
Volumes

Volume
1:N
Issues

Issue
1:N
Articles

Submission
1:N
Reviews

Submission
1:1
Editorial Decision

User
M:N
Roles

User
M:N
Journals

Submission
M:N
Authors

Reviewer
M:N
Submissions

---

# Detailed ER Diagram

See

Relationships.md

SQL_Tables.md

Prisma Schema (Future)