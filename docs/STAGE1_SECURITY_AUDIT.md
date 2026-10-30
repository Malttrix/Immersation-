# Stage 1 security audit — 30 October 2026

Repository: Malttrix/Immersation-. Baseline: `a5b9f8e`. Feature branch: `security/stripe-production-hardening`.

**Status: code implemented and locally tested; production activation and genuine Stripe Test Mode end-to-end verification remain pending.** No deployment, live payment, credential rotation, remote database migration or production environment change was performed.

## Architecture inspected

- React 19 + TypeScript + Vite frontend. Google OAuth uses Supabase, but a second browser-only imitation email/password flow could impersonate any email, including the hardcoded administrator.
- `server.ts` was the local Express server. Vercel rewrites `/api/*` to a separate `api/index.ts` containing a second copy of the payment/publishing implementation. `api/subscribe-sendfox.ts` was an additional deployment surface.
- Products, articles, newsletters, subscriptions, coupons and legacy purchases use Supabase. No versioned migration directory existed. Both SQL bootstrap scripts contained permissive public write policies; one granted access to otherwise unconfigured tables.
- Checkout trusted complete product objects and URLs from the browser. Missing credentials generated fabricated sessions; verification accepted those sessions as paid. Stripe session metadata supplied the unlocked product IDs without order/customer checks.
- Paid text was embedded in `ReadingRoomView.tsx`. Full product/chapter queries and external EPUB/HTML links could bypass the UI lock. No durable entitlement ledger or signed payment webhook existed.
- Transaction reporting read fabricated local records and unverified `purchases` rows. Analytics forced at least twelve paid conversions.

## Findings and remediation

| Severity | Affected baseline file(s) | Vulnerability | Implemented remediation | Verification status |
|---|---|---|---|---|
| Critical | `server.ts`, `api/index.ts` | Fabricated sessions accepted as paid | Delete both implementations; shared API creates only official Stripe sessions, fails closed | HTTP rejection, configuration and unpaid-access tests pass |
| Critical | Same | Client controls prices, products and redirect origin | IDs/quantity-only schema; authoritative Supabase catalog; environment APP_URL; server snapshots | Manipulation, unavailable product and pricing tests pass |
| Critical | Same | Anyone could replace Stripe secrets; keys stored on disk/in public product records | Environment-only secrets; setter disabled behind admin guard; no key details in public health | Unauthorized/authorized setter tests pass; actual legacy stored keys require operator cleanup/rotation |
| Critical | SQL bootstrap scripts | Public or any authenticated user can modify sensitive data | Reviewed versioned RLS migration; administrator UUID allowlist; service-only commerce RPCs | Embedded PostgreSQL RLS tests pass; remote application pending |
| Critical | `src/App.tsx` | Fake login, hardcoded email admin role and local unlock authority | Supabase OAuth/magic links; backend admin lookup; server library access | Backend authorization and local-cookie manipulation tests pass; real OAuth provider QA pending |
| Critical | `ReadingRoomView.tsx`, `src/data.ts`, `src/App.tsx` | Paid text/URLs shipped publicly | Server-only chapter fallback; authorized content endpoint; remove embedded external links; private signed downloads | Content authorization tests pass; previously public external copies must be restricted manually |
| High | Both server entrypoints | No webhook signature verification, idempotency or durable fulfillment | Raw-body SDK verification; authoritative session retrieval; SQL atomic ledger/events/entitlements; monotonic refund handling | SDK signature, duplicate, async, delayed, refund, retry and rollback tests pass |
| High | Both payment handlers | Session IDs treated as bearer purchase proof | Verified account or hashed HttpOnly guest capability bound to each order | Cross-customer and verified-email claim tests pass |
| High | Server/Vercel handlers | Article sync, campaign broadcasting and EPUB imports lacked authorization | Shared admin middleware including legacy broadcast URL aliases; RLS for direct editor mutations | Unauthorized route tests pass; remote editor smoke checks pending |
| High | Server, Vercel, dashboard, `.env.example` | Committed SendFox credential in browser/server/example environment | Remove literal and browser persistence; server deployment configuration; rotate exposed credential manually | Current tracked-source pattern scan clean; credential remains in upstream history until owner-led cleanup |
| High | Original build script | Server bundle generated inside public Vite output, potentially exposing server-only content | Build backend into `build/server.cjs`; Vercel serves only `dist` | Build and static output inspection pass |
| High | `src/lib/convertEpub.ts` | Arbitrary fetches and unbounded imports | Admin guard; configured HTTPS hostname allowlist; no redirects; timeout, download/ZIP size bounds; durable upsert | Type/build checks pass; remote import QA pending |
| Medium | Dashboard, App | Fabricated revenue, manual financial-status toggles and forced conversions | Genuine commerce-order query; empty state; remove manual status override and synthetic minimum | Reporting source inspection; actual database dashboard QA pending |
| Medium | `.gitignore`, Vite config | Secret file not ignored; accidental frontend-prefixed secrets could enter bundles | Ignore legacy key file; build rejects frontend server keys and service-role JWTs | Automated environment guard test passes |
| High/Medium | Lockfile/dependencies | Out-of-sync lock and published vulnerabilities | Repair lock; compatible security updates including Express 4.22.3 | `npm audit` reports zero vulnerabilities at verification time |

