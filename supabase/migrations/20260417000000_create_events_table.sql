-- Migration: create events table for manual event entry
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  vibe_tags   TEXT[]        NOT NULL DEFAULT '{}',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency    TEXT          NOT NULL DEFAULT 'ZMW',
  starts_at   TIMESTAMPTZ   NOT NULL,
  ends_at     TIMESTAMPTZ,
  source      TEXT          NOT NULL DEFAULT 'manual',
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_venue_id_idx  ON events (venue_id);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events (starts_at DESC);
