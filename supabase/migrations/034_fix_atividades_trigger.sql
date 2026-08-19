-- ============================================================
-- Migration 034: Corrigir trigger quebrado em atividades
-- ============================================================
--
-- O trigger assignments_updated_at (criado em 004_assignments.sql) chama
-- update_updated_at(), que faz NEW.updated_at = now(). A migration 027
-- renomeou a coluna assignments.updated_at -> atividades.atualizado_em, mas
-- o trigger continuou apontando pra update_updated_at() sem ajuste.
--
-- Resultado: qualquer UPDATE em atividades (editar, publicar, encerrar)
-- falha com "record NEW has no field updated_at".
--
-- update_updated_at() continua em uso por outras tabelas que NÃO tiveram a
-- coluna renomeada (comunicados, boletins, responsaveis) — por isso a
-- correção aqui é um trigger dedicado só para atividades, não uma mudança
-- na função compartilhada.

CREATE OR REPLACE FUNCTION set_atividades_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assignments_updated_at ON atividades;
DROP TRIGGER IF EXISTS atividades_atualizado_em ON atividades;

CREATE TRIGGER atividades_atualizado_em
  BEFORE UPDATE ON atividades
  FOR EACH ROW
  EXECUTE FUNCTION set_atividades_atualizado_em();

NOTIFY pgrst, 'reload schema';