## Follow-up review

The continuation added `202610300002_payment_mode_isolation.sql`; apply it after the initial migration. It preserves previous rows and leaves their mode unclassified until Stripe evidence is re-verified. Unknown-mode rows cannot grant paid access. The fixture suite now contains 33 tests.

| Severity | Affected file(s) | Finding | Remediation | Verification |
|---|---|---|---|---|
| Critical | `server/app.ts`, commerce RPCs | A shared Supabase project could let test entitlements unlock products in a live deployment | Bind orders, grants, claims, lookups, idempotency and financial reports to explicit Stripe mode; remove mode-less RPC signatures | Cross-mode HTTP/SQL and upgrade tests pass |
| High | Download endpoint | An accidentally public paid bucket could still issue download links | Read bucket configuration and refuse to sign unless it is private | Public-bucket rejection/private signing fixture passes |
| Medium | Payment reconciliation | A stale paid result could be returned after SQL retained a refund | Return persisted transaction status, rather than the pre-transaction calculation | Refund response reports unpaid/refunded with no books |
| Medium | Payment email persistence | An unpaid email snapshot could precede the final confirmed Stripe details | Persist claim email only when payment is confirmed; use the confirmed Stripe email | Unpaid-to-paid email regression passes |

## Credentials and sensitive assets requiring manual action

- **SendFox personal access credential:** exposed in baseline source and Git history. Revoke/replace it in SendFox and store only `SENDFOX_API_KEY` server-side. Deleting code does not invalidate an exposed credential. Existing deployments, CDN copies and local browser storage may contain it.
- **Any Stripe key ever entered through the old settings screen:** treat it as exposed until the owner checks `.stripe_config.json`, the internal product configuration row, old logs/backups and browser storage. Rotate such keys and their associated webhook secrets through an approved operation. This audit found no actual Stripe secret literal in the current tracked source; that does not establish the safety of external configuration.
- **Supabase service-role credential:** no literal found by the source scan. Verify it was never assigned to a `VITE_` variable. Rotate if it was. Public anon keys are not secrets; they rely on correct RLS.
- **External paid EPUB/HTML copies:** removing references cannot revoke known URLs or copies already downloaded. Migrate assets to private storage and restrict the former origin before public activation.

The scanner reports credential types/file paths only. No secret values are included in these deliverables. History review is limited to the repository refs fetched in this clone and cannot audit provider dashboards or runtime logs.

## Preserved data and legacy access

No original price value, article body, product identifier or existing purchase row is changed by the migration. Paid source chapter text moves server-side intact. New financial records are separate from legacy rows, since old public writes cannot establish payment authenticity.

Existing customers must be reconciled **before cutover**. `npm run reconcile:legacy -- <Stripe-session-ID> <verified-user-UUID>` checks a genuine paid legacy Stripe session, verified account email, products, quantity, original title/price compatibility, currency and refund/dispute state. It creates recovery grants without manufacturing new revenue records. Receipts whose historical title/price differs need manual investigation; the tool deliberately refuses them. Never substitute a local storage list or an old writable purchase row for proof. This tool requires real staging/provider credentials and has not been run against customer records.

## Limits and remaining work

Local testing uses the official Stripe SDK to verify signatures against synthetic test fixtures, an isolated PostgreSQL runtime (PGlite), and a Supabase adapter over real SQL. This demonstrates code behavior; it does **not** demonstrate a completed payment against Stripe's hosted Test Mode service or deployed Supabase/PostgREST/Storage.

No connected Supabase/Vercel project credentials or Stripe test/live credentials were available. Therefore provider payments, hosted webhook byte preservation, actual RLS/grants in the existing project, SMTP/OAuth email verification, deployed asset signing, backups and rollback must be checked in staging. The actual production schema may differ from checked-in SQL; compare it before applying the migration.

Refunds conservatively revoke every product grant in the refunded order, including partial refunds. Dispute lifecycle automation is not implemented; handle disputes operationally and extend webhook coverage before supporting a different policy. Checkout currently preserves the original USD, one-copy-per-digital-product model; coupons, taxes and other currencies are not silently introduced. New inactive products cannot be purchased; existing paid grants remain readable when a product is deactivated.

A persistent order owner/request key prevents duplicate checkout creation, and a per-owner database limit permits five new attempts per ten minutes. Add provider/WAF rate limits for distributed abuse and public newsletter submission. Order reporting fetches the latest 200 orders and labels this window; add pagination/full accounting exports before using it for financial statements. Browser analytics and activity logs remain local UI telemetry, not an authoritative accounting/audit system. The existing large frontend chunk warning remains.
