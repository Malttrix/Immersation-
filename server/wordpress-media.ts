import sharp, { type Metadata } from 'sharp';
import { createHash } from 'node:crypto';
import { isWordPressStagingOrigin } from '../scripts/wordpress-staging-origin.mjs';
import { PRODUCTION_WORDPRESS_ORIGIN, validateMiraProduction } from '../scripts/mira-production-guard.mjs';

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_PIXELS = 32_000_000;
const MEDIA_USER_AGENT = 'Immersation-MIRA-Media-Diagnostic/1.0';
const STAGING_ORIGIN = 'https://staging-cms.immersation.com';
function mediaEndpoint(origin: string, id?: number): URL {
  if (origin !== STAGING_ORIGIN && origin !== PRODUCTION_WORDPRESS_ORIGIN) throw new MediaError('WORDPRESS_NOT_CONFIGURED');
  if (id !== undefined && (!Number.isSafeInteger(id) || id < 1)) throw new MediaError('WORDPRESS_NOT_CONFIGURED');
  const route = `/wp/v2/media${id === undefined ? '' : `/${id}`}`;
  const endpoint = new URL(origin === PRODUCTION_WORDPRESS_ORIGIN ? '/index.php' : `/wp-json${route}`, origin);
  if (origin === PRODUCTION_WORDPRESS_ORIGIN) endpoint.searchParams.set('rest_route', route);
  return endpoint;
}
export type PreparedImage = { bytes: Buffer; mime: string; width: number; height: number; sha256: string; extension: string };
export class MediaError extends Error {
  constructor(public code: string, public uncertain = false) { super(code); }
}

/** Decode and re-encode: do not trust supplied names, extensions, MIME or metadata. */
export async function prepareImage(bytes: Buffer, role: string): Promise<PreparedImage> {
  if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new MediaError('INVALID_SIZE');
  let metadata: Metadata;
  try { metadata = await sharp(bytes, { failOn: 'error', limitInputPixels: MAX_PIXELS, animated: false }).metadata(); }
  catch { throw new MediaError('INVALID_IMAGE'); }
  if (!metadata.format || !['jpeg','png','webp'].includes(metadata.format) || !metadata.width || !metadata.height || (metadata.pages || 1) !== 1 || metadata.width * metadata.height > MAX_PIXELS) throw new MediaError('INVALID_IMAGE');
  let normalized: Buffer;
  try {
    const pipeline = sharp(bytes, { failOn: 'error', limitInputPixels: MAX_PIXELS }).rotate();
    normalized = await (metadata.format === 'jpeg' ? pipeline.jpeg({quality: 88}) : metadata.format === 'png' ? pipeline.png() : pipeline.webp({quality: 88})).toBuffer();
  } catch { throw new MediaError('INVALID_IMAGE'); }
  if (normalized.length > MAX_IMAGE_BYTES) throw new MediaError('INVALID_SIZE');
  const output = await sharp(normalized).metadata();
  const width = output.width!, height = output.height!;
  if (width < 300 || height < 300 || ((role === 'cover' || role === 'background') && width <= height) || (role.startsWith('pinterest') && height <= width)) throw new MediaError('INVALID_DIMENSIONS');
  const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
  return { bytes: normalized, mime: `image/${metadata.format}`, width, height, extension, sha256: createHash('sha256').update(normalized).digest('hex') };
}
export type WordPressMedia = { id: number; url: string; mime: string; width: number; height: number };

