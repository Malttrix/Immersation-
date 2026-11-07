import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { validateEditorialPackage } from './editorial-package.js';
import { createWordPressAdapter, prepareImage, MAX_IMAGE_BYTES, MediaError, verifyStagingMedia } from './wordpress-media.js';

const digest = (s: string) => createHash('sha256').update(s).digest();
export function agentAuthorized(header: string | undefined, env: NodeJS.ProcessEnv): boolean {
  const supplied = header?.match(/^Bearer ([A-Za-z0-9_-]{43,128})$/)?.[1] || '';
  // Two slots allow rotation; deleting a slot revokes that credential.
  const secrets = [env.MIRA_AGENT_TOKEN, env.MIRA_AGENT_TOKEN_PREVIOUS].filter((s): s is string => !!s && /^[A-Za-z0-9_-]{43,128}$/.test(s));
  const candidate = digest(supplied);
  let match = false;
  for (const secret of secrets) match = timingSafeEqual(candidate, digest(secret)) || match;
  return !!supplied && match;
}
export function mountEditorialAgent(app: Express, db: SupabaseClient | null, env: NodeJS.ProcessEnv, mediaFetch: typeof fetch = fetch) {
  const root = '/api/editorial/agent';
  let reviewUrl = 'https://immersation.com/admin';
  try { const origin = new URL(env.APP_URL || 'https://immersation.com'); if (origin.protocol === 'https:' && !origin.username && !origin.password) reviewUrl = `${origin.origin}/admin`; } catch { /* use the canonical review URL */ }
  app.use(root, (req: Request, res: Response, next: NextFunction) => {
    res.set('X-Correlation-Id', randomUUID());
    if (env.VERCEL && req.headers['x-forwarded-proto'] !== 'https') return res.status(400).json({ code: 'HTTPS_REQUIRED' });
    if (!agentAuthorized(req.headers.authorization, env)) return res.status(401).json({ code: 'UNAUTHORIZED' });
    if (!db) return res.status(503).json({ code: 'UNAVAILABLE' });
    next();
  });
  app.use(root, express.json({ limit: '600kb', strict: true }));
  app.use(root, async (_req, res, next) => {
    try {
      const limit = await db!.rpc('mira_rate_limit', { p_bucket: 'mira' });
      if (limit.error) return res.status(503).json({ code: 'UNAVAILABLE' });
      if (!limit.data) return res.status(429).json({ code: 'RATE_LIMITED' });
      next();
    } catch { res.status(503).json({ code: 'UNAVAILABLE' }); }
  });
  app.post(`${root}/drafts/:id/assets/:role`, express.raw({ type: 'application/octet-stream', limit: MAX_IMAGE_BYTES }), async (req, res) => {
    const id = req.params.id, role = req.params.role, key = req.get('idempotency-key') || '';
    if (!req.is('application/octet-stream')) return res.status(415).json({ code: 'CONTENT_TYPE' });
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id) || !/^(cover|background|pinterest[12]|instagram[1-9])$/.test(role) || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return res.status(400).json({ code: 'INVALID_REQUEST' });
    let image: Awaited<ReturnType<typeof prepareImage>>, adapter: ReturnType<typeof createWordPressAdapter>;
    try { image = await prepareImage(req.body, role); adapter = createWordPressAdapter(env, mediaFetch); }
    catch (err) { return res.status(err instanceof MediaError && err.code === 'WORDPRESS_NOT_CONFIGURED' ? 503 : 400).json({ code: err instanceof MediaError ? err.code : 'INVALID_IMAGE' }); }
    try {
      const reservation = await db!.rpc('mira_media_start', { p_id: id, p_key: key, p_role: role, p_hash: image.sha256, p_original_hash: createHash('sha256').update(req.body).digest('hex'), p_filename: (req.get('x-original-filename') || '').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,200) });
      if (reservation.error) return res.status(reservation.error.code === '23505' || reservation.error.code === '42501' ? 409 : 503).json({ code: 'MEDIA_RESERVATION_FAILED' });
      if (reservation.data?.state === 'completed') return res.json({ asset: reservation.data.result, replayed: true });
      if (reservation.data?.state !== 'new') return res.status(409).json({ code: 'MEDIA_RECONCILIATION_REQUIRED', retrySafe: false });
      let asset;
      try { asset = await adapter.upload(image, role, createHash('md5').update(key).digest('hex'));  }
      catch (err) { await db!.rpc('mira_media_uncertain', { p_key: key }); return res.status(502).json({ code: err instanceof MediaError ? err.code : 'WORDPRESS_RESULT_UNKNOWN', retrySafe: false }); }
      const completed = await db!.rpc('mira_media_complete', { p_key: key, p_result: asset });
      if (completed.error || !completed.data) return res.status(503).json({ code: 'MEDIA_RECONCILIATION_REQUIRED', retrySafe: false });
      return res.status(201).json({ asset: completed.data, replayed: false });
    } catch { return res.status(503).json({ code: 'MEDIA_RECONCILIATION_REQUIRED', retrySafe: false }); }
  });
  app.get(`${root}/drafts/:id/assets/:role/status`, async (req,res) => {
    const key=req.get('idempotency-key') || '';
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(req.params.id) || !/^(cover|background|pinterest[12]|instagram[1-9])$/.test(req.params.role) || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return res.status(400).json({code:'INVALID_REQUEST'});
    try { const result=await db!.rpc('mira_media_status',{p_id:req.params.id,p_role:req.params.role,p_key:key});
      if (result.error) return res.status(503).json({code:'UNAVAILABLE'});
      if (!result.data) return res.status(404).json({code:'NOT_FOUND'});
      return res.json(result.data);
    } catch { return res.status(503).json({code:'UNAVAILABLE'}); }
  });
  app.get(`${root}/drafts/:id/assets/:role/verify`, async (req,res) => {
    const key = req.get('idempotency-key') || '', id = req.params.id, role = req.params.role;
    if (env.VERCEL !== '1' || env.VERCEL_PROJECT_NAME !== 'immersation-staging' || env.VERCEL_PROJECT_ID !== 'prj_Ip7SJfJuqk1B7OfTkm0Jl1ceBwk0' || env.MIRA_STAGING_SUPABASE_REF !== 'dibfotxdupgdhbmhmrnl' || env.SUPABASE_URL !== 'https://dibfotxdupgdhbmhmrnl.supabase.co' || env.APP_URL?.replace(/\/$/,'') !== 'https://immersation-staging.vercel.app' || env.WORDPRESS_MEDIA_BASE_URL?.replace(/\/$/,'') !== 'https://staging-cms.immersation.com') return res.status(404).json({code:'NOT_FOUND'});
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id) || !/^(cover|background|pinterest[12]|instagram[1-9])$/.test(role) || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return res.status(400).json({code:'INVALID_REQUEST'});
    try {
      const result = await db!.from('mira_media_uploads').select('state,result,sha256,operation_id').eq('submission_id',id).eq('role',role).eq('request_key',key).maybeSingle();
      if (result.error) return res.status(503).json({code:'UNAVAILABLE'});
      if (!result.data || result.data.state !== 'completed') return res.status(404).json({code:'NOT_FOUND'});
      const row = result.data;
      await verifyStagingMedia(row.result, role, row.operation_id, row.sha256, mediaFetch);
      return res.json({verified:true, id:row.result.id, role});
    } catch { return res.status(502).json({code:'MEDIA_VERIFICATION_FAILED'}); }
  });
  app.post(`${root}/drafts`, async (req, res) => {
    if (!req.is('application/json')) return res.status(415).json({ code: 'CONTENT_TYPE' });
    const key = req.get('idempotency-key') || '';
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(key)) return res.status(400).json({ code: 'INVALID_IDEMPOTENCY_KEY' });
    const checked = validateEditorialPackage(req.body);
    if (checked.ok === false) return res.status(400).json({ code: 'VALIDATION_FAILED', errors: checked.errors });
    const fingerprint = digest(JSON.stringify(checked.value)).toString('hex');
    try {
      const result = await db!.rpc('mira_submit', { p_id: checked.value.submissionId, p_key: key, p_fingerprint: fingerprint, p_package: checked.value });
      if (result.error) {
        if (['23505', '42501', '40001'].includes(result.error.code)) return res.status(409).json({ code: 'CONFLICT' });
        return res.status(503).json({ code: 'UNAVAILABLE' });
      }
      const status = await db!.rpc('mira_status', { p_id: checked.value.submissionId });
      if (status.error || !status.data) return res.status(503).json({ code: 'UNAVAILABLE', retrySafe: true });
      return res.status(result.data?.replayed ? 200 : 201).json({ ...status.data, replayed: !!result.data?.replayed, validation: 'passed', reviewUrl });
    } catch { return res.status(503).json({ code: 'UNAVAILABLE', retrySafe: true }); }
  });
  app.post(`${root}/drafts/:id/finalize`, async (req, res) => {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(req.params.id)) return res.status(400).json({ code: 'INVALID_REQUEST' });
    try {
      const result = await db!.rpc('mira_finalize', { p_id: req.params.id });
      if (result.error || !result.data) return res.status(409).json({ code: 'FINALIZATION_FAILED' });
      return res.json({ submissionId: req.params.id, ...result.data, reviewUrl });
    } catch { return res.status(503).json({ code: 'UNAVAILABLE' }); }
  });
  app.get(`${root}/drafts/:id`, async (req, res) => {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(req.params.id)) return res.status(404).json({ code: 'NOT_FOUND' });
    try {
      const result = await db!.rpc('mira_status', { p_id: req.params.id });
      if (result.error) return res.status(503).json({ code: 'UNAVAILABLE' });
      if (!result.data) return res.status(404).json({ code: 'NOT_FOUND' });
      return res.json({ ...result.data, reviewUrl });
    } catch { return res.status(503).json({ code: 'UNAVAILABLE' }); }
  });
}
