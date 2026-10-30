# Configuration and activation guide

## Before configuration

1. Back up production database rows, policies, grants, functions and Storage configuration. Record the deployed application version and existing webhook configuration. Rehearse restoration in staging.
2. Compare deployed schema with checked-in SQL. Review `supabase/migrations/202610300001_commerce_security.sql` in a nonproduction clone first. The migration is designed for the existing Immersation tables; it is not a fresh-database bootstrap. Old standalone SQL scripts now deliberately refuse execution because their legacy policies are unsafe.
3. Identify legitimate historical customers and reconcile verified Stripe receipts before removing the old application. Leave original purchase rows untouched. Arrange support recovery for uncertain historical records; do not grant access based solely on an email or browser cache.
4. Rotate exposed SendFox credentials, and review any Stripe keys stored through the old dashboard. Remove legacy secret configuration from the old product system row and filesystem through an approved cleanup; the new application never reads it.

## Server environment

Use protected environment settings, never Git-tracked values:

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret for the deployment's required mode |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for that deployment's endpoint |
| `APP_URL` | Exact canonical origin, HTTPS except local test mode on localhost |
| `SUPABASE_URL` | Server Supabase project URL; legacy `VITE_SUPABASE_URL` also accepted |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role credential for verified commerce operations |
| `SENDFOX_API_KEY` | Server-only newsletter provider credential, replacing exposed legacy token |
| `EPUB_ALLOWED_HOSTS` | Comma-separated HTTPS import hostnames, only if administrator EPUB import is needed |
| `GEMINI_API_KEY` | Existing server AI configuration if used |

Browser configuration remains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Use only the anon/publishable key. Never prefix any Stripe, service-role, SendFox or other server secret with `VITE_`. The Vite build rejects known unsafe variables. No Stripe publishable key is needed for the hosted Checkout redirect integration.

Vercel supplies `VERCEL_ENV`: **production requires live credentials; preview/development require test credentials**, regardless of `NODE_ENV`. Standalone servers without `VERCEL_ENV` require live keys only when `NODE_ENV=production`; otherwise test keys. Missing credentials, webhook secret, origin, database or compatible schema cause payment failure, never a simulated success. A conventional local `NODE_ENV=production npm start` cannot use test keys; use a Vercel preview or explicitly set `VERCEL_ENV=preview` for a local production-build test.

## Supabase setup

Apply the reviewed versioned migration manually to staging first. It changes privileges but does not delete original records or rewrite prices. Review any integrations relying on public product table reads; the website now uses `/api/products` with a safe projection. The editor still writes through Supabase using its authenticated administrator session and the new RLS.

Enroll an existing verified Supabase user as an administrator through the trusted SQL editor:

```sql
insert into public.security_admins(user_id)
values ('<verified-Supabase-auth-user-UUID>')
on conflict do nothing;
```

Do not put emails, credentials or roles in local storage to grant administration. Remove an allowlist row to revoke access. The allowlist cannot be edited by browser clients.

Verify the existing catalog contains the legitimate product IDs and unchanged prices. `active` defaults to true and `currency` defaults to the original USD model. The server rejects missing, inactive, invalid, free-priced or non-USD checkout items. Free products remain readable when configured with `price=0`.

Set up Google OAuth and/or email magic links in Supabase. Restrict redirect URLs to the actual local/staging/production origins. Configure reliable email delivery. An account can claim a guest order only after Supabase confirms its email; the stored order email comes from Stripe, never the claim request.

Upload paid deliverables into the **private** `paid-books` bucket. Record each file:

```sql
insert into public.commerce_assets(product_id, object_path)
values ('<existing-product-ID>', '<private-object-path>')
on conflict (product_id) do update set object_path=excluded.object_path;
```

Confirm the bucket is private even if it existed before migration. No public policy should reveal its objects. Authorized downloads obtain a 60-second signed URL. These URLs are short-lived bearer links; they are not DRM. Move chapter data into the protected `book_chapters` table or the existing product chapters field. Server fallback chapters cover the original source books. Restrict previously public file origins separately; references alone do not protect those copies.

