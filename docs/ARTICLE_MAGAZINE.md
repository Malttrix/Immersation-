# Immersation: The Living Journal

Revision branch: `feature/living-journal`, based on production commit `5ad6c1d`. Review locally; do not merge or deploy without approval.

## Rendering architecture and preservation

`App.tsx` resolves `/articles/:slug`, normalizes bilingual records and loads Supabase as the source of truth. `ArticlesView.tsx` owns archive/detail navigation, local bookmark and analytics state, related articles and IntersectionObserver scrollspy. `ArticlePage` renders `article.content[lang]` through ReactMarkdown, remark-gfm, the magazine AST pass and rehype-sanitize. The existing first-H1 removal, generated anchor IDs, routing callbacks and `SEOHead` metadata remain unchanged.

The revision changes article composition only. It does not modify stored copy, slugs, Supabase schema/policies, payment code, Content Studio, global navigation or SEO metadata. Reflections, sharing, bookmarks, analytics, audio, captions and related navigation retain their existing handlers. There are no added dependencies or generated images.

## The composition system

One `ArticlePage` and one `ArticleOpening` render all modes. An optional `article.presentation` selects the layout, either as a string or `{ mode: string }`. Human-readable, hyphenated and underscored names are accepted; absent/unknown values fall back to Premium Magazine. No presentation selector or persisted presentation field existed in the audited production code. This is an optional rendering API, not a Content Studio or database change.

| Mode | Opening | Image and reading scale |
| --- | --- | --- |
| `classic-editorial` | Linear title, deck, then metadata | 800px outer essay, 700px body, restrained headline |
| `premium-magazine` | Desktop title/metadata aligned beside a supporting deck; stacked below 1024px | 1160px photographic spread, 700px body (680px Chinese) |
| `visual-feature` | Image opens the story, followed by an inset title composition | 1160px photography; inset disappears on mobile |

Examples: `presentation: 'Classic Editorial'`, `presentation: 'premium-magazine'`, or `presentation: { mode: 'visual-feature' }`. Existing article objects without this optional value continue working.

The brand remains Parchment White #F4F1EB, Deep Cypress #1A2F24, Obsidian Ink #1C1C1C, Quiet Rust #8B5A44 and Muted Gold #B69A6B, using existing Lora/Noto Serif SC fonts. Desktop body text is 19px/1.85; mobile 17px/1.85; Chinese body leading is 2. Headlines use natural wrapping without inserted line breaks or rewritten text. Chinese titles use less compression and strict line breaking.

The single hero is unfiltered and follows the source image's natural proportions. This removes the old fixed-frame letterboxing of panoramic covers. Noncritical media remains lazy-loaded; priority covers remain eager. Existing fallback geometry and safe-image URL checks remain. Accurate per-image dimensions are not stored in the existing article model; unusual aspect ratios can still adjust during first image decoding. No measured CLS claim is made.

The TOC is closed initially at every width and opens in place. A thin progress rail replaces the permanent margin marker and uses Motion values without per-scroll React state updates. Promotional columns are removed: related articles, newsletter, optional ad and Pinterest all follow the article/reflections. The Pinterest image mounts only after its disclosure opens. Reflections use an unboxed form with clearer placeholders and explicit accessible labels. Reduced-motion/transparency and print rules remain scoped to the reader.

## Reusable Markdown layouts

`ArticleMagazine.tsx` exports `EditorialImage`, `MagazineBlock`, `ArticleOpening`, and `resolveArticlePresentation`. Existing `:::magazine` directives retain their syntax, Markdown contents, nesting and sanitization:

```markdown
:::magazine image {"src":"/images/photo.jpg","alt":"Describe the existing photo","caption":"Existing caption"}

:::

:::magazine split {"src":"/images/photo.jpg","alt":"Describe the existing photo","side":"right"}

## Existing heading

Original Markdown body.

:::

:::magazine background {"src":"/images/another-photo.jpg"}

Original section text.

:::

:::magazine quote

An exact quotation already in the article.

:::
```

Use blank lines around markers. Attributes are limited to `src`, `alt`, `caption`, `side`; layout is `image`, `split`, `background`, or `quote`. Image sources accept HTTP(S) or root-relative public paths; script/data/blob/protocol-relative/authenticated URLs are rejected. No raw HTML parser, custom styles or event handlers are admitted. Invalid, unknown or unclosed directives stay ordinary Markdown; fenced/indented code is never interpreted. Informative images need meaningful alt text; background images remain decorative, with all indexable copy rendered as real text.

Background photography is now opt-in only, at 7% opacity on parchment. The automatic repeated-cover background section has been removed. The manual-chores article retains only the existing exact bilingual sentence styled as a pull quote; it appears once and in its original position. Explicit directives still override that automatic quotation treatment.

## Local review

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/articles/mindfulness-through-manual-chores` and `http://localhost:3000/articles/why-real-growth-feels-like-going-backward`. Use the site language controls. Public Supabase URL and anon/publishable key must be configured in ignored `.env.local` to read these database-only articles. Never place a service-role key in a Vite variable. This workspace already has public preview configuration.

Open `http://localhost:3000/docs/journal-preview.html` for a local mode selector and bilingual toggle using the same ArticlePage. It reads the existing manual-chores record, falls back to a bundled essay if unavailable, and prevents form submissions in capture phase. It does not persist presentation choices. Vite's production entry is index.html; this dev-only review HTML is not built as a production route.

Validation: `npm run lint`, `npm test`, `npm run build`. Visual review targets 1440×1000, 768×1024 and 390×844. Do not submit production reflection/newsletter forms during review.
