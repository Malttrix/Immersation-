import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PGlite } from "@electric-sql/pglite";
import {
  createArticle,
  normalizeArticle,
  hydrateArticle,
  articlePayload,
  articleSEO,
  suggestSlug,
  articleStats,
  readingTime,
  validateArticle,
  articleIsPublic,
  fromScheduleInput,
  toScheduleInput,
  mediaChoices,
  editableSections,
  configureSection,
  supabaseArticleRepository,
} from "../src/lib/article-studio";
import { ArticleEssentials } from "../src/components/content-studio/ArticleEssentials";
import { AdvancedSEO } from "../src/components/content-studio/AdvancedSEO";
import { ArticlePage } from "../src/components/ArticlesView";
const existing = () =>
  normalizeArticle({
    id: "existing",
    slug: "existing-url",
    title: { en: "Original title", zh: "原始标题" },
    excerpt: { en: "Original description", zh: "原始简介" },
    content: {
      en: "## Original section\n\nOriginal **body**.\n\nSecond paragraph.",
      zh: "## 原始章节\n\n原始内容。",
    },
    seo: {
      titleEN: "Custom search title",
      titleZH: "独立搜索标题",
      descEN: "Custom description",
    },
    presentation: { mode: "visual-feature", extra: "kept" },
    editorial: { backgroundIntensity: 0.24, custom: "kept" },
    pinterestImageUrl: "https://example.com/pin.jpg",
    unknownLegacy: { keep: true },
    readTime: { en: "8 MIN READ", zh: "8 分钟阅读" },
  });

