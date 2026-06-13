-- Nível de dano (3 níveis do edital)
CREATE TYPE damage_level AS ENUM (
  'minimal',   -- Minimal / No damage
  'partial',   -- Partially damaged
  'complete'   -- Completely damaged
);

-- Tipo de infraestrutura (7 categorias + other)
CREATE TYPE infrastructure_type AS ENUM (
  'residential',
  'commercial',
  'government',
  'utility',
  'transport_comm',
  'community',
  'public_recreation',
  'other'
);

-- Natureza da crise
CREATE TYPE crisis_nature AS ENUM (
  'natural',
  'technological',
  'human_made'
);

-- Subtipo de crise
CREATE TYPE crisis_subtype AS ENUM (
  'earthquake',
  'flood',
  'tsunami',
  'hurricane_cyclone',
  'wildfire',
  'explosion',
  'chemical_incident',
  'conflict',
  'civil_unrest'
);

-- Fonte da observação
CREATE TYPE observation_source AS ENUM (
  'citizen',
  'drone',
  'satellite',
  'sensor'
);

-- Status da observação
CREATE TYPE observation_status AS ENUM (
  'active',
  'superseded',
  'flagged'
);

-- Status da crise
CREATE TYPE crisis_status AS ENUM (
  'active',
  'monitoring',
  'closed'
);

-- 6 idiomas ONU
CREATE TYPE un_language AS ENUM (
  'ar',
  'zh',
  'en',
  'fr',
  'ru',
  'es'
);
