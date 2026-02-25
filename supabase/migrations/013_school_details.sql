-- ============================================
-- EduScanAI - Detalhes da Escola
-- Migration: 013_school_details.sql
-- ============================================

ALTER TABLE schools ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS diretor TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS vice_diretor TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS coord_pedagogica TEXT;

NOTIFY pgrst, 'reload schema';
