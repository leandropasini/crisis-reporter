-- ── Trigger: confiança por triangulação geográfica ────────────────────────────
-- ABS(lat - lat) < 0.001 ≈ 100m (aproximação MVP; produção: ST_DWithin + PostGIS)
CREATE OR REPLACE FUNCTION calculate_confidence()
RETURNS TRIGGER AS $$
DECLARE
  nearby_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO nearby_count
  FROM observations
  WHERE
    crisis_id = NEW.crisis_id
    AND status = 'active'
    AND id != NEW.id
    AND ABS(latitude  - NEW.latitude)  < 0.001
    AND ABS(longitude - NEW.longitude) < 0.001;

  NEW.confidence := CASE
    WHEN nearby_count >= 3 THEN 85
    WHEN nearby_count = 2  THEN 65
    WHEN nearby_count = 1  THEN 45
    ELSE 30
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_confidence
BEFORE INSERT ON observations
FOR EACH ROW EXECUTE FUNCTION calculate_confidence();

-- ── Trigger: versionamento de observação ──────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_observation_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.building_id IS NOT NULL THEN
    UPDATE observations
    SET
      status        = 'superseded',
      superseded_by = NEW.id
    WHERE
      building_id = NEW.building_id
      AND crisis_id = NEW.crisis_id
      AND status = 'active'
      AND id != NEW.id;

    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM observations
    WHERE building_id = NEW.building_id
      AND crisis_id = NEW.crisis_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_observation_version
BEFORE INSERT ON observations
FOR EACH ROW EXECUTE FUNCTION handle_observation_version();

-- ── Trigger: atualizar area_stats após insert ─────────────────────────────────
-- Usa ST_GeoHash (PostGIS). Se PostGIS indisponível, calcule geohash no cliente
-- e passe via campo adicional antes do insert — remova ST_GeoHash daqui.
CREATE OR REPLACE FUNCTION update_area_stats()
RETURNS TRIGGER AS $$
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

CREATE TRIGGER trg_area_stats
AFTER INSERT ON observations
FOR EACH ROW EXECUTE FUNCTION update_area_stats();
