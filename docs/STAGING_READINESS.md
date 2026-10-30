# Staging readiness — continuation, 30 October 2026

## Supplied targets

- Supabase project: [zoneqvjrbcowlzwiyinq.supabase.co](https://zoneqvjrbcowlzwiyinq.supabase.co)
- Vercel preview: [immersation preview](https://immersation-5jo8g7p38-immersation.vercel.app)

These URLs identify the supplied services; they do not establish the deployed commit, database contents or payment mode.

## Read-only checks performed

| Check | Observed result | What it establishes |
|---|---|---|
| Supabase `/rest/v1/` without a key | HTTP 401 | Endpoint responds and requires an API key; does not verify schema, RLS policies or persistence |
| Preview `/`, `/api/health`, `/api/admin/payment-health` without authentication | HTTP 401 in direct no-redirect requests | Application could not be inspected through those requests |
| Preview opened in Codex browser | Redirected to **Log in to Vercel** | Vercel authentication currently blocks browser inspection; login page left open for the owner |
| Local protected credentials | Required Stripe key, signing secret, Supabase service-role key and app origin absent | No genuine provider/payment or remote schema test was possible |

No checkout, payment, database migration, remote record write, environment update or deployment-protection change was performed against these targets.

## Local work completed after the first delivery

- Orders and legacy grants carry an explicit Stripe mode. Server-authorized access, claims, order reporting and checkout idempotency are scoped to that mode.
- Test purchases cannot unlock a live deployment, including when the same Supabase database is accidentally configured for both environments.
- Existing records are preserved; unknown-mode records cannot authorize paid access until a trusted operator re-verifies Stripe evidence.
- Return-page verification uses the persisted SQL result, including refunds retained over stale paid events.
- Claim email is captured only from confirmed payment details.
- The download endpoint checks that `paid-books` is private before creating a signed URL.
- A new migration upgrades the previous schema without deleting customer, order, item or entitlement rows.
- The opt-in staging smoke command creates and expires a genuine **unpaid Test Mode** Checkout Session after confirming the deployed gateway mode. It also checks the durable order and rejection of fabricated/unpaid access. It has not run against the supplied services.

Local verification: `npm run lint`, 33 fixture/isolated PostgreSQL tests and `npm run build` passed. These tests do not substitute for hosted Stripe Test Mode payment and actual Supabase/PostgREST/Storage verification.

## Required next access and configuration

1. Sign in to the open Vercel browser page using the owner's normal account. Do not disable deployment protection. This allows browser inspection; terminal automation needs its own approved access method.
2. Confirm which commit the preview runs. This local feature branch has not been pushed or deployed. A preview-only deployment needs explicit approval before the new implementation can be tested there.
3. Confirm the supplied Supabase project is appropriate for nonproduction writes. Review the actual schema and both migrations; apply them manually to staging only after approval/review and backup. No migration has been applied by this task.
4. Configure test-only Stripe and server-only Supabase credentials in protected settings. Use the matching webhook signing secret and verified administrator allowlist. Never paste keys into chat.
5. For automated preview checks, provide protected `STRIPE_TEST_PRODUCT_ID` and `STAGING_ADMIN_ACCESS_TOKEN`. If required, use an existing owner-approved Vercel automation credential; the script does not create one or weaken protection.
6. Run `npm run test:stripe-staging` only against the updated, configured staging deployment. Then perform the separate hosted payment, webhook retry, account recovery, private download and publishing regression checks in `PRODUCTION_ACCEPTANCE.md`.

The template `STAGING_ENVIRONMENT.example` contains public URLs and blank credential fields. Production activation and any real transaction remain separately approval-gated.
