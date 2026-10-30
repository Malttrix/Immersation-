# Immersation Stage 1 implementation

**Implemented on `security/stripe-production-hardening`; activation remains blocked pending provider/staging verification and explicit production approval.** The branch is local and has not been pushed, merged or deployed. No real payment or remote database change was made.

## Delivered code

- `server/app.ts`, `server/security.ts`: shared Express API, Supabase-verified identities, UUID administrator allowlist, strict Stripe deployment mode, authoritative pricing, durable checkout idempotency, ownership checks, verified webhooks and recoverable fulfillment.
- `supabase/migrations/202610300001_commerce_security.sql`: non-destructive order/item/entitlement/event/recovery-grant schema, transactional RPCs, explicit grants and RLS, private asset mapping, administrator Storage controls. Apply manually only after staging/schema review.
- `server/publishing.ts`, `src/lib/convertEpub.ts`: existing publishing handlers centralized and protected; article writes persist in Supabase; EPUB imports restricted and bounded.
- `server/book-content.ts`: original fallback book chapters moved intact outside public frontend assets.
- `api/index.ts`, removed `api/subscribe-sendfox.ts`, `server.ts`: one API implementation for Vercel and local development; raw webhook body precedes JSON middleware.
- `src/App.tsx`, `src/lib/security-api.ts`: verified OAuth/magic-link identity, server library access, customer-bound checkout verification, visible cancellation/error states, duplicate click prevention, actual order reporting and no local payment simulation.
- `src/components/ReadingRoomView.tsx`, `src/data.ts`: backend-authorized chapter loading and protected signed downloads; embedded paid text and public paid-file fallbacks removed.
- `src/components/AdminDashboard.tsx`: bearer authorization for API mutations, environment-only Stripe configuration guidance, safe diagnostics, genuine transaction/empty states, removal of manual payment status overrides and fabricated paid conversion counts. Article design and studio layout were not redesigned.
- `scripts/reconcile-legacy-purchase.ts`: operator recovery from verified paid legacy Stripe receipts and a verified account; no fabricated financial records.
- `scripts/public-env.ts`: block known server credentials and Supabase service-role keys from public Vite variables.
- `.env.example`, `.gitignore`, `vercel.json`, `vite.config.ts`, `tsconfig.server.json`, `package.json`, `package-lock.json`: protected configuration, compatible patched dependencies, tested Node 24 target, backend build outside public `dist`, consistent Vercel API routing.
- `supabase_schema.sql`, `supabase_rls_security_fix.sql`: old unsafe policy execution disabled; permissive policy definitions removed.
- `tests/security.test.ts`: 33 tests using real isolated PostgreSQL SQL/RLS and official Stripe SDK signature verification; external Stripe/Supabase interactions are fixtures.

## Reviewable implementation commits

| Commit | Change |
|---|---|
| `3a3f3a5` | Verified Stripe payments and atomic Supabase entitlements |
| `e42baf9` | Storefront authentication/access and removal of browser simulation |
| `84fc019` | Security tests, dependency repair and isolated server build |
| `c675f16` | Pin verified Node 24 LTS deployment runtime |
| `eb52e53` | Initial audit and production activation guide |
| `40e50e5` | Payment-mode isolation, stored payment state, private downloads and mode recovery |
| `45b2519` | Gated genuine Stripe Test Mode smoke command |
| `154b605` | Prove staging automation stops before checkout against a live gateway |

Documentation updates accompany these implementation commits. The original baseline is `a5b9f8e`.

## Verification completed

- `npm run lint`: passed.
- `npm test`: **33 passed, zero failures**.
- `npm run build`: passed. Existing frontend chunk-size warning remains; backend is emitted to `build/server.cjs`, not public `dist`.
- Same type checks, tests and build toolchain also passed using bundled **Node 24.22.1**. Initial required npm commands ran under the workstation's Node 26.4.0.
- Compatible dependency updates report **zero npm audit vulnerabilities** at verification time.
- Source credential pattern scan: clean; no secret values printed in reports. Prior SendFox credential remains exposed in original repository history and requires rotation.
- Static artifact checks: no backend bundle, distinctive paid book text or former external paid-file reference in public output.
- Local production-build browser smoke test: homepage rendered, cart empty/add-item flows worked, and unavailable checkout displayed a controlled error without unlocking anything. Browser had no Supabase/Stripe configuration; provider-enabled reader/editor flows remain staging checks.
- Isolated migration test: original article, product price and legacy customer/purchase row remained intact. This is fixture evidence, not a comparison against the actual production database.

### Requested test coverage

