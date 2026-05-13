# IndoBiz Japan

IndoBiz Japan is a Next.js intelligence platform for Japanese companies tracking India-related business news, regulation, markets, and investment signals. It combines curated article views, source provenance, membership access, admin publishing tools, and automated news collection.

## Features

- News-style home page with featured articles, category filters, search, and industry tags
- Article pages with summaries, implications for Japanese businesses, related articles, and source verification details
- Categories for economy, regulation, society, culture, markets, and columns
- Market snapshot support for exchange rates, equities, interest rates, and crude oil
- Public pricing, signup, login, profile, terms, and contact flows
- Supabase-backed article and membership data
- Stripe checkout, customer portal, and webhook routes for paid memberships
- Admin area for article management, image upload, and scraper execution
- RSS/API scraping pipeline with source URL quality gates and provenance snippets
- Optional LLM synthesis through Anthropic or OpenAI
- Optional AI image generation through OpenAI Images or Runware with Supabase Storage upload

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Stripe
- Anthropic SDK / OpenAI SDK
- Python scraper utilities

## Requirements

- Node.js 20.9 or newer
- npm
- Python 3 for scraper scripts
- Supabase project for database-backed features
- Stripe account for paid membership flows

The project includes `scripts/with-supported-node.mjs`, which lets npm scripts use a supported local Node version when available.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the values needed for the features you want to run. At minimum, Supabase variables are required for database-backed app behavior:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Key groups in `.env.example`:

- `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`: article synthesis provider and model settings
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase app and server access
- `CRON_SECRET`, `ADMIN_API_KEY`: cron and admin API protection
- `GNEWS_API_KEY`, `GNEWS_QUERY`, `GNEWS_LANG`, `GNEWS_COUNTRY`: optional GNews integration for scraping
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_APP_URL`: Stripe membership payments
- `IMAGE_PROVIDER`, `OPENAI_IMAGE_*`, `RUNWARE_*`, `SUPABASE_IMAGE_BUCKET`: generated article image settings

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run scrape:fetch
npm run scrape:run
```

- `npm run dev`: run the local Next.js development server
- `npm run build`: create a production build
- `npm run start`: start the production server after building
- `npm run lint`: run ESLint
- `npm run scrape:fetch`: run the Python India news fetcher
- `npm run scrape:run`: send fetched articles into the local scraping pipeline

## Scraping Pipeline

The scraper collects India business and policy news from RSS/API sources, resolves final URLs, extracts evidence snippets, and attaches provenance metadata. The TypeScript pipeline then deduplicates, summarizes, classifies, and applies publishing quality gates.

Run the fetcher directly:

```bash
npm run scrape:fetch
```

Run the full local ingestion flow while the dev server is running:

```bash
npm run dev
npm run scrape:run
```

Optional GNews setup:

```bash
export GNEWS_API_KEY="your_api_key"
export GNEWS_QUERY="india business OR india economy OR india infrastructure"
export GNEWS_LANG="en"
export GNEWS_COUNTRY="in"
npm run scrape:fetch
```

## Stripe Local Webhooks

For local paid membership testing, run Stripe CLI forwarding in a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Validation

Before shipping changes, run:

```bash
npm run lint
npm run build
```

## Project Structure

- `app/`: Next.js app routes, API routes, and layouts
- `components/`: UI components, article views, pricing, profile, membership, and admin components
- `lib/`: article data, automation, Supabase, Stripe, LLM, image generation, and utility modules
- `scripts/python/`: scraper and pipeline push scripts
- `supabase/`: setup SQL and migrations
- `README_ja.md`: previous Japanese README

## Notes

- The contact form submits through FormSubmit to `info@g-launchers.com`.
- Market snapshot content can be provided through static or stored article data depending on the article source.
- Scraper output is gated so non-article source URLs or low-quality provenance can be marked for review or failed instead of published.
