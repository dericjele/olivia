-- ─────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Drop and recreate if you already ran the previous version
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

-- Add any missing columns if table already exists
alter table leads add column if not exists score   integer;
alter table leads add column if not exists notes   jsonb;
alter table leads add column if not exists source  text;
alter table leads add column if not exists lang    text default 'en';

-- Indexes
create index if not exists leads_contact_idx  on leads (contact);
create index if not exists leads_journey_idx  on leads (journey);
create index if not exists leads_created_idx  on leads (created_at desc);

-- RLS
alter table leads enable row level security;

drop policy if exists "service role only" on leads;
create policy "service role only"
  on leads using (false) with check (false);

-- ─────────────────────────────────────────────────────────
-- Olivia's dashboard view — readable summary of all leads
-- ─────────────────────────────────────────────────────────
create or replace view leads_dashboard as
select
  id,
  created_at at time zone 'Pacific/Auckland' as nzt,
  contact,
  journey,
  score,
  source,
  lang,
  -- Pull key fields out of notes jsonb for easy reading
  notes->>'city'              as city,
  notes->>'nz_years'         as nz_years,
  notes->>'currently_in_ece' as currently_in_ece,
  notes->>'biggest_blocker'  as biggest_blocker,
  notes->>'quiz_weak_areas'  as quiz_weak_areas,
  notes->>'cv_headline'      as cv_headline,
  notes->>'cv_key_insight'   as cv_key_insight,
  notes->>'cv_gaps'          as cv_gaps,
  notes->>'pathway_country'  as pathway_country,
  notes->>'pathway_level'    as pathway_level,
  notes->>'booking_need'     as booking_need,
  notes->>'booking_timeline' as booking_timeline,
  notes->>'workplace_situation' as workplace_situation,
  notes
from leads
order by created_at desc;