test("new articles start as drafts, with shared identity and independent language fields", () => {
  const a = createArticle("new");
  assert.equal(a.status, "Draft");
  assert.equal(a.slug, "");
  assert.equal(a.contentFormat, "markdown");
  assert.equal(a.editorial.automaticBackground, false);
  a.title.en = "English";
  assert.equal(a.title.zh, "");
});
test("existing article normalization and save payload preserve identity, content, custom SEO, media and unknown data", () => {
  const a = existing(),
    b = articlePayload(a);
  assert.equal(b.slug, "existing-url");
  assert.deepEqual(b.content, a.content);
  assert.deepEqual(b.unknownLegacy, { keep: true });
  assert.equal(b.seo.titleZH, "独立搜索标题");
  assert.equal(b.studio.pinterestImageUrl, a.pinterestImageUrl);
  assert.deepEqual(b.studio.presentation, a.presentation);
  assert.equal(b.studio.editorial.custom, "kept");
});
test("identical legacy SEO collapses while different overrides remain", () => {
  const a = existing();
  a.seo = { ...a.seo, titleEN: a.title.en, descZH: a.excerpt.zh };
  const n = normalizeArticle(a);
  assert.equal(n.seo.titleEN, undefined);
  assert.equal(n.seo.descZH, undefined);
  assert.equal(n.seo.titleZH, "独立搜索标题");
  assert.equal(articleSEO(n, "en").title, n.title.en);
  assert.equal(articleSEO(n, "zh").title, "独立搜索标题");
});
test("default SEO is language specific, description uses the unified primary field", () => {
  const a = createArticle("a");
  a.title = { en: "English", zh: "中文" };
  a.excerpt = { en: "Description", zh: "简介" };
  assert.deepEqual(articleSEO(a, "zh"), { title: "中文", description: "简介" });
  assert.deepEqual(articleSEO(a, "en"), {
    title: "English",
    description: "Description",
  });
});
test("slug suggestions handle punctuation, apostrophes, Chinese and whitespace", () => {
  assert.equal(
    suggestSlug("  Reader’s Calm: A Practice! "),
    "readers-calm-a-practice",
  );
  assert.equal(suggestSlug("正念 练习"), "正念-练习");
  assert.equal(existing().slug, "existing-url");
});
test("reading time counts body words and Chinese characters, excluding directive and image URLs", () => {
  assert.equal(articleStats("word ".repeat(441), "en").minutes, 3);
  assert.equal(articleStats("心".repeat(801), "zh").minutes, 3);
  assert.equal(
    articleStats("![visual](https://example.com/" + "a".repeat(800) + ")", "en")
      .words,
    0,
  );
  assert.equal(
    articleStats(
      ':::magazine background {"src":"https://example.com/img.jpg"}\n\nBody\n\n:::',
      "en",
    ).words,
    1,
  );
  assert.equal(readingTime(existing(), "en"), "8 MIN READ");
  assert.notEqual(
    readingTime({ ...existing(), readTimeAutomatic: true }, "en"),
    "8 MIN READ",
  );
});
test("draft validation permits incomplete second language, publishing requires both", () => {
  const a = createArticle("a");
  a.slug = "valid";
  a.title.en = "Title";
  assert.deepEqual(validateArticle(a), []);
  a.status = "Published";
  assert.ok(validateArticle(a).some((e) => e.includes("Simplified Chinese")));
  assert.ok(validateArticle(a).some((e) => e.includes("English")));
});
test("schedule conversion uses explicit Singapore timezone and due visibility", () => {
  assert.equal(
    fromScheduleInput("2030-01-02T10:30"),
    "2030-01-02T02:30:00.000Z",
  );
  assert.equal(
    fromScheduleInput("2030-01-02T10:30:00.000"),
    "2030-01-02T02:30:00.000Z",
  );
  assert.equal(toScheduleInput("2030-01-02T02:30:00.000Z"), "2030-01-02T10:30");
  const a = {
    ...existing(),
    status: "Scheduled",
    scheduledDate: "2030-01-02T02:30:00Z",
  };
  assert.equal(articleIsPublic(a, Date.parse("2030-01-02T02:29Z")), false);
  assert.equal(articleIsPublic(a, Date.parse("2030-01-02T02:30Z")), true);
  assert.equal(articleIsPublic({ ...a, status: "Draft" }), false);
  assert.equal(articleIsPublic({ ...a, scheduledDate: "bad" }), false);
});
test("media selection only returns real supported URLs and preserves Pinterest", () => {
  assert.equal(
    mediaChoices([existing()])[0].url,
    "https://example.com/pin.jpg",
  );
  assert.equal(mediaChoices([{ cover: "javascript:alert(1)" }]).length, 0);
  assert.ok(validateArticle({ ...existing(), cover: "data:evil" }).length);
});
test("section layouts preserve wording and edit an existing directive without nesting", () => {
  const a = existing(),
    source = a.content.en,
    s = editableSections(source)[0];
  const configured = configureSection(source, s, "background", {
    src: "https://example.com/a.jpg",
    intensity: 0.2,
    overlay: 0.3,
    mobileFallback: "plain",
  });
  assert.ok(configured.includes(source));
  const block = editableSections(configured)[0];
  assert.equal(block.layout, "background");
  const edited = configureSection(configured, block, "background", {
    intensity: 0.28,
  });
  assert.equal((edited.match(/:::magazine/g) || []).length, 1);
  assert.ok(edited.includes("Original **body**."));
  assert.ok(edited.includes('"overlay":0.3'));
});
test("fenced Markdown headings and directives are not editable sections", () => {
  assert.deepEqual(
    editableSections("```md\n## Code\n:::magazine quote\n```"),
    [],
  );
});
test("Supabase synchronization failure rejects and never returns a fabricated success", async () => {
  const repo = supabaseArticleRepository({
    rpc: async () => ({ error: { code: "40001", message: "conflict" } }),
  });
  await assert.rejects(repo.save(existing(), 1), /changed in another session/);
  await assert.rejects(
    supabaseArticleRepository(null).save(existing(), 0),
    /not configured/,
  );
});
test("successful adapter sends one article with revision and hydrates metadata", async () => {
  let args: any;
  const repo = supabaseArticleRepository({
    rpc: async (name: any, a: any) => {
      assert.equal(name, "studio_save_article");
      args = a;
      return { data: { ...a.p_article, studio_revision: 2 } };
    },
  });
  const saved = await repo.save(existing(), 1);
  assert.equal(args.p_expected_revision, 1);
  assert.equal(saved.studio_revision, 2);
  assert.equal(saved.pinterestImageUrl, existing().pinterestImageUrl);
  assert.equal(saved.studio, undefined);
});
test("essentials contain primary fields without duplicate SEO inputs; advanced overrides start collapsed", () => {
  const a = existing();
  const essentials = renderToStaticMarkup(
    React.createElement(ArticleEssentials, {
      article: a,
      change: () => {},
      isNew: false,
    }),
  );
  assert.match(essentials, /Article title/);
  assert.doesNotMatch(essentials, /SEO title override/);
  const advanced = renderToStaticMarkup(
    React.createElement(AdvancedSEO, {
      article: a,
      lang: "zh",
      change: () => {},
    }),
  );
  assert.match(advanced, /独立搜索标题/);
  assert.match(advanced, /<details>/);
  assert.doesNotMatch(advanced, /<details open/);
});
test("shared article preview renders the actual magazine mode and reading tools in English and Chinese", () => {
  for (const lang of ["en", "zh"] as const) {
    const a = existing();
    a.cover = "https://example.com/a.jpg";
    a.date = { en: "JAN 2026", zh: "2026年1月" };
    a.tags = [];
    const html = renderToStaticMarkup(
      React.createElement(ArticlePage, {
        article: a as any,
        lang,
        onBack: () => {},
        preview: true,
      }),
    );
    assert.match(html, /data-presentation="visual-feature"/);
    assert.match(html, /journal-pinterest-widget/);
    assert.match(html, /role="progressbar"/);
    assert.ok(html.includes(a.title[lang]));
    assert.doesNotMatch(html, /name="comment"/);
  }
});

