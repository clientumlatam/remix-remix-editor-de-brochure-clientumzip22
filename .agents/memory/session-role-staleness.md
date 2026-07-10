---
name: Session role staleness
description: Session-cached role fields can drift from the DB if a role is changed directly in SQL after login.
---

This app stores `role` in the express-session (set at login/register time). Endpoints
that check authorization (`requireAdmin`) re-query the DB on every request, but
`/api/auth/me` used to just return the cached `req.session.role` snapshot.

**Why:** when an admin promotes a user's role directly via SQL (not through a
login/registration flow), any of that user's existing sessions keep the stale role
until they log out and back in — even though DB-backed authorization checks
(`requireAdmin`) already treat them as admin. This produced a confusing bug where the
backend allowed an action but the frontend still hid the corresponding UI (e.g. an
admin-only nav tab).

**How to apply:** any endpoint that reports "who am I / what can I do" to the frontend
(like `/api/auth/me`) should re-check authoritative DB state, matching the pattern used
by real authorization middleware, rather than trusting a session snapshot set at login.
