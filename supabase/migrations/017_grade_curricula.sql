  -- ============================================
  -- EduScanAI - Grade Curricular
  -- Define quais disciplinas pertencem a cada série/nível.
  -- Ex: "1º Ano" → Matemática, Português, História...
  -- Migration: 017_grade_curricula.sql
  -- ============================================

  CREATE TABLE grade_curricula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    grade_level TEXT NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (school_id, grade_level, subject_id)
  );

  CREATE INDEX idx_grade_curricula_school_grade ON grade_curricula (school_id, grade_level);

  ALTER TABLE grade_curricula ENABLE ROW LEVEL SECURITY;

  -- Todos da escola podem ler
  CREATE POLICY "grade_curricula_select" ON grade_curricula
    FOR SELECT USING (school_id = get_my_school_id());

  -- Apenas admin pode inserir
  CREATE POLICY "grade_curricula_insert" ON grade_curricula
    FOR INSERT WITH CHECK (
      school_id = get_my_school_id()
      AND get_my_role() = 'admin'
    );

  -- Apenas admin pode deletar
  CREATE POLICY "grade_curricula_delete" ON grade_curricula
    FOR DELETE USING (
      school_id = get_my_school_id()
      AND get_my_role() = 'admin'
    );

  NOTIFY pgrst, 'reload schema';
