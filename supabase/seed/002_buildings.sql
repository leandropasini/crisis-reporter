-- 20 building footprints — Porto Alegre, RS
-- Run order: 2 of 3 (requires 001_crisis.sql)
-- Polygons are simplified rectangles (~20m × 10m) for MVP; replace with real OSM data for production.

DO $$
DECLARE
  cid UUID := 'c0000000-0000-0000-0000-000000000001';
BEGIN

-- ── Centro Histórico ──────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000001', cid, 'osm-411201',
  '{"type":"Polygon","coordinates":[[[-51.229100,-30.027800],[-51.228900,-30.027800],[-51.228900,-30.027700],[-51.229100,-30.027700],[-51.229100,-30.027800]]]}',
  -30.027750, -51.229000,
  'Rua dos Andradas 1234, Centro Histórico', 'Terminal Rodoviário de Porto Alegre'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000002', cid, 'osm-411202',
  '{"type":"Polygon","coordinates":[[[-51.230200,-30.028500],[-51.230000,-30.028500],[-51.230000,-30.028400],[-51.230200,-30.028400],[-51.230200,-30.028500]]]}',
  -30.028450, -51.230100,
  'Av. Mauá 1050, Centro', 'Edifício Comercial Mauá'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000003', cid, 'osm-411203',
  '{"type":"Polygon","coordinates":[[[-51.228500,-30.026800],[-51.228300,-30.026800],[-51.228300,-30.026700],[-51.228500,-30.026700],[-51.228500,-30.026800]]]}',
  -30.026750, -51.228400,
  'Av. Loureiro da Silva 500, Centro', NULL
) ON CONFLICT (id) DO NOTHING;

-- ── Cidade Baixa ──────────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000004', cid, 'osm-411204',
  '{"type":"Polygon","coordinates":[[[-51.222100,-30.041200],[-51.221900,-30.041200],[-51.221900,-30.041100],[-51.222100,-30.041100],[-51.222100,-30.041200]]]}',
  -30.041150, -51.222000,
  'Rua Felipe Camarão 300, Cidade Baixa', 'Posto de Saúde Cidade Baixa'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000005', cid, 'osm-411205',
  '{"type":"Polygon","coordinates":[[[-51.222800,-30.040000],[-51.222600,-30.040000],[-51.222600,-30.039900],[-51.222800,-30.039900],[-51.222800,-30.040000]]]}',
  -30.039950, -51.222700,
  'Rua Barros Cassal 780, Cidade Baixa', NULL
) ON CONFLICT (id) DO NOTHING;

-- ── Bom Fim ───────────────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000006', cid, 'osm-411206',
  '{"type":"Polygon","coordinates":[[[-51.208200,-30.031200],[-51.208000,-30.031200],[-51.208000,-30.031100],[-51.208200,-30.031100],[-51.208200,-30.031200]]]}',
  -30.031150, -51.208100,
  'Rua Garibaldi 340, Bom Fim', NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000007', cid, 'osm-411207',
  '{"type":"Polygon","coordinates":[[[-51.209000,-30.030500],[-51.208800,-30.030500],[-51.208800,-30.030400],[-51.209000,-30.030400],[-51.209000,-30.030500]]]}',
  -30.030450, -51.208900,
  'Rua Fernandes Vieira 230, Bom Fim', NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000008', cid, 'osm-411208',
  '{"type":"Polygon","coordinates":[[[-51.208600,-30.031800],[-51.208400,-30.031800],[-51.208400,-30.031700],[-51.208600,-30.031700],[-51.208600,-30.031800]]]}',
  -30.031750, -51.208500,
  'Rua Silva Só 430, Bom Fim', NULL
) ON CONFLICT (id) DO NOTHING;

-- ── Moinhos de Vento ─────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000009', cid, 'osm-411209',
  '{"type":"Polygon","coordinates":[[[-51.210300,-30.019200],[-51.210100,-30.019200],[-51.210100,-30.019100],[-51.210300,-30.019100],[-51.210300,-30.019200]]]}',
  -30.019150, -51.210200,
  'Rua Mostardeiro 560, Moinhos de Vento', NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000010', cid, 'osm-411210',
  '{"type":"Polygon","coordinates":[[[-51.211000,-30.019800],[-51.210800,-30.019800],[-51.210800,-30.019700],[-51.211000,-30.019700],[-51.211000,-30.019800]]]}',
  -30.019750, -51.210900,
  'Av. Independência 1200, Moinhos de Vento', 'Supermercado Zaffari Moinhos'
) ON CONFLICT (id) DO NOTHING;

