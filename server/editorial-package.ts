/** Local contract validation foundation; this module does not create an API. */
export type Bilingual = { en: string; zh: string };
export type EditorialPackage = {
  submissionId: string;
  slug: string;
  pillar: string;
  category: Bilingual;
  title: Bilingual;
  excerpt: Bilingual;
  content: Bilingual;
  references: { title: string; url: string }[];
  tags?: string[];
  seo?: { titleEN?: string; titleZH?: string; descEN?: string; descZH?: string };
  internalLinks?: string[];
  editorialNotes?: string;
  qa?: { factual?: string; citations?: string; bilingual?: string; images?: string; seo?: string; warnings?: string[]; generation?: string };
  social?: { pinterest?: { role: string; title: string; description: string; keywords: string[] }[]; instagram?: { roles: string[]; caption: string; hashtags: string[] } };
  alt?: Record<string, Bilingual>;
};

const KEYS = new Set(['submissionId', 'slug', 'pillar', 'category', 'title', 'excerpt', 'content', 'references', 'tags', 'seo', 'internalLinks', 'editorialNotes', 'qa', 'social', 'alt']);
const PAIR_KEYS = new Set(['en', 'zh']);
const REF_KEYS = new Set(['title', 'url']);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const only = (v: Record<string, unknown>, keys: Set<string>) => Object.keys(v).every(k => keys.has(k));
const plain = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
const pair = (v: unknown, max: number) => object(v) && only(v, PAIR_KEYS) && plain(v.en, max) && plain(v.zh, max);

// The renderer uses sanitized Markdown. Reject raw HTML and active link schemes at
// ingestion too; this is deliberately conservative and is not an HTML sanitizer.
function safeMarkdown(value: string): boolean {
  return !/<\/?[a-zA-Z!][^>]*>/.test(value) && !/(?:javascript|vbscript|data)\s*:/i.test(value);
}
function safeReferenceUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password;
  } catch { return false; }
}
export function validateEditorialPackage(value: unknown): { ok: true; value: EditorialPackage } | { ok: false; errors: string[] } {
  if (!object(value)) return { ok: false, errors: ['Package must be an object.'] };
  const errors: string[] = [];
  if (!only(value, KEYS)) errors.push('Package contains unsupported fields.');
  if (!plain(value.submissionId, 128) || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(String(value.submissionId))) errors.push('Invalid submissionId.');
  if (!plain(value.slug, 160) || !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(String(value.slug))) errors.push('Invalid slug.');
  if (!['body','tool','capital'].includes(String(value.pillar))) errors.push('Invalid pillar.');
  for (const [field, max] of [['category', 200], ['title', 300], ['excerpt', 2000], ['content', 250000]] as const) {
    if (!pair(value[field], max)) errors.push(`Invalid bilingual ${field}.`);
  }
  if (pair(value.content, 250000)) {
    const content = value.content as Bilingual;
    if (!safeMarkdown(content.en) || !safeMarkdown(content.zh)) errors.push('Content contains unsupported HTML or active URL schemes.');
  }
  if (!Array.isArray(value.references) || value.references.length > 50 || value.references.some(r => !object(r) || !only(r, REF_KEYS) || !plain(r.title, 300) || !safeReferenceUrl(r.url))) errors.push('Invalid references.');
  const list = (v: unknown, maxItems: number, maxLength: number) => Array.isArray(v) && v.length <= maxItems && v.every(x => plain(x, maxLength));
  const role = (v: unknown) => typeof v === 'string' && /^(cover|background|pinterest[12]|instagram[1-9])$/.test(v);
  if (value.tags !== undefined && !list(value.tags, 30, 80)) errors.push('Invalid tags.');
  if (value.internalLinks !== undefined && (!list(value.internalLinks, 30, 160) || (value.internalLinks as string[]).some(x => !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(x)))) errors.push('Invalid internal links.');
  if (value.editorialNotes !== undefined && !plain(value.editorialNotes, 10000)) errors.push('Invalid editorial notes.');
  if (value.seo !== undefined && (!object(value.seo) || !only(value.seo, new Set(['titleEN','titleZH','descEN','descZH'])) || Object.values(value.seo).some(x => !plain(x, 500)))) errors.push('Invalid SEO overrides.');
  if (value.qa !== undefined && (!object(value.qa) || !only(value.qa,new Set(['factual','citations','bilingual','images','seo','warnings','generation'])) || Object.entries(value.qa).some(([k,v]) => k === 'warnings' ? !list(v, 40, 500) : !plain(v, 3000)))) errors.push('Invalid QA metadata.');
  if (value.alt !== undefined && (!object(value.alt) || Object.keys(value.alt).length > 13 || Object.entries(value.alt).some(([k,v]) => !role(k) || !pair(v, 500)))) errors.push('Invalid image alternative text.');
  if (value.social !== undefined) {
    const social = value.social;
    if (!object(social) || !only(social,new Set(['pinterest','instagram']))) errors.push('Invalid social metadata.');
    else {
      if (social.pinterest !== undefined && (!Array.isArray(social.pinterest) || social.pinterest.length > 2 || social.pinterest.some(p => !object(p) || !only(p,new Set(['role','title','description','keywords'])) || !['pinterest1','pinterest2'].includes(String(p.role)) || !plain(p.title, 200) || !plain(p.description, 1000) || !list(p.keywords, 30, 80)))) errors.push('Invalid Pinterest metadata.');
      const ig = social.instagram;
      if (ig !== undefined && (!object(ig) || !only(ig,new Set(['roles','caption','hashtags'])) || !Array.isArray(ig.roles) || ig.roles.length > 9 || ig.roles.some(r => typeof r !== 'string' || !/^instagram[1-9]$/.test(r)) || !plain(ig.caption, 2200) || !list(ig.hashtags,30,80))) errors.push('Invalid Instagram metadata.');
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: value as unknown as EditorialPackage };
}
