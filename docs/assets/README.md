# Assets

Version: 2.0

Status: Active

---

# Overview

The `assets/` directory contains all project-related resources that are not part of the application source code.

These assets are used for documentation, design, branding, presentations, and development references.

This folder should **not** contain production code.

---

# Folder Purpose

The assets folder serves as the central repository for

- Branding resources
- Logos
- Icons
- Design references
- Screenshots
- UI mockups
- Wireframes
- PDF references
- Presentation materials
- Documentation images

---

# Recommended Structure

assets/

├── branding/

├── logos/

├── icons/

├── screenshots/

├── ui/

├── wireframes/

├── presentations/

├── references/

├── documentation/

└── archive/

---

# Branding

Contains

- UORA Logo
- Journal Logos
- Brand Guidelines
- Color Palette
- Typography Reference

Examples

assets/branding/

uora-logo.png

ujgsm-logo.png

brand-guide.pdf

---

# Logos

Contains

High-resolution logos

SVG

PNG

Dark Theme

Light Theme

Transparent Versions

---

# Icons

Contains

Custom SVG Icons

Favicon

App Icons

Social Icons

---

# Screenshots

Contains

Landing Page

Dashboard

Author Portal

Reviewer Portal

Editor Portal

Admin Portal

These screenshots should be updated after major UI changes.

---

# UI

Contains

Design References

Component Screenshots

UI Inspiration

Design Tokens

Color References

---

# Wireframes

Contains

Low Fidelity Designs

High Fidelity Designs

User Flow Sketches

Page Layouts

---

# Presentations

Contains

Client Presentation

Architecture Presentation

Project Demo

Pitch Deck

---

# References

Contains

Client Documents

Research Material

PDF References

External Resources

Journal Policies

Publishing Guidelines

---

# Documentation Images

Contains

Architecture Diagrams

ER Diagrams

Workflow Images

API Diagrams

Used inside Markdown documentation.

---

# Archive

Contains

Old Assets

Deprecated Logos

Previous UI Versions

Legacy Designs

Nothing should be permanently deleted.

---

# Naming Convention

Folders

kebab-case

Files

descriptive-name.extension

Examples

landing-page-v1.png

author-dashboard.png

er-diagram-v2.drawio

journal-logo.svg

---

# File Formats

Images

PNG

SVG

JPG

Documents

PDF

PPTX

Drawings

.drawio

Design

.fig (Figma Export)

---

# Best Practices

✓ Keep production assets separate from documentation assets.

✓ Store editable design files whenever possible.

✓ Optimize images before committing.

✓ Never overwrite historical assets without versioning.

✓ Archive outdated assets instead of deleting them.

---

# Excluded Files

Do not store

node_modules

build files

compiled assets

temporary screenshots

cache files

IDE configuration

production uploads

database backups

---

# Future

As the platform grows, this directory may also contain

Marketing Material

Social Media Assets

Conference Posters

Journal Covers

Certificate Templates

Email Templates

Training Material