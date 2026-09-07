# Reviewer Portal

Version: 2.0

Authentication: Required

Role: Reviewer

---

# 1. Overview

The Reviewer Portal enables invited reviewers to evaluate assigned manuscripts and provide structured peer reviews.

The portal supports confidential peer review while maintaining transparency for editors.

---

# 2. Objectives

Manage Review Assignments

Submit Reviews

Track Deadlines

Improve Review Quality

---

# 3. Dashboard

Pending Reviews

Completed Reviews

Due Soon

Notifications

Review Statistics

---

# 4. Navigation

Dashboard

Review Invitations

Assigned Papers

Completed Reviews

Notifications

Settings

Logout

---

# 5. Invitations

Invitation Details

Journal

Submission Title

Deadline

Accept

Decline

---

# 6. Assigned Papers

Download Manuscript

View Metadata

Author Information (Based on Review Model)

Supporting Files

Review Deadline

---

# 7. Submit Review

Overall Recommendation

Strengths

Weaknesses

Confidential Comments

Comments to Author

Attach Files

Submit

---

# 8. Recommendation Options

Accept

Minor Revision

Major Revision

Reject

---

# 9. Completed Reviews

History

Journal

Recommendation

Submission Date

Completion Date

---

# 10. Notifications

New Invitation

Deadline Reminder

Review Accepted

Review Completed

---

# 11. Settings

Profile

Password

Notification Preferences

---

# 12. Permissions

Read

Assigned Papers

Create

Review

Update

Own Review

Cannot

Publish

Assign Reviewers

Modify Submission

Access Unassigned Papers

---

# 13. APIs Used

Authentication

Review

Submission

Notifications

Profile

---

# 14. Database Modules

Users

Reviewer Assignments

Reviews

Submissions

Notifications

---

# 15. Future Features

Review Templates

AI Review Assistant

Reviewer Certificates

Reviewer Ranking

Reviewer Analytics

Review Credits








One Major Recommendation (Very Important)

After analyzing Elsevier, Springer, IEEE, MDPI, and your current requirements, I recommend not making "Reviewer" a role users register for directly.

Instead, use this workflow:

User Registers
        │
        ▼
Author Account Created
        │
        ▼
Editor Invites User as Reviewer
        │
        ▼
Reviewer Accepts Invitation
        │
        ▼
Reviewer Role Assigned

Advantages:

Better control over reviewer quality.
No fake reviewer registrations.
Journal-specific reviewer assignments.
Supports the same user being:
Author in Journal A.
Reviewer in Journal B.
Editor in Journal C.

This aligns much better with how established scholarly publishing platforms manage editorial roles and fits naturally with the journal-scoped role model we've been designing.