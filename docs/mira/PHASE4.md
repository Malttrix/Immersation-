# MIRA × Immersation Phase 4 — local handoff

**NO-GO for production and Hermes connection.** The branch is locally implemented and tested; isolated Supabase/Vercel/WordPress staging and real WordPress upload and retrieval have not been verified. The only previously supplied Supabase project is production, not a staging project. No separate WordPress test installation or restricted staging credentials are available in this task. No production migrations, configuration, publication or deployments were performed.

## Implementation

- The draft API and Content Studio continue to use the existing articles, authentication and approval model. An agent cannot call approval or publication. Private editorial notes, references, warnings and alt text can now be edited through an administrator-only RPC; the article revision is incremented in the same transaction and prior approval is invalidated. The existing Studio handles bilingual text, SEO and article media. The review panel provides private metadata editing and unresolved media operations.
- Uploads persist a unique operation ID, original filename, source and normalized SHA-256, role, submission and state before contacting WordPress. A provider failure changes the reservation to `uncertain` where possible; a crashed process may leave `reserved`, which is treated identically. The schema also permits `failed`, but there is **no automatic transition or automatic retry** for failed/uncertain provider outcomes.
- An administrator can enter a WordPress media ID in the existing review panel. The server checks administrator identity, retrieves that single media record from the configured WordPress origin, verifies its operation-specific filename, downloads the candidate without credentials or redirects, and compares the full normalized SHA-256 and dimensions. Only an exact match can be attached; the database records the administrator and revision in the audit log. Repeated confirmation is idempotent. No arbitrary URL supplied by a user is fetched and no unrelated media is listed. A filename alone is insufficient. If WordPress recompresses or renames the original file, verification can fail safely and requires human investigation; a definitive absent-upload/failed-operation resolution flow remains unimplemented.
- The Python standard-library client sends only drafts, records retry keys in a private `.mira-state.json`, marks image requests uncertain before sending, and refuses automatic uncertain retries. It reports structured errors and server correlation IDs without printing the token. It does not approve or publish.

## Client preparation (do not install on Hermes yet)

Python 3.10+ is required; the client has no Python dependencies. Copy `tools/mira/immersation.py` and a package directory to the isolated test machine after review. Use `examples/mira/package.json` as the manifest and provide real local `media/cover.jpg`, `media/pinterest1.jpg`, `media/pinterest2.jpg` and optionally `media/instagram1.jpg`. Example files are placeholders, not actual images. Paths must remain inside the package directory. Configure `IMMERSATION_API_BASE` to the HTTPS preview origin and `MIRA_AGENT_TOKEN` in the protected process environment, not in a manifest or chat.

```sh
python3 immersation.py submit --package /path/to/package
python3 immersation.py status --id sample-001
```

When an upload is uncertain, stop. An administrator must verify and attach it in Studio; only after confirmation run `submit` with `--resume-reconciled` to retry the same request key. The client never makes an automatic uncertain retry. Keep the state file private and back it up while resolving failures. Replacing it or its keys can create duplicates. Telegram integration should relay the confirmed summary to the existing gateway; no bot or Cron job is installed.

## Environment variables

