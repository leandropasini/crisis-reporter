-- ── observations ──────────────────────────────────────────────────────────────
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (relatório anônimo de cidadão)
CREATE POLICY "obs_insert_public"
  ON observations FOR INSERT
  WITH CHECK (true);

-- Qualquer um pode ler
CREATE POLICY "obs_select_public"
  ON observations FOR SELECT
  USING (true);

-- Update/delete bloqueados (sem policy = bloqueado por padrão com RLS ativo)

-- ── buildings ─────────────────────────────────────────────────────────────────
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buildings_select_public"
  ON buildings FOR SELECT
  USING (true);

CREATE POLICY "buildings_insert_service"
  ON buildings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── crises ────────────────────────────────────────────────────────────────────
ALTER TABLE crises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crises_select_public"
  ON crises FOR SELECT
  USING (true);

CREATE POLICY "crises_insert_service"
  ON crises FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "crises_update_service"
  ON crises FOR UPDATE
  USING (auth.role() = 'service_role');

-- ── area_stats ────────────────────────────────────────────────────────────────
ALTER TABLE area_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "area_stats_select_public"
  ON area_stats FOR SELECT
  USING (true);

-- Insert/update apenas via trigger (service_role executa o trigger internamente)
CREATE POLICY "area_stats_write_service"
  ON area_stats FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "area_stats_update_service"
  ON area_stats FOR UPDATE
  USING (auth.role() = 'service_role');

-- ── Storage: policy pública de leitura ────────────────────────────────────────
CREATE POLICY "photos_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'observation-photos');

-- Upload restrito a service_role (nunca exposta no frontend)
CREATE POLICY "photos_insert_service"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'observation-photos'
    AND auth.role() = 'service_role'
  );
