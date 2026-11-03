# MIRA Phase 3: local implementation and staging handoff

**Not production ready.** The implementation is local and uncommitted. Both MIRA migrations are proposals and have not been applied to staging or production. The WordPress adapter has only been tested with injected responses; no real uploads or public URL checks have been made. The existing unrelated AdminDashboard upload control still fabricates URLs and was not replaced. Do not use it as evidence of an upload.

## Implementation

The existing draft API accepts bounded bilingual content plus optional tags, SEO overrides, internal-link slugs, private editorial notes, QA, social metadata and bilingual image alt text. The package example documents the exact shape. SEO overrides use existing Studio keys; canonical URL is derived by the existing article page. Source references, notes, QA and social planning metadata are stored in the private submission row and exposed through the administrator-only `mira_review_details` function, not a publicly readable article row. The review panel displays this information, the media records and the current article revision. The existing English/Chinese preview and edit controls remain in use. Private review metadata is currently read-only in Studio.

Submissions begin `collecting_assets`. Cover and two Pinterest images are required to finalize for `pending_review`. Optional background and Instagram roles are supported. Article media and public-facing SEO are revisioned through the existing article row; changes invalidate approval. The server-side approval gate and admin-only publishing remain in place. Pinterest and Instagram are metadata only; nothing posts externally.

## API contract

All routes require `Authorization: Bearer <MIRA_AGENT_TOKEN>`. Limits are database-backed and cover all authenticated agent requests. On Vercel, HTTPS is required.

1. `POST /api/editorial/agent/drafts` — JSON up to 600 KB, stable `Idempotency-Key` (16–128 URL-safe characters). Returns submission ID, `collecting_assets`, revision, validation and review URL. Same key and payload is replayed; different payload is a conflict.
2. `POST /api/editorial/agent/drafts/:id/assets/:role` — `application/octet-stream` image up to 3 MiB, unique stable `Idempotency-Key`. Roles: `cover`, `background`, `pinterest1`, `pinterest2`, `instagram1`–`instagram9`. Returns a confirmed WordPress ID, URL, MIME type and dimensions. The server derives the filename. The media endpoint accepts bytes, never an agent-provided URL.
3. `POST /api/editorial/agent/drafts/:id/finalize` — confirms the three required completed roles and no unresolved upload reservations, then returns `pending_review` and the saved revision. A retry after successful finalization is safe.
4. `GET /api/editorial/agent/drafts/:id` — returns status and current revision for the single configured MIRA identity.

A completed upload retried with the same key and same normalized bytes returns the stored result without another WordPress call. A reserved operation represents an upload that may have reached WordPress. It returns `MEDIA_RECONCILIATION_REQUIRED` or `retrySafe: false`; **do not retry with a new key**. The current implementation does not provide a completed operator reconciliation UI. An administrator must inspect WordPress and the private reservation and use a separately reviewed recovery procedure; do not delete unknown media. This is a staging and production release blocker.

## Media architecture

Sharp decodes JPEG/PNG/WebP with a 32-million-pixel limit, rejects unsupported or animated images, checks role orientation and minimum dimensions, rotates and re-encodes to discard metadata. The request and re-encoded result are each limited to 3 MiB, below the typical Vercel request-body ceiling; actual platform limits must be checked in preview. Bigger files are rejected, not staged. No agent-selected URL is fetched. The configured HTTPS WordPress origin is operator-controlled, redirects are rejected, a 20-second timeout is set, and response ID, URL origin, format and dimensions must match before attachment. WordPress can store an upload even when a response is lost: no automatic upload retries are performed. Deterministic role/hash filenames support manual investigation but do not make WordPress itself idempotent.

The backend currently does not set WordPress attachment alt text/caption; bilingual alt text is preserved privately and the cover alt is mapped to the existing article field. Pinterest target URLs are derived from the final article slug and should be confirmed before use. Per-image captions, Open Graph overrides, structured-data extensions, localized slugs, an automated QA engine and downloadable social packages remain incomplete. No claim is made that references or factual claims have been verified.

## Environment and account requirements

