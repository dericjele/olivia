-- ─────────────────────────────────────────────────────────────
-- Run in: Supabase Dashboard → SQL Editor
-- Adds new columns to existing leads table
-- ─────────────────────────────────────────────────────────────

-- New columns for richer lead data
alter table leads
  add column if not exists city          text,
  add column if not exists nz_duration   text,
  add column if not exists employed      text,
  add column if not exists heard_from    text,
  add column if not exists booking_need  text,
  add column if not exists booking_timeline text;

-- Indexes for Olivia's filtering
create index if not exists leads_city_idx     on leads (city);
create index if not exists leads_employed_idx on leads (employed);

-- ─────────────────────────────────────────────────────────────
-- Rich view for Olivia to use when making contact
-- ─────────────────────────────────────────────────────────────
create or replace view leads_for_olivia as
select
  id,
  created_at at time zone 'Pacific/Auckland' as created_nzt,
  contact,
  journey,
  score,
  source,
  lang,
  city,
  nz_duration,
  employed,
  heard_from,
  booking_need,
  booking_timeline,
  -- Pull key fields out of notes JSON for easy reading
  notes->>'quiz_band'       as quiz_band,
  notes->>'quiz_weak_areas' as quiz_weak_areas,
  notes->>'biggest_blocker' as biggest_blocker,
  notes->>'cv_band'         as cv_band,
  notes->>'cv_headline'     as cv_headline,
  notes->>'cv_key_insight'  as cv_key_insight,
  notes->>'cv_gaps'         as cv_gaps,
  notes->>'cv_strengths'    as cv_strengths,
  notes->>'cv_quick_wins'   as cv_quick_wins,
  notes->>'cv_next_step'    as cv_next_step,
  notes->>'pathway_type'    as pathway_type,
  notes->>'workplace_situation' as workplace_situation,
  notes->>'file_type'       as file_type
from leads
order by created_at desc;
