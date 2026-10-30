# Production acceptance — requires explicit activation approval

No boxes below are asserted complete merely because a local fixture passes.

## Data and security readiness

- [ ] Backups include rows, RLS policies, table/function grants and Storage configuration; recovery rehearsed.
- [ ] Compare actual deployed schema against the versioned migration; apply in staging and review schema diff.
- [ ] Original article/product counts, identifiers, prices and customer records match pre-migration snapshots.
- [ ] Legitimate existing buyers reconciled from provider receipts, or assigned an owner-led recovery case before cutover.
- [ ] Exposed SendFox credential rotated; review/rotate any Stripe key previously entered into browser settings.
- [ ] `.stripe_config.json` and internal secret product configuration removed through approved cleanup; old deployments/CDN caches reviewed.
- [ ] Only verified administrator UUIDs in `security_admins`; regular accounts cannot add themselves or edit products/articles/settings.
- [ ] Anonymous and normal user attempts cannot write sensitive tables, read orders or use identity-bearing RPCs directly.
- [ ] New private bucket confirmed private; actual paid files uploaded; prior public EPUB/HTML origins restricted.
- [ ] Google OAuth and/or email magic link redirects and delivery work on actual domain; no imitation password login remains.

## Staging Stripe Test Mode

- [ ] Preview uses test credentials; production-key-in-preview and test-key-in-production both fail closed.
- [ ] Missing/misconfigured keys, origin or storage return controlled unavailable responses.
- [ ] Both versioned migrations are reviewed/applied in order; unknown-mode historical records are re-verified before cutover.
- [ ] Test-mode purchases, legacy grants and claims cannot unlock live access or appear as live revenue, even if the database is shared.
- [ ] Paid download signing refuses a public bucket; previously public external assets are separately restricted.
- [ ] Checkout contains correct catalog products, quantity one, unchanged price and USD currency.
- [ ] Altered cart amounts/titles/currency and nonexistent/inactive products are rejected.
- [ ] Repeated clicks and retry with same key reuse the checkout; test expiry/new attempt recovery.
- [ ] Complete an actual hosted Stripe Test Mode checkout using test payment methods; verify remote order and items persist.
- [ ] Return page confirms only the correct customer order; another customer cannot claim/verify it with its session ID.
- [ ] Browser local storage edits and fabricated sessions cannot expose paid chapters or signed download URLs.
- [ ] Refresh and independent signed-in devices retain access; account logout removes account-only access.
- [ ] Guest cookie access works; verified account email recovery works without the cookie; unverified/different email recovery fails.
- [ ] Cancel, decline, connection interruption and expired session show understandable outcomes without granting access.
- [ ] Delay webhook; return-page reconciliation grants access only after actual paid state.
- [ ] Asynchronous unpaid completion stays locked; later success unlocks; stale failure cannot overwrite paid state.
- [ ] Hosted Vercel webhook validates unchanged raw bytes; changed body/signature/mode fails.
- [ ] Duplicate/reordered events create one entitlement/event record; concurrent processing is safe.
- [ ] Database outage returns retryable non-2xx, then succeeds after restoration without missing/duplicate grants.
- [ ] Refund event revokes access; stale paid event cannot restore it; partial-refund policy reviewed.
- [ ] Purchase recorded with missing asset produces fulfillment-pending guidance; configured file download works and signed URL expires.
- [ ] Admin dashboard shows genuine order IDs, items, amount/currency, payment timestamp, payment/refund state and accurate empty state.
- [ ] Public articles, bilingual views, navigation, cart, legitimate product editing and existing Content Studio flow pass smoke checks.
- [ ] Public build output contains no server bundle, paid text, private file references or secret values.
- [ ] Dependency audit, `npm run lint`, `npm test`, `npm run build` pass from a clean Node 24 install.

## Approved production activation

- [ ] Owner approves exact commit(s), schema migration, credential/variable changes, live webhook configuration and deployment.
- [ ] Maintenance window/checkout gate enabled during cutover; rollback owner and procedure agreed.
- [ ] Production requires live key and its correct signing secret; admin health checks API/database/configuration.
- [ ] Live webhook delivery and logging verified on deployed URL; no secrets/customer payloads in logs.
- [ ] **Separate approval for one real transaction** obtained; no such transaction has been performed by this implementation task.
- [ ] Approved real transaction yields matching Stripe payment, durable order, correct customer entitlement, download and receipt.
- [ ] Approved refund/recovery check completed and financial records reconciled.
- [ ] Public checkout enabled only after acceptance; monitor failed webhook deliveries and fulfillment failures.

Production payment operation must not be claimed until the approved real transaction and deployed checks succeed.
