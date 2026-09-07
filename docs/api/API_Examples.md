# API Examples

Version: 2.0

Status: Planning

---

# Standard Response

Success

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {}
}

---

Validation Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}

---

Unauthorized

{
  "success": false,
  "message": "Unauthorized."
}

---

Not Found

{
  "success": false,
  "message": "Resource not found."
}

---

Server Error

{
  "success": false,
  "message": "Internal Server Error."
}

---

# Login Example

POST

/auth/login

Request

{
  "email": "user@example.com",
  "password": "password"
}

Response

{
  "success": true,
  "token": "...",
  "user": {}
}

---

# Create Submission

POST

/submissions

Authorization

Bearer Token

Request

Multipart Form Data

Metadata

Files

Response

{
  "success": true,
  "submissionId": "...",
  "status": "Submitted"
}

---

# Get Journals

GET

/journals

Response

{
  "success": true,
  "data": []
}

---

# Assign Reviewer

POST

/editor/submissions/{id}/assign-reviewer

Request

{
  "reviewerId": "...",
  "deadline": "2026-09-15"
}

Response

{
  "success": true,
  "message": "Reviewer assigned."
}

---

# Submit Review

POST

/reviews

Request

{
  "recommendation": "Minor Revision",
  "commentsToAuthor": "...",
  "confidentialComments": "..."
}

Response

{
  "success": true
}

---

# Pagination

{
  "page": 1,
  "limit": 10,
  "total": 120,
  "totalPages": 12
}

---

# Standard Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Naming Convention

Resources

Plural

/users

/journals

/articles

/submissions

Use nouns rather than verbs.

Workflow actions may use descriptive endpoints.

Example

/editor/submissions/{id}/assign-reviewer

/reviewer/invitations/{id}/accept

/editor/submissions/{id}/decision

---

# API Versioning

/api/v1

Future

/api/v2

Breaking changes require a new version.





🚀 One Architectural Recommendation (Very Important)

After reviewing the complete platform, I recommend not designing APIs around user roles. Instead, design them around business resources.

Instead of:

/author/submissions
/editor/submissions
/admin/articles

prefer a resource-oriented structure such as:

/api/v1/submissions
/api/v1/articles
/api/v1/journals
/api/v1/reviews
/api/v1/issues

The same endpoint can serve different roles, while RBAC determines what each user can do.

For example:

Role	GET /submissions	POST /submissions
Author	Own submissions	Create submission
Editor	Journal submissions	Not allowed
Admin	All submissions	System operations

This approach has several advantages:

Smaller and cleaner API surface.
Less duplicated code.
Easier Swagger/OpenAPI documentation.
Better alignment with REST principles.
Simpler permission checks through middleware.

The portal-specific routes (/author/dashboard, /editor/dashboard) still make sense for dashboard data, but most CRUD operations should be resource-based rather than role-based. This will make the backend easier to maintain as the platform grows to support many journals and user roles.