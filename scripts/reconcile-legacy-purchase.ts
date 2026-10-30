/** Operator-only recovery: do not use browser/localStorage or legacy purchases rows as evidence. */
import 'dotenv/config';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { paymentConfig, pricedProduct } from '../server/security';
async function main() {
  const [sessionId, userId] = process.argv.slice(2);
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId || '') || !/^[a-f0-9-]{36}$/.test(userId || '')) throw new Error('Use: npm run reconcile:legacy -- <Stripe-session-ID> <verified-Supabase-user-UUID>');
  const config = paymentConfig(process.env);
  const stripe = new Stripe(config.key);
  const db = createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{ auth:{persistSession:false} });
  const {data:{user},error} = await db.auth.admin.getUserById(userId);
  if (error || !user?.email_confirmed_at || !user.email) throw new Error('A verified account is required.');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== 'payment' || session.livemode !== config.live || session.payment_status !== 'paid' || session.status !== 'complete' || session.customer_details?.email?.toLowerCase() !== user.email.toLowerCase()) throw new Error('Stripe payment or verified customer identity does not match.');
  const ids = JSON.parse(session.metadata?.books || '[]');
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20 || ids.some(id=>typeof id!=='string' || id.startsWith('__')) || new Set(ids).size!==ids.length) throw new Error('Legacy product evidence requires manual investigation.');
  const products = await db.from('products').select('id,title,price,currency,active').in('id',ids);
  if(products.error || products.data.length !== ids.length) throw new Error('Catalog mismatch.');
  const items = products.data.map(pricedProduct);
  const lines = await stripe.checkout.sessions.listLineItems(sessionId,{limit:100});
  if(lines.has_more || lines.data.length!==items.length || session.currency!=='usd' || session.amount_total!==items.reduce((n,i)=>n+i.unit_amount,0)) throw new Error('Amount mismatch; investigate historical receipts manually.');
  const remaining = [...lines.data];
  for(const item of items) {
    const i=remaining.findIndex(l=>l.quantity===1 && l.currency==='usd' && l.price?.unit_amount===item.unit_amount && l.description===`Immersation: ${item.title}`);
    if(i<0) throw new Error('Product and price evidence do not match.');
    remaining.splice(i,1);
  }
  const pi=typeof session.payment_intent==='string' ? session.payment_intent : session.payment_intent?.id;
  if(!pi) throw new Error('Missing payment intent.');
  const intent=await stripe.paymentIntents.retrieve(pi,{expand:['latest_charge']});
  const charge=intent.latest_charge;
  if(intent.status!=='succeeded' || !charge || typeof charge==='string' || charge.amount_refunded>0 || charge.disputed) throw new Error('Refunded, disputed or unsettled receipt.');
  const existing=await db.from('commerce_legacy_grants').select('user_id,active').eq('stripe_session_id',session.id);
  if(existing.error || existing.data.some(g=>g.user_id!==user.id || !g.active)) throw new Error('Receipt already reconciled to a different or revoked owner.');
  // Ignore existing grants; rerunning must never reactivate a refunded receipt.
  const result=await db.from('commerce_legacy_grants').upsert(items.map(i=>({user_id:user.id,product_id:i.product_id,stripe_session_id:session.id,stripe_payment_intent_id:pi})),{onConflict:'stripe_session_id,product_id',ignoreDuplicates:true});
  if(result.error) throw new Error('Grant persistence failed.');
  console.log(`Reconciled ${items.length} verified legacy product grants. No payment was created.`);
}
main().catch(e=>{ console.error(e instanceof Error && !('raw' in e) ? e.message : 'Legacy reconciliation failed.');process.exitCode=1; });
