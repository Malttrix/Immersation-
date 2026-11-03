# MIRA editorial integration: audit and implementation plan

Status: a local draft API and proposed review migration are now implemented; see [PHASE2.md](PHASE2.md) for scope and remaining work. Media uploads, staging verification and deployment are not complete. Do not use this as a production integration.

## Existing architecture

- React 19 / Vite SPA; Vercel rewrites `/api/*` to the Express app in `api/index.ts`; other routes fall back to the SPA. The same Express application runs locally.
- Content Studio is `src/components/content-studio`, backed by `src/lib/article-studio.ts`. Article title, excerpt, content and other localised fields are JSON objects with `en` and `zh`; extensions are stored in `articles.studio`.
- The existing `studio_save_article` RPC uses the authenticated Supabase user and `is_security_admin()`, row revisions and slug locking. Its statuses are Draft, Scheduled and Published. `studio_article_visible` and RLS protect drafts from ordinary readers. The administrator can currently publish or schedule without a separate approval record.
- The public application reads the existing `articles` table and applies article visibility, and SEO uses existing title/description overrides and canonical fields. The sitemap is a static `public/sitemap.xml`, not a live publication index. Changes to publication must account for both RLS and all alternate public read paths.
- WordPress upload UI in `AdminDashboard.tsx` is explicitly a mock: it constructs a URL after a timeout. No real WordPress media credentials or upload implementation were found in the application. Its visible audit message is not proof of an upload. Verify actual WordPress service-account permissions and staging separately.
- `server/app.ts` uses a server-only Supabase service role for other server operations and checks `security_admins` for admin routes. Existing payment code is outside this work. Current logging and mock admin audit data are not a durable, agent-specific audit system.
- No Hermes job or Telegram gateway is present in this repository; reporting must return data to the existing caller, not create a new bot.

## Intended sequence

1. Define bounded, strict bilingual package validation and reject forbidden publishing controls. Reuse existing metadata conventions and renderer sanitization; validate all media separately from article data.
2. Design an additive migration for private agent ownership, request fingerprints, immutable audit/review events and atomic writes into the existing `articles` table. Enforce draft-only writes and approval invalidation in the database, including all existing save paths. A service-role HTTP route alone is not a sufficient publication boundary. Deny anonymous/authenticated direct access to private integration tables.
3. Add a dedicated credential with rotation/revocation, constant-time checks, distributed database-backed rate limits, idempotency and request limits. Ensure public API errors do not leak upstream details. Never give the agent a Supabase user session or a service-role credential.
4. Implement WordPress media against a restricted server-side service account after verifying its actual capabilities. Vercel has a finite request payload limit: use bounded small uploads or a reviewed staged-upload design, not unchecked arbitrary remote URLs. Sniff and decode images, limit pixel count, strip unsafe metadata as appropriate, store provider IDs and hashes, and design recovery for provider-success/database-failure. Do not report upload success without confirmation.
5. Extend the existing Studio with private review metadata, preview, revision request, rejection, approval and publish controls. Persist reviewer and immutable review events server-side; approval must bind to a content revision. Review changes to existing admin RPC and direct update permissions for bypasses.
6. Add a Hermes CLI with protected environment variables, persistent idempotency keys, retry-safe per-stage state, no credential logging and Telegram-ready output. Document installation and sample package.
7. Test full security boundaries locally with realistic schema and then in an isolated staging project and WordPress media account. Test rollback, public API and sitemap visibility, approval races, asset retries, and existing checkout behavior. Production changes require separate explicit approval.

## Critical open dependencies

- The provided Supabase project was previously used as production. A separate staging database and restricted staging WordPress account have not been established in this task. Do not test destructive operations or upload arbitrary media to production.
- Rate limiting and upload deduplication must survive concurrent serverless instances; process-local counters and assuming provider idempotency are insufficient.
- Current authenticated admin publishing does not record an independent approval, so a new review state cannot be safely enforced only in React. Scheduled visibility must be considered as well as direct publication.
- External WordPress requests need fixed trusted origins, redirect restrictions, timeout and safe filename handling. Public URLs should be verified without accepting attacker-selected fetch destinations.
