-- 008_crisis_setup.sql

-- ── Extend crisis_subtype enum ────────────────────────────────────────────────
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'landslide' AFTER 'wildfire';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'drought'   AFTER 'landslide';

-- ── Add description column to crises ─────────────────────────────────────────
ALTER TABLE crises ADD COLUMN IF NOT EXISTS description TEXT;

-- ── Allow anon to INSERT crises (crisis setup in live mode) ───────────────────
CREATE POLICY "crises_insert_anon"
  ON crises FOR INSERT TO anon
  WITH CHECK (true);