test("additive migration saves, preserves unrelated columns and foreign keys, rejects stale/duplicate/unauthorized writes, and gates drafts/schedules", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(
      `create role anon;create role authenticated;create table articles(id text primary key,title jsonb,excerpt jsonb,content jsonb,category jsonb,date jsonb,"readTime" jsonb,pillar text,featured boolean default false,cover text,audio text,created_at timestamptz default now(),legacy_extra jsonb, compatibility_default boolean not null default false, generated_label text generated always as (id || '-derived') stored);create table references_test(article_id text references articles(id) on delete cascade);create function is_security_admin() returns boolean language sql stable as $$select coalesce(current_setting('test.admin',true),'false')='true'$$;alter table articles enable row level security;grant select on articles to anon,authenticated;`,
    );
    await pg.exec(
      readFileSync(
        new URL(
          "../supabase/migrations/202610310001_content_studio.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await pg.exec(
      "set test.admin='true';insert into articles(id,title,legacy_extra) values('existing','{\"en\":\"Original\"}','{\"preserved\":true}');insert into references_test values('existing');",
    );
    const save = async (a: any, r: number) =>
      (
        await pg.query<{ value: any }>(
          "select studio_save_article($1::jsonb,$2) value",
          [JSON.stringify(articlePayload(a)), r],
        )
      ).rows[0].value;
    const one = await save(existing(), 0);
    assert.equal(one.studio_revision, 1);
    assert.deepEqual(one.legacy_extra, { preserved: true });
    assert.equal(
      (await pg.query("select * from references_test")).rows.length,
      1,
    );
    await assert.rejects(save(existing(), 0), /revision conflict/);
    const two = await save(
      { ...hydrateArticle(one), title: { en: "Revised", zh: "修改" } },
      1,
    );
    assert.equal(two.studio_revision, 2);
    assert.equal(two.legacy_extra.preserved, true);
    await assert.rejects(
      pg.exec(
        "update articles set title='{\"en\":\"stale legacy\"}' where id='existing'",
      ),
      /revision-based/,
    );
    await assert.rejects(
      save({ ...createArticle("duplicate"), slug: "existing-url" }, 0),
      /slug already exists/,
    );
    const draft = createArticle("draft");
    draft.slug = "draft";
    draft.title.en = "Unfinished";
    const savedDraft = await save(draft, 0);
    assert.equal(savedDraft.studio.status, "Draft");
    assert.equal(savedDraft.compatibility_default, false);
    assert.equal(savedDraft.generated_label, "draft-derived");
    const future = {
      ...createArticle("future"),
      slug: "future",
      status: "Scheduled",
      scheduledDate: "2099-01-01T00:00:00Z",
    };
    await save(future, 0);
    const due = {
      ...createArticle("due"),
      slug: "due",
      status: "Scheduled",
      scheduledDate: "2000-01-01T00:00:00Z",
    };
    await save(due, 0);
    await pg.exec("set test.admin='false';");
    await assert.rejects(save(existing(), 2), /Administrator access required/);
    await pg.exec("set role anon;");
    const publicRows = (
      await pg.query<{ id: string }>("select id from articles order by id")
    ).rows.map((x) => x.id);
    assert.deepEqual(publicRows, ["due", "existing"]);
    await pg.exec("reset role;");
    assert.equal(
      (
        await pg.query<{ visible: boolean }>(
          `select studio_article_visible('{"status":"Scheduled","scheduledDate":"malformed"}') visible`,
        )
      ).rows[0].visible,
      false,
    );
  } finally {
    await pg.close();
  }
});

test("unknown metadata extensions survive a normalization and save round trip", () => {
  const a = hydrateArticle({
    ...existing(),
    studio: { futureSetting: { preserve: true }, status: "Published" },
  });
  const saved = articlePayload(a);
  assert.deepEqual(saved.studio.futureSetting, { preserve: true });
});
test("section configuration keeps headings inside code fences in the same section", () => {
  const source =
    "## First\n\n```md\n## Code only\n```\n\nOriginal paragraph.\n\n## Second\n\nOther paragraph.";
  const sections = editableSections(source);
  assert.equal(sections.length, 2);
  const result = configureSection(source, sections[0], "quote", {});
  assert.ok(result.indexOf("Original paragraph.") < result.indexOf("\n:::\n"));
  assert.ok(result.includes("## Second\n\nOther paragraph."));
});


test("legacy empty published slugs retain the ID URL while new drafts stay unassigned",()=>{assert.equal(normalizeArticle({id:"legacy-url",slug:"",title:{en:"Old title",zh:"旧标题"}}).slug,"legacy-url");assert.equal(createArticle("new-id").slug,"");});
