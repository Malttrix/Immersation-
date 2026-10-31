import { editorialImageSource } from "./magazine-markdown";
import { backgroundIntensity } from "./editorial-settings";
export type Language = "en" | "zh";
export type Pair = Record<Language, string>;
export type StudioArticle = Record<string, any> & {
  id: string;
  slug: string;
  title: Pair;
  excerpt: Pair;
  content: Pair;
  studio_revision?: number;
};
const pair = (value: any, fallback = ""): Pair =>
  typeof value === "string"
    ? { en: value, zh: value }
    : { en: value?.en ?? fallback, zh: value?.zh ?? fallback };
export function hydrateArticle(raw: any): StudioArticle {
  const a = { ...raw, ...raw?.studio };
  delete a.studio;
  const extensions = { ...raw?._studioExtensions, ...raw?.studio };
  for (const key of ["version", ...studioMetadataKeys]) delete extensions[key];
  if (Object.keys(extensions).length) a._studioExtensions = extensions;
  return {
    ...a,
    articleFormat:
      a.articleFormat ||
      (["editorial-intelligence", "digital-guide", "framework"].includes(
        a.contentFormat,
      )
        ? a.contentFormat
        : "editorial-intelligence"),
    status:
      (
        {
          draft: "Draft",
          published: "Published",
          scheduled: "Scheduled",
        } as Record<string, string>
      )[String(a.status || "").toLowerCase()] ||
      a.status ||
      (a.published === false ? "Draft" : "Published"),
    id: a.id || a.slug || "",
    slug: a.slug || (a.status === "Draft" && a.slug === "" ? "" : a.id || ""),
    title: pair(a.title),
    excerpt: pair(a.excerpt || a.description),
    content: pair(a.content || a.description),
    tags: Array.isArray(a.tags) ? a.tags : [],
    category: pair(a.category),
    readTime: pair(a.readTime),
    date: pair(a.date),
    seo: { ...a.seo },
  };
}
export function normalizeArticle(raw: any): StudioArticle {
  const a = hydrateArticle(raw);
  for (const l of ["en", "zh"] as const) {
    const suffix = l === "en" ? "EN" : "ZH";
    if (a.seo[`title${suffix}`] === a.title[l]) delete a.seo[`title${suffix}`];
    if (a.seo[`desc${suffix}`] === a.excerpt[l]) delete a.seo[`desc${suffix}`];
  }
  return a;
}
export function createArticle(
  id = `art-${crypto.randomUUID()}`,
): StudioArticle {
  return normalizeArticle({
    id,
    slug: "",
    title: { en: "", zh: "" },
    excerpt: { en: "", zh: "" },
    content: { en: "", zh: "" },
    status: "Draft",
    pillar: "body",
    categoryValue: "",
    articleFormat: "editorial-intelligence",
    contentFormat: "markdown",
    author: "Immersation Editor",
    date: { en: "", zh: "" },
    tags: [],
    relatedArticles: [],
    presentation: "premium-magazine",
    editorial: { automaticBackground: false },
    studio_revision: 0,
  });
}
export function suggestSlug(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
export function articleStats(markdown: string, lang: Language) {
  const text = markdown
    .replace(/^:::.*$/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|~]/g, " ");
  const characters = (text.match(/[\p{Script=Han}]/gu) || []).length;
  const words = (
    text
      .replace(/[\p{Script=Han}]/gu, " ")
      .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []
  ).length;
  return {
    words,
    characters,
    minutes: Math.max(1, Math.ceil(words / 220 + characters / 400)),
    lang,
  };
}
export function readingTime(a: any, lang: Language) {
  if (!a.readTimeAutomatic && a.readTime?.[lang]) return a.readTime[lang];
  const { minutes } = articleStats(a.content?.[lang] || "", lang);
  return lang === "en" ? `${minutes} MIN READ` : `${minutes} 分钟阅读`;
}
export function articleSEO(a: any, lang: Language) {
  const suffix = lang === "en" ? "EN" : "ZH";
  return {
    title: a.seo?.[`title${suffix}`] || a.title?.[lang] || a.title?.en || "",
    description:
      a.seo?.[`desc${suffix}`] || a.excerpt?.[lang] || a.excerpt?.en || "",
  };
}
export function articleIsPublic(raw: any, now = Date.now()) {
  const a = hydrateArticle(raw),
    status = a.status || (a.published === false ? "Draft" : "Published");
  return (
    status === "Published" ||
    (status === "Scheduled" &&
      !!a.scheduledDate &&
      scheduleTimestamp(a.scheduledDate) <= now)
  );
}
export function scheduleTimestamp(value: string): number {
  return Date.parse(
    /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value.replace(" ", "T")}+08:00`,
  );
}
export function toScheduleInput(iso: string) {
  if (!iso) return "";
  const d = new Date(scheduleTimestamp(iso));
  if (!Number.isFinite(d.getTime())) return "";
  return new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 16);
}
export function fromScheduleInput(value: string) {
  if (!value) return "";
  const d = new Date(`${value}+08:00`);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}
export function validateArticle(
  a: StudioArticle,
  existing: StudioArticle[] = [],
): string[] {
  const errors: string[] = [];
  if (!a.slug || !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(a.slug))
    errors.push("Enter a valid URL slug using letters, numbers and hyphens.");
  if (existing.some((x) => x.id !== a.id && x.slug === a.slug))
    errors.push("This slug belongs to another article.");
  if (!a.title.en.trim() && !a.title.zh.trim())
    errors.push("Add an article title in at least one language.");
  if (a.status !== "Draft")
    for (const l of ["en", "zh"] as const)
      if (!a.title[l].trim() || !a.excerpt[l].trim() || !a.content[l].trim())
        errors.push(
          `Complete the ${l === "en" ? "English" : "Simplified Chinese"} title, description and body before publishing or scheduling.`,
        );
  if (!["Draft", "Published", "Scheduled"].includes(a.status))
    errors.push("Choose Draft, Published or Scheduled.");
  if (
    a.status === "Scheduled" &&
    (!Number.isFinite(Date.parse(a.scheduledDate)) ||
      Date.parse(a.scheduledDate) <= Date.now())
  )
    errors.push("Choose a future schedule time (Asia/Singapore, UTC+08:00).");
  for (const url of [
    a.cover,
    a.pinterestImageUrl,
    a.editorial?.backgroundImage,
  ])
    if (url && !editorialImageSource(url))
      errors.push("Use a valid http(s) or root-relative media URL.");
  if (a.canonicalLink && !/^https?:\/\/[^\s]+$/.test(a.canonicalLink))
    errors.push("Canonical URL must be an absolute http(s) URL.");
  return errors;
}
export const studioMetadataKeys = [
  "slug",
  "pillar",
  "categoryValue",
  "articleFormat",
  "contentFormat",
  "tags",
  "pinterestImageUrl",
  "adUrl",
  "status",
  "scheduledDate",
  "publicationDate",
  "featured",
  "relatedArticles",
  "seo",
  "author",
  "canonicalLink",
  "presentation",
  "editorial",
  "coverAlt",
  "coverCaption",
  "readTimeAutomatic",
  "readTime",
  "updatedAt",
] as const;
export function articlePayload(
  draft: StudioArticle,
): StudioArticle & { studio: Record<string, any> } {
  const a = normalizeArticle(draft);
  const studio: Record<string, any> = { ...a._studioExtensions, version: 2 };
  a.readTimeAutomatic = true;
  a.readTime = { en: readingTime(a, "en"), zh: readingTime(a, "zh") };
  // Presentation objects and unknown legacy properties are kept; only named new fields are normalized by their controls.
  for (const key of studioMetadataKeys)
    if (a[key] !== undefined) studio[key] = a[key];
  return { ...a, studio };
}
export function mediaChoices(articles: any[]) {
  const map = new Map<string, string>();
  for (const a of articles)
    for (const [url, label] of [
      [a.cover, "Cover"],
      [a.pinterestImageUrl, "Pinterest"],
      [a.editorial?.backgroundImage, "Background"],
    ])
      if (editorialImageSource(url))
        map.set(url, `${a.title?.en || a.slug} · ${label}`);
  return [...map].map(([url, label]) => ({ url, label }));
}
export function magazineDirective(
  layout: "image" | "background" | "split" | "quote",
  attrs: Record<string, any>,
  body: string,
) {
  const safe = { ...attrs };
  if (layout === "background")
    safe.intensity = backgroundIntensity(safe.intensity);
  return `\n\n:::magazine ${layout} ${JSON.stringify(safe)}\n\n${body}\n\n:::\n\n`;
}
export interface ArticleRepository {
  saveDestination?: "remote" | "browser-review";
  list(): Promise<StudioArticle[]>;
  save(article: StudioArticle, revision: number): Promise<StudioArticle>;
}
export function supabaseArticleRepository(client: any): ArticleRepository {
  return {
    async list() {
      if (!client)
        throw Error("Supabase is not configured. No remote save is available.");
      const { data, error } = await client.from("articles").select("*");
      if (error) throw Error(error.message);
      return (data || []).map(hydrateArticle);
    },
    async save(article, revision) {
      if (!client)
        throw Error(
          "Supabase is not configured. Your recovery copy remains in this browser.",
        );
      const { data, error } = await client.rpc("studio_save_article", {
        p_article: articlePayload(article),
        p_expected_revision: revision,
      });
      if (error)
        throw Error(
          error.code === "40001"
            ? "This article changed in another session. Export your draft, close, and reopen the latest version before saving."
            : `${error.message} No save was confirmed. Check that the Stage 3 migration is installed.`,
        );
      if (!data) throw Error("The server did not confirm a save.");
      return hydrateArticle(data);
    },
  };
}
export function editableSections(source: string) {
  const lines = source.split("\n");
  let offset = 0,
    fence = false,
    depth = 0;
  const result: {
    label: string;
    start: number;
    end: number;
    headerEnd?: number;
    attrs?: Record<string, any>;
    layout?: string;
  }[] = [];
  let current: (typeof result)[number] | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^:::magazine /.test(line)) {
      if (depth === 0) {
        if (current) {
          current.end = offset;
          current = undefined;
        }
        const m =
          /^:::magazine (background|image|split|quote)(?: (\{.*\}))?$/.exec(
            line,
          );
        if (m)
          try {
            result.push({
              label: `Existing ${m[1]} block · ${i + 1}`,
              start: offset,
              end: offset + line.length,
              headerEnd: offset + line.length,
              attrs: JSON.parse(m[2] || "{}"),
              layout: m[1],
            });
          } catch {}
      }
      depth++;
    } else if (!fence && line === ":::") depth = Math.max(0, depth - 1);
    else if (!fence && depth === 0 && /^## /.test(line)) {
      if (current) current.end = offset;
      current = { label: line.slice(3), start: offset, end: source.length };
      result.push(current);
    }
    offset += line.length + 1;
  }
  return result;
}
export function configureSection(
  source: string,
  section: ReturnType<typeof editableSections>[number],
  layout: "background" | "image" | "split" | "quote",
  attrs: Record<string, any>,
) {
  if (section.headerEnd !== undefined)
    return (
      source.slice(0, section.start) +
      `:::magazine ${layout} ${JSON.stringify({ ...section.attrs, ...attrs })}` +
      source.slice(section.end)
    );
  return (
    source.slice(0, section.start) +
    magazineDirective(layout, attrs, source.slice(section.start, section.end)) +
    source.slice(section.end)
  );
}
