-- ============================================
-- EduScanAI - Correção com IA
-- Migration: 021_correcao_ia.sql
-- ============================================

-- 1. Adicionar campos à tabela assignments
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS modo_envio TEXT NOT NULL DEFAULT 'individual'
    CHECK (modo_envio IN ('individual', 'lote'));

-- 2. Adicionar campos à tabela submissions
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'aluno'
    CHECK (origem IN ('aluno', 'professor_lote')),
  ADD COLUMN IF NOT EXISTS status_processamento TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_processamento IN ('pendente', 'processando', 'corrigido', 'erro'));

-- 3. Tópicos por atividade
CREATE TABLE topicos_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES assignments ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topicos_atividade_atividade_id ON topicos_atividade (atividade_id);

-- 4. Correções da IA
CREATE TABLE correcoes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id UUID NOT NULL UNIQUE REFERENCES submissions ON DELETE CASCADE,
  nota_geral NUMERIC NOT NULL DEFAULT 0,
  total_questoes INTEGER NOT NULL DEFAULT 0,
  acertos INTEGER NOT NULL DEFAULT 0,
  resumo_ia TEXT,
  resposta_raw JSONB,
  modelo_ia TEXT DEFAULT 'mock-v1',
  processado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_correcoes_ia_envio_id ON correcoes_ia (envio_id);

-- 5. Desempenho por tópico
CREATE TABLE desempenho_topico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correcao_id UUID NOT NULL REFERENCES correcoes_ia ON DELETE CASCADE,
  topico_id UUID NOT NULL REFERENCES topicos_atividade ON DELETE CASCADE,
  acertos INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  percentual NUMERIC NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT 'medio' CHECK (nivel IN ('facil', 'medio', 'dificil')),
  observacao_ia TEXT
);

CREATE INDEX idx_desempenho_topico_correcao_id ON desempenho_topico (correcao_id);
CREATE INDEX idx_desempenho_topico_topico_id ON desempenho_topico (topico_id);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE topicos_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE correcoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE desempenho_topico ENABLE ROW LEVEL SECURITY;

-- ---- TOPICOS RLS ----

-- SELECT: qualquer pessoa que pode ver a atividade pode ver tópicos
CREATE POLICY "topicos_select" ON topicos_atividade
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM assignments)
  );

-- INSERT/UPDATE/DELETE: professor dono ou admin
CREATE POLICY "topicos_insert" ON topicos_atividade
  FOR INSERT WITH CHECK (
    atividade_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_update" ON topicos_atividade
  FOR UPDATE USING (
    atividade_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_delete" ON topicos_atividade
  FOR DELETE USING (
    atividade_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- ---- CORRECOES_IA RLS ----

-- SELECT: aluno vê a própria correção
CREATE POLICY "correcoes_ia_select_student" ON correcoes_ia
  FOR SELECT USING (
    envio_id IN (
      SELECT id FROM submissions WHERE student_id = auth.uid()
    )
  );

-- SELECT: professor/admin vê correções das suas atividades
CREATE POLICY "correcoes_ia_select_staff" ON correcoes_ia
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND envio_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE a.teacher_id = auth.uid()
        OR (a.school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- INSERT/UPDATE: service role only (via server API)
-- Não precisa de policy — o server usa service role

-- ---- DESEMPENHO_TOPICO RLS ----

-- SELECT: segue as mesmas regras de correcoes_ia
CREATE POLICY "desempenho_select_student" ON desempenho_topico
  FOR SELECT USING (
    correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN submissions s ON s.id = c.envio_id
      WHERE s.student_id = auth.uid()
    )
  );

CREATE POLICY "desempenho_select_staff" ON desempenho_topico
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN submissions s ON s.id = c.envio_id
      JOIN assignments a ON a.id = s.assignment_id
      WHERE a.teacher_id = auth.uid()
        OR (a.school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );
