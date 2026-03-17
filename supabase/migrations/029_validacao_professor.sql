-- ============================================================
-- Migration 029: Validacao do professor na correcao IA
-- Quando aluno envia, IA corrige mas professor precisa validar
-- Quando professor envia em lote, ja fica validado automaticamente
-- ============================================================

-- Campo de validacao no envio
ALTER TABLE envios
  ADD COLUMN IF NOT EXISTS validado_professor BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS validado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validado_por UUID REFERENCES perfis(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_envios_validado ON envios (validado_professor);

NOTIFY pgrst, 'reload schema';
