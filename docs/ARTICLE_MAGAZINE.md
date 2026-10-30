# Article magazine reader

Branch: `feature/editorial-magazine`. Local review only; do not push, merge or deploy without approval.

## Architecture audit

- `App.tsx` resolves `/articles/:slug`, normalizes bilingual fields, loads articles from defaults/local storage and then Supabase (the source of truth), and subscribes to article changes.
- `ArticlesView.tsx` owns archive/detail navigation, bookmarks, local reading analytics, related articles and scrollspy. Its exported `ArticlePage` renders `article.content[lang]` through ReactMarkdown, GFM and rehype-sanitize. It removes the first source H1 because the page has its own title; this existing behavior is retained.
- Heading components generate existing anchor IDs. The old scrollspy queried `heading-*` even though the renderer emitted unprefixed slugs. It now observes rendered body IDs and reattaches after asynchronous article loads. Page-view tracking remains keyed to navigation, so heading/bookmark updates do not create extra page views. Existing anchor URLs are retained.
- Markdown renderers retain audio, source links, tables, code, captions and blockquotes. Paragraphs containing Markdown images now use valid block wrappers, while mixed inline image markup remains valid.
- `ReaderReflections` and its Supabase queries, sharing/Pinterest, newsletter, ads, related articles, stats, bookmarks and all analytics IDs remain connected.
- `SEOHead.tsx` remains the metadata authority: title, description, canonical, OG and JSON-LD. It and routing/data storage are unchanged. Existing client-rendered SEO behavior is preserved; this is not an SSR migration.
- Brand: #F4F1EB paper, #1A2F24 display type, #1C1C1C body, #8B5A44 links, #B69A6B rules; existing Lora/Noto Serif SC. No replacement fonts, generated photography or packages.

## Presentation

The title uses a quiet cover-image wash, balanced serif typography and the existing excerpt/byline. A separate unfiltered, uncropped cover plate remains visible. The reading column is constrained, with a desktop sidebar at 1100px; tablet/mobile use the existing collapsible TOC and sidebar tools below the article. A reader-scoped overflow fix lets the sidebar and reading marker actually stick to the viewport; long sidebar tools remain scrollable. Images have reserved geometry, fallback and loading priorities. Decorative photos are hidden from assistive technology; the original text stays in the DOM.

`ArticleMagazine.tsx` exports reusable `EditorialImage` and `MagazineBlock` components. `magazine-markdown.ts` adds an allowlisted AST presentation pass before the existing sanitizer. No HTML parser, database migration or source-content mutation is involved.

## Optional authoring directives

Place markers on separate lines **with a blank line before and after each marker**. Attributes are a single JSON object on the opening line. Supported layouts: `image`, `background`, `quote`, `split`. Only `src`, `alt`, `caption`, `side` are accepted. `side` is `left` (default) or `right`. Image sources accept HTTP(S) or root-relative public paths; script/data/blob/protocol-relative/authenticated URLs are rejected. Supply meaningful alt text for informative images; empty alt is decorative. Captions are plain text, not HTML.

```markdown
:::magazine background {"src":"https://example.com/existing-photo.jpg"}

## An existing section heading

The original Markdown section goes here.

:::

:::magazine quote

An exact quotation already in the article.

:::

:::magazine image {"src":"/images/existing-photo.jpg","alt":"Describe the photograph","caption":"Existing caption or credit"}

:::

:::magazine split {"src":"/images/existing-photo.jpg","alt":"Describe the photograph","side":"right"}

## An existing heading

Original text, links and formatting.

:::
```

Nesting is supported. Fenced/indented code blocks are not interpreted. Unknown attributes, invalid JSON and unclosed directives fall back to ordinary Markdown. Raw HTML remains inert. No arbitrary styles or event attributes cross sanitization. Ordinary Markdown needs no changes.

## Demonstration without rewriting content

At `/articles/mindfulness-through-manual-chores`, a presentation-only AST decorator styles the existing emphasized sentence “The chore stays the same. Your attention changes.” (or its existing Chinese equivalent) as a pull quote, and wraps the existing “The strange luxury of having only one thing to do” section (or its Chinese equivalent) with the article's own faded cover. Text appears once, in the original sequence. Explicit directives override this automatic demo styling. The stored article, bilingual copy and factual claims are untouched.

## Local preview

```sh
npm ci
npm run dev
```

Open http://localhost:3000/articles/mindfulness-through-manual-chores . Use the existing EN / 中文 navigation controls. The demonstration article lives in the existing Supabase project, not the checked-in default article list. Configure `VITE_SUPABASE_URL` and a public anon/publishable key in ignored `.env.local` for the actual data; never use a service-role key in Vite. This workspace has a read-only public configuration prepared. Without it, default articles still preview normally, but this database-only slug is absent.

Checks: `npm run lint`, `npm test`, `npm run build`. No payment credentials or server service-role key are needed for article preview. Do not submit reflections, subscription forms, or editor changes against production during local visual review.
