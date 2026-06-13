-- Add Portuguese to the un_language enum so observations submitted with
-- language='pt' (UI now ships a pt locale) don't fail with 22P02.
ALTER TYPE un_language ADD VALUE IF NOT EXISTS 'pt';
