-- 30 observations — RS Floods 2024
-- Run order: 3 of 3 (requires 001 + 002)
-- Distribution: 10 complete · 10 partial · 10 minimal
-- Sources: citizen(16), drone(7), satellite(4), sensor(3)
-- photo_url uses picsum.photos as visual placeholder; replace with real bucket URLs for production.

DO $$
DECLARE
  cid  UUID := 'c0000000-0000-0000-0000-000000000001';
  sess UUID := 'f0000000-0000-0000-0000-000000000001';
BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE DAMAGE (10)  — critical infrastructure, high confidence
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Terminal Rodoviário — colapso parcial de cobertura
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000001',cid,'b1000000-0000-0000-0000-000000000001',
  'Terminal Rodoviário de Porto Alegre',
  'Cobertura metálica colapsada sobre plataformas 3-7. Acesso interditado. Estimativa: 800m² comprometidos.',
  'transport_comm','complete',TRUE,
  'https://picsum.photos/seed/obs01/800/600',
  -30.027750,-51.229000,'gps','drone',sess,'en',94,2,'active',
  '2024-05-01T08:30:00Z',
  '{"electricity_condition":"no_service","health_services":"not_functional","pressing_needs":["shelter","transport"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. CEEE Subestação Navegantes — inundação do painel elétrico
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000002',cid,'b1000000-0000-0000-0000-000000000012',
  'CEEE Subestação Navegantes',
  'Água atingiu 1,8m — transformadores submersos. Corte de energia para ~12.000 domicílios.',
  'utility','complete',FALSE,
  'https://picsum.photos/seed/obs02/800/600',
  -30.003950,-51.218800,'gps','satellite',sess,'en',97,3,'active',
  '2024-05-01T07:15:00Z',
  '{"electricity_condition":"no_service","pressing_needs":["electricity","water"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. Hospital Pronto Socorro — andar térreo inundado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000003',cid,'b1000000-0000-0000-0000-000000000011',
  'Hospital Pronto Socorro Municipal',
  'Pavimento térreo com 1,2m de água. UTI evacuada preventivamente. Equipamentos danificados.',
  'government','complete',FALSE,
  'https://picsum.photos/seed/obs03/800/600',
  -30.003150,-51.218400,'gps','drone',sess,'en',91,2,'active',
  '2024-05-01T09:45:00Z',
  '{"electricity_condition":"no_service","health_services":"not_functional","pressing_needs":["medical_care","water","electricity"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 4. Casa de Bombas DMAE — motor principal destruído
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000004',cid,'b1000000-0000-0000-0000-000000000013',
  'Casa de Bombas DMAE Navegantes',
  'Motor principal e bombas secundárias submersos. Abastecimento de água interrompido para o setor norte.',
  'utility','complete',TRUE,
  'https://picsum.photos/seed/obs04/800/600',
  -30.002450,-51.217700,'gps','sensor',sess,'en',89,1,'active',
  '2024-05-01T10:20:00Z',
  '{"electricity_condition":"no_service","pressing_needs":["water","sanitation"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 5. EMEF Escola Municipal Humaitá — estrutura comprometida
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000005',cid,'b1000000-0000-0000-0000-000000000014',
  'EMEF Escola Municipal Humaitá',
  'Muro de contenção colapsado. Lama e detritos cobrem toda a área interna. Estrutura interditada.',
  'government','complete',TRUE,
  'https://picsum.photos/seed/obs05/800/600',
  -29.998150,-51.213700,'gps','citizen',sess,'en',83,1,'active',
  '2024-05-01T11:00:00Z',
  '{"electricity_condition":"no_service","health_services":"not_functional","pressing_needs":["shelter","food","water"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. Viaduto da Rua Voluntários — pilares expostos
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000006',cid,NULL,
  'Viaduto Voluntários da Pátria',
  'Erosão severa nas fundações. Pilares P3 e P4 com trincas visíveis. Via interditada preventivamente.',
  'transport_comm','complete',TRUE,
  'https://picsum.photos/seed/obs06/800/600',
  -30.005000,-51.219000,'gps','drone',sess,'en',92,1,'active',
  '2024-05-01T12:30:00Z',
  '{"electricity_condition":"moderate_damage","pressing_needs":["transport"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 7. EMEF Escola Estadual Padre Reus — inundação total
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000007',cid,'b1000000-0000-0000-0000-000000000018',
  'EMEF Escola Estadual Padre Reus',
  'Água atingiu 2m no primeiro andar. Biblioteca, laboratório e quadra destruídos.',
  'government','complete',TRUE,
  'https://picsum.photos/seed/obs07/800/600',
  -29.997450,-51.180900,'gps','citizen',sess,'en',88,2,'active',
  '2024-05-01T13:15:00Z',
  '{"electricity_condition":"no_service","health_services":"not_functional","pressing_needs":["shelter","food","water","sanitation"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 8. Centro Comunitário Vila Rubem Berta — demolição necessária
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000008',cid,NULL,
  'Centro Comunitário Vila Rubem Berta',
  'Cobertura desabou. Paredes estruturais rachadas. Laudo técnico indica demolição necessária.',
  'community','complete',TRUE,
  'https://picsum.photos/seed/obs08/800/600',
  -29.993000,-51.172000,'gps','citizen',sess,'en',79,1,'active',
  '2024-05-01T14:00:00Z',
  '{"electricity_condition":"no_service","pressing_needs":["shelter","food","communication"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 9. Passarela Pedonal — Av. Farrapos
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000009',cid,NULL,
  'Passarela Pedonal Av. Farrapos',
  'Estrutura metálica retorcida pela força da correnteza. Queda parcial sobre a via.',
  'transport_comm','complete',TRUE,
  'https://picsum.photos/seed/obs09/800/600',
  -30.007000,-51.215000,'gps','satellite',sess,'en',95,1,'active',
  '2024-05-01T15:30:00Z',
  '{"pressing_needs":["transport"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 10. Estação de Tratamento de Esgoto — Ilha da Pintada
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000010',cid,NULL,
  'ETE Ilha da Pintada — DMAE',
  'Sistemas de tratamento primário e secundário inoperantes. Risco de contaminação do Guaíba.',
  'utility','complete',FALSE,
  'https://picsum.photos/seed/obs10/800/600',
  -29.985000,-51.220000,'gps','sensor',sess,'en',86,1,'active',
  '2024-05-01T16:00:00Z',
  '{"electricity_condition":"no_service","pressing_needs":["water","sanitation"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PARTIAL DAMAGE (10)  — mixed infrastructure, medium confidence