Server only: `SUPABASE_URL` (or existing `VITE_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `MIRA_AGENT_TOKEN`, optional `MIRA_AGENT_TOKEN_PREVIOUS`, `WORDPRESS_MEDIA_BASE_URL`, `WORDPRESS_MEDIA_USERNAME`, `WORDPRESS_MEDIA_APP_PASSWORD`. Client: `IMMERSATION_API_BASE`, `MIRA_AGENT_TOKEN`. No values belong in Git, logs, browser code, prompts or Telegram.

## Staging procedure

1. Provision a separate Supabase staging project with an isolated, sanitized copy of the actual production **schema**, isolated credentials and explicit authorization. Back up staging, then review the existing commerce security and Studio migration prerequisites. Apply the final reviewed versions of `202611030001_mira_editorial.sql` and `202611040001_mira_media.sql` in that order. These migration files were edited in this branch and must not be reapplied over an earlier draft of the same migration.
2. Create a Vercel preview with **staging-only** variables, `APP_URL` set to its non-production HTTPS origin, and no production keys. Verify `api/index.ts` is deployed as a Node function and `/api/*` rewrites reach it; `npm run build` alone is not proof. Exercise authentication, JSON and 3 MiB binary limits, Sharp native dependencies, timeouts, correlation IDs and rate limits against the preview.
3. Use a separate WordPress staging instance and a dedicated account limited to uploading and inspecting its own media, with an Application Password. Do not grant plugin, theme, user or publishing administration. If no staging WordPress exists, stop before uploading. Verify actual REST upload, returned ID, dimensions, MIME and public URL retrieval, including WordPress image transformations and hash reconciliation. The configured URL must be an HTTPS origin; cross-origin CDN media is currently rejected.
4. From a staging client submit bilingual content and required media, verify private and public access, exact-revision approval, stale approvals, explicit publication, URL/language rendering, editor compatibility, retry concurrency, uncertainty and reconciliation. Confirm checkout regression against test-mode fixtures only. Keep production Cron paused and do not change the Hermes model or provider configuration.
5. Document all results, external size/time/cost limits, account permissions, and request an independent security review. Approve production migrations, secret configuration and deployment separately only after staging acceptance.

## Migration and rollback

The two proposed SQL migrations add private submissions, audit, rate limiting, upload reservation/reconciliation, admin review and revision guards. Never drop the guard while MIRA articles remain: disable the agent, preserve backups and audit history, and first develop and test an inverse migration and a safe archive or conversion strategy for each protected article. Do not automatically delete WordPress media. Production execution requires separate explicit approval.

## Verification and limitations

The local test suite includes image decoding, mock WordPress responses, deterministic candidate/hash matching, retry idempotency, admin-only approval, metadata-edit invalidation and existing checkout security tests. Test evidence and final counts are recorded below after the final run. Mock responses do not establish compatibility with the actual WordPress site. Real WordPress, hosted Vercel API topology, real isolated Supabase policies and the full Hermes-to-public staging workflow are **BLOCKED**, not passed. Other remaining work: inspect real multi-connection races, exercise the admin reconciliation UI in a real authenticated browser, provide a safe operator process for confirmed absent uploads, validate the complete editorial package and preview UX, and independently review all grants, role boundaries and fail-closed behavior. No real media samples are committed.

The production build warns about large existing frontend chunks (~1.7 MB and ~1.0 MB uncompressed). These affect frontend load performance, not whether the new server endpoints are present; Vercel runtime and Sharp packaging still require preview verification. No unrelated code splitting was undertaken.

## Launch checklist

- [ ] Isolated staging Supabase, Vercel and WordPress verified with non-production credentials.
- [ ] Real upload, URL retrieval, lost-response reconciliation and uncertain/absent outcome handling verified.
- [ ] Authenticated founder review, private edits and exact-revision publication verified end to end.
- [ ] Client recovery, full package, public draft exclusion, and payment regression verified in staging.
- [ ] Independent security and migration/rollback review completed.
- [ ] Explicit approval obtained for production migration, configuration and deployment.

## Local test evidence

- `npm run lint`: passed.
- `npm run build`: passed with the large-chunk warning described above.
- `npm test`: 82 passed, 0 failed, including the existing checkout suite; local socket access was enabled for HTTP tests.
- Tests use injected WordPress responses and a disposable PGlite database. Real external staging checks remain blocked.

## Changed files

The cumulative branch includes `server/app.ts`, `server/editorial-agent.ts`, `server/editorial-package.ts`, `server/wordpress-media.ts`, `src/lib/article-studio.ts`, `src/components/content-studio/ArticleEditor.tsx`, `src/components/content-studio/MiraReviewDetails.tsx`, both MIRA SQL migrations, the MIRA tests, package manifests, `tools/mira/immersation.py`, sample JSON, `docs/mira/ARCHITECTURE.md` and `docs/mira/PHASE2.md` through `PHASE4.md`. Sharp is the only new runtime dependency.
