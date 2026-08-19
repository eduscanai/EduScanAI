import { serverSupabaseServiceRole } from '#supabase/server'

// Confirma de uma vez todos os envios "aguardando_confirmacao" de uma
// atividade objetiva — atalho pra quando o professor já revisou o lote
// inteiro. Espelha confirmar-pendentes.post.ts de simulados.
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const atividadeId = getRouterParam(event, 'id')

  if (!atividadeId) {
    throw createError({ statusCode: 400, message: 'Atividade inválida.' })
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
    throw createError({ statusCode: 403, message: 'Sem permissão para confirmar esta atividade.' })
  }

  const { data: envios, error: envioErr } = await client
    .from('envios')
    .update({
      status_processamento: 'corrigido',
      corrigido_em: new Date().toISOString(),
      validado_professor: true,
      validado_em: new Date().toISOString(),
      validado_por: profile.id
    })
    .eq('atividade_id', atividadeId)
    .eq('status_processamento', 'aguardando_confirmacao')
    .select('id')

  if (envioErr) {
    throw createError({ statusCode: 500, message: 'Erro ao confirmar: ' + envioErr.message })
  }

  return { confirmados: envios?.length || 0 }
})
