-- ============================================
-- FIX: Aplicar migration 021 com nomes corretos (pos-rename)
-- Cole no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. Adicionar modo_envio na tabela atividades
ALTER TABLE atividades
  ADD COLUMN IF NOT EXISTS modo_envio TEXT NOT NULL DEFAULT 'individual'
    CHECK (modo_envio IN ('individual', 'lote'));

-- 2. Adicionar campos na tabela envios
ALTER TABLE envios
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'aluno'
    CHECK (origem IN ('aluno', 'professor_lote')),
  ADD COLUMN IF NOT EXISTS status_processamento TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_processamento IN ('pendente', 'processando', 'corrigido', 'erro'));

-- 3. Topicos por atividade
CREATE TABLE IF NOT EXISTS topicos_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topicos_atividade_atividade_id ON topicos_atividade (atividade_id);

-- 4. Correcoes da IA
CREATE TABLE IF NOT EXISTS correcoes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id UUID NOT NULL UNIQUE REFERENCES envios(id) ON DELETE CASCADE,
  nota_geral NUMERIC NOT NULL DEFAULT 0,
  total_questoes INTEGER NOT NULL DEFAULT 0,
  acertos INTEGER NOT NULL DEFAULT 0,
  resumo_ia TEXT,
  resposta_raw JSONB,
  modelo_ia TEXT DEFAULT 'mock-v1',
  processado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_correcoes_ia_envio_id ON correcoes_ia (envio_id);

-- 5. Desempenho por topico
CREATE TABLE IF NOT EXISTS desempenho_topico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correcao_id UUID NOT NULL REFERENCES correcoes_ia(id) ON DELETE CASCADE,
  topico_id UUID NOT NULL REFERENCES topicos_atividade(id) ON DELETE CASCADE,
  acertos INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  percentual NUMERIC NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT 'medio' CHECK (nivel IN ('facil', 'medio', 'dificil')),
  observacao_ia TEXT
);

CREATE INDEX IF NOT EXISTS idx_desempenho_topico_correcao_id ON desempenho_topico (correcao_id);
CREATE INDEX IF NOT EXISTS idx_desempenho_topico_topico_id ON desempenho_topico (topico_id);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE topicos_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE correcoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE desempenho_topico ENABLE ROW LEVEL SECURITY;

-- TOPICOS RLS
CREATE POLICY "topicos_select" ON topicos_atividade
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM atividades)
  );

CREATE POLICY "topicos_insert" ON topicos_atividade
  FOR INSERT WITH CHECK (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_update" ON topicos_atividade
  FOR UPDATE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_delete" ON topicos_atividade
  FOR DELETE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- CORRECOES_IA RLS
CREATE POLICY "correcoes_ia_select_student" ON correcoes_ia
  FOR SELECT USING (
    envio_id IN (
      SELECT id FROM envios WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "correcoes_ia_select_staff" ON correcoes_ia
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND envio_id IN (
      SELECT s.id FROM envios s
      JOIN atividades a ON a.id = s.assignment_id
      WHERE a.teacher_id = auth.uid()
        OR (a.school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- DESEMPENHO_TOPICO RLS
CREATE POLICY "desempenho_select_student" ON desempenho_topico
  FOR SELECT USING (
    correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN envios s ON s.id = c.envio_id
      WHERE s.student_id = auth.uid()
    )
  );

CREATE POLICY "desempenho_select_staff" ON desempenho_topico
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN envios s ON s.id = c.envio_id
      JOIN atividades a ON a.id = s.assignment_id
      WHERE a.teacher_id = auth.uid()
        OR (a.school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

NOTIFY pgrst, 'reload schema';
