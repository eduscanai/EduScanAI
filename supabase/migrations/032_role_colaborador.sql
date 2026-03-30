-- ============================================================
-- Migration 032: Adicionar role 'collaborator' (colaborador)
-- ============================================================

-- 1. Remover constraint antiga e recriar com novo valor
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_role_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_role_check
  CHECK (role IN ('admin', 'pedagogue', 'teacher', 'student', 'collaborator'));

-- 2. Colunas extras no perfil (para colaborador e outros)
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cargo TEXT;

NOTIFY pgrst, 'reload schema';
