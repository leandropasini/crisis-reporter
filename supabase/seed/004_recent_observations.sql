-- 8 recent observations for demo/video — timestamps in last 48h
-- Run in Supabase SQL editor after 001_crisis.sql and 002_tables.sql
-- Crisis: c0000000-0000-0000-0000-000000000001 (RS Floods 2024)

DO $$
DECLARE
  cid  UUID := 'c0000000-0000-0000-0000-000000000001';
  sess UUID := 'f0000000-0000-0000-0000-000000000099';
BEGIN

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000001',cid,'UPA 24h — Av. Bento Gonçalves','health_center','complete',FALSE,'https://picsum.photos/seed/r01/800/600',-30.0280,-51.2180,'gps','citizen',sess,'pt',88,1,'active',NOW() - INTERVAL '2 hours','{"health_services":"not_functional","pressing_needs":["medical_care"]}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000002',cid,'Residência — Rua dos Andradas 550','residential','severe',FALSE,'https://picsum.photos/seed/r02/800/600',-30.0310,-51.2210,'gps','citizen',sess,'pt',73,1,'active',NOW() - INTERVAL '4 hours','{"electricity_condition":"no_service","pressing_needs":["shelter","water"]}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000003',cid,'Residência — Rua Sete de Setembro 210','residential','partial',FALSE,'https://picsum.photos/seed/r03/800/600',-30.0295,-51.2195,'gps','citizen',sess,'pt',61,1,'active',NOW() - INTERVAL '6 hours','{"electricity_condition":"moderate_damage"}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000004',cid,'EMEF Escola Municipal Irmão Pedro','school','severe',TRUE,'https://picsum.photos/seed/r04/800/600',-30.0180,-51.1980,'gps','drone',sess,'pt',85,2,'active',NOW() - INTERVAL '8 hours','{"electricity_condition":"no_service","pressing_needs":["shelter","food"]}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000005',cid,'Residência — Rua Barão do Amazonas 340','residential','partial',FALSE,'https://picsum.photos/seed/r05/800/600',-30.0200,-51.2010,'manual_pin','citizen',sess,'pt',55,1,'active',NOW() - INTERVAL '12 hours','{"electricity_condition":"minor_damage"}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000006',cid,'Subestação CEEE — Navegantes','utility','severe',FALSE,'https://picsum.photos/seed/r06/800/600',-30.0350,-51.2290,'gps','sensor',sess,'pt',92,1,'active',NOW() - INTERVAL '16 hours','{"electricity_condition":"no_service","pressing_needs":["electricity","water"]}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000007',cid,'Galeria Comercial — Av. Farrapos 1200','commercial','partial',TRUE,'https://picsum.photos/seed/r07/800/600',-30.0370,-51.2310,'gps','citizen',sess,'pt',67,1,'active',NOW() - INTERVAL '20 hours','{"electricity_condition":"moderate_damage"}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (id,crisis_id,infrastructure_name,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('d0000000-0000-0000-0000-000000000008',cid,'Residência — Rua Cristóvão Colombo 800','residential','minimal',FALSE,'https://picsum.photos/seed/r08/800/600',-30.0420,-51.2150,'gps','citizen',sess,'pt',38,1,'active',NOW() - INTERVAL '24 hours','{"electricity_condition":"no_damage"}'::jsonb) ON CONFLICT (id) DO NOTHING;

END $$;
