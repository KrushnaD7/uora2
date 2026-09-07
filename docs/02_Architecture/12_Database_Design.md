# Database Design

Version: 2.0

Status: Planning

Database: PostgreSQL

ORM: Prisma

---

# 1. Overview

The UORA Platform uses a relational database architecture designed to support multiple journals, multiple editorial teams, and the complete scholarly publishing lifecycle.

The database is the central source of truth for every entity within the platform.

The design prioritizes

- Data Integrity
- Scalability
- Normalization
- Security
- Maintainability
- Multi-Journal Support

---

# 2. Design Principles

The database follows these principles:

• Every business entity has its own table.

• Foreign keys enforce relationships.

• Soft delete is preferred for business records.

• UUIDs are used as primary identifiers.

• Audit information is stored for every important record.

• Business rules are enforced through services rather than database triggers whenever possible.

---

# 3. Database Architecture

Platform

↓

Authentication

↓

Users

↓

Roles

↓

Journals

↓

Volumes

↓

Issues

↓

Articles

↓

Submissions

↓

Reviews

↓

Editorial Decisions

↓

Notifications

↓

Reports

Every module owns its own tables while sharing common authentication and user data.

---

# 4. Core Domains

The database is divided into multiple domains.

Authentication Domain

User Domain

Journal Domain

Publication Domain

Editorial Domain

Notification Domain

Administration Domain

Analytics Domain

---

# 5. Authentication Domain

Responsible for

- Users
- Roles
- Permissions
- Sessions
- Password Reset
- Email Verification

---

# 6. Journal Domain

Responsible for

- Journals

- Editorial Board

- Journal Settings

- Disciplines

- Categories

- Indexing Information

---

# 7. Publication Domain

Responsible for

Volumes

Issues

Articles

PDFs

Files

DOI (Future)

Citation

Keywords

Authors

Affiliations

---

# 8. Editorial Domain

Responsible for

Submissions

Reviewer Assignments

Reviews

Editorial Decisions

Revision Requests

Publication Queue

---

# 9. Administration Domain

Responsible for

Users

Roles

Permissions

Website Content

Configurations

Announcements

Audit Logs

---

# 10. Relationships

The platform follows relational modelling.

Example

Journal

↓

Volume

↓

Issue

↓

Article

Another workflow

User

↓

Submission

↓

Review

↓

Decision

↓

Publication

Detailed relationships are documented separately.

See

database/Relationships.md

database/ER_Diagram.md

---

# 11. Data Integrity

The database enforces

Primary Keys

Foreign Keys

Unique Constraints

Indexes

Cascade Rules

Check Constraints

Transactions

---

# 12. Naming Convention

Tables

snake_case

Columns

snake_case

Primary Key

id

Foreign Keys

xxx_id

Timestamps

created_at

updated_at

deleted_at

---

# 13. Auditing

Every important table stores

Created By

Updated By

Created At

Updated At

Deleted At

Deleted By (Future)

---

# 14. Performance

Indexes will be added for

Email

Journal Slug

Submission Status

Article Slug

Volume

Issue

Publication Date

Search Keywords

---

# 15. Security

Passwords

Hashed

Tokens

Encrypted

Sensitive Information

Restricted by Role

Database Access

Backend Only

---

# 16. Scalability

The schema supports

Unlimited Journals

Unlimited Articles

Unlimited Authors

Unlimited Reviewers

Unlimited Editorial Boards

Future Integrations

ORCID

Crossref

DOI

Google Scholar

---

# 17. Future Expansion

Future database modules include

Payments

Subscriptions

AI Analysis

Citation Metrics

Institution Management

Conference Management

API Clients

Mobile Devices

---

# 18. Related Documents

database/SQL_Tables.md

database/Relationships.md

database/ER_Diagram.md