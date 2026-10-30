import { createHash } from 'node:crypto';
import type { Request } from 'express';
export class PublicError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export const unavailable = () => new PublicError(503, 'PAYMENT_UNAVAILABLE', 'Secure checkout is temporarily unavailable.');
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function deploymentIsLive(env: NodeJS.ProcessEnv) {
  // Vercel previews use NODE_ENV=production; VERCEL_ENV takes precedence.
  return env.VERCEL_ENV ? env.VERCEL_ENV === 'production' : env.NODE_ENV === 'production';
}
export function paymentConfig(env: NodeJS.ProcessEnv) {
  const production = deploymentIsLive(env);
  const mode = production ? 'live' : 'test';
  const key = env.STRIPE_SECRET_KEY || '';
  if (!new RegExp(`^sk_${mode}_[A-Za-z0-9]{16,}$`).test(key) || !env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) throw unavailable();
  let url: URL;
  try { url = new URL(env.APP_URL || ''); } catch { throw unavailable(); }
  if (url.username || url.password || (url.protocol !== 'https:' && !(mode === 'test' && url.hostname === 'localhost' && url.protocol === 'http:'))) throw unavailable();
  return { key, mode, live: production, origin: url.origin, webhook: env.STRIPE_WEBHOOK_SECRET };
}
export function cartIdentifiers(body: any) {
  if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) throw new PublicError(400, 'INVALID_CART', 'Please check your cart.');
  const seen = new Set<string>();
  return body.items.map((item: any) => {
    if (!item || Object.keys(item).some(k => !['productId', 'quantity'].includes(k)) || typeof item.productId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(item.productId) || item.quantity !== 1 || seen.has(item.productId)) throw new PublicError(400, 'INVALID_PRODUCT', 'Please check your selected products.');
    seen.add(item.productId);
    return item.productId as string;
  });
}
export function guestHash(req: Request) {
  const value = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('purchase_owner='))?.slice(15);
  return value && /^[a-f0-9]{64}$/.test(value) ? hash(value) : null;
}
export function pricedProduct(row: any) {
  const amount = Math.round(Number(row.price) * 100);
  if (!row.active || !Number.isSafeInteger(amount) || amount <= 0 || amount > 99999999 || Math.abs(Number(row.price) * 100 - amount) > 0.0001 || row.currency !== 'usd') throw new PublicError(400, 'INVALID_PRODUCT', 'This product is unavailable for purchase.');
  return { product_id: row.id, title: String(row.title?.en || row.title?.zh || row.id).slice(0, 200), unit_amount: amount, quantity: 1 };
}
export function validateSession(session: any, order: any, lines: any[], live: boolean) {
  const expected = [...order.order_items].sort((a, b) => a.product_id.localeCompare(b.product_id));
  const actual = lines.map(l => ({ product_id: l.price?.product?.metadata?.product_id, unit_amount: l.price?.unit_amount, quantity: l.quantity })).sort((a,b) => String(a.product_id).localeCompare(String(b.product_id)));
  if (session.id !== order.stripe_session_id || order.livemode !== live || session.livemode !== live || session.mode !== 'payment' || session.client_reference_id !== order.id || session.metadata?.order_id !== order.id || session.amount_total !== order.amount || session.currency !== order.currency || actual.length !== expected.length || actual.some((a,i) => a.product_id !== expected[i].product_id || a.unit_amount !== expected[i].unit_amount || a.quantity !== expected[i].quantity) || lines.some(l => l.currency !== order.currency)) throw new PublicError(409, 'PAYMENT_MISMATCH', 'Payment requires support review.');
}
