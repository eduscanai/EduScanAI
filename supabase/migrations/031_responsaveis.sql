-- ============================================================
-- Migration 031: Responsaveis vinculados a alunos
-- Um aluno pode ter 1 ou mais responsaveis
-- ============================================================

CREATE TABLE IF NOT EXISTS responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  parentesco TEXT NOT NULL DEFAULT 'outro'
    CHECK (parentesco IN ('pai', 'mae', 'avo', 'avo_m', 'tio', 'tia', 'irmao', 'irma', 'padrasto', 'madrasta', 'tutor', 'outro')),
  telefone TEXT,
  telefone2 TEXT,
  email TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  cep TEXT,
  profissao TEXT,
  local_trabalho TEXT,
  responsavel_financeiro BOOLEAN NOT NULL DEFAULT false,
  responsavel_pedagogico BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responsaveis_aluno ON responsaveis (aluno_id);
CREATE INDEX IF NOT EXISTS idx_responsaveis_escola ON responsaveis (escola_id);
CREATE INDEX IF NOT EXISTS idx_responsaveis_cpf ON responsaveis (cpf);

-- Trigger updated_at
CREATE TRIGGER responsaveis_updated_at
  BEFORE UPDATE ON responsaveis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "responsaveis_select" ON responsaveis
  FOR SELECT USING (escola_id = get_my_school_id());

CREATE POLICY "responsaveis_insert" ON responsaveis
  FOR INSERT WITH CHECK (
    escola_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "responsaveis_update" ON responsaveis
  FOR UPDATE USING (
    escola_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "responsaveis_delete" ON responsaveis
  FOR DELETE USING (
    escola_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

NOTIFY pgrst, 'reload schema';
