import { serverSupabaseServiceRole } from '#supabase/server'

// Corrige manualmente a leitura de uma ou mais questões antes de confirmar
// o envio (ex: o OMR leu errado uma bolha). Só permitido enquanto o envio
// está "aguardando_confirmacao" — depois de confirmado, o resultado é
// oficial e passa por outro fluxo se precisar mudar.
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
    .select('id, professor_id, escola_id, questoes, valor_maximo')
    .eq('id', simuladoId)
    .single()

  if (simuladoErr || !simulado) {
    throw createError({ statusCode: 404, message: 'Simulado não encontrado.' })
  }

  const podeGerenciar =
    simulado.professor_id === profile.id ||
    (profile.role === 'admin' && simulado.escola_id === profile.school_id)

  if (!podeGerenciar) {
    throw createError({ statusCode: 403, message: 'Sem permissão para editar este envio.' })
  }

  const body = await readBody(event)
  const respostas = body?.respostas

  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
    throw createError({ statusCode: 400, message: 'Envie "respostas" como um objeto { "q1": "B", ... }.' })
  }

  const questoes = (simulado.questoes || []) as Array<{
    numero: number
    option_count: number
    resposta: string
    peso: number
  }>
  const questaoPorNumero = new Map(questoes.map((q) => [`q${q.numero}`, q]))

  for (const [chave, valor] of Object.entries(respostas)) {
    const questao = questaoPorNumero.get(chave)
    if (!questao) {
      throw createError({ statusCode: 400, message: `Questão desconhecida: ${chave}.` })
    }
    if (valor === '') continue
    const permitido = Array.from({ length: questao.option_count }, (_, i) => String.fromCharCode(65 + i))
    if (typeof valor !== 'string' || !permitido.includes(valor)) {
      throw createError({
        statusCode: 400,
        message: `Resposta inválida em ${chave}: use uma de ${permitido.join(', ')} ou "".`
      })
    }
  }

  const { data: envioAtual, error: envioAtualErr } = await client
    .from('simulado_envios')
    .select('id, respostas_detectadas, status_processamento')
    .eq('id', envioId)
    .eq('simulado_id', simuladoId)
    .single()

  if (envioAtualErr || !envioAtual) {
    throw createError({ statusCode: 404, message: 'Envio não encontrado.' })
  }

  if (envioAtual.status_processamento !== 'aguardando_confirmacao') {
    throw createError({
      statusCode: 400,
      message: 'Só é possível editar respostas de envios aguardando confirmação.'
    })
  }

  const respostasFinal = {
    ...(envioAtual.respostas_detectadas as Record<string, string> | null || {}),
    ...respostas
  }

  const nota = recalcularNota(respostasFinal, questoes, Number(simulado.valor_maximo))

  const { data: envio, error: updateErr } = await client
    .from('simulado_envios')
    .update({
      respostas_detectadas: respostasFinal,
      nota: nota.nota,
      percentual: nota.percentual,
      acertos: nota.acertos,
      erros: nota.erros,
      em_branco: nota.em_branco,
      detalhes: nota.detalhes
    })
    .eq('id', envioId)
    .select()
    .single()

  if (updateErr || !envio) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar edição: ' + updateErr?.message })
  }

  return envio
})
