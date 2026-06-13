-- Replace service_role-only upload policy with one that allows anonymous citizens
-- to submit photos. Path is scoped to {crisisId}/{sessionId}/{uuid}.ext so
-- there is no risk of path collisions between submitters.

DROP POLICY IF EXISTS "photos_insert_service" ON storage.objects;

CREATE POLICY "photos_insert_anon"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'observation-photos');