- Existing server-only `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `APP_URL`.
- `MIRA_AGENT_TOKEN`, optional `MIRA_AGENT_TOKEN_PREVIOUS` for rotation.
- `WORDPRESS_MEDIA_BASE_URL`, `WORDPRESS_MEDIA_USERNAME`, `WORDPRESS_MEDIA_APP_PASSWORD` — protected server-side values only. Base URL must be an HTTPS origin with no credentials/path/query. The adapter rejects media URLs hosted on another origin, including a CDN, until explicitly designed and reviewed.
- The WordPress account needs a narrowly scoped capability to create and inspect its own media via REST with an Application Password. It must not have administrator, theme, plugin or content-publishing privileges. Verify account capabilities and WordPress support before using real credentials.

## Migrations and staging

`202611030001_mira_editorial.sql` creates private submission, idempotency, audit and rate-limit records, and revision approval controls. `202611040001_mira_media.sql` adds private upload reservations, attachment and finalization functions. Both depend on the existing Studio and commerce-security migrations, and must be reviewed together against the actual target schema. The former is still uncommitted and has been revised during Phase 3; do not apply it over an environment that already applied an earlier draft of the same migration.

Use a separate Supabase staging project containing a sanitized copy of the actual schema, a Vercel preview configured only with staging secrets, and a separate WordPress test installation and media account. If no separate WordPress installation exists, use the injected adapter fixtures until a controlled test account and isolated test media arrangement are explicitly approved; never delete existing media. Verify image formats, size limits, account scopes, WordPress REST responses, resulting media accessibility, concurrent retries, timeout reconciliation, admin review, draft invisibility, and publication on staging. Independently review all DB grants, triggers and the complete workflow before any production rollout.

Rollback: disable agent access and preserve the protected review guard and records first. Back up affected data. Plan and test a reviewed inverse migration only after protected articles and uploads are safely archived or converted; dropping the guard while protected articles remain would remove their publication control. Never automatically delete WordPress media.

## Verification and remaining work

See the accompanying handoff for the final test run. Fixtures cover image processing, WordPress success/unauthorized/timeout responses, full HTTP submission with mocked WordPress, idempotency, revision approval and public visibility. This is not proof of real WordPress behavior or Vercel deployment compatibility. Tests do not yet cover a real provider, every partial-failure recovery, all image preview states, or all simultaneous multi-connection races. The founder review panel still needs editable private metadata and a proper status refresh. A true secure operator reconciliation flow, production-grade review, isolated staging, media accessibility checks, and full end-to-end acceptance remain necessary.

## Next Hermes phase

After staging acceptance, implement a small client that stores the agent token in a protected environment variable, submits the JSON package, persists distinct idempotency keys for every asset, uploads bytes, finalizes only after confirmed asset responses, and reports only confirmed server state to the existing Telegram gateway. On `retrySafe: false`, stop and request operator reconciliation; do not send another upload. Never include tokens in command output, logs or Telegram.

## Local verification result

- `npm run lint`: passed.
- `npm run build`: passed; Vite reported existing large-chunk warnings.
- `npm test`: 79 passed, 0 failed, with local socket access enabled. One intermediate test initially failed because it attempted to read a private table while acting as `anon`; it was corrected to assert the permission denial and then verify the private row after resetting the role.
- Live WordPress, accessible media URLs, Vercel preview and an isolated staging deployment: not tested.

## Files in the working change

- `server/app.ts`, `server/editorial-agent.ts`, `server/editorial-package.ts`, `server/wordpress-media.ts`
- `src/lib/article-studio.ts`, `src/components/content-studio/ArticleEditor.tsx`, `src/components/content-studio/MiraReviewDetails.tsx`
- `supabase/migrations/202611030001_mira_editorial.sql`, `supabase/migrations/202611040001_mira_media.sql`
- `tests/editorial-package.test.ts`, `tests/mira-review.test.ts`, `tests/mira-media.test.ts`
- `examples/mira/article-package.json`, `docs/mira/ARCHITECTURE.md`, `docs/mira/PHASE2.md`, `docs/mira/PHASE3.md`
- `package.json`, `package-lock.json` (Sharp image decoder)
