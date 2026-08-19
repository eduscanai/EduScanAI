-- ============================================================
-- Migration 033: Simulados (correção OMR real, via microserviço Python)
-- ============================================================
--
-- "simulados" e "simulado_envios" são tabelas novas e dedicadas (não uma
-- extensão de atividades/envios), pois o fluxo de OMR (template de bolhas,
-- gabarito gerado, folha em PDF, matrícula em blocos) não tem equivalente
-- nos campos genéricos de atividades. Seguem as mesmas convenções já
-- usadas no restante do schema: nomes em português, escola_id/turma_id/
-- professor_id/aluno_id, get_my_school_id()/get_my_role() para RLS.

-- 1. simulados
CREATE TABLE IF NOT EXISTS simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES perfis ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  questoes JSONB NOT NULL DEFAULT '[]',
  gabarito JSONB NOT NULL DEFAULT '{}',
  pesos JSONB NOT NULL DEFAULT '{}',
  valor_maximo NUMERIC NOT NULL DEFAULT 10 CHECK (valor_maximo > 0),
  matricula_em_blocos BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'publicado'
    CHECK (status IN ('rascunho', 'publicado', 'encerrado')),
  template_json JSONB,
  config_json JSONB,
  marcador_url TEXT,
  folha_respostas_url TEXT,
  folha_solucao_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulados_escola_id ON simulados (escola_id);
CREATE INDEX IF NOT EXISTS idx_simulados_turma_id ON simulados (turma_id);
CREATE INDEX IF NOT EXISTS idx_simulados_professor_id ON simulados (professor_id);

-- Trigger dedicado (não reaproveita update_updated_at(), que hardcoda
-- NEW.updated_at e quebraria aqui — a coluna desta tabela é atualizado_em).
CREATE OR REPLACE FUNCTION set_simulados_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS simulados_atualizado_em ON simulados;
CREATE TRIGGER simulados_atualizado_em
  BEFORE UPDATE ON simulados
  FOR EACH ROW
  EXECUTE FUNCTION set_simulados_atualizado_em();

-- 2. simulado_envios
CREATE TABLE IF NOT EXISTS simulado_envios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID NOT NULL REFERENCES simulados ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES perfis ON DELETE CASCADE,
  status_processamento TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_processamento IN ('pendente', 'processando', 'corrigido', 'erro')),
  arquivo_original_url TEXT,
  matricula_detectada TEXT,
  imagem_processada_url TEXT,
  respostas_detectadas JSONB,
  nota NUMERIC,
  percentual NUMERIC,
  acertos INTEGER,
  erros INTEGER,
  em_branco INTEGER,
  detalhes JSONB,
  log_excerto TEXT,
  erro_mensagem TEXT,
  corrigido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (simulado_id, aluno_id)
);

CREATE INDEX IF NOT EXISTS idx_simulado_envios_simulado_id ON simulado_envios (simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_envios_aluno_id ON simulado_envios (aluno_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_envios ENABLE ROW LEVEL SECURITY;

-- ---- SIMULADOS ----

DROP POLICY IF EXISTS "simulados_select_admin_pedagogue" ON simulados;
CREATE POLICY "simulados_select_admin_pedagogue" ON simulados
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue')
    AND escola_id = get_my_school_id()
  );

DROP POLICY IF EXISTS "simulados_select_teacher" ON simulados;
CREATE POLICY "simulados_select_teacher" ON simulados
  FOR SELECT USING (
    get_my_role() = 'teacher'
    AND turma_id IN (
      SELECT class_id FROM turma_professores WHERE teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "simulados_select_student" ON simulados;
CREATE POLICY "simulados_select_student" ON simulados
  FOR SELECT USING (
    get_my_role() = 'student'
    AND status = 'publicado'
    AND turma_id IN (
      SELECT class_id FROM turma_alunos WHERE student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "simulados_insert" ON simulados;
CREATE POLICY "simulados_insert" ON simulados
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'teacher')
    AND escola_id = get_my_school_id()
    AND professor_id = auth.uid()
  );

DROP POLICY IF EXISTS "simulados_update" ON simulados;
CREATE POLICY "simulados_update" ON simulados
  FOR UPDATE USING (
    professor_id = auth.uid()
    OR (get_my_role() = 'admin' AND escola_id = get_my_school_id())
  );

DROP POLICY IF EXISTS "simulados_delete" ON simulados;
CREATE POLICY "simulados_delete" ON simulados
  FOR DELETE USING (
    professor_id = auth.uid()
    OR (get_my_role() = 'admin' AND escola_id = get_my_school_id())
  );

-- ---- SIMULADO_ENVIOS ----

-- SELECT: aluno vê o próprio envio
DROP POLICY IF EXISTS "simulado_envios_select_own" ON simulado_envios;
CREATE POLICY "simulado_envios_select_own" ON simulado_envios
  FOR SELECT USING (aluno_id = auth.uid());

-- SELECT: professor dono do simulado (ou admin/pedagogue da escola) vê todos
DROP POLICY IF EXISTS "simulado_envios_select_staff" ON simulado_envios;
CREATE POLICY "simulado_envios_select_staff" ON simulado_envios
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND simulado_id IN (
      SELECT id FROM simulados
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- INSERT/UPDATE/DELETE: apenas service role (rotas de servidor), igual ao
-- padrão já usado em correcoes_ia — a correção é sempre feita pelo servidor
-- (que chama o microserviço Python), nunca diretamente pelo cliente.

-- ============================================================
-- Storage: bucket simulados-files
-- ============================================================
-- Convenção de path: escolaId/simulados/{simuladoId}/gabarito/...
-- (template/config/marcador/folhas em PDF — leitura ampla dentro da escola)
-- e escolaId/simulados/{simuladoId}/envios/{alunoId}/...
-- (folha escaneada + imagem processada de um aluno — leitura restrita).

INSERT INTO storage.buckets (id, name, public)
VALUES ('simulados-files', 'simulados-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "simulados_files_select_gabarito" ON storage.objects;
CREATE POLICY "simulados_files_select_gabarito" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'simulados-files'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[4] = 'gabarito'
  );

DROP POLICY IF EXISTS "simulados_files_select_envios_staff" ON storage.objects;
CREATE POLICY "simulados_files_select_envios_staff" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'simulados-files'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[4] = 'envios'
    AND get_my_role() IN ('admin', 'pedagogue', 'teacher')
  );

DROP POLICY IF EXISTS "simulados_files_select_envios_aluno" ON storage.objects;
CREATE POLICY "simulados_files_select_envios_aluno" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'simulados-files'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[4] = 'envios'
    AND (storage.foldername(name))[5] = auth.uid()::text
  );

DROP POLICY IF EXISTS "simulados_files_insert" ON storage.objects;
CREATE POLICY "simulados_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'simulados-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

DROP POLICY IF EXISTS "simulados_files_update" ON storage.objects;
CREATE POLICY "simulados_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'simulados-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

DROP POLICY IF EXISTS "simulados_files_delete" ON storage.objects;
CREATE POLICY "simulados_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'simulados-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

NOTIFY pgrst, 'reload schema';
