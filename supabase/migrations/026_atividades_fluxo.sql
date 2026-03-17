-- ============================================================
-- Migration 026: Fluxo completo de atividades
-- Gabarito separado, período, peso, visibilidade, habilidades BNCC
-- ============================================================

-- 1. Novas colunas na tabela atividades
ALTER TABLE atividades
  ADD COLUMN IF NOT EXISTS gabarito JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS grading_period_id UUID REFERENCES periodos_avaliacao(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS peso NUMERIC NOT NULL DEFAULT 1 CHECK (peso > 0),
  ADD COLUMN IF NOT EXISTS visivel_aluno BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_atividades_grading_period ON atividades (grading_period_id);

-- 2. Tabela junction: atividade ↔ habilidades BNCC
CREATE TABLE IF NOT EXISTS atividade_habilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
  habilidade_id UUID NOT NULL REFERENCES bncc_habilidades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (atividade_id, habilidade_id)
);

CREATE INDEX IF NOT EXISTS idx_atividade_habilidades_atividade ON atividade_habilidades (atividade_id);
CREATE INDEX IF NOT EXISTS idx_atividade_habilidades_habilidade ON atividade_habilidades (habilidade_id);

-- RLS
ALTER TABLE atividade_habilidades ENABLE ROW LEVEL SECURITY;

-- SELECT: quem pode ver a atividade pode ver suas habilidades
CREATE POLICY "atividade_habilidades_select" ON atividade_habilidades
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM atividades)
  );

-- INSERT: professor dono ou admin
CREATE POLICY "atividade_habilidades_insert" ON atividade_habilidades
  FOR INSERT WITH CHECK (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- DELETE: professor dono ou admin
CREATE POLICY "atividade_habilidades_delete" ON atividade_habilidades
  FOR DELETE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- 3. Atualizar RLS do aluno para respeitar visivel_aluno
-- Dropar a policy antiga e recriar
DROP POLICY IF EXISTS "assignments_select_student" ON atividades;

CREATE POLICY "assignments_select_student" ON atividades
  FOR SELECT USING (
    get_my_role() = 'student'
    AND status = 'published'
    AND visivel_aluno = true
    AND class_id IN (
      SELECT class_id FROM turma_alunos WHERE student_id = auth.uid()
    )
  );

-- 4. Migrar gabaritos existentes de attachments para o campo gabarito
-- (gabaritos eram marcados com prefixo [GABARITO] nos attachments)
UPDATE atividades
SET
  gabarito = (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'name', regexp_replace(elem->>'name', '^\[GABARITO\] ', ''),
        'url', elem->>'url'
      )
    ), '[]'::jsonb)
    FROM jsonb_array_elements(attachments) AS elem
    WHERE elem->>'name' LIKE '[GABARITO]%'
  ),
  attachments = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(attachments) AS elem
    WHERE elem->>'name' NOT LIKE '[GABARITO]%'
  )
WHERE attachments::text LIKE '%[GABARITO]%';

NOTIFY pgrst, 'reload schema';
