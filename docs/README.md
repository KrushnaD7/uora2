# UORA Platform

> **Universal Oneness Research Association (UORA)**  
> A scalable multi-journal academic publishing platform for managing scholarly journals, peer review, editorial workflows, publications, and research dissemination.

---

# 📖 Overview

The UORA Platform is a modern academic publishing system designed to digitize the complete lifecycle of scholarly publishing.

Instead of maintaining separate websites for each journal, UORA provides a **single unified platform** capable of hosting multiple journals while supporting independent editorial teams, publication workflows, and role-based access.

The platform consists of:

- 🌐 Public Website
- 👨‍🎓 Author Portal
- 📝 Reviewer Portal
- 👨‍💼 Editor Portal
- 🛠️ Admin Portal

All powered by a single backend and a centralized PostgreSQL database.

---

# 🎯 Project Goals

- Publish high-quality peer-reviewed journals.
- Digitize the editorial workflow.
- Support multiple journals on one platform.
- Simplify manuscript submission and tracking.
- Improve collaboration between authors, reviewers, and editors.
- Maintain ethical publishing standards.
- Build a scalable publishing ecosystem.

---

# 🏗 Platform Architecture

```
                        Internet
                            │
                            ▼
                  Next.js Frontend
                            │
                            ▼
                  Express REST API
                            │
                            ▼
                      Prisma ORM
                            │
                            ▼
                     PostgreSQL Database
```

---

# 👥 User Roles

| Role | Description |
|------|-------------|
| Visitor | Browse journals and published articles |
| Author | Submit and manage manuscripts |
| Reviewer | Review assigned manuscripts |
| Editor | Manage editorial workflow |
| Managing Editor | Manage publication process |
| Editor-in-Chief | Final editorial authority |
| Admin | Platform administration |
| Super Admin | Complete platform management |

---

# 🚀 Core Modules

- Authentication
- User Management
- Role & Permission Management
- Journal Management
- Editorial Board
- Volume Management
- Issue Management
- Article Management
- Manuscript Submission
- Peer Review
- Editorial Decisions
- Publication Management
- Notifications
- Reports
- Audit Logs

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- RBAC

---

# 📂 Repository Structure

```
uora-platform/

├── docs/
│   ├── 01_Product/
│   ├── 02_Architecture/
│   ├── 03_Portals/
│   ├── 04_Development/
│   ├── api/
│   ├── database/
│   ├── diagrams/
│   ├── engineering/
│   └── assets/
│
├── frontend/
├── backend/
├── shared/
├── infrastructure/
├── scripts/
└── README.md
```

---

# 📚 Documentation

## Product

- Project Summary
- Product Requirements
- User Roles
- User Workflows
- Features
- Business Rules

## Architecture

- System Architecture
- Tech Stack
- Database Design
- API Design
- Backend Architecture
- Frontend Architecture
- Project Structure

## Portals

- Public Website
- Author Portal
- Reviewer Portal
- Editor Portal
- Admin Portal

## Development

- UI Design System
- Development Roadmap
- Testing Checklist
- Deployment

## Database

- ER Diagram
- SQL Tables
- Relationships

## APIs

- Public APIs
- Internal APIs
- API Examples

---

# 🔄 Development Workflow

```
Planning

↓

Database Design

↓

API Design

↓

Backend Development

↓

Frontend Development

↓

Integration

↓

Testing

↓

Deployment
```

---

# 📅 Roadmap

- ✅ Documentation
- ⏳ Database Schema
- ⏳ Prisma Models
- ⏳ Authentication
- ⏳ Public Website
- ⏳ Author Portal
- ⏳ Reviewer Portal
- ⏳ Editor Portal
- ⏳ Admin Portal
- ⏳ Testing
- ⏳ Deployment

---

# 🌱 Future Scope

- DOI Integration
- ORCID Integration
- Crossref Integration
- Google Scholar Metadata
- AI Reviewer Recommendation
- AI Plagiarism Detection
- Citation Analytics
- Email Automation
- Mobile Application
- Multi-language Support

---

# 📌 Current Status

**Project Phase**

Planning & Architecture

**Development Status**

Documentation Completed

Database Design In Progress

Backend Development Pending

Frontend Integration Pending

---

# 👨‍💻 Development Team

This project is being developed as a unified academic publishing platform for the Universal Oneness Research Association (UORA).

---

# 📄 License

This repository is proprietary and intended for the development of the UORA Platform.

Unauthorized distribution or commercial use is prohibited unless approved by the project owner.

---

# 📞 Organization

**Universal Oneness Research Association (UORA)**

Website: https://uorapublications.com

Location: Chhatrapati Sambhajinagar, Maharashtra, India

---

> **"Advancing Knowledge Through Ethical Research and Digital Publishing."**