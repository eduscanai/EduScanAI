-- ============================================
-- EduScanAI - Campos extras do aluno
-- Migration: 014_profiles_student_fields.sql
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_nascimento DATE;

NOTIFY pgrst, 'reload schema';
