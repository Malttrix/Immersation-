# MIRA Phase 2 — historical notes

Phase 3 changes supersede parts of this document. See [PHASE3.md](PHASE3.md) for the current contract and limitations.

The branch includes a proposed migration and a restricted draft API. It has not been applied to staging or production. No actual WordPress upload, upload endpoint, Hermes client, SEO/media fields, or complete review UI has been implemented. Do not configure the credential or deploy until the remaining work and independent security review are complete.

## API

`POST /api/editorial/agent/drafts` accepts the JSON shape in `examples/mira/article-package.json`, with `Authorization: Bearer <agent-token>`, `Content-Type: application/json` and a stable `Idempotency-Key` of 16–128 URL-safe characters. A retry with the same key and identical JSON is replayed. Reusing the key for different data is a conflict. Status is `GET /api/editorial/agent/drafts/:submissionId`. These endpoints do not offer publication. JSON is limited to 600 KB; a database-backed limiter allows 30 authenticated requests per minute for the sole MIRA identity. Only one agent identity is currently supported.

The package contract does not yet support image assets or SEO overrides. References are stored in the existing `studio` extension but have not yet been exposed as a complete editable review panel. Response `reviewUrl` points to `/admin` on configured `APP_URL` (HTTPS only) or the canonical site.

## Security and review

`MIRA_AGENT_TOKEN` is a separate random 32-byte-or-stronger URL-safe token, verified by SHA-256 and constant-time digest comparison. `MIRA_AGENT_TOKEN_PREVIOUS` allows temporary rotation; remove it to revoke the prior token. Generate credentials locally using a cryptographically secure generator and store only in a protected server-side secrets system, never the browser or a repository. `SUPABASE_URL` (or existing `VITE_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` remain server-only. `APP_URL` supplies the trusted review origin. No new credentials are set by this branch.

The SQL migration stores private ownership, request fingerprints, review state and audit events in separate RLS-enabled tables. Agent submission runs as the server role, always writes Draft and is atomic with idempotency. Existing article and content columns remain authoritative. Admin-only review actions bind approval to `studio_revision`; a trigger on the article table invalidates approval on edits and only accepts an unchanged, approved revision for publication. MIRA scheduling and post-publication changes are deliberately blocked pending a complete revision workflow. Manual articles retain their existing publishing flow. Studio adds controls for review, rejection, revision request and publishing; they require saving changes first.

The status is private and shared by the one MIRA identity, not a multi-agent ownership model. The fingerprint uses the submitted JSON's serialization; callers should retry the same payload with the same key. An error after the database commit may return 503: retry the exact request with the same key.

## Staging checklist

1. Obtain an isolated Supabase project with the *actual* production schema and a staging WordPress installation with a restricted media account. Never use the production project for test drafts.
2. Review RLS, grants, existing triggers, all alternate writes and data migration/rollback with an independent security reviewer. Apply migrations only after backups and explicit approval for the target environment.
3. Configure protected server-only staging variables; test key rotation and revocation. Verify browser bundles and logs do not contain credentials.
4. Submit and retry bilingual drafts; exercise concurrent requests, direct SQL/RPC authorization, stale revisions, all review actions, publication, public pages, sitemap and authenticated previews.
5. Implement and verify the WordPress upload pipeline, secure retries and partial failure recovery before allowing media submission. The current mock is not a real upload.
6. Verify failure recovery, audit records, cleanup/retention of rate limits and records, admin UX, editor compatibility and complete Hermes package integration.
7. Independently review the exact production migration and deployment plan; obtain explicit approval before production changes.

Rollback requires a reviewed inverse migration after the API is disabled; do not simply drop the trigger or private tables while MIRA drafts exist, since that would remove their review protection. Preserve a backup and either retain the guard or explicitly archive/convert each protected article before removing it.
