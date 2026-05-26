-- RS Floods 2024 — seed crisis
-- Run order: 1 of 3
-- Crisis ID is fixed so .env VITE_DEMO_CRISIS_ID can reference it.

INSERT INTO crises (
  id,
  name,
  nature,
  subtype,
  location_name,
  bbox_sw_lat,
  bbox_sw_lng,
  bbox_ne_lat,
  bbox_ne_lng,
  started_at,
  status,
  geohash_precision,
  created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'RS Floods 2024',
  'natural',
  'flood',
  'Porto Alegre, RS, Brasil',
  -30.100000,
  -51.300000,
  -29.950000,
  -51.100000,
  '2024-05-01T00:00:00Z',
  'active',
  6,
  '2024-05-01T00:00:00Z'
) ON CONFLICT (id) DO NOTHING;
