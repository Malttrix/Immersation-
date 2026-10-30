/** Opt-in nonproduction integration check. Creates and expires a genuine unpaid TEST session. */
import 'dotenv/config';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { paymentConfig } from '../server/security';
async function main() {
  const config = paymentConfig(process.env);
  if (config.live) throw new Error('This check only runs with Stripe Test Mode.');
  const productId = process.env.STRIPE_TEST_PRODUCT_ID;
  const adminToken = process.env.STAGING_ADMIN_ACCESS_TOKEN;
  if (!productId || !adminToken) throw new Error('Set STRIPE_TEST_PRODUCT_ID and STAGING_ADMIN_ACCESS_TOKEN in protected staging environment variables.');
  const stripe = new Stripe(config.key, { timeout: 15000, maxNetworkRetries: 1 });
  async function call(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    // Optional existing automation credential; never disable protection or log it.
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers.set('x-vercel-protection-bypass', process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
    const response = await fetch(config.origin + path, { ...init, headers, redirect: 'error', signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    return { response, data };
  }
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  // Confirm actual deployed gateway mode BEFORE creating any checkout or order.
  const health = await call('/api/admin/payment-health', { headers: adminHeaders });
  assert.equal(health.response.status, 200, 'Verified staging administrator access required.');
  assert.equal(health.data.mode, 'test', 'Target must report test mode.');
  assert.equal(health.data.stripe_reachable, true, 'Stripe test API must be reachable.');
  assert.equal(health.data.persistence_healthy, true, 'Staging database schema must be available.');
  const context = await call('/api/checkout-context');
  assert.equal(context.response.status, 200, 'Secure guest context required.');
  const cookie = context.response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('purchase_owner='), 'Guest ownership cookie required.');
  let sessionId: string | undefined;
  try {
    const checkout = await call('/api/create-checkout-session', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID(), Cookie: cookie },
      body: JSON.stringify({ items: [{ productId, quantity: 1 }] })
    });
    assert.equal(checkout.response.status, 200, 'Staging checkout creation failed.');
    assert.equal(typeof checkout.data.sessionId, 'string', 'Checkout must return its genuine session identifier.');
    sessionId = checkout.data.sessionId;
    const session = await stripe.checkout.sessions.retrieve(sessionId!);
    assert.equal(session.livemode, false, 'Only Stripe test sessions are allowed.');
    assert.equal(session.mode, 'payment');
    assert.equal(session.payment_status, 'unpaid');
    assert.equal(session.client_reference_id, checkout.data.orderId);
    assert.equal(session.metadata?.order_id, checkout.data.orderId);
    const orders = await call('/api/admin/orders', { headers: adminHeaders });
    assert.equal(orders.response.status,200);
    const order = orders.data.orders.find((o: any) => o.id === checkout.data.orderId);
    assert.ok(order, 'The genuine session must have a durable database order.');
    assert.equal(order.amount, session.amount_total);
    assert.equal(order.currency, session.currency);
    assert.deepEqual(order.commerce_order_items.map((i: any) => i.product_id), [productId]);
    const unpaid = await call(`/api/verify-session?session_id=${encodeURIComponent(sessionId!)}`, { headers: { Cookie: cookie } });
    assert.equal(unpaid.response.status,200);assert.equal(unpaid.data.paid,false);assert.deepEqual(unpaid.data.books,[]);
    const forged = await call('/api/verify-session?session_id=SANDBOX_forged', { headers: { Cookie: cookie } });
    assert.equal(forged.response.status,400);
    await stripe.checkout.sessions.expire(sessionId!);
    const expired = await call(`/api/verify-session?session_id=${encodeURIComponent(sessionId!)}`, { headers: { Cookie: cookie } });
    assert.equal(expired.response.status,200);assert.equal(expired.data.status,'expired');assert.equal(expired.data.paid,false);
    console.log('PASS: genuine Stripe Test Mode session, durable order, unpaid access denial and expiry. No payment was made.');
    console.log('Paid fulfillment, signed webhook delivery and account recovery still require the staging acceptance checks.');
  } finally {
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.livemode === false && session.status === 'open') await stripe.checkout.sessions.expire(sessionId);
    }
  }
}
main().catch(() => { console.error('Staging smoke check did not complete. Check protected test credentials, administrator token, product ID and staging service configuration. No success is claimed.');process.exitCode=1; });
