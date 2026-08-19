import { serverSupabaseServiceRole } from '#supabase/server'

// Confirma um envio processado (status 'aguardando_confirmacao'), tornando
// o resultado oficial pro aluno. Além de status_processamento/corrigido_em
// (como em simulados), também marca validado_professor — esse campo já
// tem esse significado no resto de Atividades (ver useSubmissions).
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
    throw createError({ statusCode: 403, message: 'Sem permissão para confirmar este envio.' })
  }

  const { data: envio, error: envioErr } = await client
    .from('envios')
    .update({
      status_processamento: 'corrigido',
      corrigido_em: new Date().toISOString(),
      validado_professor: true,
      validado_em: new Date().toISOString(),
      validado_por: profile.id
    })
    .eq('id', envioId)
    .eq('atividade_id', atividadeId)
    .eq('status_processamento', 'aguardando_confirmacao')
    .select()
    .single()

  if (envioErr || !envio) {
    throw createError({
      statusCode: 404,
      message: 'Envio não encontrado ou não está aguardando confirmação.'
    })
  }

  return envio
})