-- ═══════════════════════════════════════════════════════════════════════════════

-- 11. Posto de Saúde Cidade Baixa — andar térreo alagado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000011',cid,'b1000000-0000-0000-0000-000000000004',
  'Posto de Saúde Cidade Baixa',
  'Recepção e farmácia alagadas (40cm). Consultórios superiores operacionais. Atendimento parcial.',
  'government','partial',FALSE,
  'https://picsum.photos/seed/obs11/800/600',
  -30.041150,-51.222000,'gps','citizen',sess,'en',76,1,'active',
  '2024-05-01T09:00:00Z',
  '{"electricity_condition":"minor_damage","health_services":"partially_functional","pressing_needs":["medical_care","water"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 12. UBS Partenon — infiltrações e queda de energia
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000012',cid,'b1000000-0000-0000-0000-000000000019',
  'UBS Partenon',
  'Telhado com infiltrações em 30% da área. Gerador ativado. Vacinação suspensa temporariamente.',
  'government','partial',FALSE,
  'https://picsum.photos/seed/obs12/800/600',
  -30.049150,-51.184100,'gps','citizen',sess,'en',68,1,'active',
  '2024-05-01T10:45:00Z',
  '{"electricity_condition":"moderate_damage","health_services":"partially_functional","pressing_needs":["electricity","medical_care"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 13. Edifício Comercial Mauá — subsolo alagado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000013',cid,'b1000000-0000-0000-0000-000000000002',
  'Edifício Comercial Av. Mauá 1050',
  'Subsolo com 1,5m de água. Estacionamento destruído. Andares comerciais operacionais.',
  'commercial','partial',TRUE,
  'https://picsum.photos/seed/obs13/800/600',
  -30.028450,-51.230100,'gps','citizen',sess,'en',72,2,'active',
  '2024-05-01T11:30:00Z',
  '{"electricity_condition":"minor_damage","pressing_needs":["electricity"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 14. Supermercado Zaffari Moinhos — danos menores
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000014',cid,'b1000000-0000-0000-0000-000000000010',
  'Supermercado Zaffari Moinhos de Vento',
  'Seção de hortifrúti e frios inutilizados por falta de energia. Estrutura sem danos.',
  'commercial','partial',FALSE,
  'https://picsum.photos/seed/obs14/800/600',
  -30.019750,-51.210900,'gps','citizen',sess,'en',61,1,'active',
  '2024-05-01T12:00:00Z',
  '{"electricity_condition":"moderate_damage","pressing_needs":["electricity","food"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 15. Farmácia Popular Sarandi — estoque danificado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000015',cid,'b1000000-0000-0000-0000-000000000017',
  'Farmácia Popular Sarandi',
  'Água entrou pelo nível da rua. Estoque do piso danificado. Atendimento suspenso por 3 dias.',
  'commercial','partial',TRUE,
  'https://picsum.photos/seed/obs15/800/600',
  -29.998150,-51.180100,'gps','citizen',sess,'en',65,1,'active',
  '2024-05-01T13:00:00Z',
  '{"electricity_condition":"minor_damage","health_services":"partially_functional","pressing_needs":["medical_care"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 16. Ginásio Esportivo Municipal — quadra alagada
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000016',cid,NULL,
  'Ginásio Esportivo Municipal — Glória',
  'Quadra coberta com 60cm de água e lama. Arquibancadas intactas. Sendo usado como abrigo temporário.',
  'public_recreation','partial',TRUE,
  'https://picsum.photos/seed/obs16/800/600',
  -30.059000,-51.190000,'gps','drone',sess,'en',74,1,'active',
  '2024-05-01T14:30:00Z',
  '{"electricity_condition":"moderate_damage","pressing_needs":["shelter","food","water","sanitation"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 17. Residências Rua São Carlos — 3 casas afetadas
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000017',cid,'b1000000-0000-0000-0000-000000000015',
  'Residências — Rua São Carlos 120-140',
  '3 casas térreas com água até 80cm. Móveis e eletrodomésticos destruídos. Famílias desabrigadas.',
  'residential','partial',FALSE,
  'https://picsum.photos/seed/obs17/800/600',
  -30.016150,-51.215400,'gps','citizen',sess,'en',69,1,'active',
  '2024-05-01T15:00:00Z',
  '{"electricity_condition":"no_service","pressing_needs":["shelter","food","water"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 18. Residência Rua Garibaldi — porão alagado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000018',cid,'b1000000-0000-0000-0000-000000000006',
  'Residência — Rua Garibaldi 340',
  'Porão completamente alagado. Instalações elétricas comprometidas. Andar superior habitável.',
  'residential','partial',FALSE,
  'https://picsum.photos/seed/obs18/800/600',
  -30.031150,-51.208100,'gps','citizen',sess,'en',58,2,'active',
  '2024-05-01T16:00:00Z',
  '{"electricity_condition":"minor_damage","pressing_needs":["electricity"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 19. Igreja São José — criptoportico inundado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000019',cid,NULL,
  'Igreja São José — Anchieta',
  'Salão paroquial alagado. Nave principal sem danos. Sendo usada como ponto de distribuição.',
  'community','partial',FALSE,
  'https://picsum.photos/seed/obs19/800/600',
  -30.030000,-51.235000,'gps','citizen',sess,'en',55,1,'active',
  '2024-05-01T17:00:00Z',
  '{"electricity_condition":"minor_damage","pressing_needs":["food","water","shelter"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 20. Residência Av. Ipiranga — rachaduras
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000020',cid,'b1000000-0000-0000-0000-000000000020',
  'Residência — Av. Ipiranga 2340',
  'Recalque diferencial causando rachaduras na alvenaria. Laudo pendente. Moradores em alerta.',
  'residential','partial',FALSE,
  'https://picsum.photos/seed/obs20/800/600',
  -30.010150,-51.172100,'manual_pin','citizen',sess,'en',62,1,'active',
  '2024-05-01T18:00:00Z',
  '{"electricity_condition":"no_damage","pressing_needs":["shelter"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MINIMAL DAMAGE (10)  — mostly residential, low-confidence, surface damage only
