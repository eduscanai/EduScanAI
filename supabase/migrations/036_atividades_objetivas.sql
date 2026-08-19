-- ============================================================
-- Migration 036: Prova objetiva dentro de Atividades
-- Reaproveita o motor OMR do Simulado (via omrService.ts), mas mantém a
-- prova objetiva como um tipo de atividade — sem duplicar simulados/
-- simulado_envios. Segue o mesmo padrão de extensão 1:1 já usado por
-- correcoes_ia (extensão de envios).
-- ============================================================

-- 1. Tipo de atividade
ALTER TABLE atividades
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'dissertativa'
    CHECK (tipo IN ('dissertativa', 'objetiva'));

-- 2. Config da prova objetiva (1:1 com atividades)
CREATE TABLE IF NOT EXISTS atividade_objetiva (
  atividade_id UUID PRIMARY KEY REFERENCES atividades(id) ON DELETE CASCADE,
  questoes JSONB NOT NULL DEFAULT '[]',
  gabarito JSONB NOT NULL DEFAULT '{}',
  pesos JSONB NOT NULL DEFAULT '{}',
  matricula_em_blocos BOOLEAN NOT NULL DEFAULT false,
  template_json JSONB,
  config_json JSONB,
  marcador_url TEXT,
  folha_respostas_url TEXT,
  folha_solucao_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Gate de confirmação humana (mesma correção que a migration 035 fez em
-- simulado_envios.status_processamento). O nome real da constraint ainda é
-- o da tabela original (submissions), confirmado na base de testes antes de
-- escrever esta migration — dropar "envios_status_processamento_check"
-- não teria efeito nenhum e deixaria a constraint antiga (sem
-- 'aguardando_confirmacao') ativa, quebrando o insert silenciosamente.
ALTER TABLE envios DROP CONSTRAINT IF EXISTS submissions_status_processamento_check;
ALTER TABLE envios DROP CONSTRAINT IF EXISTS envios_status_processamento_check;
ALTER TABLE envios ADD CONSTRAINT envios_status_processamento_check
  CHECK (status_processamento IN ('pendente', 'processando', 'aguardando_confirmacao', 'corrigido', 'erro'));

-- 4. Resultado da correção OMR (1:1 com envios)
CREATE TABLE IF NOT EXISTS envio_objetivo (
  envio_id UUID PRIMARY KEY REFERENCES envios(id) ON DELETE CASCADE,
  arquivo_original_url TEXT,
  matricula_detectada TEXT,
  imagem_processada_url TEXT,
  respostas_detectadas JSONB,
  percentual NUMERIC,
  acertos INTEGER,
  erros INTEGER,
  em_branco INTEGER,
  detalhes JSONB,
  log_excerto TEXT,
  erro_mensagem TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE atividade_objetiva ENABLE ROW LEVEL SECURITY;
ALTER TABLE envio_objetivo ENABLE ROW LEVEL SECURITY;

-- ---- ATIVIDADE_OBJETIVA ----
-- SELECT: quem pode ver a atividade pode ver sua config objetiva
-- (mesmo padrão de atividade_habilidades_select, migration 026)
DROP POLICY IF EXISTS "atividade_objetiva_select" ON atividade_objetiva;
CREATE POLICY "atividade_objetiva_select" ON atividade_objetiva
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM atividades)
  );

-- INSERT/UPDATE/DELETE: apenas service role (rota de servidor), igual ao
-- padrão já usado em correcoes_ia — só o servidor cria/atualiza (ele chama
-- o microserviço Python).

-- ---- ENVIO_OBJETIVO ----
-- SELECT: aluno vê o próprio resultado
DROP POLICY IF EXISTS "envio_objetivo_select_own" ON envio_objetivo;
CREATE POLICY "envio_objetivo_select_own" ON envio_objetivo
  FOR SELECT USING (
    envio_id IN (SELECT id FROM envios WHERE aluno_id = auth.uid())
  );

-- SELECT: professor dono da atividade (ou admin/pedagogo da escola) vê todos
-- (mesmo padrão de correcoes_ia_select_staff, migration 021)
DROP POLICY IF EXISTS "envio_objetivo_select_staff" ON envio_objetivo;
CREATE POLICY "envio_objetivo_select_staff" ON envio_objetivo
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND envio_id IN (
      SELECT e.id FROM envios e
      JOIN atividades a ON a.id = e.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- INSERT/UPDATE/DELETE: apenas service role (rota de servidor) — a
-- correção é sempre feita pelo servidor, nunca diretamente pelo cliente.

NOTIFY pgrst, 'reload schema';
