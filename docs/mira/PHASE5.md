# MIRA × Immersation — Phase 5 staging readiness

**Recommendation: NO-GO for production or live Hermes connection.** The founder reports a separate Supabase project named `immersation-staging`; its project reference and isolation have not yet been verified. No separate Vercel or WordPress staging service was identified. No production migrations, deployments, credential changes, media uploads or articles were made.

## Resource inventory and evidence

| Resource | Observed | Status |
| --- | --- | --- |
| Supabase | `zoneqvjrbcowlzwiyinq` was identified earlier as the production project. This checkout has migrations but no separate staging project configuration. | REPORTED: `immersation-staging` exists; its reference, schema and staging-only credentials require verification. |
| Vercel | `vercel.json` rewrites `/api/*` to the Node function `api/index.ts`; the checkout has no `.vercel` link. A live deployment tab is present, but no isolated preview with staging-only variables was established. | BLOCKED: feature-branch preview and runtime verification are required. |
| WordPress | `cms.immersation.com` is the production media origin. No separate staging WordPress installation or restricted test account was supplied. | BLOCKED: do not upload to production. |
| Browser | No authenticated staging Content Studio was available. | BLOCKED: authenticated browser acceptance was not performed. |
| Hermes VM | No staging connection or installation performed. | BLOCKED pending staging acceptance. |

The earlier preview URL and production Supabase project must not be assumed isolated. Confirm every target and credential scope before any external action. Availability, plan limits and cost of new services require the founder's review.

## Local implementation and recovery

The branch adds `202611050001_mira_absence.sql`, following the two earlier proposed MIRA migrations. It preserves upload history, creates a private RLS-protected evidence record, prevents completion of an operation marked failed, and allows a service-only transition after an authenticated admin makes an explicit decision. A 10-minute minimum cooling-off interval is enforced. The admin endpoint queries the configured WordPress REST media search for the operation identifier, requires a valid zero-result response, and blocks if candidates exist, the response is incomplete or the service is unavailable. It then records the actor, evidence and audit event. A late response cannot attach to an operation already marked absent.

**A WordPress search is not proof of global absence.** Search indexing, inaccessible uploads, trash, permissions and long-running provider work can hide a match. The operator must independently verify the *complete* library and other uploader/trash scope, document the evidence without secrets or personal data, and explicitly accept the decision. A limited media account cannot establish that scope alone. The cooling-off period is not a mathematical guarantee that WordPress finished processing. This mechanism remains **unverified with real WordPress** and requires independent security/operational review before staging or production use. Where evidence is inconclusive, leave the operation uncertain and do not retry.

The existing Studio review section exposes the operator decision; MIRA cannot make it. The client exposes `--retry-confirmed-absent <role>` only after the server reports that exact previous key as `failed`, then records the old key in local history before generating a new one. Reconciliation with an existing matching media object still requires operation identifier plus full file hash; duplicate or incorrect candidates must not be attached. No automatic uncertain upload retry is performed.

## Staging setup

1. **Supabase:** Provision or identify an isolated staging project and staging administrator. Confirm it has the actual sanitized production schema and prerequisite commerce-security and Content Studio migrations; use synthetic data. Back up staging and review exact SQL/grants. With explicit authorization, apply `202611030001_mira_editorial.sql`, `202611040001_mira_media.sql`, then `202611050001_mira_absence.sql`, in order. The first two are proposed versions and must not be reapplied over earlier drafts with the same names. Verify RLS, service-role-only RPC grants, administrator RPCs, audit events, duplicate requests, locks, review invalidation, and public draft exclusion.
2. **Vercel:** Use a preview deployment of this branch with only staging environment values and a non-production origin. Confirm that `/api/health`, `/api/editorial/agent/*`, `/api/admin/mira/*` and the Content Studio route reach the expected server runtime. Verify HTTPS, body limits, Sharp native package availability and tracing. Build success is not evidence of deployed API routing. Do not configure a preview to point at production Supabase or production WordPress.
3. **WordPress:** Provision a separate staging installation and restricted media account supporting Application Passwords. Store credentials in protected staging environment variables. Verify the account's exact visibility and upload capabilities; absence investigation may require a separate authorized administrator with broader read access. Upload known disposable images only after authorization. Record IDs, MIME, dimensions, returned URLs and retrieval/hash results without credentials. Check transformations, generated sizes, search scope, duplicate candidates, timeout and lost response. No real upload or retrieval has been performed.
4. **Browser and workflow:** Sign in to the staging website as a staging admin, create a disposable bilingual package with cover and two pins using the client, and verify pending review, all assets, English/Chinese display, private metadata editing, revision invalidation, refusal of agent publication, explicit admin approval and publication in staging. Check public draft pages, APIs and sitemap, retries and existing functionality. Record real browser evidence. Do not use mock tests as real-service evidence.

