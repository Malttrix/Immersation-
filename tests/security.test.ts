import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import Stripe from 'stripe';
import { assertPublicEnvironment } from '../scripts/public-env';
import { createApp } from '../server/app';
import { paymentConfig, cartIdentifiers, pricedProduct, validateSession, hash } from '../server/security';

const env = { NODE_ENV: 'test', STRIPE_SECRET_KEY: 'sk_test_' + 'fixture'.repeat(5), STRIPE_WEBHOOK_SECRET: 'whsec_fixture_only', APP_URL: 'http://localhost:3000' };
const sdk = new Stripe(env.STRIPE_SECRET_KEY);
const userId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
let pg: PGlite;
let server: any;
let base: string;
const sessions = new Map<string, any>();
let stripeCalls = 0;
let failRpc: string | null = null;
let bucketPublic = false;
let signedUrlCalls = 0;
const db: any = {
  storage: {
    getBucket: async () => ({ data: { id: 'paid-books', public: bucketPublic }, error: null }),
    from: () => ({ createSignedUrl: async () => { signedUrlCalls++; return { data: { signedUrl: 'https://storage.example.test/fixture-signed-url' }, error: null }; } })
  },
  auth: { getUser: async (token: string) => ({ data: { user: token === 'valid-user' ? { id: userId, email: 'verified@example.test', email_confirmed_at: '2026-01-01' } : token === 'other-user' ? { id: otherId, email: 'other@example.test', email_confirmed_at: '2026-01-01' } : null }, error: null }) },
  rpc: async (name: string, args: any = {}) => {
    if (failRpc === name) return { error: { message: 'fixture failure' }, data: null };
    try {
      const entries = Object.entries(args);
      const result = await pg.query(`select public.${name}(${entries.map(([k],i) => `${k} => $${i+1}`).join(',')}) as value`, entries.map(([,v]) => typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
      return { data: (result.rows[0] as any).value, error: null };
    } catch (e) { return { data: null, error: e }; }
  },
  from: (table: string) => {
    const where: string[] = []; const params: any[] = []; let single = false; let select = '*'; let limit = ''; let sort = '';
    const filter = (column: string, value: any, op = '=') => { params.push(value); where.push(op === '= any' ? `"${column}" = any($${params.length})` : `"${column}" ${op} $${params.length}`); return q; };
    const q: any = {
      select: (s: string) => { select = s; return q; }, eq: (k: string,v: any) => filter(k,v),
      in: (k: string,v: any) => filter(k,v,'= any'),
      not: (k: string,_op: any,v: any) => filter(k,v,'not like'),
      order: (k: string) => { sort = ` order by "${k}" desc`; return q; }, limit: (n: number) => { limit=` limit ${n}`; return q; },
      maybeSingle: () => { single=true; return q; }, single: () => { single=true; return q; },
      then: (resolve: any,reject: any) => (async () => {
        try {
          // Keep real SQL rows; embedded relationships are modeled with actual child queries.
          let columns = select.includes('(') ? '*' : select;
          const result = await pg.query(`select ${columns} from public.${table}${where.length ? ' where '+where.join(' and ') : ''}${sort}${limit}`,params);
          const rows: any[] = result.rows;
          if (select.includes('order_items:')) for (const row of rows) row.order_items = (await pg.query('select * from commerce_order_items where order_id=$1',[row.id])).rows;
          if (select.includes('commerce_order_items(')) for (const row of rows) row.commerce_order_items = (await pg.query('select * from commerce_order_items where order_id=$1',[row.id])).rows;
          return { data: single ? rows[0] || null : rows, error: null };
        } catch(e) { return { data: null, error: e }; }
      })().then(resolve,reject)
    }; return q;
  }
};
const stripe: any = {
  webhooks: sdk.webhooks,
  balance: { retrieve: async () => ({}) },
  checkout: { sessions: {
    create: async (payload: any, options: any) => {
      stripeCalls++;
      const id = 'cs_test_' + options.idempotencyKey.replace(/-/g,'');
      const line_items = payload.line_items.map((l: any) => ({ quantity: l.quantity, currency: l.price_data.currency, price: { unit_amount: l.price_data.unit_amount, product: { metadata: l.price_data.product_data.metadata } } }));
      if (!sessions.has(id)) sessions.set(id, { ...payload, id, status: 'open', payment_status: 'unpaid', livemode: false, currency: 'usd', amount_total: payload.line_items.reduce((n: number,l: any) => n+l.price_data.unit_amount,0), line_items, customer_details: { email: 'verified@example.test' }, url: 'https://checkout.stripe.com/c/fixture' });
      return sessions.get(id);
    },
    retrieve: async (id: string) => { if (!sessions.has(id)) throw new Error('unknown session'); return sessions.get(id); },
    listLineItems: async (id: string) => ({ data: sessions.get(id).line_items, has_more: false })
  } }, paymentIntents: { retrieve: async () => ({ latest_charge: { amount_refunded: 0 } }) }
};
async function request(path: string, options: any = {}) {
  const r = await fetch(base+path, options);
  return { status: r.status, body: await r.json(), cookie: r.headers.get('set-cookie')?.split(';')[0] };
}
async function startCheckout() {
  const context = await request('/api/checkout-context');
  const cookie = context.cookie!;
  const key = randomUUID();
  const payload = { items: [{ productId: 'paid-book', quantity: 1 }] };
  const result = await request('/api/create-checkout-session', { method: 'POST', headers: { 'content-type':'application/json', 'idempotency-key':key, cookie }, body: JSON.stringify(payload) });
  assert.equal(result.status,200,JSON.stringify(result.body));
  const row = (await pg.query('select * from commerce_orders where id=$1',[result.body.orderId])).rows[0] as any;
  return { ...result, row, session: sessions.get(row.stripe_session_id), cookie, key, payload };
}
async function webhook(session: any, id = 'evt_'+randomUUID(), type = 'checkout.session.completed') {
  const payload = JSON.stringify({ id, object: 'event', type, livemode: false, data: { object: { id: session.id } } });
  const signature = sdk.webhooks.generateTestHeaderString({ payload, secret: env.STRIPE_WEBHOOK_SECRET });
  return request('/api/stripe/webhook', { method:'POST', headers:{ 'content-type':'application/json','stripe-signature':signature },body:payload });
}
before(async () => {
  pg = new PGlite();
  await pg.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean);
    create table storage.objects(id uuid primary key,bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant all on storage.objects to anon,authenticated,service_role;
    insert into auth.users values('${userId}'),('${otherId}');`);
  const schema = readFileSync('supabase_schema.sql','utf8');
  await pg.exec(schema.slice(schema.indexOf('-- 1. PRODUCTS TABLE'),schema.indexOf('-- ENABLE ROW LEVEL SECURITY')));
  await pg.exec(`insert into products(id,title,price) values('paid-book','{"en":"Paid Book"}',19),('free-book','{"en":"Free Book"}',0);
    insert into articles(id,title) values('existing-article','{"en":"Unchanged"}');
    insert into purchases(id,email,amount) values('legacy-proof','legacy@example.test',19);`);
  await pg.exec(readFileSync('supabase/migrations/202610300001_commerce_security.sql','utf8'));
  // Exercise an actual upgrade with an existing paid order and entitlement.
  const upgradeId = '33333333-3333-4333-8333-333333333333';
  const oldOrder = await db.rpc('commerce_prepare_order',{p_id:upgradeId,p_user:null,p_guest:hash('upgrade_fixture'),p_key:'upgrade_fixture',p_items:[{product_id:'paid-book',title:'Paid Book',unit_amount:1900,quantity:1}],p_amount:1900,p_currency:'usd'});
  assert.equal(oldOrder.error,null);
  assert.equal((await db.rpc('commerce_attach_session',{p_order:upgradeId,p_session:'cs_test_upgradeFixture'})).error,null);
  assert.equal((await db.rpc('commerce_apply_payment',{p_order_id:upgradeId,p_session_id:'cs_test_upgradeFixture',p_intent_id:null,p_status:'paid',p_email:'upgrade@example.test',p_event_id:'evt_upgradeFixture',p_event_type:'checkout.session.completed',p_refunded:0})).error,null);
  await pg.exec(readFileSync('supabase/migrations/202610300002_payment_mode_isolation.sql','utf8'));
  server = createApp({ env, db, stripe }).listen(0,'127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise<void>(resolve=>server.close(()=>resolve())); await pg?.close(); });

test('missing credentials and wrong modes fail closed; preview requires test even with NODE_ENV production', () => {
  assert.throws(()=>paymentConfig({}));
  assert.throws(()=>paymentConfig({ ...env,NODE_ENV:'production' }));
  assert.throws(()=>paymentConfig({ ...env,STRIPE_SECRET_KEY:'sk_live_'+'x'.repeat(32) }));
  assert.equal(paymentConfig({ ...env,NODE_ENV:'production',VERCEL_ENV:'preview' }).mode,'test');
  assert.throws(()=>paymentConfig({ ...env,APP_URL:'https://user:password@example.test' }));
});
test('cart rejects malformed, duplicate, free-priced and manipulated items', () => {
  for (const body of [{},{items:[]},{items:[{productId:'x',quantity:0}]},{items:[{productId:'x',quantity:1,price:1}]},{items:[{productId:'x',quantity:1},{productId:'x',quantity:1}]}]) assert.throws(()=>cartIdentifiers(body));
  assert.throws(()=>pricedProduct({ active:true,currency:'usd',price:0 }));
});
test('unauthenticated admin mutations and diagnostics are rejected',async()=> {
  for (const [method,path] of [['POST','/api/sync-articles'],['POST','/api/broadcast-sendfox'],['POST','/api/convert-epub'],['POST','/api/admin/set-stripe-keys'],['GET','/api/admin/orders'],['GET','/api/admin/payment-health']]) assert.equal((await request(path,{method,headers:{'content-type':'application/json'},...(method==='POST'?{body:'{}'}:{})})).status,401);
  assert.deepEqual((await request('/api/health')).body,{status:'ok'});
});
test('verified normal user cannot administer; database allowlisted user can',async()=> {
  assert.equal((await request('/api/admin/me',{headers:{authorization:'Bearer valid-user'}})).status,403);
  await pg.query('insert into security_admins(user_id) values($1)',[userId]);
  assert.equal((await request('/api/admin/me',{headers:{authorization:'Bearer valid-user'}})).status,200);
  assert.equal((await request('/api/admin/set-stripe-keys',{method:'POST',headers:{authorization:'Bearer valid-user','content-type':'application/json'},body:'{}'})).status,410);
  await pg.query('delete from security_admins where user_id=$1',[userId]);
});
test('fabricated SANDBOX and forged sessions cannot unlock books',async()=> {
  assert.equal((await request('/api/verify-session?session_id=SANDBOX_fabricated')).status,400);
  assert.equal((await request('/api/verify-session?session_id=cs_test_forged')).status,404);
  assert.equal((await request('/api/products/paid-book/content',{headers:{cookie:'immersation_unlocked_books=paid-book'}})).status,403);
});
test('public catalog hides paid content and internal records; free access remains',async()=> {
  const r = await request('/api/products'); assert.equal(r.status,200); assert.equal(r.body.products.length,2); assert.equal(r.body.products[0].chapters,undefined);
  assert.equal((await request('/api/products/free-book/content')).status,200);
});
test('invalid product and client price override never call Stripe',async()=> {
  const {cookie} = await request('/api/checkout-context'); const before = stripeCalls;
  for(const item of [{productId:'missing',quantity:1},{productId:'paid-book',quantity:1,price:0.01},{productId:'free-book',quantity:1}]) {
    const r = await request('/api/create-checkout-session',{method:'POST',headers:{cookie,'content-type':'application/json','idempotency-key':randomUUID()},body:JSON.stringify({items:[item]})}); assert.equal(r.status,400);
  } assert.equal(stripeCalls,before);
});
test('session creation persists authoritative price and retries reuse the order/session',async()=> {
  const c = await startCheckout(); assert.equal(c.row.amount,1900);
  const retry = await request('/api/create-checkout-session',{method:'POST',headers:{cookie:c.cookie,'content-type':'application/json','idempotency-key':c.key},body:JSON.stringify(c.payload)});
  assert.equal(retry.body.orderId,c.row.id);
  assert.equal((await pg.query('select count(*)::int as n from commerce_order_items where order_id=$1',[c.row.id])).rows[0]['n'],1);
});
test('unpaid/canceled session grants no entitlement; another guest cannot verify',async()=> {
  const c=await startCheckout();
  const r=await request('/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}});assert.equal(r.body.paid,false);
  assert.equal((await request('/api/verify-session?session_id='+c.session.id)).status,404);
  assert.deepEqual((await request('/api/entitlements',{headers:{cookie:c.cookie}})).body.books,['free-book']);
});
test('genuine SDK signature verification rejects tampered body',async()=> {
  const c=await startCheckout();const payload=JSON.stringify({id:'evt_fake'});
  const signature=sdk.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET});
  assert.equal((await request('/api/stripe/webhook',{method:'POST',headers:{'content-type':'application/json','stripe-signature':signature},body:payload+' '})).status,400);
});
test('paid signed event atomically persists event and entitlement; duplicate is idempotent',async()=> {
  const c=await startCheckout(); c.session.payment_status='paid';c.session.status='complete';
  const id='evt_'+randomUUID();assert.equal((await webhook(c.session,id)).status,200);assert.equal((await webhook(c.session,id)).status,200);
  assert.equal((await pg.query('select count(*)::int as n from commerce_entitlements where order_id=$1',[c.row.id])).rows[0]['n'],1);
  assert.equal((await pg.query('select count(*)::int as n from commerce_webhook_events where event_id=$1',[id])).rows[0]['n'],1);
  assert.ok((await request('/api/entitlements',{headers:{cookie:c.cookie}})).body.books.includes('paid-book'));
});
test('delayed webhook recovers through owned Stripe reconciliation',async()=> {
  const c=await startCheckout();c.session.payment_status='paid';c.session.status='complete';
  const r=await request('/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}});assert.equal(r.body.paid,true);
  assert.equal((await webhook(c.session)).status,200);
});
test('unpaid asynchronous completion stays locked, succeeded event unlocks, stale failure cannot revoke',async()=> {
  const c=await startCheckout();c.session.status='complete';await webhook(c.session);
  assert.equal((await request('/api/entitlements',{headers:{cookie:c.cookie}})).body.books.includes('paid-book'),false);
  c.session.payment_status='paid';await webhook(c.session,undefined,'checkout.session.async_payment_succeeded');
  await webhook(c.session,undefined,'checkout.session.async_payment_failed');
  assert.equal((await pg.query('select status from commerce_orders where id=$1',[c.row.id])).rows[0]['status'],'paid');
});
test('guest purchase claim uses verified identity, not client supplied email; account owns after claim',async()=> {
  const c=await startCheckout();c.session.payment_status='paid';c.session.status='complete';await webhook(c.session);
  await request('/api/claim-purchases',{method:'POST',headers:{authorization:'Bearer other-user','content-type':'application/json'},body:JSON.stringify({email:'verified@example.test'})});
  assert.equal((await pg.query('select user_id from commerce_orders where id=$1',[c.row.id])).rows[0]['user_id'],null);
  assert.equal((await request('/api/claim-purchases',{method:'POST',headers:{authorization:'Bearer valid-user'}})).status,200);
  assert.equal((await pg.query('select user_id from commerce_orders where id=$1',[c.row.id])).rows[0]['user_id'],userId);
  assert.equal((await request('/api/products/paid-book/content',{headers:{authorization:'Bearer valid-user'}})).status,200);
  assert.equal((await request('/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}})).status,404);
});
test('database failure yields webhook retry instead of acknowledgement',async()=> {
  const c=await startCheckout();c.session.payment_status='paid';failRpc='commerce_apply_payment';
  assert.equal((await webhook(c.session)).status,503);failRpc=null;
  assert.equal((await webhook(c.session)).status,200);
});
test('amount, currency, mode, product and session/customer context mismatches are rejected',async()=> {
  const c=await startCheckout(); const order:any={...c.row,order_items:(await pg.query('select * from commerce_order_items where order_id=$1',[c.row.id])).rows};
  for (const change of [{amount_total:1},{currency:'eur'},{livemode:true},{client_reference_id:randomUUID()},{metadata:{order_id:randomUUID()}}]) assert.throws(()=>validateSession({...c.session,...change},order,c.session.line_items,false));
  assert.throws(()=>validateSession(c.session,order,[{...c.session.line_items[0],quantity:2}],false));
});
test('RLS blocks anonymous content/order writes and paid chapter reads; RPC identity spoofing is denied',async()=> {
  await pg.exec('set role anon');
  await assert.rejects(pg.exec("update products set price=0"));
  await assert.rejects(pg.exec("select * from commerce_orders"));
  await assert.rejects(pg.exec(`select commerce_access('paid-book','${userId}',null,false)`));
  await assert.rejects(pg.exec('select * from book_chapters'));
  await pg.exec('reset role');
  await pg.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${otherId}',false)`);
  assert.equal((await pg.query('select * from products')).rows.length,0);
  await assert.rejects(pg.exec("insert into security_admins(user_id) values('22222222-2222-4222-8222-222222222222')"));
  await pg.exec('reset role');
});
test('migration preserves original articles, prices, old customer rows and does not trust legacy purchases',async()=> {
  assert.equal((await pg.query("select price from products where id='paid-book'")).rows[0]['price'],'19');
  assert.equal((await pg.query("select title from articles where id='existing-article'")).rows[0]['title']['en'],'Unchanged');
  assert.equal((await pg.query("select email from purchases where id='legacy-proof'")).rows[0]['email'],'legacy@example.test');
});
test('expired session remains unpaid',async()=> {
 const c=await startCheckout();c.session.status='expired';await webhook(c.session,undefined,'checkout.session.expired');
 assert.equal((await pg.query('select status from commerce_orders where id=$1',[c.row.id])).rows[0]['status'],'expired');
});
test('refund revokes access permanently even if a paid event is retried',async()=> {
 const c=await startCheckout();c.session.payment_status='paid';await webhook(c.session);
 await db.rpc('commerce_apply_payment',{p_order_id:c.row.id,p_session_id:c.session.id,p_intent_id:null,p_status:'refunded',p_email:null,p_event_id:'evt_refund_'+randomUUID(),p_event_type:'charge.refunded',p_refunded:1900,p_live:false});
 await webhook(c.session);
 assert.equal((await pg.query('select active from commerce_entitlements where order_id=$1',[c.row.id])).rows[0]['active'],false);
 assert.equal((await pg.query('select status from commerce_orders where id=$1',[c.row.id])).rows[0]['status'],'refunded');
 const verified=await request('/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}});
 assert.equal(verified.body.paid,false);assert.equal(verified.body.status,'refunded');assert.deepEqual(verified.body.books,[]);
});
test('transaction rolls back entitlement/order changes when event persistence fails',async()=> {
 const c=await startCheckout();
 const r=await db.rpc('commerce_apply_payment',{p_order_id:c.row.id,p_session_id:c.session.id,p_intent_id:null,p_status:'paid',p_email:'verified@example.test',p_event_id:'evt_rollback',p_event_type:null,p_refunded:0,p_live:false});
 assert.ok(r.error);
 assert.equal((await pg.query('select status from commerce_orders where id=$1',[c.row.id])).rows[0]['status'],'pending');
 assert.equal((await pg.query('select * from commerce_entitlements where order_id=$1',[c.row.id])).rows.length,0);
});
test('RLS preserves anonymous article reads and admin catalog editing; normal account cannot update prices',async()=> {
 await pg.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${otherId}',false)`);
 await pg.exec("update products set price=0 where id='paid-book'");
 assert.equal((await pg.query('select * from articles')).rows.length,1);
 await pg.exec('reset role');
 assert.equal((await pg.query("select price from products where id='paid-book'")).rows[0]['price'],'19');
 await pg.query('insert into security_admins(user_id) values($1)',[userId]);
 await pg.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${userId}',false)`);
 await pg.exec("update products set title=title where id='paid-book'");
 assert.equal((await pg.query('select * from products')).rows.length,2);
 await pg.exec('reset role');
 await pg.query('delete from security_admins where user_id=$1',[userId]);
});
test('missing Stripe configuration returns controlled PAYMENT_UNAVAILABLE over HTTP',async()=> {
 const disabled=createApp({env:{NODE_ENV:'production'},db,stripe}).listen(0,'127.0.0.1');
 await new Promise<void>(r=>disabled.once('listening',r));
 const address=disabled.address() as any;
 const response=await fetch(`http://127.0.0.1:${address.port}/api/create-checkout-session`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
 assert.equal(response.status,503);assert.deepEqual(await response.json(),{success:false,code:'PAYMENT_UNAVAILABLE',message:'Secure checkout is temporarily unavailable.'});
 await new Promise<void>(r=>disabled.close(()=>r()));
});
test('downloads require ownership and missing assets report fulfillment pending',async()=> {
 assert.equal((await request('/api/products/paid-book/download')).status,403);
 const c=await startCheckout();c.session.payment_status='paid';await webhook(c.session);
 assert.equal((await request('/api/products/paid-book/download',{headers:{cookie:c.cookie}})).body.code,'FULFILLMENT_PENDING');
});

test('build environment refuses frontend server secrets and service-role Supabase keys',()=> {
 assert.throws(()=>assertPublicEnvironment({VITE_STRIPE_SECRET_KEY:'fixture'}));
 const service='eyJfixture.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.fixture';
 assert.throws(()=>assertPublicEnvironment({VITE_SUPABASE_ANON_KEY:service}));
 assert.doesNotThrow(()=>assertPublicEnvironment({VITE_SUPABASE_ANON_KEY:'sb_publishable_fixture'}));
});

test('webhook recovers a session created before its database attachment failed',async()=> {
 const c=await startCheckout();
 await pg.query('update commerce_orders set stripe_session_id=null where id=$1',[c.row.id]);
 c.session.payment_status='paid';
 assert.equal((await webhook(c.session)).status,200);
 const row=(await pg.query('select stripe_session_id,status from commerce_orders where id=$1',[c.row.id])).rows[0] as any;
 assert.equal(row.stripe_session_id,c.session.id);assert.equal(row.status,'paid');
});

test('test purchases cannot unlock, verify or appear as live sales in a shared database',async()=> {
 const c=await startCheckout();c.session.payment_status='paid';await webhook(c.session);
 assert.ok((await request('/api/entitlements',{headers:{cookie:c.cookie}})).body.books.includes('paid-book'));
 const production=createApp({env:{...env,NODE_ENV:'production',APP_URL:'https://shop.example.test',STRIPE_SECRET_KEY:'sk_live_'+'fixture'.repeat(5)},db,stripe}).listen(0,'127.0.0.1');
 await new Promise<void>(r=>production.once('listening',r));
 const address=production.address() as any;const origin=`http://127.0.0.1:${address.port}`;
 try {
  const library=await fetch(origin+'/api/entitlements',{headers:{cookie:c.cookie}}).then(r=>r.json());
  assert.deepEqual(library.books,['free-book']);
  assert.equal((await fetch(origin+'/api/products/paid-book/content',{headers:{cookie:c.cookie}})).status,403);
  assert.equal((await fetch(origin+'/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}})).status,404);
  await pg.query('insert into security_admins(user_id) values($1)',[userId]);
  const orders=await fetch(origin+'/api/admin/orders',{headers:{authorization:'Bearer valid-user'}}).then(r=>r.json());
  assert.deepEqual(orders.orders,[]);
 } finally {
  await pg.query('delete from security_admins where user_id=$1',[userId]);
  await new Promise<void>(r=>production.close(()=>r()));
 }
});
test('claims and legacy grants respect Stripe mode; unknown mode never grants paid access',async()=> {
 const c=await startCheckout();c.session.payment_status='paid';await webhook(c.session);
 await db.rpc('commerce_claim',{p_user:otherId,p_email:'verified@example.test',p_live:true});
 assert.equal((await pg.query('select user_id from commerce_orders where id=$1',[c.row.id])).rows[0]['user_id'],null);
 await pg.query('update commerce_orders set livemode=null where id=$1',[c.row.id]);
 for(const p_live of [true,false]) assert.equal((await db.rpc('commerce_access',{p_product:'paid-book',p_user:null,p_guest:hash(c.cookie.slice('purchase_owner='.length)),p_live})).data,false);
 await pg.query("insert into commerce_legacy_grants(user_id,product_id,stripe_session_id,stripe_payment_intent_id,livemode) values($1,'paid-book','cs_test_legacy_fixture','pi_legacy_fixture',false)",[otherId]);
 assert.equal((await db.rpc('commerce_access',{p_product:'paid-book',p_user:otherId,p_guest:null,p_live:false})).data,true);
 assert.equal((await db.rpc('commerce_access',{p_product:'paid-book',p_user:otherId,p_guest:null,p_live:true})).data,false);
});
test('mode-aware idempotency separates the same owner/request across test and live',async()=> {
 const items=[{product_id:'paid-book',title:'Paid Book',unit_amount:1900,quantity:1}];const key=randomUUID();
 const common={p_user:null,p_guest:'fixture_owner',p_key:key,p_items:items,p_amount:1900,p_currency:'usd'};
 const trial=await db.rpc('commerce_prepare_order',{...common,p_id:randomUUID(),p_live:false});
 const liveOrder=await db.rpc('commerce_prepare_order',{...common,p_id:randomUUID(),p_live:true});
 assert.equal(trial.error,null);assert.equal(liveOrder.error,null);assert.notEqual(trial.data,liveOrder.data);
 await pg.query('delete from commerce_order_items where order_id=any($1)',[[trial.data,liveOrder.data]]);
 await pg.query('delete from commerce_orders where id=any($1)',[[trial.data,liveOrder.data]]);
});
test('public paid bucket is rejected before signing; a private bucket yields an authorized short-lived URL',async()=> {
 const c=await startCheckout();c.session.payment_status='paid';await webhook(c.session);
 await pg.query("insert into commerce_assets(product_id,object_path) values('paid-book','fixture/book.epub')");
 const before=signedUrlCalls;
 try {
  bucketPublic=true;
  assert.equal((await request('/api/products/paid-book/download',{headers:{cookie:c.cookie}})).status,503);
  assert.equal(signedUrlCalls,before);
  bucketPublic=false;
  const result=await request('/api/products/paid-book/download',{headers:{cookie:c.cookie}});
  assert.equal(result.status,200);assert.equal(result.body.url,'https://storage.example.test/fixture-signed-url');
  assert.equal(signedUrlCalls,before+1);
 } finally {bucketPublic=false;await pg.exec("delete from commerce_assets where product_id='paid-book'");}
});

test('unpaid customer email is not claim evidence and paid email follows confirmed Stripe details',async()=> {
 const c=await startCheckout();c.session.customer_details.email='unpaid@example.test';
 await request('/api/verify-session?session_id='+c.session.id,{headers:{cookie:c.cookie}});
 assert.equal((await pg.query('select customer_email from commerce_orders where id=$1',[c.row.id])).rows[0]['customer_email'],null);
 c.session.customer_details.email='paid@example.test';c.session.payment_status='paid';await webhook(c.session);
 assert.equal((await pg.query('select customer_email from commerce_orders where id=$1',[c.row.id])).rows[0]['customer_email'],'paid@example.test');
});

test('mode migration preserves prior paid records and quarantines unclassified access',async()=> {
 const id='33333333-3333-4333-8333-333333333333';
 const row=(await pg.query('select status,livemode,amount from commerce_orders where id=$1',[id])).rows[0] as any;
 assert.equal(row.status,'paid');assert.equal(row.amount,1900);assert.equal(row.livemode,null);
 assert.equal((await pg.query('select active from commerce_entitlements where order_id=$1',[id])).rows[0]['active'],true);
 for(const p_live of [true,false]) assert.equal((await db.rpc('commerce_access',{p_product:'paid-book',p_user:null,p_guest:hash('upgrade_fixture'),p_live})).data,false);
 assert.ok((await db.rpc('commerce_access',{p_product:'paid-book',p_user:null,p_guest:hash('upgrade_fixture')})).error);
 assert.ok((await db.rpc('commerce_health')).data.unclassified_orders>=1);
 const assigned=await db.rpc('commerce_assign_mode',{p_order:id,p_session:'cs_test_upgradeFixture',p_live:false,p_email:'confirmed-upgrade@example.test'});
 assert.equal(assigned.error,null);
 const classified=(await pg.query('select livemode,customer_email,owner_key from commerce_orders where id=$1',[id])).rows[0] as any;
 assert.equal(classified.livemode,false);assert.equal(classified.customer_email,'confirmed-upgrade@example.test');assert.ok(classified.owner_key.startsWith('test:'));
 assert.equal((await db.rpc('commerce_access',{p_product:'paid-book',p_user:null,p_guest:hash('upgrade_fixture'),p_live:false})).data,true);
 assert.ok((await db.rpc('commerce_assign_mode',{p_order:id,p_session:'cs_test_upgradeFixture',p_live:true,p_email:'confirmed-upgrade@example.test'})).error);
});

test('staging smoke command stops before checkout when the deployed gateway reports live mode',async()=> {
 const calls:string[]=[];
 const target=createServer((req,res)=>{
  calls.push(req.url || '');
  assert.equal(req.headers.authorization,'Bearer staging_fixture');
  assert.equal(req.headers['x-vercel-protection-bypass'],'automation_fixture');
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({mode:'live',stripe_reachable:true,persistence_healthy:true}));
 }).listen(0);
 await new Promise<void>(r=>target.once('listening',r));
 const address=target.address() as any;
 try {
  const exit=await new Promise<number|null>((resolve,reject)=>{
   const child=spawn(process.execPath,['--import','tsx','scripts/stripe-test-smoke.ts'],{
    env:{...process.env,...env,VERCEL_ENV:'preview',APP_URL:`http://localhost:${address.port}`,STRIPE_TEST_PRODUCT_ID:'paid-book',STAGING_ADMIN_ACCESS_TOKEN:'staging_fixture',VERCEL_AUTOMATION_BYPASS_SECRET:'automation_fixture'},
    stdio:'ignore'
   });
   child.once('error',reject);child.once('exit',resolve);
  });
  assert.equal(exit,1);assert.deepEqual(calls,['/api/admin/payment-health']);
 } finally {await new Promise<void>(r=>target.close(()=>r()));}
});
