# API Documentation

Version: 2.0

Status: Planning

Architecture: REST API

---

# 1. Overview

The UORA Platform exposes REST APIs for communication between the frontend applications and the backend.

All authenticated portals consume the same backend services.

The API is divided into

Public APIs

Internal APIs

Administrative APIs

---

# 2. API Principles

The API follows these principles.

RESTful

Stateless

JSON Based

Versioned

Secure

Consistent

Documented

---

# 3. API Categories

Authentication

User Management

Journal Management

Volume Management

Issue Management

Article Management

Submission Management

Review Management

Editorial Management

Notification Management

Search

Reports

Dashboard

Settings

---

# 4. Public APIs

Accessible without login.

Examples

Browse Journals

Browse Articles

Search

Download PDFs

Current Issues

Archives

Editorial Board

Contact Information

---

# 5. Protected APIs

Require JWT authentication.

Modules

Author

Reviewer

Editor

Admin

Authentication middleware validates every request.

---

# 6. Authentication Flow

Client

↓

Login Request

↓

JWT Generated

↓

Access Token Returned

↓

Protected Request

↓

JWT Validation

↓

Controller

↓

Response

---

# 7. Request Lifecycle

Client

↓

Route

↓

Authentication

↓

Role Validation

↓

Request Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response

---

# 8. Request Format

All requests use JSON.

Multipart Form Data is used for

Manuscript Upload

Images

PDFs

Supplementary Files

---

# 9. Response Format

Every response follows one standard format.

Success

Message

Data

Pagination (If Required)

Metadata (Optional)

Error

Status

Message

Validation Errors

Timestamp

---

# 10. Authentication

JWT Authentication

Bearer Token

Role Middleware

Permission Middleware

---

# 11. Validation

Every request passes through

Schema Validation

Business Validation

Authorization

Database Validation

---

# 12. Error Handling

Consistent HTTP Status Codes.

200

201

400

401

403

404

409

422

500

---

# 13. Pagination

Supported by

Articles

Submissions

Reviews

Users

Journals

Notifications

---

# 14. Filtering

Search

Sorting

Status

Journal

Issue

Volume

Publication Date

Author

Reviewer

Editor

---

# 15. Versioning

Current Version

v1

Future

v2

Breaking changes will create new API versions.

---

# 16. Security

JWT

RBAC

Input Validation

Rate Limiting

CORS

HTTPS

Audit Logging

---

# 17. Documentation

Swagger/OpenAPI

Postman Collection

API Examples

Detailed endpoint documentation is maintained separately.

See

api/Public_APIs.md

api/Internal_APIs.md

api/API_Examples.md

---

# 18. Future APIs

DOI Service

ORCID

Crossref

Google Scholar

Email Service

Analytics

AI Services

Notifications

Mobile APIs























/api/v1

/auth
/users
/journals
/volumes
/issues
/articles
/submissions
/reviews
/editorial-decisions
/notifications
/reports
/settings