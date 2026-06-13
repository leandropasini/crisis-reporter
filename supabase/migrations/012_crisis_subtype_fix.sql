-- Add landslide and drought to crisis_subtype enum so it covers all 11
-- UNDP-spec disaster types (DisasterType already had both, subtype didn't).
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'landslide' AFTER 'hurricane_cyclone';
ALTER TYPE crisis_subtype ADD VALUE IF NOT EXISTS 'drought' AFTER 'landslide';