Required server environment names: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `MIRA_AGENT_TOKEN`, optional `MIRA_AGENT_TOKEN_PREVIOUS`, `WORDPRESS_MEDIA_BASE_URL`, `WORDPRESS_MEDIA_USERNAME`, `WORDPRESS_MEDIA_APP_PASSWORD`. Client: `IMMERSATION_API_BASE`, `MIRA_AGENT_TOKEN`. Use staging-only protected values; do not paste secrets into chat.

## Hermes preparation

The client uses Python 3.10+ standard library only. The prepared skill is `tools/mira/immersation-draft-publisher/SKILL.md`; it has not been installed on Hermes. After staging acceptance, copy the client and skill to a reviewed staging location and use `examples/mira/package.json` as the package manifest. Supply local files for `media/cover.jpg`, `media/pinterest1.jpg`, `media/pinterest2.jpg` and optional `media/instagram1.jpg`. Configure protected environment variables, then run:

```sh
python3 /path/to/immersation.py submit --package /path/to/package
python3 /path/to/immersation.py status --id <submission-id>
```

The client keeps `.mira-state.json` private and reuses keys. After a verified candidate is attached, an operator can explicitly use `--resume-reconciled`. Only after the operator confirms absence and the API reports `failed`, use `--retry-confirmed-absent <role>`. No client action is approval or publication. The review URL must match the configured API origin. Report only server-confirmed status to the existing Telegram gateway.

## Security and verification

- Local tests cover authentication, draft/approval boundaries, private metadata, media normalization, operation/hash matching, provider search failures and duplicate candidates, recorded absence and cooldown, idempotency, and existing checkout regression. Local test counts are recorded below after the final run.
- Local server fixtures and PGlite are not isolated hosted Supabase, real WordPress, hosted Vercel or a real authenticated Content Studio browser. Those tests remain BLOCKED.
- The agent token is server-verified; API calls have a database-backed limit and JSON/binary caps. The media adapter uses the fixed configured HTTPS WordPress origin, blocks redirects, and does not fetch agent-supplied URLs. The client rejects cross-origin redirects and review URLs.
- Outstanding risk: proving absence across a real WordPress installation, complete multi-connection race analysis, full UI usability, provider behavior, migration compatibility with the actual staging schema, and independent security review.

## Rollback and controlled production sequence

Disable the agent first and preserve the protected article review guard, upload decisions and audits. Back up affected data and develop/test an inverse migration and safe treatment of protected drafts before removing any guard. Never automatically delete media. After all staging and independent reviews pass, separately request approval for a reviewed backup, production migrations and protected secret configuration, then an approved deployment. Verify the deployed API and existing payment behavior before separately authorizing the Hermes connection. This document does not authorize any production action.

## Local test evidence

- `npm run lint`: passed.
- `npm run build`: passed, with the pre-existing large-chunk warning.
- `npm test`: 84 passed, 0 failed. The suite used local socket access and disposable PGlite. It includes a real Python-client process against a local HTTP fixture; it does not connect to a real hosted API or WordPress service.
- Real staging migrations, WordPress upload/retrieval, authenticated browser testing and the complete staging workflow: **BLOCKED** pending isolated resources, protected credentials and specific authorization.

## Phase 5 files

`server/app.ts`, `server/editorial-agent.ts`, `server/wordpress-media.ts`, `src/components/content-studio/MiraReviewDetails.tsx`, `src/lib/article-studio.ts`, `supabase/migrations/202611050001_mira_absence.sql`, `tests/mira-client.test.ts`, `tests/mira-media.test.ts`, `tests/mira-review.test.ts`, `tests/security.test.ts`, `tools/mira/immersation.py`, `tools/mira/immersation-draft-publisher/SKILL.md`, and this document.

## Separate staging project update

The prior preview-only guard was superseded by [STAGING_VERCEL.md](STAGING_VERCEL.md). The current guard permits a Vercel Production-labeled deployment only for the separately identified `immersation-staging` project and exact feature ref with isolated staging configuration. It checks both build and API runtime; it cannot prove external credentials or DNS targets are isolated. No staging project, migration or deployment was created by this change.
