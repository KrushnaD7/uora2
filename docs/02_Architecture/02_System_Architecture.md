# System Architecture

Version: 2.0

Status: Planning

Architecture Style: Layered Monolithic Architecture

---

# 1. Overview

The UORA Platform follows a modular layered architecture designed to support multiple academic journals through a single backend and a unified frontend.

The architecture separates responsibilities into independent layers, making the platform scalable, maintainable, and easy to extend.

Unlike traditional journal websites, UORA is designed as a publishing platform where multiple journals share the same infrastructure while maintaining independent editorial operations.

---

# 2. High-Level Architecture

                         Internet
                             │
                             ▼
                    UORA Frontend (Next.js)
                             │
                             ▼
                     REST API (Express.js)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
 Authentication         Business Logic      File Storage
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                     Prisma ORM Layer
                             │
                             ▼
                      PostgreSQL Database

---

# 3. Platform Layers

The platform is divided into seven logical layers.

Presentation Layer

↓

Routing Layer

↓

Controller Layer

↓

Service Layer

↓

Repository Layer

↓

ORM Layer

↓

Database Layer

Each layer has a single responsibility.

---

# 4. Presentation Layer

Technology

- Next.js
- React
- TypeScript
- Tailwind CSS

Responsibilities

- Render UI
- Form Validation
- API Communication
- Authentication
- Dashboard Rendering
- Public Website
- Portal Interfaces

No database logic exists in this layer.

---

# 5. Routing Layer

Responsibilities

- API Routing
- Authentication Middleware
- Role Middleware
- Validation Middleware
- Rate Limiting

Example

/auth/login

/users

/journals

/submissions

/articles

---

# 6. Controller Layer

Responsibilities

- Receive Request
- Validate Request
- Call Service
- Return Response

Controllers never contain business logic.

---

# 7. Service Layer

This is the core business layer.

Responsibilities

- Business Rules
- Validation
- Workflow Execution
- Authorization
- Transactions

Example

SubmissionService

ReviewService

JournalService

NotificationService

---

# 8. Repository Layer

Responsibilities

- Database Queries
- CRUD Operations
- Pagination
- Filtering
- Searching

Repositories communicate only with Prisma.

---

# 9. ORM Layer

Technology

Prisma ORM

Responsibilities

- Database Mapping
- Query Generation
- Relations
- Transactions
- Migrations

---

# 10. Database Layer

Technology

PostgreSQL

Responsibilities

- Persistent Storage
- Data Integrity
- Relationships
- Indexes
- Constraints

---

# 11. Public Platform

Accessible without login.

Modules

- Landing Page
- About
- Vision
- Mission
- Journals
- Journal Pages
- Current Issues
- Archives
- Search
- Articles
- Editorial
- Contact

---

# 12. Authenticated Platform

Role-based access.

Modules

Author Portal

Reviewer Portal

Editor Portal

Admin Portal

Every portal communicates with the same backend.

---

# 13. Module Architecture

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

Each module is independent.

---

# 14. Request Lifecycle

Client

↓

HTTP Request

↓

Route

↓

Authentication Middleware

↓

Role Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Response

---

# 15. Authentication Flow

User

↓

Login

↓

JWT Generated

↓

Stored Securely

↓

Protected API Request

↓

JWT Validation

↓

Role Validation

↓

Controller

---

# 16. Role-Based Access Control

Authentication

↓

User

↓

Assigned Roles

↓

Permissions

↓

Resource Access

Roles determine access to every protected endpoint.

---

# 17. File Storage Architecture

The platform stores

- Manuscripts
- PDFs
- Images
- Supplementary Files
- Journal Logos

Metadata is stored in PostgreSQL.

Physical files are stored separately.

Future options

- Local Storage
- AWS S3
- Cloud Storage

---

# 18. Logging

System logs

Authentication Logs

Audit Logs

Submission Logs

Review Logs

Publication Logs

API Logs

---

# 19. Scalability

The architecture supports

- Multiple Journals
- Thousands of Articles
- Multiple Editorial Teams
- Independent Journal Configuration
- Future Microservice Migration

---

# 20. Future Architecture

Planned integrations

- DOI Provider
- ORCID
- Crossref
- Google Scholar
- Email Service
- AI Services
- Citation Analytics
- Plagiarism Detection

---

# 21. Design Principles

- Modular
- Layered
- Scalable
- Maintainable
- Secure
- Reusable
- API First
- Database Driven
- Role Based
- Journal Independent