-- ═══════════════════════════════════════════════════════════════════════════════

-- 21. Residência Rua Fernandes Vieira — umidade
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000021',cid,'b1000000-0000-0000-0000-000000000007',
  'Residência — Rua Fernandes Vieira 230',
  'Umidade nas paredes do porão. Nenhum dano estrutural. Moradores em casa.',
  'residential','minimal',FALSE,
  'https://picsum.photos/seed/obs21/800/600',
  -30.030450,-51.208900,'gps','citizen',sess,'en',42,1,'active',
  '2024-05-01T09:30:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 22. Padaria Central — pequena infiltração
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000022',cid,NULL,
  'Padaria Central — Moinhos de Vento',
  'Pequena infiltração pela porta lateral. Produção normal. Dano cosmético apenas.',
  'commercial','minimal',FALSE,
  'https://picsum.photos/seed/obs22/800/600',
  -30.020000,-51.211000,'gps','citizen',sess,'en',35,1,'active',
  '2024-05-01T10:00:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 23. Residência Rua Mostardeiro — jardim danificado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000023',cid,'b1000000-0000-0000-0000-000000000009',
  'Residência — Rua Mostardeiro 560',
  'Jardim frontal destruído pela enxurrada. Calçada danificada. Casa sem danos internos.',
  'residential','minimal',FALSE,
  'https://picsum.photos/seed/obs23/800/600',
  -30.019150,-51.210200,'gps','citizen',sess,'en',38,1,'active',
  '2024-05-01T11:00:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 24. Clínica Médica — estacionamento alagado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000024',cid,NULL,
  'Clínica Médica — Rua Ramiro Barcelos 1800',
  'Estacionamento com 20cm de água. Clínica operacional. Acesso por entrada alternativa.',
  'government','minimal',FALSE,
  'https://picsum.photos/seed/obs24/800/600',
  -30.022000,-51.218000,'gps','citizen',sess,'en',48,1,'active',
  '2024-05-01T11:30:00Z',
  '{"electricity_condition":"no_damage","health_services":"fully_functional"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 25. Residência Av. Ipiranga — calçada
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000025',cid,NULL,
  'Residência — Av. Ipiranga 1450',
  'Calçada e muro frontal danificados pela enxurrada. Nenhum dano à habitação.',
  'residential','minimal',FALSE,
  'https://picsum.photos/seed/obs25/800/600',
  -30.049000,-51.184000,'gps','citizen',sess,'en',45,1,'active',
  '2024-05-01T12:30:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 26. Colégio Farroupilha — pátio com lama
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000026',cid,'b1000000-0000-0000-0000-000000000016',
  'Colégio Farroupilha — Independência',
  'Pátio externo coberto de lama (5cm). Salas de aula sem danos. Aulas suspensas por 2 dias.',
  'government','minimal',TRUE,
  'https://picsum.photos/seed/obs26/800/600',
  -30.016950,-51.216100,'gps','drone',sess,'en',55,1,'active',
  '2024-05-01T13:00:00Z',
  '{"electricity_condition":"no_damage","health_services":"fully_functional"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 27. Residência Rua Silva Só — vidro quebrado
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000027',cid,'b1000000-0000-0000-0000-000000000008',
  'Residência — Rua Silva Só 430',
  'Janela lateral quebrada pela força do vento/água. Casa habitável. Família permaneceu.',
  'residential','minimal',FALSE,
  'https://picsum.photos/seed/obs27/800/600',
  -30.031750,-51.208500,'gps','citizen',sess,'en',32,1,'active',
  '2024-05-01T14:00:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 28. Residência Rua Barros Cassal
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000028',cid,'b1000000-0000-0000-0000-000000000005',
  'Residência — Rua Barros Cassal 780',
  'Rede elétrica da garagem desligada preventivamente. Nenhum contato com água. Precaução apenas.',
  'residential','minimal',FALSE,
  'https://picsum.photos/seed/obs28/800/600',
  -30.039950,-51.222700,'gps','citizen',sess,'en',29,1,'active',
  '2024-05-01T15:30:00Z',
  '{"electricity_condition":"minor_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 29. Bar e Restaurante — Av. Loureiro da Silva
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000029',cid,'b1000000-0000-0000-0000-000000000003',
  'Bar e Restaurante — Av. Loureiro da Silva 500',
  'Calçada frontal danificada. Estabelecimento fechado preventivamente. Estrutura OK.',
  'commercial','minimal',FALSE,
  'https://picsum.photos/seed/obs29/800/600',
  -30.026750,-51.228400,'gps','citizen',sess,'en',41,1,'active',
  '2024-05-01T16:30:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 30. Área de lazer Parque da Redenção — árvores caídas
INSERT INTO observations (id,crisis_id,building_id,infrastructure_name,infrastructure_description,infrastructure_type,damage_level,debris_clearing_needed,photo_url,latitude,longitude,location_method,source,session_id,language,confidence,version_number,status,client_created_at,modular_fields)
VALUES ('a0000000-0000-0000-0000-000000000030',cid,NULL,
  'Parque da Redenção — Área Central',
  '3 árvores caídas bloqueando trilha principal. Lago transbordou. Nenhuma estrutura permanente danificada.',
  'public_recreation','minimal',TRUE,
  'https://picsum.photos/seed/obs30/800/600',
  -30.033000,-51.213000,'satellite','satellite',sess,'en',51,1,'active',
  '2024-05-02T08:00:00Z',
  '{"electricity_condition":"no_damage"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

END $$;
