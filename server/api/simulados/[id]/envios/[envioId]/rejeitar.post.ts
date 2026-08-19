import { serverSupabaseServiceRole } from '#supabase/server'

// Rejeita um envio processado em lote (status 'aguardando_confirmacao') —
// descarta o resultado detectado; o aluno volta a aparecer como "não
// enviado" e pode ser reenviado (lote ou individual).
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const simuladoId = getRouterParam(event, 'id')
  const envioId = getRouterParam(event, 'envioId')

  if (!simuladoId || !envioId) {
    throw createError({ statusCode: 400, message: 'Parâmetros inválidos.' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: simulado, error: simuladoErr } = await client
    .from('simulados')
    .select('id, professor_id, escola_id')
    .eq('id', simuladoId)
    .single()

  if (simuladoErr || !simulado) {
    throw createError({ statusCode: 404, message: 'Simulado não encontrado.' })
  }

  const podeGerenciar =
    simulado.professor_id === profile.id ||
    (profile.role === 'admin' && simulado.escola_id === profile.school_id)

  if (!podeGerenciar) {
    throw createError({ statusCode: 403, message: 'Sem permissão para rejeitar este envio.' })
  }

  const { data: envio, error: envioErr } = await client
    .from('simulado_envios')
    .delete()
    .eq('id', envioId)
    .eq('simulado_id', simuladoId)
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
