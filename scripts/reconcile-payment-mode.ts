/** Operator-only, one-order-at-a-time recovery for records created before mode isolation. */
import 'dotenv/config';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { paymentConfig, validateSession } from '../server/security';
async function main() {
  const [orderId] = process.argv.slice(2);
  if (!/^[a-f0-9-]{36}$/.test(orderId || '')) throw new Error('Use: npm run reconcile:mode -- <existing-order-UUID>');
  const config = paymentConfig(process.env);
  const stripe = new Stripe(config.key);
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const result = await db.from('commerce_orders').select('*,order_items:commerce_order_items(*)').eq('id',orderId).single();
  if (result.error || !result.data?.stripe_session_id) throw new Error('Existing order/session required.');
  const order = result.data;
  if (order.livemode !== null && order.livemode !== config.live) throw new Error('Order belongs to a different payment mode.');
  const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
  const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ['data.price.product'] });
  if (lines.has_more) throw new Error('Unexpected product list.');
  validateSession(session, { ...order, livemode: config.live }, lines.data, config.live);
  if (order.status === 'paid' && session.payment_status !== 'paid') throw new Error('Stored payment state needs manual investigation.');
  if (order.status === 'paid') {
    const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!intentId) throw new Error('Payment intent required.');
    const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ['latest_charge'] });
    const charge = intent.latest_charge;
    if (intent.status !== 'succeeded' || !charge || typeof charge === 'string' || charge.amount_refunded > 0 || charge.disputed) throw new Error('Refunded, disputed or unsettled receipt needs manual investigation.');
  }
  if (order.user_id) {
    const account = await db.auth.admin.getUserById(order.user_id);
    if (account.error || !account.data.user?.email_confirmed_at || !session.customer_details?.email || account.data.user.email?.toLowerCase() !== session.customer_details.email.toLowerCase()) throw new Error('Existing account ownership requires manual receipt review.');
  }
  const assigned = await db.rpc('commerce_assign_mode', { p_order: order.id, p_session: session.id, p_live: config.live, p_email: session.payment_status === 'paid' ? session.customer_details?.email || null : null });
  if (assigned.error) throw new Error('Mode assignment failed.');
  console.log('Existing order payment mode verified and assigned. No payment or entitlement was created.');
}
main().catch(e => { console.error(e instanceof Error && !('raw' in e) ? e.message : 'Payment mode reconciliation failed.'); process.exitCode = 1; });
