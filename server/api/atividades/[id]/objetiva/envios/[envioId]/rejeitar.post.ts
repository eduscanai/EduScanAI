import { serverSupabaseServiceRole } from '#supabase/server'

// Rejeita um envio processado (status 'aguardando_confirmacao') — descarta
// o resultado detectado; o aluno volta a aparecer como "não enviado" e pode
// ser reenviado (lote ou individual). Espelha o rejeitar.post.ts de simulados.
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const atividadeId = getRouterParam(event, 'id')
  const envioId = getRouterParam(event, 'envioId')

  if (!atividadeId || !envioId) {
    throw createError({ statusCode: 400, message: 'Parâmetros inválidos.' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: atividade, error: atividadeErr } = await client
    .from('atividades')
    .select('id, professor_id, escola_id')
    .eq('id', atividadeId)
    .eq('tipo', 'objetiva')
    .single()

  if (atividadeErr || !atividade) {
    throw createError({ statusCode: 404, message: 'Atividade objetiva não encontrada.' })
  }

  const podeGerenciar =
    atividade.professor_id === profile.id ||
    (profile.role === 'admin' && atividade.escola_id === profile.school_id)

  if (!podeGerenciar) {
    throw createError({ statusCode: 403, message: 'Sem permissão para rejeitar este envio.' })
  }

  const { data: envio, error: envioErr } = await client
    .from('envios')
    .delete()
    .eq('id', envioId)
    .eq('atividade_id', atividadeId)
    .eq('status_processamento', 'aguardando_confirmacao')
    .select('id')
    .single()

  if (envioErr || !envio) {
    throw createError({
      statusCode: 404,
      message: 'Envio não encontrado ou não está aguardando confirmação.'
    })
  }

  return { ok: true }
})