/** Verify an existing completed staging upload; never accept a caller-provided URL. */
export async function verifyStagingMedia(asset: WordPressMedia, role: string, operationId: string, expectedHash: string, transport: typeof fetch = fetch, origin = 'https://staging-cms.immersation.com', referer = 'https://immersation-staging.vercel.app/', metadataAuthorization?: string): Promise<void> {
  if (!asset || !Number.isSafeInteger(asset.id) || asset.id < 1 || !/^(cover|background|pinterest[12]|instagram[1-9])$/.test(role) || !/^[a-f0-9]{32}$/.test(operationId) || !/^[a-f0-9]{64}$/.test(expectedHash)) throw new MediaError('MEDIA_VERIFICATION_FAILED');
  let saved: URL;
  try { saved = new URL(asset.url); } catch { throw new MediaError('MEDIA_VERIFICATION_FAILED'); }
  const filename = `mira-${role}-${operationId}`;
  if (saved.origin !== origin || saved.username || saved.password || saved.search || saved.hash || !new RegExp(`^/wp-content/uploads/\\d{4}/\\d{2}/${filename}\\.(jpg|png|webp)$`).test(saved.pathname)) throw new MediaError('MEDIA_VERIFICATION_FAILED');
  try {
    const metadata = await transport(mediaEndpoint(origin,asset.id), { redirect:'error', signal:AbortSignal.timeout(10000), headers:{accept:'application/json','User-Agent':MEDIA_USER_AGENT, ...(metadataAuthorization ? {authorization:metadataAuthorization} : {})} });
    if (metadata.status !== 200 || !metadata.headers.get('content-type')?.toLowerCase().startsWith('application/json') || Number(metadata.headers.get('content-length') || 0) > 262144 || !metadata.body) throw Error();
    const readLimited = async (response: Response, limit: number) => {
      const reader = response.body!.getReader(); const chunks: Uint8Array[] = []; let length = 0;
      for (;;) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > limit) { await reader.cancel(); throw Error(); } chunks.push(part.value); }
      return Buffer.concat(chunks);
    };
    const record = JSON.parse((await readLimited(metadata, 262144)).toString('utf8'));
    if (record.id !== asset.id || record.source_url !== saved.href || record.mime_type !== asset.mime || record.media_details?.width !== asset.width || record.media_details?.height !== asset.height) throw Error();
    const response = await transport(saved.href, { redirect:'error', signal:AbortSignal.timeout(15000), headers:{'User-Agent':'Mozilla/5.0 MIRA-Editorial-Media','Referer':referer} });
    const mime = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (response.status !== 200 || !response.body || mime !== asset.mime || !['image/png','image/jpeg','image/webp'].includes(mime || '') || Number(response.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) throw Error();
    const bytes = await readLimited(response, MAX_IMAGE_BYTES);
    const valid = mime === 'image/png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : mime === 'image/jpeg' ? bytes.subarray(0,3).equals(Buffer.from([255,216,255])) : bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
    if (!valid || createHash('sha256').update(bytes).digest('hex') !== expectedHash) throw Error();
    const info = await sharp(bytes, {failOn:'error',limitInputPixels:MAX_PIXELS}).metadata();
    if (`image/${info.format}` !== mime || info.width !== asset.width || info.height !== asset.height || (info.pages || 1) !== 1) throw Error();
  } catch { throw new MediaError('MEDIA_VERIFICATION_FAILED'); }
}
export function createWordPressAdapter(env: NodeJS.ProcessEnv, transport: typeof fetch = fetch) {
  let base: URL;
  try { base = new URL(env.WORDPRESS_MEDIA_BASE_URL || ''); } catch { throw new MediaError('WORDPRESS_NOT_CONFIGURED'); }
  const staging = env.VERCEL_PROJECT_ID !== 'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu' && isWordPressStagingOrigin(env.WORDPRESS_MEDIA_BASE_URL);
  const production = !!PRODUCTION_WORDPRESS_ORIGIN && validateMiraProduction(env).length === 0 && base.origin === PRODUCTION_WORDPRESS_ORIGIN;
  if ((!staging && !production) || !env.WORDPRESS_MEDIA_USERNAME || !env.WORDPRESS_MEDIA_APP_PASSWORD) throw new MediaError('WORDPRESS_NOT_CONFIGURED');
  const endpoint = mediaEndpoint(base.origin);
  const authorization = `Basic ${Buffer.from(`${env.WORDPRESS_MEDIA_USERNAME}:${env.WORDPRESS_MEDIA_APP_PASSWORD}`).toString('base64')}`;
  return {
    async upload(image: PreparedImage, role: string, operationId = image.sha256.slice(0,32)): Promise<WordPressMedia> {
      const filename = `mira-${role}-${operationId}.${image.extension}`;
      let response: Response;
      try {
        response = await transport(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000), headers: { authorization, 'User-Agent':MEDIA_USER_AGENT, 'content-type': image.mime, 'content-disposition': `attachment; filename="${filename}"` }, body: new Uint8Array(image.bytes) });
      } catch { throw new MediaError('WORDPRESS_RESULT_UNKNOWN', true); }
      if (!response.ok) throw new MediaError(response.status === 401 || response.status === 403 ? 'WORDPRESS_UNAUTHORIZED' : response.status === 429 ? 'WORDPRESS_RATE_LIMIT' : 'WORDPRESS_RESULT_UNKNOWN', true);
      let body: any;
      try { body = await response.json(); } catch { throw new MediaError('WORDPRESS_RESULT_UNKNOWN', true); }
      let url: URL;
      try { url = new URL(body.source_url); } catch { throw new MediaError('WORDPRESS_RESULT_UNKNOWN', true); }
      if (!Number.isSafeInteger(body.id) || body.id < 1 || url.protocol !== 'https:' || url.origin !== base.origin || url.username || url.password || body.mime_type !== image.mime || body.media_details?.width !== image.width || body.media_details?.height !== image.height) throw new MediaError('WORDPRESS_RESULT_UNKNOWN', true);
      return { id: body.id, url: url.href, mime: body.mime_type, width: image.width, height: image.height };
    },
    async checkNoCandidates(operationId: string): Promise<void> {
      if (!/^[a-f0-9]{32}$/.test(operationId)) throw new MediaError('INVALID_OPERATION');
      const query = mediaEndpoint(base.origin);
      query.searchParams.set('search',operationId); query.searchParams.set('per_page','100'); query.searchParams.set('context','edit');
      let response: Response;
      try { response = await transport(query,{headers:{authorization,'User-Agent':MEDIA_USER_AGENT},redirect:'error',signal:AbortSignal.timeout(10000)}); }
      catch { throw new MediaError('WORDPRESS_UNAVAILABLE'); }
      if (!response.ok) throw new MediaError('WORDPRESS_UNAVAILABLE');
      const total = response.headers.get('x-wp-total');
      let items: unknown; try { items=await response.json(); } catch { throw new MediaError('WORDPRESS_UNAVAILABLE'); }
      if (total === null || !/^\d+$/.test(total) || !Array.isArray(items)) throw new MediaError('WORDPRESS_UNAVAILABLE');
      if (Number(total)!==0 || items.length!==0) throw new MediaError('CANDIDATES_EXIST');
      // A search alone cannot prove absence: an administrator must independently
      // audit the complete media library and record their evidence and decision.
    },
    async verifyCandidate(id: number, role: string, operationId: string, expectedHash: string): Promise<WordPressMedia> {
      if (!Number.isSafeInteger(id) || id < 1 || !/^[a-f0-9]{32}$/.test(operationId) || !/^[a-f0-9]{64}$/.test(expectedHash)) throw new MediaError('CANDIDATE_MISMATCH');
      let response: Response;
      try { response = await transport(mediaEndpoint(base.origin,id), { headers: { authorization, 'User-Agent':MEDIA_USER_AGENT }, redirect: 'error', signal: AbortSignal.timeout(10000) }); }
      catch { throw new MediaError('WORDPRESS_UNAVAILABLE'); }
      if (!response.ok) throw new MediaError('WORDPRESS_UNAVAILABLE');
      let data: any; try { data=await response.json(); } catch { throw new MediaError('CANDIDATE_MISMATCH'); }
      let url: URL; try { url=new URL(data.source_url); } catch { throw new MediaError('CANDIDATE_MISMATCH'); }
      const fileName = url.pathname.split('/').pop() || '';
      if (data.id !== id || url.origin !== base.origin || url.protocol !== 'https:' || url.username || url.password || !new RegExp(`^mira-${role}-${operationId}\\.(jpg|png|webp)$`).test(fileName)) throw new MediaError('CANDIDATE_MISMATCH');
      let download: Response;
      try { download=await transport(url, { redirect:'error', signal: AbortSignal.timeout(10000) }); } catch { throw new MediaError('WORDPRESS_UNAVAILABLE'); }
      if (!download.ok || Number(download.headers.get('content-length') || 0) > MAX_IMAGE_BYTES || !download.body) throw new MediaError('CANDIDATE_MISMATCH');
      const reader=download.body.getReader(), chunks: Uint8Array[]=[]; let length=0;
      for (;;) { const part=await reader.read(); if (part.done) break; length+=part.value.length; if (length>MAX_IMAGE_BYTES) { await reader.cancel(); throw new MediaError('CANDIDATE_MISMATCH'); } chunks.push(part.value); }
      const bytes=Buffer.concat(chunks);
      if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) throw new MediaError('CANDIDATE_MISMATCH');
      let meta: Metadata; try { meta=await sharp(bytes,{failOn:'error',limitInputPixels:MAX_PIXELS}).metadata(); } catch { throw new MediaError('CANDIDATE_MISMATCH'); }
      const mime = meta.format === 'jpeg' ? 'image/jpeg' : `image/${meta.format}`;
      if (!meta.width || !meta.height || data.mime_type !== mime || data.media_details?.width !== meta.width || data.media_details?.height !== meta.height) throw new MediaError('CANDIDATE_MISMATCH');
      return {id,url:url.href,mime,width:meta.width,height:meta.height};
    }
  };
}
