# Founder Review revision guard — review before deployment

Target: the existing Production database and API for `zoneqvjrbcowlzwiyinq` and `immersation.com`. This release contains one database migration and one API change; it does not submit an article or change article content, media, or existing audit records.

The API requires JSON `{"expected_revision":4}` on `POST /api/editorial/agent/drafts/production-private-test-0b50a8359812/finalize`. The value is not hard-coded: clients must provide the saved revision they intend to submit. The new service-role-only function locks the article and submission in the existing order and checks the revision, Draft state, review eligibility, three recorded media roles, and no unresolved uploads before transition. A duplicate call for the same pending revision returns the existing status without a second audit entry. Stale revisions fail before any transition.

## Deployment dependency

1. Independently inspect the deployed function signatures, dependencies, migration history and target. Apply only `202611090001_mira_finalize_revision_guard.sql` using an approved, audited Production migration process. It disables the legacy unguarded function and adds the guarded function atomically. Do not replay older migrations.
2. Deploy only the matching reviewed API commit. Between steps 1 and 2, review submissions fail closed. If the API is deployed first, its new RPC will be unavailable until the migration is applied; therefore deploy the database first.
3. Verify function grants and the API's authenticated/unauthenticated and stale-revision behavior without sending a review submission. Existing clients that send an empty finalize body must be updated to send `expected_revision`; the old RPC is intentionally disabled. Hermes schedules stay paused.
4. Only after those checks, verify the article, media and revision again and send one authenticated API request with `expected_revision: 4` for the specifically authorized existing submission. Confirm `pending_review`, revision 4 and Draft; do not approve or publish.

This document is not authorization to modify Production. Existing migration history may have been initialized by a separate guarded runner; reconcile this new migration with that actual history rather than assuming a fresh database. The SQL is deliberately outside the repository's general `supabase/migrations` directory so a routine push cannot accidentally apply it.

Local verification: focused API and PGlite security/behavior tests, a separate local test against the complete original three-migration Production MIRA chain, TypeScript and build. PGlite is not a hosted Postgres concurrency test; hosted compatibility and deployed permission checks remain required.
