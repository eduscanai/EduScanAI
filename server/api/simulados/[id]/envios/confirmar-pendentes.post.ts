import { serverSupabaseServiceRole } from '#supabase/server'

// Confirma de uma vez todos os envios "aguardando_confirmacao" de um
// simulado — atalho pra quando o professor já revisou o lote inteiro.
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const simuladoId = getRouterParam(event, 'id')

  if (!simuladoId) {
    throw createError({ statusCode: 400, message: 'Simulado inválido.' })
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
    throw createError({ statusCode: 403, message: 'Sem permissão para confirmar este simulado.' })
  }

  const { data: envios, error: envioErr } = await client
    .from('simulado_envios')
    .update({
      status_processamento: 'corrigido',
      corrigido_em: new Date().toISOString()
    })
    .eq('simulado_id', simuladoId)
    .eq('status_processamento', 'aguardando_confirmacao')
    .select('id')

  if (envioErr) {
    throw createError({ statusCode: 500, message: 'Erro ao confirmar: ' + envioErr.message })
  }

  return { confirmados: envios?.length || 0 }
})
