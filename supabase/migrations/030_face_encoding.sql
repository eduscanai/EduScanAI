-- ============================================================
-- Migration 030: Colunas de reconhecimento facial em perfis
-- ============================================================

ALTER TABLE perfis
  ADD COLUMN IF NOT EXISTS face_encoding JSONB,
  ADD COLUMN IF NOT EXISTS encoding_atualizado_em TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
