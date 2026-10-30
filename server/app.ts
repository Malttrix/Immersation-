import express, { type Request, type RequestHandler } from 'express';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { cartIdentifiers, deploymentIsLive, guestHash, paymentConfig, pricedProduct, PublicError, unavailable, validateSession } from './security';
import { mountPublishing } from './publishing';
import { defaultBookContent } from './book-content';

type Dependencies = { env?: NodeJS.ProcessEnv; db?: SupabaseClient; stripe?: Stripe };
export function createApp(deps: Dependencies = {}) {
  const env = deps.env || process.env;
  const live = deploymentIsLive(env);
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const db = deps.db || (url && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) : null);
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const database = () => { if (!db) throw unavailable(); return db; };
  const gateway = () => { const config = paymentConfig(env); return { config, stripe: deps.stripe || new Stripe(config.key, { maxNetworkRetries: 2, timeout: 15000 }) }; };
  const checked = <T>(result: { data: T; error: any }): T => { if (result.error) throw unavailable(); return result.data; };
  async function user(req: Request, required = true) {
    const token = req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1];
    if (!token) { if (!required) return null; throw new PublicError(401, 'AUTH_REQUIRED', 'Please sign in securely.'); }
    const { data, error } = await database().auth.getUser(token);
    if (error || !data.user) throw new PublicError(401, 'AUTH_REQUIRED', 'Please sign in securely.');
    return data.user;
  }
  async function admin(req: Request) {
    const u = await user(req);
    const membership: any = checked(await database().from('security_admins').select('user_id').eq('user_id', u.id).maybeSingle());
    if (!membership) throw new PublicError(403, 'ADMIN_REQUIRED', 'Administrator access required.');
    return u;
  }
  const route = (fn: (req: any, res: any) => Promise<any>): RequestHandler => (req,res,next) => { Promise.resolve(fn(req,res)).catch(next); };
  const requireAdmin: RequestHandler = (req,res,next) => { admin(req).then(() => next()).catch(next); };
  async function owned(req: Request, order: any) {
    const u = await user(req, false);
    if (!order || !(order.user_id && u?.id === order.user_id || !order.user_id && order.guest_hash && order.guest_hash === guestHash(req))) throw new PublicError(404, 'ORDER_NOT_FOUND', 'Order not found for this customer.');
  }
  async function reconcile(sessionId: string, event?: Stripe.Event) {
    const { stripe, config } = gateway();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    let order: any = checked(await database().from('commerce_orders').select('*,order_items:commerce_order_items(*)').eq('stripe_session_id', sessionId).eq('livemode', live).maybeSingle());
    // Recover if Stripe created a session but the response/attachment database write failed.
    if (!order && /^[a-f0-9-]{36}$/.test(session.metadata?.order_id || '') && session.client_reference_id === session.metadata?.order_id) {
      const candidate: any = checked(await database().from('commerce_orders').select('*,order_items:commerce_order_items(*)').eq('id', session.metadata.order_id).eq('livemode', live).maybeSingle());
      if (candidate && !candidate.stripe_session_id) order = candidate;
    }
    if (!order) throw unavailable();
    const lines = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ['data.price.product'] });
    if (lines.has_more) throw unavailable();
    validateSession(session, { ...order, stripe_session_id: order.stripe_session_id || sessionId }, lines.data, config.live);
    if (!order.stripe_session_id) checked(await database().rpc('commerce_attach_session', { p_order: order.id, p_session: sessionId }));
    let refunded = 0;
    const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (intentId) {
      const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ['latest_charge'] });
      const charge = intent.latest_charge;
      if (charge && typeof charge !== 'string') refunded = charge.amount_refunded;
    }
    const status = refunded > 0 ? 'refunded' : session.payment_status === 'paid' ? 'paid' : session.status === 'expired' ? 'expired' : event?.type === 'checkout.session.async_payment_failed' ? 'failed' : 'pending';
    checked(await database().rpc('commerce_apply_payment', {
      p_order_id: order.id, p_session_id: session.id, p_intent_id: intentId || null,
      p_status: status, p_email: session.customer_details?.email || null,
      p_event_id: event?.id || null, p_event_type: event?.type || null, p_refunded: refunded, p_live: live
    }));
    // The SQL transaction may preserve a refund/paid state over a stale provider event.
    const persisted: any = checked(await database().from('commerce_orders').select('status').eq('id',order.id).eq('livemode',live).single());
    return { ...order, status: persisted.status, paid: persisted.status === 'paid', books: persisted.status === 'paid' ? order.order_items.map((i: any) => i.product_id) : [] };
  }
  // Must precede express.json; Vercel adapter also disables its body parser.
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '1mb' }), route(async (req,res) => {
    const { stripe, config } = gateway();
    let event: Stripe.Event;
    try {
      if (!Buffer.isBuffer(req.body) || typeof req.headers['stripe-signature'] !== 'string') throw new Error();
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.webhook);
    } catch { throw new PublicError(400, 'INVALID_SIGNATURE', 'Invalid webhook signature.'); }
    if (event.livemode !== config.live) throw new PublicError(400, 'INVALID_MODE', 'Invalid event environment.');
    if (['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type)) {
      await reconcile((event.data.object as Stripe.Checkout.Session).id, event);
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      if (!paymentIntent) throw unavailable();
      const order: any = checked(await database().from('commerce_orders').select('stripe_session_id').eq('stripe_payment_intent_id', paymentIntent).eq('livemode',live).maybeSingle());
      if (!order) {
        // Legacy recovery grants are based on independently reconciled Stripe receipts.
        const legacy: any[] = checked(await database().from('commerce_legacy_grants').select('stripe_session_id').eq('stripe_payment_intent_id', paymentIntent).eq('livemode',live));
        if (!legacy.length) throw unavailable();
        checked(await database().rpc('commerce_revoke_legacy', { p_intent: paymentIntent, p_event: event.id, p_type: event.type, p_live: live }));
      } else await reconcile(order.stripe_session_id, event);
    }
    res.json({ received: true });
  }));
  app.use(express.json({ limit: '8mb' }));
  app.get('/api/health', (_req,res) => res.json({ status: 'ok' }));
  app.get('/api/admin/payment-health', requireAdmin, route(async (_req,res) => {
    let config: ReturnType<typeof paymentConfig> | null = null;
    try { config = paymentConfig(env); } catch { /* report safe diagnostics */ }
    const probe = await database().rpc('commerce_health');
    let stripeReachable = false;
    if (config) { try { await gateway().stripe.balance.retrieve(); stripeReachable = true; } catch { /* no secrets */ } }
    res.json({ configured: !!config, mode: config?.mode || 'unavailable', webhook_configured: !!env.STRIPE_WEBHOOK_SECRET,
      stripe_reachable: stripeReachable, persistence_healthy: !probe.error, fulfillment: probe.error ? 'unavailable' : probe.data,
      operational: false, activation: 'Requires acceptance checks and an approved transaction' });
  }));
  app.post('/api/admin/set-stripe-keys', requireAdmin, (_req,res) => res.status(410).json({ success: false, message: 'Use protected deployment environment variables.' }));
  app.get('/api/admin/sendfox-health', requireAdmin, route(async (_req,res) => {
    if (!env.SENDFOX_API_KEY) return res.json({ configured: false, connected: false });
    const response = await fetch('https://api.sendfox.com/lists', { headers: { Authorization: `Bearer ${env.SENDFOX_API_KEY}` }, signal: AbortSignal.timeout(10000) });
    res.json({ configured: true, connected: response.ok });
  }));
  app.get('/api/admin/me', requireAdmin, (_req,res) => res.json({ admin: true }));
  app.get('/api/admin/orders', requireAdmin, route(async (_req,res) => {
    const orders = checked(await database().from('commerce_orders').select('id,customer_email,amount,currency,status,paid_at,refunded_amount,created_at,commerce_order_items(product_id,title,unit_amount,quantity)').eq('livemode',live).order('created_at', { ascending: false }).limit(200));
    res.json({ orders });
  }));
  app.get('/api/checkout-context', route(async (req,res) => {
    const { config } = gateway();
    if (!guestHash(req)) res.cookie('purchase_owner', randomBytes(32).toString('hex'), { httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'lax', path: '/', maxAge: 30*86400000 });
    res.json({ success: true });
  }));
  app.post('/api/create-checkout-session', route(async (req,res) => {
    const { config, stripe } = gateway();
    const ids = cartIdentifiers(req.body);
    const u = await user(req, false);
    const ownerHash = guestHash(req);
    if (!u && !ownerHash) throw new PublicError(409, 'CHECKOUT_CONTEXT_REQUIRED', 'Please restart checkout to establish a secure customer session.');
    const requestKey = req.headers['idempotency-key'];
    if (typeof requestKey !== 'string' || !/^[a-f0-9-]{36}$/.test(requestKey)) throw new PublicError(400, 'INVALID_REQUEST', 'Please retry checkout.');
    const products: any = checked(await database().from('products').select('id,title,price,currency,active').in('id', ids));
    if (products.length !== ids.length) throw new PublicError(400, 'INVALID_PRODUCT', 'A selected product is unavailable.');
    const items = products.map(pricedProduct).sort((a,b) => a.product_id.localeCompare(b.product_id));
    for (const id of ids) {
      const alreadyOwned = checked(await database().rpc('commerce_access', { p_product: id, p_user: u?.id || null, p_guest: ownerHash, p_live: live }));
      if (alreadyOwned) throw new PublicError(409, 'ALREADY_OWNED', 'This volume is already available in your library.');
    }
    const orderId: any = checked(await database().rpc('commerce_prepare_order', { p_id: randomUUID(), p_user: u?.id || null, p_guest: ownerHash,
      p_key: requestKey, p_items: items, p_amount: items.reduce((n,i) => n+i.unit_amount,0), p_currency: 'usd', p_live: live }));
    const existing: any = checked(await database().from('commerce_orders').select('stripe_session_id').eq('id',orderId).single());
    if (existing.stripe_session_id) {
      const previous = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);
      if (previous.status !== 'open' || !previous.url) throw new PublicError(409, 'CHECKOUT_CLOSED', 'Your previous checkout completed or expired. Check payment status before starting a new checkout.');
      return res.json({ success: true, url: previous.url, orderId, sessionId: previous.id });
    }
    const session = await stripe.checkout.sessions.create({ mode: 'payment', client_reference_id: orderId, metadata: { order_id: orderId },
      line_items: items.map(i => ({ quantity: 1, price_data: { currency: 'usd', unit_amount: i.unit_amount, product_data: { name: i.title, metadata: { product_id: i.product_id } } } })),
      success_url: `${config.origin}/?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${config.origin}/?checkout_canceled=true`,
      ...(u?.email && u.email_confirmed_at ? { customer_email: u.email } : {})
    }, { idempotencyKey: `checkout-${orderId}` });
    checked(await database().rpc('commerce_attach_session', { p_order: orderId, p_session: session.id }));
    res.json({ success: true, url: session.url, orderId, sessionId: session.id });
  }));
  app.get('/api/verify-session', route(async (req,res) => {
    if (typeof req.query.session_id !== 'string' || !/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(req.query.session_id)) throw new PublicError(400, 'INVALID_SESSION', 'Invalid payment session.');
    const order: any = checked(await database().from('commerce_orders').select('*').eq('stripe_session_id', req.query.session_id).eq('livemode',live).maybeSingle());
    await owned(req, order);
    const result = await reconcile(req.query.session_id);
    res.json({ paid: result.paid, books: result.books, status: result.status, orderId: result.id });
  }));
  app.post('/api/claim-purchases', route(async (req,res) => {
    const u = await user(req);
    if (!u.email || !u.email_confirmed_at) throw new PublicError(403, 'VERIFIED_EMAIL_REQUIRED', 'Verify your account email first.');
    checked(await database().rpc('commerce_claim', { p_user: u.id, p_email: u.email, p_live: live }));
    res.json({ success: true });
  }));
  async function access(req: Request, id: string) {
    const u = await user(req,false);
    const allowed: any = checked(await database().rpc('commerce_access', { p_product: id, p_user: u?.id || null, p_guest: guestHash(req), p_live: live }));
    if (!allowed) throw new PublicError(403, 'PURCHASE_REQUIRED', 'Purchase this volume or sign in to recover your purchase.');
  }
  app.get('/api/entitlements', route(async (req,res) => {
    const u = await user(req,false);
    const books = checked(await database().rpc('commerce_library', { p_user: u?.id || null, p_guest: guestHash(req), p_live: live }));
    res.json({ books });
  }));
  app.get('/api/products', route(async (_req,res) => {
    // Explicit projection prevents nested config, chapter, file and legacy secret leakage.
    const products = checked(await database().from('products').select('id,title,tagline,description,price,cover,"coverImageUrl",currency,active').eq('active',true).not('id','like','\\_\\_%')) as any[];
    res.json({ products: products.map(({ description, ...p }) => ({ ...p, description: { en: typeof description?.en === 'string' ? description.en : '', zh: typeof description?.zh === 'string' ? description.zh : '' } })) });
  }));
  app.get('/api/products/:id/content', route(async (req,res) => {
    await access(req, req.params.id);
    const p: any = checked(await database().from('products').select('id,chapters').eq('id',req.params.id).single());
    const chapters: any = checked(await database().from('book_chapters').select('chapters').eq('product_id',req.params.id).maybeSingle());
    res.json({ chapters: chapters?.chapters?.length ? chapters.chapters : p.chapters?.length ? p.chapters : defaultBookContent[p.id] || [] });
  }));
  app.get('/api/products/:id/download', route(async (req,res) => {
    await access(req,req.params.id);
    const asset: any = checked(await database().from('commerce_assets').select('object_path').eq('product_id',req.params.id).maybeSingle());
    if (!asset) throw new PublicError(409, 'FULFILLMENT_PENDING', 'Your purchase is recorded. The download is being prepared; contact support if this continues.');
    const bucket = checked(await database().storage.getBucket('paid-books'));
    if (!bucket || bucket.public) throw unavailable();
    const signed: any = checked(await database().storage.from('paid-books').createSignedUrl(asset.object_path, 60, { download: true }));
    res.json({ url: signed.signedUrl });
  }));
  mountPublishing(app, db, requireAdmin);
  app.use('/api', (_req,res) => res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Endpoint not found.' }));
  app.use((err: any,_req: any,res: any,_next: any) => {
    const e = err instanceof PublicError ? err : err.type === 'entity.too.large' ? new PublicError(413,'REQUEST_TOO_LARGE','Request is too large.') : err instanceof SyntaxError ? new PublicError(400,'INVALID_JSON','Invalid request.') : unavailable();
    if (e.status >= 500) console.error('API operation failed', { code: e.code, path: _req.path });
    res.status(e.status).json({ success: false, code: e.code, message: e.message });
  });
  return app;
}
export default createApp();
