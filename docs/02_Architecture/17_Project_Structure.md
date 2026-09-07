# Project Structure

Version: 2.0

Status: Planning

---

# 1. Overview

The UORA Platform is organized as a full-stack application with separate frontend and backend projects while sharing one database.

The structure promotes modular development and clear separation of responsibilities.

---

# 2. Repository Structure

uora-platform/

docs/

frontend/

backend/

database/

scripts/

deployment/

---

# 3. Frontend Structure

frontend/

app/

components/

features/

hooks/

services/

store/

types/

utils/

constants/

assets/

styles/

public/

middleware.ts

---

# 4. App Structure

app/

(public)/

(auth)/

(author)/

(reviewer)/

(editor)/

(admin)/

api/

layout.tsx

page.tsx

---

# 5. Components

components/

layout/

navigation/

forms/

tables/

cards/

dialogs/

charts/

common/

ui/

---

# 6. Backend Structure

backend/

src/

config/

middlewares/

errors/

shared/

modules/

utils/

uploads/

prisma/

tests/

---

# 7. Module Structure

modules/

auth/

users/

roles/

journals/

volumes/

issues/

articles/

submissions/

reviews/

editorial/

notifications/

reports/

settings/

dashboard/

---

# 8. Database Structure

database/

ER_Diagram.md

SQL_Tables.md

Relationships.md

Migrations

Seeds

---

# 9. Documentation Structure

docs/

01_Product/

02_Architecture/

03_Portals/

04_Development/

database/

api/

engineering/

diagrams/

assets/

---

# 10. Environment Files

.env

.env.local

.env.example

---

# 11. Configuration Files

package.json

tsconfig.json

eslint.config

prettier.config

tailwind.config

next.config

prisma.schema

---

# 12. Deployment

docker/

nginx/

github/

scripts/

---

# 13. Naming Conventions

Folders

kebab-case

Files

feature-name.ts

Components

PascalCase

Variables

camelCase

Constants

UPPER_CASE

Database

snake_case

---

# 14. Git Workflow

main

develop

feature/*

bugfix/*

hotfix/*

release/*

---

# 15. Development Principles

Feature First

Modular

Reusable

Layered

Consistent

Well Documented