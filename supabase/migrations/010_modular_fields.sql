ALTER TABLE observations
  ADD COLUMN IF NOT EXISTS electricity_status text,
  ADD COLUMN IF NOT EXISTS health_status      text,
  ADD COLUMN IF NOT EXISTS pressing_needs     text[];
