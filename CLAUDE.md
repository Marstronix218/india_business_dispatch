# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

```bash
npm run dev                # Next.js dev server (Turbopack)
npm run build              # Production build
npm run lint               # eslint . — note: ESLint v9 config not yet present, prefer tsc
./node_modules/.bin/tsc --noEmit   # Source of truth for type errors (see below)
npm run scrape:fetch       # Run Python scraper directly, prints rawArticles JSON
npm run scrape:run         # Pipe scraped rawArticles into POST /api/scrape/run (dev server must be running)
```

`next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` — `npm run build` will succeed even when types are broken. **Always run `tsc --noEmit` to catch type errors**, since the build does not.

## Architecture

### Stack

Next.js 16 (App Router, RSC) + React 19 + Tailwind v4 + Supabase + shadcn/ui (`new-york` style, see [components.json](components.json)). Aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`.

### Data flow: Supabase → server page → client store

Articles live in Supabase (schema in [supabase/migrations/](supabase/migrations/)). The flow is:

1. Each `app/.../page.tsx` server component checks `hasSupabaseConfig()` and calls `listPublishedArticles()` from [lib/supabase/article-repository.ts](lib/supabase/article-repository.ts). If Supabase env vars are missing or no articles exist, render [`<DataUnavailable />`](components/data-unavailable.tsx).
2. The articles array is passed to `<ArticleStoreProvider initial={articles}>`, which calls `useHydrateArticles` to populate the **module-level singleton store** in [lib/article-store.ts](lib/article-store.ts) (uses `useSyncExternalStore`).
3. Client components consume `usePublicArticles()`, which filters to `workflowStatus === "published"`. **The `published` filter happens client-side, not in the SQL query** — server returns everything `listPublishedArticles` allows, and the store filters again on read.

There is no Redux/Context for articles; the store is a global mutable variable behind a subscription API. Any client component can read it without prop-drilling.

### Editorial design system

The homepage was redesigned from a generic news list into an editorial/magazine layout. Three-tier typography is wired in [app/layout.tsx](app/layout.tsx) and [app/globals.css](app/globals.css):

- **Body**: Noto Sans JP (`font-sans`, default)
- **Headlines**: Noto Serif JP (`font-serif`)
- **Metadata / accent labels / dates**: JetBrains Mono (`font-mono`)

Apply this hierarchy on every page — H1s are `font-serif font-bold`, uppercase tracking labels are `font-mono tracking-[0.22em]`. The pattern is already followed in [components/site-header.tsx](components/site-header.tsx), [site-footer.tsx](components/site-footer.tsx), [article-view.tsx](components/article-view.tsx), [pricing/page.tsx](app/pricing/page.tsx), [contact/page.tsx](app/contact/page.tsx).

Custom utilities in `globals.css` (Tailwind v4 `@layer utilities`):

- `.ph-stripe`, `.ph-stripe-warm`, `.ph-stripe-cool`, `.ph-stripe-green` — diagonal stripe placeholders shown when `imageUrl` is missing. Tone is selected by `deriveImageTone(article)` in [lib/news-data.ts](lib/news-data.ts) based on category.
- `.marquee-ticker` (+ `@keyframes marquee-ticker`) and `.marquee-wrap` — the LIVE market ticker bar in [components/market-ticker.tsx](components/market-ticker.tsx). Pause-on-hover via `.marquee-wrap:hover .marquee-ticker { animation-play-state: paused }`. The ticker is a client component that fetches `/api/market/snapshot` (see "Live market data" below).
- `.topic-rule` — the bold-segment + hairline divider used under topic-section headers.
- `.card-hover` — translateY+shadow lift used on every news card.

### Topic-section taxonomy

The DB stores `category` (経済/規制/社会/...) and `industryTags`, but the homepage groups articles into 7 **editorial sections** (`strategy`, `policy`, `industry`, `talent`, `market`, `japan_india`, `column`) defined as `TOPIC_SECTIONS` in [lib/news-data.ts](lib/news-data.ts). These are the "business-concern axis" — they reflect what a Japanese executive would care about (進出戦略, 規制・制度, 産業動向, 人材・労務, 市況・指標, 日印連携, コラム) rather than the raw source category. The mapping is computed by `deriveTopicSection(article)` — there is no `topicSection` column. If you add new categories or want to recategorize, edit that function rather than touching data.

`japanIndiaCollaboration` on an article forces it into the `japan_india` section regardless of category. The industry-tag filter in [components/news-list.tsx](components/news-list.tsx) is only shown for sections in `INDUSTRY_VISIBLE_SECTIONS` (currently `null / industry / strategy`) — don't surface it elsewhere without a reason.

Topic sections render via [components/topic-carousel.tsx](components/topic-carousel.tsx): horizontal snap-scroll, 3 cards visible on `lg`, 2 on `sm`, 1 on mobile, with center-aligned chevron buttons that scroll one page (3 cards) at a time. Arrows hide when ≤3 articles.

### Card components

Four card variants in [components/news-card.tsx](components/news-card.tsx): `NewsCardHero` (16:10, gradient-overlay headline, `priority + loading="eager" + fetchPriority="high"` for LCP), `NewsCardMosaic` (small overlay, accepts `priority` prop), `NewsCardTile` (image + serif title + summary), `NewsCardFeature` (large feature inside a section). All use `resolveArticleImageUrl` from [lib/image-utils.ts](lib/image-utils.ts), which **strips legacy `/images/...` paths** and falls back to the placeholder stripe.

Above-the-fold images on the home grid (hero + first two mosaics) pass `priority` to avoid the LCP warning.

### Automation pipeline

[lib/automation.ts](lib/automation.ts) is the editorial-quality gate. The flow:

1. Connectors (`SOURCE_CONNECTORS`) declare RSS/API sources. The actual fetching happens in [scripts/python/fetch_india_news.py](scripts/python/fetch_india_news.py) — Python is the source of truth for scraping; TS-side connectors are metadata. Default sources are Reuters, PIB, and Google News RSS (Business / Manufacturing / Logistics / Policy). If `GNEWS_API_KEY` is set, the GNews API is also enabled (tunable via `GNEWS_QUERY`, `GNEWS_LANG`, `GNEWS_COUNTRY`). Synthetic fallback articles are only emitted when `--allow-fallback` is passed.
2. Raw articles → `dedupeArticles` → `buildSummary` / `buildImplications` (LLM via [lib/llm/](lib/llm/)) → `clusterArticles` (multi-source merging).
3. **URL quality gate**: `isLikelyArticleUrl` in [lib/source-url-utils.ts](lib/source-url-utils.ts) determines whether `sourceUrl` looks like an article (vs a section/listing page). Drafts that fail are marked `workflowStatus: "failed"` and never published. This gate runs **on the TS side after Python**, so passing Python doesn't guarantee publication.
4. Output: `PipelineResult` with `published / review / failed` counts. Inserted via `insertPipelineDrafts` in [lib/supabase/article-repository.ts](lib/supabase/article-repository.ts).

Three entry points hit the pipeline:

- `npm run scrape:run` → [scripts/python/push_to_pipeline.py](scripts/python/push_to_pipeline.py) → `POST /api/scrape/run` (requires `ADMIN_API_KEY` header in production).
- Admin UI button → `POST /api/scrape/python` ([app/api/scrape/python/route.ts](app/api/scrape/python/route.ts)).
- Vercel cron daily at 21:00 UTC → `GET /api/cron/scrape` (requires `CRON_SECRET` Bearer; see [vercel.json](vercel.json)). This path runs Python, calls `runAutomationPipeline`, and inserts directly — it does NOT go through the `/api/scrape/run` HTTP boundary.

### Auth / admin

`/admin/*` is gated by [proxy.ts](proxy.ts) (note: filename is `proxy.ts`, not Next's conventional `middleware.ts`). It does **constant-time** comparison of `ADMIN_API_KEY` against an `x-admin-key` header or `admin_key` query param. In dev with no key set, access is allowed; in production with no key set, access is denied. Same key is checked by `isAdminRequest` in [lib/admin-auth.ts](lib/admin-auth.ts) for write endpoints.

### Live market data

[lib/market-data.ts](lib/market-data.ts) fetches live quotes for INR/JPY, USD/INR, Nifty 50, Sensex, Brent, and Gold from Yahoo Finance's `query1.finance.yahoo.com/v8/finance/chart` endpoint. The route handler [app/api/market/snapshot/route.ts](app/api/market/snapshot/route.ts) exposes this with `revalidate: 300` and a `s-maxage=300, stale-while-revalidate=600` cache header. On fetch failure the route returns 502 and the client ticker falls back to `—` placeholders. **Don't confuse this with `marketSnapshot` on `NewsArticle`** — the article-level snapshot is still static seed data attached only to category=`market` articles, separate from the live ticker.

### Article data shape

`NewsArticle` ([lib/news-data.ts](lib/news-data.ts)) has both `provenance` (single source) and `sources[]` (multi-source after clustering). Use `getAllSources(article)` to read either uniformly. `marketSnapshot` is currently static (only on category=`market` articles); the homepage ticker uses live data via the route above. `japanIndiaCollaboration: true` reroutes the article into the `japan_india` topic section. `workflowStatus` is the lifecycle field — `published / review / failed`.

## Conventions worth knowing

- **Don't add `topicSection` to article data** — it's derived. Same for `imageTone`.
- **Keep the three-font hierarchy** when adding pages (serif H1, mono accent labels, sans body). Don't reach for `text-3xl font-semibold` defaults.
- The pricing CTA `ctaHref` in [lib/site-config.ts](lib/site-config.ts) uses `/pricing` (top of page), not the `#free-member` anchor — the anchor `id` still exists on the form section but is no longer linked to. Don't reintroduce the anchor without a reason.
- Build is tolerant of TS errors. Run `tsc --noEmit` before claiming a change works.
- Real article images come from external CDNs (Times of India, etc.). `next.config.mjs` has `images.unoptimized: true` so any external URL works without `remotePatterns` config.
