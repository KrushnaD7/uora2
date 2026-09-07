# Public APIs

Version: 2.0

Status: Planning

Base URL

/api/v1

Authentication

❌ Not Required

---

# Overview

Public APIs are accessible without authentication.

These APIs provide information about UORA, journals, articles, editorial boards, issues, and other publicly available resources.

---

# Public Modules

Authentication

Website

Journals

Articles

Issues

Volumes

Editorial Board

Search

Contact

---

# Authentication APIs

POST

/auth/register

Description

Register new user

---

POST

/auth/login

Description

Login user

---

POST

/auth/forgot-password

Description

Forgot password

---

POST

/auth/reset-password

Description

Reset password

---

GET

/auth/verify-email

Description

Verify email

---

# Website APIs

GET

/website/home

Homepage Data

---

GET

/website/about

About Page

---

GET

/website/vision

Vision

---

GET

/website/mission

Mission

---

GET

/website/contact

Contact Information

---

# Journal APIs

GET

/journals

List Journals

---

GET

/journals/{slug}

Journal Details

---

GET

/journals/{slug}/editorial

Editorial Board

---

GET

/journals/{slug}/guidelines

Author Guidelines

---

GET

/journals/{slug}/publication-ethics

Publication Ethics

---

# Volume APIs

GET

/journals/{slug}/volumes

List Volumes

---

GET

/volumes/{id}

Volume Details

---

# Issue APIs

GET

/issues

List Issues

---

GET

/issues/{id}

Issue Details

---

GET

/issues/current

Current Issue

---

# Article APIs

GET

/articles

Published Articles

---

GET

/articles/{slug}

Article Details

---

GET

/articles/{slug}/download

Download PDF

---

# Search APIs

GET

/search

Global Search

Parameters

keyword

journal

author

volume

issue

year

---

# Contact APIs

POST

/contact

Submit Contact Form

---

# Response

All public APIs return

Status

Message

Data

Pagination (If Required)

---

# Future APIs

Citation Export

RSS Feed

Sitemap

Google Scholar Metadata

Crossref Metadata

DOI Lookup