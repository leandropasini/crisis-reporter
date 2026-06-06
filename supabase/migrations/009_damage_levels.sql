-- 009_damage_levels.sql

-- ── Change 1: Migrate 'severe' damage records → 'complete' (UNDP 3-level spec) ──
-- damage_level column is TEXT (converted in 006), so no enum manipulation needed.
UPDATE observations SET damage_level = 'complete' WHERE damage_level = 'severe';

-- ── Change 2: New crisis subtypes ────────────────────────────────────────────────
-- These were added in 001_enums.sql already; ADD VALUE IF NOT EXISTS is idempotent.
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'tsunami'           AFTER 'wildfire';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'conflict'          AFTER 'civil_unrest';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'civil_unrest'      AFTER 'conflict';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'explosion'         AFTER 'civil_unrest';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'chemical_incident' AFTER 'explosion';

-- ── Change 3: infrastructure_name column ─────────────────────────────────────────
-- Already created in 002_tables.sql; this is a no-op safety net.
ALTER TABLE observations         ADD COLUMN IF NOT EXISTS infrastructure_name TEXT NOT NULL DEFAULT '';
ALTER TABLE observations_default ADD COLUMN IF NOT EXISTS infrastructure_name TEXT NOT NULL DEFAULT '';
