# Backend Architecture

Version: 2.0

Status: Planning

Framework: Express.js

Language: TypeScript

Architecture: Layered Modular Architecture

---

# 1. Overview

The UORA backend is designed as a modular REST API server responsible for managing authentication, journals, submissions, peer reviews, editorial workflows, publications, notifications, and administration.

The backend follows a strict Layered Architecture to ensure scalability, maintainability, and clean separation of concerns.

Every module follows the exact same internal structure.

---

# 2. Architecture Goals

The backend is designed to be

- Modular
- Scalable
- Secure
- Testable
- Reusable
- Maintainable
- API First

---

# 3. Layered Architecture

Every request follows the same pipeline.

Client

↓

Route

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL

↓

Response

No layer is skipped.

---

# 4. Layer Responsibilities

## Route Layer

Responsibilities

- API Endpoints
- HTTP Methods
- Middleware Registration

Contains

No Business Logic

---

## Middleware Layer

Responsibilities

Authentication

Authorization

Validation

Logging

Rate Limiting

Error Handling

---

## Controller Layer

Responsibilities

Receive Request

Call Service

Return Response

Controllers never access Prisma directly.

---

## Service Layer

Business Logic

Workflow Execution

Validation

Transactions

Notifications

Permissions

This is the core of the platform.

---

## Repository Layer

Responsibilities

CRUD Operations

Database Queries

Search

Pagination

Filtering

Repositories communicate only with Prisma.

---

## ORM Layer

Technology

Prisma

Responsibilities

Schema

Relations

Transactions

Migrations

---

## Database Layer

Technology

PostgreSQL

Stores

Users

Journals

Articles

Reviews

Notifications

Logs

Settings

---

# 5. Backend Modules

Authentication

Users

Roles

Permissions

Journals

Volumes

Issues

Articles

Authors

Submissions

Reviews

Editorial Decisions

Notifications

Reports

Audit Logs

Dashboard

Settings

Each module is independent.

---

# 6. Module Structure

Each module follows the same structure.

module/

routes.ts

controller.ts

service.ts

repository.ts

validation.ts

types.ts

constants.ts

interfaces.ts

index.ts

---

# 7. Shared Components

Shared Query Builder

Base Repository

Base Service

Logger

Error Handler

Utilities

Constants

Types

Helpers

These components are reused across all modules.

---

# 8. Authentication

JWT

RBAC

Password Hashing

Refresh Token (Future)

Email Verification

Password Reset

---

# 9. File Upload

Supported Files

PDF

DOCX

Images

Supplementary Files

Storage

Local

Future

AWS S3

Cloud Storage

---

# 10. Error Handling

Centralized Error Middleware

Consistent API Responses

Validation Errors

Authentication Errors

Business Errors

Database Errors

---

# 11. Logging

API Logs

Authentication Logs

Submission Logs

Publication Logs

Audit Logs

---

# 12. Future Improvements

Redis

Queue System

Email Service

Microservices

WebSockets

AI Services

Monitoring

Caching

---

# 13. Design Principles

Single Responsibility

Dependency Injection

Reusable Components

Consistent Module Structure

Service Driven Architecture

API First