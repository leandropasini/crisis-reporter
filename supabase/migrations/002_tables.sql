-- ── PostGIS (requerido pelo trigger update_area_stats via ST_GeoHash) ──────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── crises ────────────────────────────────────────────────────────────────────
CREATE TABLE crises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  nature            crisis_nature NOT NULL,
  subtype           crisis_subtype NOT NULL,
  location_name     TEXT NOT NULL,
  bbox_sw_lat       NUMERIC(9,6),
  bbox_sw_lng       NUMERIC(9,6),
  bbox_ne_lat       NUMERIC(9,6),
  bbox_ne_lng       NUMERIC(9,6),
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ,
  status            crisis_status NOT NULL DEFAULT 'active',
  -- Geohash adaptativo: 5=~5km² rural, 6=~1.2km² urbano (default), 7=~150m² denso
  geohash_precision INTEGER NOT NULL DEFAULT 6
    CHECK (geohash_precision BETWEEN 4 AND 8),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crises_status ON crises(status);

-- ── buildings ─────────────────────────────────────────────────────────────────
CREATE TABLE buildings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id     UUID NOT NULL REFERENCES crises(id),
  osm_id        TEXT,
  geojson       JSONB NOT NULL,
  centroid_lat  NUMERIC(9,6) NOT NULL,
  centroid_lng  NUMERIC(9,6) NOT NULL,
  address       TEXT,
  name          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buildings_crisis   ON buildings(crisis_id);
CREATE INDEX idx_buildings_centroid ON buildings(centroid_lat, centroid_lng);

-- ── observations (particionada por crisis_id) ─────────────────────────────────
CREATE TABLE observations (
  id                         UUID NOT NULL DEFAULT gen_random_uuid(),
  crisis_id                  UUID NOT NULL REFERENCES crises(id),

  building_id                UUID REFERENCES buildings(id),
  infrastructure_name        TEXT NOT NULL,
  infrastructure_description TEXT,

  infrastructure_type        infrastructure_type NOT NULL,
  infrastructure_type_other  TEXT,
  damage_level               damage_level NOT NULL,
  debris_clearing_needed     BOOLEAN NOT NULL DEFAULT FALSE,

  photo_url                  TEXT NOT NULL,
  photo_thumbnail_url        TEXT,
  latitude                   NUMERIC(9,6) NOT NULL,
  longitude                  NUMERIC(9,6) NOT NULL,
  location_method            TEXT NOT NULL DEFAULT 'gps',

  source                     observation_source NOT NULL DEFAULT 'citizen',

  session_id                 UUID NOT NULL,
  is_proxy                   BOOLEAN NOT NULL DEFAULT FALSE,
  proxy_description          TEXT,

  language                   un_language NOT NULL DEFAULT 'en',

  confidence                 INTEGER NOT NULL DEFAULT 30
    CHECK (confidence BETWEEN 0 AND 100),

  version_number             INTEGER NOT NULL DEFAULT 1,
  -- FK omitida: partitioned table PK é (id, crisis_id); FK em id sozinho é inválida no PG
  superseded_by              UUID,
  status                     observation_status NOT NULL DEFAULT 'active',

  client_created_at          TIMESTAMPTZ NOT NULL,
  synced_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  modular_fields             JSONB DEFAULT '{}'::jsonb,

  PRIMARY KEY (id, crisis_id)
) PARTITION BY LIST (crisis_id);

CREATE INDEX idx_obs_crisis_damage ON observations(crisis_id, damage_level);
CREATE INDEX idx_obs_crisis_type   ON observations(crisis_id, infrastructure_type);
CREATE INDEX idx_obs_crisis_status ON observations(crisis_id, status);
CREATE INDEX idx_obs_building      ON observations(building_id) WHERE building_id IS NOT NULL;
CREATE INDEX idx_obs_location      ON observations(latitude, longitude);
CREATE INDEX idx_obs_created       ON observations(created_at DESC);
CREATE INDEX idx_obs_session       ON observations(session_id);

-- Partição default obrigatória antes de qualquer insert
CREATE TABLE observations_default PARTITION OF observations DEFAULT;

-- ── area_stats ────────────────────────────────────────────────────────────────
CREATE TABLE area_stats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id         UUID NOT NULL REFERENCES crises(id),
  geohash           TEXT NOT NULL,
  observation_count INTEGER NOT NULL DEFAULT 0,
  complete_count    INTEGER NOT NULL DEFAULT 0,
  partial_count     INTEGER NOT NULL DEFAULT 0,
  minimal_count     INTEGER NOT NULL DEFAULT 0,
  last_updated      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(crisis_id, geohash)
);

CREATE INDEX idx_area_stats_crisis ON area_stats(crisis_id);

-- ── Storage: bucket observation-photos ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('observation-photos', 'observation-photos', true)
ON CONFLICT (id) DO NOTHING;
