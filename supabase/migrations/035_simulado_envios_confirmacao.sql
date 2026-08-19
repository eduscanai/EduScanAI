-- ============================================================
-- Migration 035: Confirmação humana antes de contabilizar o lote
-- ============================================================
--
-- Hoje, ao processar um envio em lote, o resultado (nota, respostas
-- detectadas) já entra direto como status_processamento = 'corrigido' —
-- conta na hora pro aluno, sem ninguém olhar antes. Passamos a gravar como
-- 'aguardando_confirmacao' primeiro; só vira 'corrigido' de fato (e passa a
-- contar no resultado do aluno) depois que o professor confirma na tela.
--
-- Correção individual (server/api/simulados/[id]/envios/individual.post.ts)
-- não muda — lá o professor já escolhe o aluno e o arquivo manualmente, o
-- que já é uma confirmação implícita.

ALTER TABLE simulado_envios DROP CONSTRAINT IF EXISTS simulado_envios_status_processamento_check;
ALTER TABLE simulado_envios ADD CONSTRAINT simulado_envios_status_processamento_check
  CHECK (status_processamento IN ('pendente', 'processando', 'aguardando_confirmacao', 'corrigido', 'erro'));

NOTIFY pgrst, 'reload schema';
