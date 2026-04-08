-- ============================================================
-- 002_finder_integration.sql
-- Aligns the schools table with the Meridian Finder data model
-- so programs can be sent from the Finder into the Tracker.
--
-- This migration is fully idempotent — every step uses
-- IF EXISTS / IF NOT EXISTS so re-running on an already-migrated
-- database is safe (which is exactly what happened on the
-- crna-path-tracker live DB: the changes were applied manually
-- via the SQL editor before this file was committed).
--
-- Net effect:
--   1. program_name becomes the canonical school identifier
--      (the Notion source of truth has no separate institution
--      name — the program title contains both, e.g. "Texas
--      Wesleyan University Graduate Programs of Nurse Anesthesia").
--   2. ICU requirement switches from hours to years (the Notion
--      source uses years and most schools state requirements that way).
--   3. Adds requires_gre, min_shadowing_hours, rolling_admissions
--      so the per-school checklist can use accurate program rules
--      instead of inferring them.
--   4. source_program_id seeds a future shared End Tidal data layer.
--
-- Order matters: add new columns first, then backfill from old
-- columns (only if both still exist), then enforce constraints,
-- then drop old columns.
-- ============================================================

-- Step 1: add new columns
alter table schools add column if not exists icu_years_required numeric(3,1);
alter table schools add column if not exists requires_gre boolean default false;
alter table schools add column if not exists min_shadowing_hours integer;
alter table schools add column if not exists rolling_admissions boolean default false;
alter table schools add column if not exists source_program_id text;

-- Step 2: backfill program_name from the legacy "name" column,
-- but only if "name" still exists. On the live DB it has already
-- been dropped; this DO block makes the migration safe to re-run
-- on databases that still have the old column.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'schools'
      and column_name = 'name'
  ) then
    update schools set program_name = name where program_name is null;
  end if;
end $$;

-- Step 3: backfill icu_years_required from min_icu_hours
-- (assuming a 40-hour week, ~2080 hours/year FT). Same idempotency
-- guard — only runs if min_icu_hours hasn't been dropped yet.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'schools'
      and column_name = 'min_icu_hours'
  ) then
    update schools
      set icu_years_required = round((min_icu_hours / 2080.0)::numeric, 1)
      where min_icu_hours is not null and icu_years_required is null;
  end if;
end $$;

-- Step 4: enforce program_name not null (a no-op if it's already
-- not-nullable; ALTER COLUMN SET NOT NULL is idempotent in postgres
-- so this is safe to re-run).
alter table schools alter column program_name set not null;

-- Step 5: drop legacy columns (safe to re-run thanks to IF EXISTS).
alter table schools drop column if exists name;
alter table schools drop column if exists min_icu_hours;
