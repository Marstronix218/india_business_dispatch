-- India Business Dispatch — full Supabase setup
-- Paste this entire file into Supabase SQL Editor and run once.
-- Combines 0001_init.sql + 0002_add_market_snapshot.sql + storage bucket.

create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  source text not null,
  source_url text,
  published_at timestamptz not null,
  category text not null,
  industry_tags text[] not null default '{}',
  implications text[] not null default '{}',
  content_type text not null default 'news',
  visibility text not null default 'public',
  workflow_status text not null default 'published',
  image_url text,
  featured boolean not null default false,
  is_synthesized boolean not null default false,
  dedupe_key text,
  market_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_at_desc
  on public.articles (published_at desc);

create unique index if not exists articles_dedupe
  on public.articles (dedupe_key)
  where dedupe_key is not null;

create table if not exists public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  source_name text,
  original_title text not null,
  original_url text not null,
  canonical_url text,
  original_published_at timestamptz,
  fetched_at timestamptz,
  extracted_by text,
  source_language text,
  evidence_snippets text[] not null default '{}',
  display_order int not null default 0
);

create index if not exists article_sources_article_id
  on public.article_sources (article_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row-level security
-- ============================================================

alter table public.articles enable row level security;
alter table public.article_sources enable row level security;

drop policy if exists "articles public read" on public.articles;
create policy "articles public read"
  on public.articles for select
  using (workflow_status = 'published');

drop policy if exists "article_sources public read" on public.article_sources;
create policy "article_sources public read"
  on public.article_sources for select
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_sources.article_id
        and a.workflow_status = 'published'
    )
  );

-- service_role bypasses RLS, so admin writes from the server work without
-- additional policies.

-- ============================================================
-- Storage bucket for AI-generated article images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;
