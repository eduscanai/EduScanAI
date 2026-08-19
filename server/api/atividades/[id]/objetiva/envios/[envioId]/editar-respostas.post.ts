import { serverSupabaseServiceRole } from '#supabase/server'

// Corrige manualmente a leitura de uma ou mais questões antes de confirmar
// o envio (ex: o OMR leu errado uma bolha). Só permitido enquanto o envio
// está "aguardando_confirmacao". Espelha o editar-respostas.post.ts de
// simulados, mas grava nota em envios e o resto do detalhe em envio_objetivo.
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
    .select('id, professor_id, escola_id, nota_maxima, atividade_objetiva(questoes)')
    .eq('id', atividadeId)
    .eq('tipo', 'objetiva')
    .single()

  if (atividadeErr || !atividade || !atividade.atividade_objetiva) {
    throw createError({ statusCode: 404, message: 'Atividade objetiva não encontrada.' })
  }

  const podeGerenciar =
    atividade.professor_id === profile.id ||
    (profile.role === 'admin' && atividade.escola_id === profile.school_id)

  if (!podeGerenciar) {
    throw createError({ statusCode: 403, message: 'Sem permissão para editar este envio.' })
  }

  const body = await readBody(event)
  const respostas = body?.respostas

  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
    throw createError({ statusCode: 400, message: 'Envie "respostas" como um objeto { "q1": "B", ... }.' })
  }

  const questoes = ((atividade.atividade_objetiva as any).questoes || []) as Array<{
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
    .from('envios')
    .select('id, status_processamento, envio_objetivo(respostas_detectadas)')
    .eq('id', envioId)
    .eq('atividade_id', atividadeId)
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
    ...((envioAtual.envio_objetivo as any)?.respostas_detectadas as Record<string, string> | null || {}),
    ...respostas
  }

  const nota = recalcularNota(respostasFinal, questoes, Number(atividade.nota_maxima))

  const { error: updateEnvioErr } = await client
    .from('envios')
    .update({ nota: nota.nota })
    .eq('id', envioId)

  if (updateEnvioErr) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar edição: ' + updateEnvioErr.message })
  }

  const { data: envioObjetivo, error: updateErr } = await client
    .from('envio_objetivo')
    .update({
      respostas_detectadas: respostasFinal,
      percentual: nota.percentual,
      acertos: nota.acertos,
      erros: nota.erros,
      em_branco: nota.em_branco,
      detalhes: nota.detalhes
    })
    .eq('envio_id', envioId)
    .select()
    .single()

  if (updateErr || !envioObjetivo) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar edição: ' + updateErr?.message })
  }

  return { ...envioObjetivo, nota: nota.nota }
})
