-- ── observations.is_demo (missed in v0.4) ─────────────────────────────────────
ALTER TABLE observations_default ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE observations        ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- ── damage_level: enum → text ─────────────────────────────────────────────────
-- Add 'severe' to enum first (added in frontend but never migrated to DB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'severe'
      AND enumtypid = 'damage_level'::regtype
  ) THEN
    ALTER TYPE damage_level ADD VALUE 'severe' AFTER 'partial';
  END IF;
END $$;

-- Convert column to text so dynamic values (flood_partial, eq_hairline, etc.) can be stored.
-- Partitioned table: alter parent; Postgres cascades to partitions automatically.
ALTER TABLE observations ALTER COLUMN damage_level TYPE text USING damage_level::text;

-- Drop the now-unused enum type (only observations used it)
DROP TYPE damage_level;

-- ── crises.disaster_type ──────────────────────────────────────────────────────
ALTER TABLE crises ADD COLUMN IF NOT EXISTS disaster_type text NOT NULL DEFAULT 'generic';

-- Porto Alegre RS Floods 2024 → flood
UPDATE crises
SET disaster_type = 'flood'
WHERE id = 'f58c928d-9fc7-4499-8987-f8f4f92924ed';

-- ── RLS: allow anon to update crises (operator function for evaluator) ─────────
CREATE POLICY "crises_update_anon"
  ON crises FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── Seed: mark existing observations as demo data ─────────────────────────────
UPDATE observations
SET is_demo = TRUE
WHERE crisis_id = 'f58c928d-9fc7-4499-8987-f8f4f92924ed'
  AND client_created_at < NOW() - INTERVAL '1 day';
