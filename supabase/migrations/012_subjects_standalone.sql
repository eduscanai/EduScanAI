-- ============================================
-- EduScanAI - Disciplinas independentes (sem turma/professor)
-- O vínculo turma+professor+disciplina é feito via class_teachers
-- Migration: 012_subjects_standalone.sql
-- ============================================

-- 1. Remover constraint antiga (school_id, class_id, name)
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_unique_class_name;

-- 2. Nova constraint: disciplina única por escola
ALTER TABLE subjects ADD CONSTRAINT subjects_unique_name UNIQUE (school_id, name);

-- 3. Recarregar schema
NOTIFY pgrst, 'reload schema';