| Requested case | Evidence / limit |
|---|---|
| 1–2. Missing key / test key in production | Configuration and HTTP fail-closed tests |
| 3–4. Fabricated or forged session | HTTP rejection and no access grant |
| 5–6. Invalid ID / price manipulation | Server input/catalog tests; no Stripe invocation |
| 7. Unpaid book unlock | HTTP authorization and unpaid SQL entitlement checks |
| 8–9. Duplicate event / invalid signature | Official SDK signatures plus transactional event/entitlement checks |
| 10. Genuine hosted Stripe Test Mode checkout | **Blocked: no test credentials/project configuration**; fixture SDK calls do not count as a real provider checkout |
| 11. Cancellation | Unpaid-state fixture and cancellation UI handling; actual hosted cancel flow pending |
| 12. Delayed webhook | Owned return-page reconciliation against provider fixtures |
| 13. Guest claim | Verified identity claim, wrong email/account rejection and guest capability revocation |
| 14–15. Unauthorized/authorized admin | Actual HTTP middleware and SQL allowlist/RLS tests |
| 16–17. Data preserved / orders persist | Isolated real PostgreSQL migration and durable row checks; actual Supabase pending |
| 18. Local storage manipulation | Frontend no longer reads unlock/transaction caches; backend rejects fabricated browser ownership. Provider-enabled browser tampering regression remains an acceptance check |

Additional coverage includes preview-vs-production mode, shared-database entitlement isolation, asynchronous outcomes, expired sessions, persisted refund responses, atomic rollback, database retries, public-bucket rejection, confirmed-payment email, migration upgrades, build-time secret guards and session-attachment failure recovery. The staging command is also tested against a local live-mode fixture to prove it sends no checkout request.

## Continuation work

The follow-up adds strict database-level Stripe-mode isolation, persisted refund-status responses, confirmed-payment email capture and private-bucket enforcement. `202610300002_payment_mode_isolation.sql` is required after the initial migration; previous records remain intact with unknown mode until re-verified. `scripts/reconcile-payment-mode.ts` supports one-order-at-a-time operator recovery. `scripts/stripe-test-smoke.ts` provides an opt-in genuine unpaid Stripe test-session check, gated on the deployed administrator diagnostic reporting test mode; it has not been run against the supplied protected preview.

Public target URLs were supplied and checked read-only. Supabase requires an API key, and the Vercel preview redirects the browser to Vercel login. No application mode, live schema or genuine payment behavior could be verified. See `STAGING_READINESS.md` for exact results and remaining access/configuration steps. No protected credentials are present in the local environment.

## Exact remaining activation work

1. Rotate the exposed SendFox credential; review Stripe keys previously saved in the old dashboard and clean legacy secret stores through an approved operation.
2. Back up actual Supabase data/policies. Compare actual schema and apply both migrations in order to a staging clone, then validate RLS/PostgREST/Storage and administrator UUID enrollment.
3. Provision protected environment variables, canonical origin and Supabase OAuth/verified email delivery. Confirm no service-role credential is in frontend environment variables.
4. Upload paid files to the private bucket, map them, verify signed downloads, and restrict prior public EPUB/HTML origins. New code cannot revoke external files already public or downloaded.
5. Reconcile existing customers from genuine Stripe receipts before cutover; investigate receipts refused by the strict recovery tool. Preserve legacy rows; do not grant entitlement based solely on those rows.
6. Complete an actual hosted Stripe Test Mode checkout and Vercel raw-body webhook test, including retries, refunds, delayed confirmation and account recovery.
7. Complete the public publishing/editor regression checklist, then seek explicit approval for production configuration/migration/deployment. Separately approve and verify a real transaction before claiming production payments operational.

Refunds currently revoke the whole order's access, including partial refunds. Dispute automation is a remaining operational risk. Checkout preserves USD and quantity-one digital products; historical discounts/changed titles may require manual legacy reconciliation. Latest-200-order reporting is not a complete accounting export. Local analytics/activity logs are not a security audit trail. Review pre-existing integrations that read full product rows directly; they now need the safe catalog API or authorized access.

## Deployment and rollback

Follow `STRIPE_CONFIGURATION.md` and `PRODUCTION_ACCEPTANCE.md`. Checkout must remain disabled during cutover and until acceptance succeeds. Back up before any approved migration. Rollback should disable payments and preserve new order/entitlement/event data; never restore simulated payments or permissive public writes. Replay/reconcile Stripe events after recovery before reopening checkout.

## Using the delivered source

The source archive contains the complete final tracked tree without dependencies, generated builds or Git history. Extract it, select Node 24, run `npm ci`, and follow the configuration guide. It deliberately contains no real credentials.

The incremental Git bundle preserves the local feature branch and reviewable commits. It requires a repository containing baseline `a5b9f8e` (for example, your existing clone of the original repository):

```bash
git fetch /path/to/Immersation-security.bundle security/stripe-production-hardening
git switch -c security/stripe-production-hardening FETCH_HEAD
```

If the branch already exists, inspect/fetch it without overwriting local work. Importing the bundle does not push, merge, deploy or apply migrations. The working checkout used for implementation remains under this chat's `work/Immersation` directory.
