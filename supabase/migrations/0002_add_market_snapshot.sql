-- Add market_snapshot column to articles table
-- Apply via Supabase SQL Editor or `supabase db push`
-- (for deployments that already ran 0001_init.sql)

alter table public.articles
  add column if not exists market_snapshot jsonb;