## Stripe Test Mode

Use a separate staging Supabase project and Stripe test credentials. Put test values in Vercel Preview settings, or a local ignored environment file. Keep `APP_URL` on the exact preview/local origin.

For local events, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set the emitted local listener signing secret as `STRIPE_WEBHOOK_SECRET` in your local environment; restart the server. That secret differs from hosted endpoint secrets. Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `npm run dev`. Use a supported Node 24 runtime. The Vite module runner and standalone server tsconfig avoid configuration bundling issues seen on this workstation.

Run hosted Checkout through the website using Stripe's documented test payment methods. Confirm success, decline, cancel and asynchronous outcomes. Keep guest cookies until the return page; then test verified email recovery in a separate browser profile. Never use real cards for test transactions.

## Webhook endpoint

Configure `https://<canonical-origin>/api/stripe/webhook` in the matching Stripe environment. Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`

Copy that endpoint's signing secret to its deployment environment. The API preserves raw request bytes before JSON parsing. `api/index.ts` exports the Express app directly (retaining its `listen` property); Vercel’s Node handler detects Express and skips its body-parsing helpers. The adapter also declares body parsing disabled. Test this on an actual Vercel preview. A parsed or changed body is rejected rather than bypassing verification. Stripe may deliver duplicate/out-of-order events; the database transaction serializes order changes and atomically records successful processing. Database/transient failures return non-2xx so Stripe can retry. For a delayed webhook, the owned return-page check runs the same fulfillment operation.

The detailed `/api/admin/payment-health` endpoint requires a verified administrator bearer token. It reports mode, Stripe API reachability, webhook secret presence, schema/read health and asset/bucket configuration. Secret presence cannot prove endpoint delivery, write permissions or fulfillment; it deliberately does not announce production operational status. Complete the acceptance checklist.

## Vercel architecture and deployment

The existing SPA routes remain. Explicit `/api/*` rewrites point to `api/index.ts`, which exports the shared Express application used locally. There is no second checkout implementation and no separate subscription function. Configure Node 24, build command `npm run build`, output directory `dist`; `vercel.json` specifies the API timeout. The Node server bundle is in `build`, outside public static output. Do not publish `build` as a static directory. No runtime article source writes or persistent filesystem dependency remains in article synchronization; articles upsert into Supabase.

After staging acceptance, request explicit approval for production environment changes, migration application, webhook setup and deployment. Avoid pushing this branch until the owner decides whether automatic Vercel preview deployment is allowed. Do not merge automatically.

Approved production sequence: back up; put checkout into maintenance; apply reviewed schema/allowlist/private asset configuration; reconcile legacy buyers; set protected live-mode variables; deploy the reviewed branch; configure live webhook and verify delivery; perform one separately approved real transaction; check order, entitlement, download and refund outcomes; then enable public checkout. A successful test-mode run does not establish production acceptance.

## Rollback

Disable checkout first by removing/withholding the Stripe secret or restricting traffic. Keep the new order/entitlement/event tables and pending Stripe webhook deliveries intact. Record events needing replay. Roll back public frontend code only to a vetted version compatible with the locked database policies, or serve the public publishing pages with checkout disabled. **Do not restore the original simulated-payment API or public-write policies.**

Do not drop commerce tables, undo verified orders or re-enable permissive RLS as an application rollback. If a database restore is unavoidable, use the reviewed backup/recovery plan, reconcile Stripe events since the backup and replay them before reopening checkout. Coordinate any endpoint signing-secret change with the application version; Stripe cannot deliver valid signatures to a deployment configured with a different secret. Owner approval is required for production rollback actions too.

## Primary references

- [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Stripe webhook signatures, delivery and retries](https://docs.stripe.com/events/manage-webhook-endpoints)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js)

Runtime references: [Vercel supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [official Express detection in the Node handler](https://github.com/vercel/vercel/blob/main/packages/node/src/serverless-functions/serverless-handler.mts).
