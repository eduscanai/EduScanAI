-- ============================================================
-- Migration 037: Disciplinas por turma
-- Cada turma passa a ter seu próprio conjunto de disciplinas
-- (turma_disciplinas), em vez de depender só da Grade Curricular por
-- série (grade_curricular) ou de já existir um professor vinculado
-- (turma_professores). Usado pra filtrar o campo "Disciplina" na
-- criação de atividades de acordo com a(s) turma(s) selecionada(s).
-- ============================================================

CREATE TABLE IF NOT EXISTS turma_disciplinas (
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id UUID NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  PRIMARY KEY (turma_id, disciplina_id)
);

CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_turma ON turma_disciplinas (turma_id);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_disciplina ON turma_disciplinas (disciplina_id);

-- ============================================================
-- Backfill: turmas já existentes não podem ficar sem disciplina até um
-- admin preencher manualmente (quebraria a criação de atividade pra
-- elas). Povoa a partir de duas fontes já existentes:
-- 1. Grade Curricular da série da turma (grade_curricular por grade_level)
-- 2. Disciplinas de professores já vinculados à turma (turma_professores)
-- ============================================================

INSERT INTO turma_disciplinas (turma_id, disciplina_id)
SELECT t.id, gc.subject_id
FROM turmas t
JOIN grade_curricular gc ON gc.school_id = t.school_id AND gc.grade_level = t.grade_level
ON CONFLICT DO NOTHING;

INSERT INTO turma_disciplinas (turma_id, disciplina_id)
SELECT DISTINCT tp.class_id, tp.subject_id
FROM turma_professores tp
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE turma_disciplinas ENABLE ROW LEVEL SECURITY;

-- SELECT: quem pode ver a turma pode ver suas disciplinas (mesmo padrão
-- de atividade_habilidades_select, migration 026 — reaproveita a
-- visibilidade já resolvida nas policies de turmas)
DROP POLICY IF EXISTS "turma_disciplinas_select" ON turma_disciplinas;
CREATE POLICY "turma_disciplinas_select" ON turma_disciplinas
  FOR SELECT USING (
    turma_id IN (SELECT id FROM turmas)
  );

-- INSERT/DELETE: só admin da escola da turma (mesmo padrão de
-- grade_curricular, migration 017)
DROP POLICY IF EXISTS "turma_disciplinas_insert" ON turma_disciplinas;
CREATE POLICY "turma_disciplinas_insert" ON turma_disciplinas
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND turma_id IN (SELECT id FROM turmas WHERE school_id = get_my_school_id())
  );

DROP POLICY IF EXISTS "turma_disciplinas_delete" ON turma_disciplinas;
CREATE POLICY "turma_disciplinas_delete" ON turma_disciplinas
  FOR DELETE USING (
    get_my_role() = 'admin'
    AND turma_id IN (SELECT id FROM turmas WHERE school_id = get_my_school_id())
  );

NOTIFY pgrst, 'reload schema';
