-- ─────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────

create table if not exists leads (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now() not null,
  contact     text        not null,
  journey     text,
  score       integer,
  source      text,
  lang        text        default 'en',
  notes       jsonb
);

-- Index for quick lookups by contact (duplicate check)
create index if not exists leads_contact_idx on leads (contact);

-- Index for filtering by journey type
create index if not exists leads_journey_idx on leads (journey);

-- Row Level Security — enable but allow service role full access
alter table leads enable row level security;

-- Policy: only the service role can read/write
-- (the anon key cannot access leads directly from the browser)
create policy "service role only"
  on leads
  using (false)        -- block all anon reads
  with check (false);  -- block all anon writes

-- ─────────────────────────────────────────────────────────
-- Optional: view for Olivia to browse leads easily
-- ─────────────────────────────────────────────────────────
create or replace view leads_summary as
select
  id,
  created_at at time zone 'Pacific/Auckland' as created_nzt,
  contact,
  journey,
  score,
  source,
  lang,
  notes
from leads
order by created_at desc;
