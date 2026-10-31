# Content Studio 2.0 — implementation guide

## Architecture

`AdminDashboard` embeds `content-studio/ContentStudio`. The article list/editor is modular; newsletter, product, ebook, payment and account modules retain their existing workflows. Article editor sections are Essentials, Content, Media & Design, Publishing, Advanced SEO. `useArticleDraft` owns dirty/save/recovery state. `article-studio.ts` owns normalization, validation, reading estimates, schedule conversions, section markup and the repository adapter. `article-taxonomy.ts` contains the existing taxonomy, extracted without new production categories.

`ArticlePreview` uses an isolated iframe entry (`studio-preview.html` / `src/studio-preview.tsx`) that imports the public `ArticlePage`. Same-origin, parent-source and nonce checks gate preview messages. Preview media queries, anchors, numerical progress and TOC operate in their own viewport. Reflections and subscription forms are disabled only in preview. Public forms remain unchanged. The active-heading hook is shared with public article navigation.

## Field mapping and compatibility

| Editor | Existing data | Stage 3 handling |
| --- | --- | --- |
| Bilingual title | `title.en/zh` | Primary headline and default search/social title |
| Bilingual description | `excerpt.en/zh` | Card summary, standfirst and default search/social description |
| Bilingual body | `content.en/zh`, legacy `description` fallback | Markdown remains unchanged unless an editor explicitly edits it |
| Advanced overrides | `seo.titleEN/titleZH/descEN/descZH` | Meaningful different values retained; identical primary values collapse in editor |
| URL | `slug` or legacy `id` fallback | Suggested only before first save; existing URLs require explicit change confirmation |
| Editorial purpose | `articleFormat`, some historic `contentFormat` values | One editorial-type selector; original body-format value retained under compatibility settings |
| Magazine design | `presentation`, `editorial` and directives | Same Stage 2 modes, parser and sanitizer; object presentation extensions retained |
| Media | `cover`, `pinterestImageUrl`, new bilingual `coverAlt/coverCaption` | Real hosted URLs and existing-asset suggestions; no upload simulation |
| Publication | `status`, `scheduledDate`, legacy `date` | Explicit status; Singapore schedule stored as ISO UTC; legacy display dates kept until edited |
| Reading time | `readTime`, `readTimeAutomatic` | Existing estimates stay readable; confirmed Studio saves calculate from each body |
| Other metadata | related slugs, tags, author, ad URL, canonical and unknown properties | Retained, including future unknown JSON metadata extensions |

Legacy table definitions are incomplete. The new additive `studio` JSONB column stores extended metadata while known legacy columns are also populated where available. `hydrateArticle` merges it for public/admin consumers. `studio_revision` enables optimistic concurrency. No migration rewrites existing article rows. Titles, bodies, existing published slugs and media files are not mass-edited.

## Persistence contract

Apply `supabase/migrations/202610310001_content_studio.sql` to an approved staging database before real save testing. **It has not been applied to production.** It requires the existing Stage 1 `is_security_admin()` helper, but does not change administrator membership, commerce tables, payment configuration or credentials.

The authenticated `studio_save_article(p_article, p_expected_revision)` RPC checks administrator membership, serializes saves by article identity/slug, locks the existing row, checks its revision, rejects duplicate slugs, and updates one record atomically. It preserves creation time, unknown columns and foreign-key relationships. It never deletes and reinserts an existing article. A trigger blocks stale legacy updates to Studio 2 records. Missing migration or persistence failure keeps the editor open with Error; it never becomes Saved because a local state update succeeded.

The legacy whole-catalog `/api/sync-articles` endpoint now returns 410 for authorized callers. It must not race against revision saves. The old article form, optimistic upsert, bulk sync and mock WordPress article uploader are removed. Remaining newsletter/ebook simulations are outside this article-only scope.

Browser recovery is debounced, namespaced by owner/article, and separate from confirmed remote saves. Reloading offers recovery explicitly. A recovery from an older revision is blocked from automatic restoration; export it for comparison. The editor warns on navigation/reload, supports draft export and Cmd/Ctrl+S, and blocks closing/navigation while Saving. Browser recovery is local convenience, not a remote backup. Clear shared-browser storage when appropriate.

## Scheduling

The migration's content SELECT policy excludes Draft and future Scheduled records for public readers. Due Scheduled articles become readable at the timestamp on the next query/page load. Editors retain access through the existing verified-admin function. All application public article consumers also filter publication visibility. Legacy timezone-less schedules are interpreted as Asia/Singapore (UTC+08:00).

This is **timestamp-based visibility**, not a background scheduler. It does not send newsletters, change a status label automatically, run a cron job, or refresh a page already open. SQL tests exercise due/future/invalid timestamps and anonymous visibility. Validate again in staging before production.

## Editorial authoring

Use the existing `:::magazine image|background|split|quote` directives. The toolbar inserts ordinary Markdown and wraps selected text for background/split blocks. Media & Design can choose a heading section or existing directive, then apply a layout while retaining its words. Fenced code is excluded. Editing an existing directive updates its header rather than nesting copies.

Background attributes include `src`, `intensity` (12–28% photo opacity), `overlay` (0–60% additional parchment), `focal`, `mobileSrc`, and `mobileFallback: "plain"|"image"`. Existing attributes remain supported. Additional parchment can only improve the Stage 2 contrast floor. Raw HTML parsing remains disabled and all URLs/attributes pass the existing allowlist sanitizer. New articles start with automatic backgrounds off; existing automatic-background settings are retained.

Hero treatment preserves complete covers by default, with a photographic crop available. Inline/full-width/split media support alt text and captions. Pinterest keeps its article-specific image and hero fallback. No local or temporary file is presented as a production media asset.

## Stage 4 media integration

`MediaPicker` accepts a URL, onChange callback and existing-asset choices. A future Media Library can replace suggestions with an authenticated provider that returns durable URLs and metadata. Keep upload/list permissions on an editorial-media bucket, not the commerce private-assets bucket. Add MIME/size validation and real upload/error/progress states before enabling uploads. Never send service-role credentials to the frontend. Reuse these pickers for cover, inline, background and Pinterest assets.

## Local preview

From the repository, run `npm ci` if dependencies are absent, then `npm run dev`. Open `http://localhost:3000/docs/studio-review/index.html` for the safe standalone review or add `?dashboard` to inspect the existing admin integration. The green local-review banner states that saves affect only this browser. This review entry is not included in the production build. Use the failure toggle to verify that the editor stays open with an error. Its sample catalog/recovery data can be cleared through the browser's site storage controls.

The real `/admin` path retains the verified-admin guard and uses Supabase. Never use the local review as proof of production persistence.

## Release and rollback

1. Review the branch and migration; back up the target article table/policies.
2. Compare the staging schema with production, including existing required/generated columns and article policies. Test an existing record and a new draft through authenticated Supabase; verify anon visibility and concurrent conflicts.
3. Validate public EN/ZH URLs and metadata, media URLs, due scheduling and recovery with separate test accounts.
4. Approve migration and application release explicitly. No automated merge/deploy is part of this task.

Before adoption, rollback is simply switching back to the production branch: no live changes have been made. After Studio 2 saves exist, disable the writer first and retain the metadata hydration and visibility policy. Export `studio` metadata and revisions before any rollback. Do not drop JSON columns or revert the public read adapter blindly: new slugs/settings may live in JSON where legacy table columns were absent. A post-adoption rollback must preserve that read compatibility and use a reviewed backout change. Keep draft visibility protections; do not restore the old all-public article policy as a convenience rollback.
