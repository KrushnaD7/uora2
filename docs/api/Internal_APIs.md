# Internal APIs

Version: 2.0

Status: Planning

Base URL

/api/v1

Authentication

✅ Required

Authorization

RBAC

---

# Overview

Internal APIs require authentication.

Every request includes

Authorization

Bearer Token

Access is controlled through Role-Based Access Control (RBAC).

---

# User APIs

GET

/users/me

Current User

---

PUT

/users/profile

Update Profile

---

PUT

/users/password

Change Password

---

# Author APIs

GET

/author/dashboard

Dashboard

---

POST

/submissions

Submit Manuscript

---

PUT

/submissions/{id}

Update Draft

---

POST

/submissions/{id}/revision

Upload Revision

---

GET

/submissions

My Submissions

---

GET

/submissions/{id}

Submission Details

---

# Reviewer APIs

GET

/reviewer/dashboard

---

GET

/reviewer/invitations

---

POST

/reviewer/invitations/{id}/accept

---

POST

/reviewer/invitations/{id}/decline

---

GET

/reviewer/assignments

---

POST

/reviews

Submit Review

---

PUT

/reviews/{id}

Edit Review

---

# Editor APIs

GET

/editor/dashboard

---

GET

/editor/submissions

---

POST

/editor/submissions/{id}/assign-reviewer

---

POST

/editor/submissions/{id}/decision

---

POST

/editor/issues

Create Issue

---

POST

/editor/volumes

Create Volume

---

POST

/editor/publications

Publish Article

---

# Admin APIs

GET

/admin/dashboard

---

CRUD

/users

---

CRUD

/roles

---

CRUD

/permissions

---

CRUD

/journals

---

CRUD

/volumes

---

CRUD

/issues

---

CRUD

/articles

---

CRUD

/editorial-board

---

CRUD

/settings

---

CRUD

/website

---

GET

/reports

---

GET

/audit-logs

---

# Notification APIs

GET

/notifications

---

PUT

/notifications/read

---

DELETE

/notifications/{id}

---

# Media APIs

POST

/uploads

---

DELETE

/uploads/{id}

---

GET

/uploads/{id}

---

# Dashboard APIs

GET

/dashboard/stats

---

GET

/dashboard/activity

---

GET

/dashboard/charts

---

# Future APIs

AI

DOI

ORCID

Crossref

Email

Analytics

Mobile

API Keys