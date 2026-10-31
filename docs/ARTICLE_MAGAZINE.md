# The Living Journal V3

Branch `feature/living-journal-v3`, based on production `f03fdb2`. Local review only. Do not merge or deploy without approval.

## Architecture and boundaries

`App.tsx` still owns routing, SEOHead, bilingual normalization and Supabase synchronization. Normalization preserves optional metadata supplied by callers. Defaults/directives work with existing data; persisting new editorial controls later needs a separately reviewed Studio/storage integration. No storage or Studio changes are made here. `ArticlesView.tsx` retains archive navigation, bookmarks, local analytics, share URLs, newsletter subscriptions, reader reflections, related stories and embedded-media handling. Stored article copy, heading slug generation, article URLs, SEO metadata, Stripe and admin code are unchanged.

The article opening sits above `MagazineReaderGrid`. The grid contains the Markdown body and a sticky utility sidebar. Comments, tags, sharing, related reading, newsletter and ads follow the reading grid. Only `#article-reading-content` is measured for progress.

Reusable pieces:

- `ArticleMagazine.tsx`: MagazineHeader, ArticleOpening, MagazineReaderGrid, MagazineSidebar, EditorialImage, EditorialBackgroundSection, EditorialPullQuote, EditorialSplitSection and the backward-compatible MagazineBlock dispatcher.
- `ArticleReadingTools.tsx`: TableOfContents, ReadingProgressMarker, shared progress controller.
- `reading-progress.ts`: pure geometry calculation.
- `editorial-settings.ts`: bounded intensity, focal-position/aspect validation, and conservative contrast calculation.
- `magazine-markdown.ts`: existing directive parser and a single automatic section treatment; raw HTML remains inert.

At desktop widths (1100px and above), the reading grid uses approximately 75/25 proportions before the gutter. Its body measure remains 680px (660px Chinese), while imagery and pull quotes can use the full main column. The sidebar sticks 104px below the viewport top. Its contents and overall height are bounded; it contains percentage, expanded TOC and one article-specific Pinterest widget, without newsletter/advertising clutter.

Below 1100px the page becomes one column. A full-width collapsible contents list and accessible Pinterest share action follow the cover. A compact, fixed 52px bottom progress display remains visible. Footer padding prevents it covering the final links. Existing sharing at the article end is retained; there is one Pinterest image widget, not duplicate desktop/mobile widgets.

## Progress behavior

Let `top` and `height` describe the Markdown body's document geometry. Long-article progress is:

```text
start = top - 104
end = top + height - viewportHeight + bottomInset
progress = clamp((scrollY - start) / (end - start), 0, 1)
```

`bottomInset` is 52px on tablet/mobile and zero on desktop. Progress is zero before entering the reading area and completes when the final reading line reaches the unobscured viewport. Short articles complete once their entire text is visible. Empty/invalid geometry remains zero. Comments, long afterwords and promotions never extend the range.

A single controller subscribes to Motion's scroll value. ResizeObserver handles body reflow and cover/font changes above it; window resizing remeasures the visible reading area. Two responsive displays share the same MotionValue. Motion draws the line; refs update the visible integer and ARIA value only when the integer changes. Continuous scrolling does not set React progress state. Reduced-motion preference bypasses the line spring. The percentage is not an aria-live announcement on every change.

TOC IDs and links are retained. Scrollspy recomputes the last heading above the reading threshold after jumps as well as ordinary scrolling, updating React only when the section changes. Anchor scrolling respects reduced motion and lands 104px below the viewport top.

## Image treatment and background settings

Complete is the default for covers and inline images, preserving all embedded lettering, diagrams and infographics. The demonstration cover contains lettering, so it intentionally remains complete. An explicitly photographic image can crop to a selected aspect and focal point with object-fit: cover. Captions, safe URL validation, lazy noncritical loading, priority covers and accessible failure geometry remain in place.

Optional article metadata, ready for future Studio integration (no Studio UI/storage changes in this stage):

