-- Add AI editorial quality-check verdicts to articles
-- Apply via Supabase SQL Editor or `supabase db push`
-- All columns nullable so rows written before this migration remain valid.

alter table public.articles
  add column if not exists quality_verdict text,
  add column if not exists quality_notes text,
  add column if not exists revision_count integer not null default 0,
  add column if not exists last_quality_check_at timestamptz;
