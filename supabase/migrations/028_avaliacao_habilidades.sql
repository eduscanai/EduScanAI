-- ============================================================
-- Migration 028: Avaliação por habilidade (preenchida pela IA)
-- Cada envio tem uma avaliação por habilidade da atividade
-- ============================================================

CREATE TABLE IF NOT EXISTS avaliacao_habilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id UUID NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
  habilidade_id UUID NOT NULL REFERENCES bncc_habilidades(id) ON DELETE CASCADE,
  nivel TEXT NOT NULL DEFAULT 'pendente'
    CHECK (nivel IN ('pendente', 'insatisfatorio', 'regular', 'satisfatorio')),
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE (envio_id, habilidade_id)
);

CREATE INDEX IF NOT EXISTS idx_avaliacao_hab_envio ON avaliacao_habilidades (envio_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_hab_habilidade ON avaliacao_habilidades (habilidade_id);

-- RLS
ALTER TABLE avaliacao_habilidades ENABLE ROW LEVEL SECURITY;

-- Aluno ve as proprias
CREATE POLICY "avaliacao_hab_select_aluno" ON avaliacao_habilidades
  FOR SELECT USING (
    envio_id IN (
      SELECT id FROM envios WHERE aluno_id = auth.uid()
    )
  );

-- Professor/admin ve das suas atividades
CREATE POLICY "avaliacao_hab_select_staff" ON avaliacao_habilidades
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND envio_id IN (
      SELECT e.id FROM envios e
      JOIN atividades a ON a.id = e.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- Insert/Update: service role (IA) ou professor/admin
CREATE POLICY "avaliacao_hab_insert" ON avaliacao_habilidades
  FOR INSERT WITH CHECK (
    envio_id IN (
      SELECT e.id FROM envios e
      JOIN atividades a ON a.id = e.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "avaliacao_hab_update" ON avaliacao_habilidades
  FOR UPDATE USING (
    envio_id IN (
      SELECT e.id FROM envios e
      JOIN atividades a ON a.id = e.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "avaliacao_hab_delete" ON avaliacao_habilidades
  FOR DELETE USING (
    envio_id IN (
      SELECT e.id FROM envios e
      JOIN atividades a ON a.id = e.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

NOTIFY pgrst, 'reload schema';