```ts
editorial: {
  backgroundIntensity: 0.24,       // bounded to 0.12–0.28
  backgroundFocal: 'right',        // left / center / right / top / bottom / '80% 35%'
  backgroundImage: '/images/story-photo.jpg', // optional; otherwise existing cover
  automaticBackground: true,      // false disables the automatic section
  coverTreatment: 'complete',     // 'photograph' explicitly enables a 16:9 crop
  coverFocal: 'center'
}
```

Without directives, a valid article-specific cover/editorial image supports one automatic section introduction. The parser prefers the third suitable H2, then the second, then another eligible section, excluding references/sources. It wraps at most four immediately following paragraphs, with at least two required. Remaining paragraphs stay ordinary reading text. Text is neither duplicated nor rewritten. Explicit directives suppress automatic styling. The existing manual-chores quote is retained once in its original sequence.

Backgrounds use the existing cover with a bounded 24% default alpha, a parchment edge overlay and focal cropping. The demonstration crop emphasizes the washing scene rather than repeating the cover lettering. There is no blur, CSS enlargement or photograph behind the headline. Missing backgrounds return to plain parchment. Reduced-transparency and print modes hide decorative imagery.

Contrast was inspected in the browser and tested technically. At maximum 28% photo alpha, a conservative black-photo-pixel model with a further 5% black background / white foreground allowance for the existing paper texture gives at least 5.92:1 for body #1C1C1C and 4.88:1 for cypress headings/links. The parchment overlay brightens this bound. Section link/emphasis colors are opaque dark colors; preformatted code retains its original contrasting surface. This validates the specified foreground/background pairs, not a claim of complete WCAG compliance or a measured Core Web Vitals score.

## Backward-compatible Markdown directives

Existing image/background/quote/split directives and original attributes remain valid. Place markers on separate lines, with blank lines around them. Optional new controls are `intensity`, `focal`, `fit`, `aspect`:

```markdown
:::magazine background {"src":"/images/story-photo.jpg","intensity":0.24,"focal":"right"}

## Original heading

Original Markdown text.

:::

:::magazine image {"src":"/images/photo.jpg","alt":"Describe the existing photograph","caption":"Existing caption","fit":"cover","aspect":"21/9","focal":"80% 35%"}

:::

:::magazine split {"src":"/images/diagram.png","alt":"Original diagram","side":"right"}

Original Markdown text. Complete image presentation is the default.

:::

:::magazine quote

An exact quotation already in the article.

:::
```

`fit` is contain (default) or cover. Allowed ratios: 16/9, 21/9, 3/2, 4/3, 4/5, 1/1. Focal positions are named positions or two bounded integer percentages. Unsafe values fall back to safe defaults; arbitrary styles/events/classes are not admitted. Intensity may be numeric or a numeric string. Image URLs remain HTTP(S) or root-relative public paths; script/data/blob/protocol-relative/authenticated URLs are rejected. Unknown attributes, malformed JSON and unclosed directives remain ordinary Markdown. Code fences are never interpreted. The existing rehype-sanitize pipeline remains; no rehypeRaw is added.

## Presentation modes and local review

`article.presentation` remains a friendly string or `{ mode: string }`, supporting Classic Editorial, Premium Magazine and Visual Feature aliases. Classic keeps a compact linear opening; Premium uses the asymmetric masthead and full cover; Visual Feature opens with photography. All three share the reading grid and restored utilities.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/articles/mindfulness-through-manual-chores`. The development server in this workspace is already running on port 3000. Public Supabase URL and anon/publishable key in ignored `.env.local` are required for the actual database-only article; never place a service-role key in Vite.

`http://localhost:3000/docs/journal-preview.html` provides local mode/language controls and a 12–28% intensity slider using the same ArticlePage. It reads the existing article, falls back to an existing bundled essay when unavailable, and prevents all form submissions in capture phase. Choices remain in memory. It is not a Content Studio change and is excluded from the production build's entry points.

Checks: `npm run lint`, `npm test`, `npm run build`. Progress, responsive semantics, directive safety, automatic-section fallback and contrast calculations have dedicated tests. Before/after screenshots are captured at 1440×1000, 768×1024 and 390×844, plus full-page desktop. No production reflection/subscription/payment is submitted during review.
