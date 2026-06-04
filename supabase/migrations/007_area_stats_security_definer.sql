-- Fix update_area_stats trigger: add SECURITY DEFINER so it runs as owner
-- (bypasses area_stats RLS that requires service_role), not as anon caller.
CREATE OR REPLACE FUNCTION update_area_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_geohash   TEXT;
  v_precision INTEGER;
BEGIN
  SELECT geohash_precision INTO v_precision FROM crises WHERE id = NEW.crisis_id;
  v_geohash := ST_GeoHash(ST_Point(NEW.longitude, NEW.latitude), v_precision);

  INSERT INTO area_stats (crisis_id, geohash, observation_count,
    complete_count, partial_count, minimal_count, last_updated)
  VALUES (
    NEW.crisis_id, v_geohash, 1,
    CASE WHEN NEW.damage_level = 'complete' THEN 1 ELSE 0 END,
    CASE WHEN NEW.damage_level = 'partial'  THEN 1 ELSE 0 END,
    CASE WHEN NEW.damage_level = 'minimal'  THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (crisis_id, geohash) DO UPDATE SET
    observation_count = area_stats.observation_count + 1,
    complete_count    = area_stats.complete_count +
      CASE WHEN NEW.damage_level = 'complete' THEN 1 ELSE 0 END,
    partial_count     = area_stats.partial_count +
      CASE WHEN NEW.damage_level = 'partial'  THEN 1 ELSE 0 END,
    minimal_count     = area_stats.minimal_count +
      CASE WHEN NEW.damage_level = 'minimal'  THEN 1 ELSE 0 END,
    last_updated      = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
