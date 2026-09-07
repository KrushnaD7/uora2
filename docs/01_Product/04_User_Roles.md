# User Roles & Permissions

Version: 2.0

Status: Planning

---

# 1. Overview

The UORA Platform is a Role-Based Access Control (RBAC) system where every authenticated user belongs to one or more roles. Each role determines the actions a user can perform, the data they can access, and the portal they can use.

Instead of maintaining separate systems for different users, UORA provides one unified platform with role-specific dashboards and permissions.

Every authenticated request passes through the following flow:

Login
↓
JWT Authentication
↓
User Identification
↓
Role Validation
↓
Permission Check
↓
Requested Resource

---

# 2. User Categories

The platform has two primary user categories.

## Public Users

These users do not require authentication.

Users include

- Visitors
- Readers
- Researchers
- Students
- Institutions

Public users can

- Browse journals
- Search articles
- View issues
- Download published papers
- Read editorial information
- View journal details
- Contact UORA

Public users cannot

- Submit manuscripts
- Access dashboards
- Review papers
- Manage journals

---

## Authenticated Users

Authenticated users access the platform through secure login.

Roles include

- Author
- Reviewer
- Editor
- Managing Editor
- Editor-in-Chief
- Admin
- Super Admin

Each role has different permissions.

---

# 3. Role Hierarchy

```
Super Admin
│
├── Admin
│     │
│     ├── Editor-in-Chief
│     │       │
│     │       ├── Managing Editor
│     │       │       │
│     │       │       └── Editor
│     │       │
│     │       └── Reviewer
│     │
│     └── Author
│
└── Public User
```

Higher roles inherit greater administrative privileges but do not automatically perform lower-role workflows.

---

# 4. Public User

## Purpose

Access published research without registration.

## Dashboard

None

## Permissions

- View journals
- View issues
- View articles
- Search articles
- Download PDFs
- Read About pages
- Contact organization

## Restrictions

Cannot

- Login to portals
- Submit papers
- Review manuscripts
- Access unpublished content

---

# 5. Author

## Purpose

Submit research papers and manage submissions.

## Main Portal

/author

## Responsibilities

- Complete profile
- Submit manuscript
- Upload supplementary files
- Respond to revision requests
- Track manuscript status
- View editorial decisions
- Download acceptance letter (future)
- View publication history

## Permissions

Create

- Manuscript Submission

Read

- Own submissions
- Own reviews (after decision)
- Own decisions
- Own profile

Update

- Profile
- Manuscript before review
- Revision files

Delete

- Draft submissions only

Cannot

- Assign reviewers
- Publish papers
- View other authors
- View confidential reviews
- Manage journals

---

# 6. Reviewer

## Purpose

Evaluate assigned manuscripts.

## Main Portal

/reviewer

## Responsibilities

- Accept review invitation
- Reject review invitation
- Download manuscript
- Submit review
- Recommend editorial decision
- Meet review deadlines

## Permissions

Read

- Assigned manuscripts

Create

- Peer review

Update

- Submitted review until deadline

Cannot

- Publish articles
- Assign reviewers
- Edit submissions
- View unrelated papers

---

# 7. Editor

## Purpose

Manage manuscript processing.

## Main Portal

/editor

## Responsibilities

- Initial manuscript screening
- Assign reviewers
- Monitor review progress
- Request revisions
- Communicate with authors
- Recommend decisions

## Permissions

Manage

- Assigned submissions
- Reviewer assignments
- Editorial comments

Read

- Reviews
- Author revisions

Cannot

- Manage system users
- Delete journals
- Configure platform

---

# 8. Managing Editor

## Purpose

Coordinate editorial operations for one or more journals.

## Main Portal

/editor

## Responsibilities

- Supervise editors
- Monitor submission pipeline
- Manage publication schedule
- Create issues
- Manage volumes
- Verify accepted articles

## Permissions

Manage

- Editors
- Issues
- Volumes
- Publications

Approve

- Editorial recommendations

Cannot

- Manage platform configuration
- Manage global users

---

# 9. Editor-in-Chief

## Purpose

Final authority for journal publication.

## Main Portal

/editor

## Responsibilities

- Final publication approval
- Editorial policy
- Quality assurance
- Assign editors
- Resolve conflicts

## Permissions

Approve

- Publication
- Editorial decisions

Manage

- Editorial board
- Journal settings

Reject

- Any submission

Cannot

- Configure platform infrastructure

---

# 10. Admin

## Purpose

Platform administrator.

## Main Portal

/admin

## Responsibilities

- Manage journals
- Manage users
- Assign roles
- Configure settings
- Monitor platform
- Generate reports

## Permissions

CRUD

- Users
- Journals
- Issues
- Volumes
- Articles
- Roles
- Permissions

Manage

- Editorial assignments
- Website content
- Contact information

Cannot

- Modify system source code

---

# 11. Super Admin

## Purpose

Complete platform ownership.

Reserved for platform owner.

## Main Portal

/admin

## Responsibilities

Everything.

## Permissions

Unlimited.

Includes

- Create admins
- Remove admins
- Global settings
- Security
- Environment configuration
- System maintenance
- Audit logs
- Complete database access

---

# 12. Role Comparison

| Feature | Public | Author | Reviewer | Editor | Managing Editor | Editor-in-Chief | Admin | Super Admin |
|----------|---------|---------|-----------|---------|-----------------|-----------------|-------|--------------|
| Read Articles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Paper | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Track Submission | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review Paper | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign Reviewer | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editorial Decision | ❌ | ❌ | Recommendation | ✅ | ✅ | Final Approval | ✅ | ✅ |
| Publish Article | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Journals | ❌ | ❌ | ❌ | ❌ | Limited | Limited | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Limited | ✅ |

---

# 13. Portal Mapping

| Role | Portal |
|--------|---------|
| Public | / |
| Author | /author |
| Reviewer | /reviewer |
| Editor | /editor |
| Managing Editor | /editor |
| Editor-in-Chief | /editor |
| Admin | /admin |
| Super Admin | /admin |

---

# 14. Authentication Flow

```
User

↓

Login

↓

JWT Generated

↓

Role Retrieved

↓

Permission Middleware

↓

Portal Redirect

↓

Dashboard
```

---

# 15. Permission Model

The platform follows RBAC.

Permissions are grouped into

- Create
- Read
- Update
- Delete
- Publish
- Assign
- Approve
- Configure

Permissions are granted to roles rather than individual users.

Future versions may support custom permission groups.

---

# 16. Future Roles (Planned)

The following roles may be introduced as the platform grows.

- Journal Manager
- Copy Editor
- Language Editor
- Layout Designer
- Proofreader
- DOI Manager
- Finance Manager
- Institutional Administrator
- Publisher
- API Client

These roles are not part of the initial release but have been considered in the platform architecture.