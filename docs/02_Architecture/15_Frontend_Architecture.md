# Frontend Architecture

Version: 2.0

Status: Planning

Framework: Next.js

Language: TypeScript

---

# 1. Overview

The UORA frontend is a single unified Next.js application that serves both the public website and all authenticated portals.

Unlike the previous implementation with separate websites, the new architecture consolidates all functionality into one application with role-based routing.

---

# 2. Goals

Unified Design

SEO Friendly

Responsive

Fast

Accessible

Reusable Components

Maintainable

Role Based

---

# 3. Application Sections

Public Website

↓

Authentication

↓

Role Portals

↓

Dashboards

---

# 4. Public Website

Accessible without login.

Modules

Landing

About

Vision

Mission

Journals

Journal Details

Current Issues

Archives

Articles

Editorial

Contact

Search

---

# 5. Authentication

Login

Register

Forgot Password

Reset Password

Email Verification

---

# 6. Author Portal

Dashboard

Profile

Submit Paper

My Papers

Notifications

Settings

---

# 7. Reviewer Portal

Dashboard

Assigned Reviews

Review Details

History

Notifications

Settings

---

# 8. Editor Portal

Dashboard

Submissions

Reviewer Assignment

Editorial Decisions

Volumes

Issues

Publications

Notifications

---

# 9. Admin Portal

Dashboard

Users

Roles

Journals

Website Content

Reports

Settings

Audit Logs

---

# 10. Component Architecture

Pages

↓

Layouts

↓

Components

↓

UI Components

↓

Hooks

↓

API

↓

Backend

---

# 11. Shared Components

Navbar

Footer

Sidebar

Buttons

Cards

Tables

Forms

Dialogs

Pagination

Search

Loader

Badges

Breadcrumbs

---

# 12. State Management

React Context

Server Components

Client Components

Future

Redux Toolkit (If Required)

---

# 13. API Communication

REST API

Axios / Fetch

JWT

Error Handling

Caching

Loading States

---

# 14. Folder Organization

App Router

Components

Hooks

Services

Utils

Types

Constants

Assets

Styles

---

# 15. Responsive Design

Desktop

Tablet

Mobile

---

# 16. Theme

Approved UORA Design System

Consistent Colors

Typography

Spacing

Icons

Animations

Dark Mode (Future)

---

# 17. Future Enhancements

PWA

Offline Support

Mobile App

Real-time Notifications

AI Features