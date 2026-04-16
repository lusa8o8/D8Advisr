-- Migration: add OSM-specific columns to raw_venues
-- Required before deploying the scrape-venues edge function.

ALTER TABLE raw_venues
  ADD COLUMN IF NOT EXISTS osm_id      TEXT,
  ADD COLUMN IF NOT EXISTS raw_phone   TEXT,
  ADD COLUMN IF NOT EXISTS raw_website TEXT,
  ADD COLUMN IF NOT EXISTS raw_cuisine TEXT;

-- Unique index so the edge function can upsert without duplicating on re-runs
CREATE UNIQUE INDEX IF NOT EXISTS raw_venues_osm_id_idx
  ON raw_venues (osm_id)
  WHERE osm_id IS NOT NULL;
