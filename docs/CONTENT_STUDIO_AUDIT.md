# Stage 3 audit — before implementation

Base: production merge 800b97e. Branch: feature/immersation-content-studio-v2. No production writes, migrations, or release authorized.

## Existing editor and schema

AdminDashboard owns ~30 independent article states and a 350-line inline form. Fields: bilingual title, excerpt, body, category labels, pillar, categoryValue, articleFormat, contentFormat, tags, slug, author, date, readTime, status, schedule, featured, related slugs, cover, Pinterest image, ad URL, SEO title/description pairs, canonical. Saved payload omits unknown fields and Stage 2 presentation/editorial data. Article types are duplicated in articlesData and ArticlesView.

The checked-in initial SQL includes only id/title/excerpt/content/category/date/readTime/pillar/featured/cover/audio/created_at. Runtime records have additional fields; schema cannot be assumed from this initial SQL. Stage 3 will use an additive JSON metadata column and revision-based save function, retaining legacy record columns. A reviewed migration is required before real saves; it will not be applied to production in this task.

## Current save and frontend contracts

The old form sets React state before attempting an upsert, catches failures, sends the entire article list again to /api/sync-articles, and closes regardless of outcome. The API now writes Supabase, not source files despite its comment. Two writers can overwrite newer records. Supabase is the runtime source of truth, while App also merges bundled/local data and subscribes to changes.

ArticlePage uses title/excerpt/content[lang], cover, Pinterest URL, presentation, editorial options and Markdown directives. Numerical progress, TOC, and Pinterest are inside ArticlePage and must remain. Preview will use ArticlePage itself, inside an isolated iframe. SEOHead currently always prefers English overrides even in Chinese; fix selection without changing existing overrides or canonical values.

contentFormat is historically overloaded: markdown serialization and editorial category values both occur. articleFormat is editorial type. Preserve both raw legacy values; expose one clearly named editorial type and keep serialization under compatibility settings. Do not rewrite body content to unify these fields.

## Visual audit — step 1

Captured the actual legacy editor locally with bundled articles, using the unmodified AdminDashboard. No save or upload performed. Evidence: outputs/content-studio-v2/01-before-editor.png. Dense 12px form text, competing side-by-side languages, truncated title/slug controls, a mock upload panel occupying writing space, and settings scattered below the fold. Existing parchment/cypress branding is a useful foundation. Screenshot alone does not prove keyboard or assistive-technology accessibility.

## Compatibility and risks

- Preserve IDs, slugs, custom SEO, unrecognized properties, ad URLs, legacy dates/read-time and presentation object forms.
- Empty advanced overrides inherit primary fields. Differing legacy SEO remains explicit; identical values collapse.
- Autosave only a recovery copy in this browser, never publish on a timer. Surface local storage errors. Server saves are explicit and atomic with revision conflicts.
- Existing article SELECT policy exposes every article, and there is no tested scheduler. Add a separate content-only visibility policy for draft/future schedule exclusion and timestamp-based due visibility. Never describe an untested external scheduler as working.
- Do not reuse the commerce private-assets bucket for editorial images. Select existing HTTPS/root asset URLs; no fabricated uploads. Stage 4 can supply a real media provider.
- Additive migration, no deletion or rewriting of existing rows. Migration/production integration remains an explicit release prerequisite.