-- ── Navegantes / Humaitá (área mais afetada) ──────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000011', cid, 'osm-411211',
  '{"type":"Polygon","coordinates":[[[-51.218500,-30.003200],[-51.218300,-30.003200],[-51.218300,-30.003100],[-51.218500,-30.003100],[-51.218500,-30.003200]]]}',
  -30.003150, -51.218400,
  'Av. Presidente Roosevelt 300, Navegantes', 'Hospital Pronto Socorro Municipal'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000012', cid, 'osm-411212',
  '{"type":"Polygon","coordinates":[[[-51.218900,-30.004000],[-51.218700,-30.004000],[-51.218700,-30.003900],[-51.218900,-30.003900],[-51.218900,-30.004000]]]}',
  -30.003950, -51.218800,
  'Rua Voluntários da Pátria 2200, Navegantes', 'CEEE Subestação Navegantes'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000013', cid, 'osm-411213',
  '{"type":"Polygon","coordinates":[[[-51.217800,-30.002500],[-51.217600,-30.002500],[-51.217600,-30.002400],[-51.217800,-30.002400],[-51.217800,-30.002500]]]}',
  -30.002450, -51.217700,
  'Rua Cairu 150, Navegantes', 'Casa de Bombas DMAE Navegantes'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000014', cid, 'osm-411214',
  '{"type":"Polygon","coordinates":[[[-51.213800,-29.998200],[-51.213600,-29.998200],[-51.213600,-29.998100],[-51.213800,-29.998100],[-51.213800,-29.998200]]]}',
  -29.998150, -51.213700,
  'Av. General Olímpio Mourão Filho 100, Humaitá', 'EMEF Escola Municipal Humaitá'
) ON CONFLICT (id) DO NOTHING;

-- ── Independência ─────────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000015', cid, 'osm-411215',
  '{"type":"Polygon","coordinates":[[[-51.215500,-30.016200],[-51.215300,-30.016200],[-51.215300,-30.016100],[-51.215500,-30.016100],[-51.215500,-30.016200]]]}',
  -30.016150, -51.215400,
  'Rua São Carlos 120, Independência', NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000016', cid, 'osm-411216',
  '{"type":"Polygon","coordinates":[[[-51.216200,-30.017000],[-51.216000,-30.017000],[-51.216000,-30.016900],[-51.216200,-30.016900],[-51.216200,-30.017000]]]}',
  -30.016950, -51.216100,
  'Rua Prof. Freitas Castro 80, Independência', 'Colégio Farroupilha'
) ON CONFLICT (id) DO NOTHING;

-- ── Sarandi / Rubem Berta ─────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000017', cid, 'osm-411217',
  '{"type":"Polygon","coordinates":[[[-51.180200,-29.998200],[-51.180000,-29.998200],[-51.180000,-29.998100],[-51.180200,-29.998100],[-51.180200,-29.998200]]]}',
  -29.998150, -51.180100,
  'Av. Assis Brasil 6540, Sarandi', 'Farmácia Popular Sarandi'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000018', cid, 'osm-411218',
  '{"type":"Polygon","coordinates":[[[-51.181000,-29.997500],[-51.180800,-29.997500],[-51.180800,-29.997400],[-51.181000,-29.997400],[-51.181000,-29.997500]]]}',
  -29.997450, -51.180900,
  'Av. Assis Brasil 7200, Sarandi', 'EMEF Escola Estadual Padre Reus'
) ON CONFLICT (id) DO NOTHING;

-- ── Partenon / Glória ─────────────────────────────────────────────────────────

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000019', cid, 'osm-411219',
  '{"type":"Polygon","coordinates":[[[-51.184200,-30.049200],[-51.184000,-30.049200],[-51.184000,-30.049100],[-51.184200,-30.049100],[-51.184200,-30.049200]]]}',
  -30.049150, -51.184100,
  'Rua Gonçalves Dias 800, Partenon', 'UBS Partenon'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, crisis_id, osm_id, geojson, centroid_lat, centroid_lng, address, name)
VALUES (
  'b1000000-0000-0000-0000-000000000020', cid, 'osm-411220',
  '{"type":"Polygon","coordinates":[[[-51.172200,-30.010200],[-51.172000,-30.010200],[-51.172000,-30.010100],[-51.172200,-30.010100],[-51.172200,-30.010200]]]}',
  -30.010150, -51.172100,
  'Av. Ipiranga 2340, Vila Ipiranga', NULL
) ON CONFLICT (id) DO NOTHING;

END $$;
