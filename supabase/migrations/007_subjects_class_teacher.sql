-- ============================================
-- EduScanAI - Subjects vinculados a Turma + Professor
-- Migration: 007_subjects_class_teacher.sql
-- ============================================

-- 1. Adicionar colunas class_id e teacher_id
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles ON DELETE SET NULL;

-- 2. Unique constraint: mesma disciplina não pode repetir na mesma turma
ALTER TABLE subjects ADD CONSTRAINT subjects_unique_class_name UNIQUE (school_id, class_id, name);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects (class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects (teacher_id);

-- 4. Trigger: ao criar/atualizar disciplina com class_id + teacher_id,
--    sincroniza automaticamente com class_teachers
CREATE OR REPLACE FUNCTION sync_subject_to_class_teachers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_id IS NOT NULL AND NEW.teacher_id IS NOT NULL THEN
    INSERT INTO class_teachers (class_id, teacher_id, subject_id)
    VALUES (NEW.class_id, NEW.teacher_id, NEW.id)
    ON CONFLICT (class_id, teacher_id, subject_id) DO NOTHING;
  END IF;

  -- Se mudou o professor, remove o vínculo antigo e cria o novo
  IF TG_OP = 'UPDATE' AND OLD.teacher_id IS DISTINCT FROM NEW.teacher_id THEN
    DELETE FROM class_teachers
    WHERE class_id = OLD.class_id
      AND teacher_id = OLD.teacher_id
      AND subject_id = OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subject_sync_class_teachers ON subjects;
CREATE TRIGGER on_subject_sync_class_teachers
  AFTER INSERT OR UPDATE OF class_id, teacher_id ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION sync_subject_to_class_teachers();
