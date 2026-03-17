import { serverSupabaseServiceRole } from '#supabase/server'

// Função isolada que será substituída pela IA real no futuro
async function corrigirComIA(
  pdfResposta: string | null,
  pdfGabarito: string | null,
  topicos: { id: string; nome: string; descricao: string | null }[]
) {
  // Mock: gera resultado simulado baseado nos tópicos
  const totalQuestoes = Math.max(topicos.length * 2, 5)
  const acertos = Math.floor(Math.random() * (totalQuestoes + 1))
  const nota = Math.round((acertos / totalQuestoes) * 10 * 10) / 10

  const topicosResult = topicos.map(t => {
    const total = 2
    const acertosTopico = Math.floor(Math.random() * (total + 1))
    const percentual = Math.round((acertosTopico / total) * 100)
    return {
      topico_id: t.id,
      nome: t.nome,
      acertos: acertosTopico,
      total,
      percentual,
      nivel: percentual >= 70 ? 'facil' : percentual >= 40 ? 'medio' : 'dificil',
      observacao: `O aluno ${percentual >= 70 ? 'demonstrou bom domínio' : percentual >= 40 ? 'teve desempenho mediano' : 'precisa de reforço'} em ${t.nome}.`
    }
  })

  return {
    nota_geral: nota,
    total_questoes: totalQuestoes,
    acertos,
    resumo: `O aluno acertou ${acertos} de ${totalQuestoes} questões, obtendo nota ${nota}. ${acertos >= totalQuestoes * 0.7 ? 'Bom desempenho geral.' : 'Há pontos a melhorar.'}`,
    topicos: topicosResult
  }
}

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const client = await serverSupabaseServiceRole(event)
  const { envio_id } = await readBody(event)

  if (!envio_id) {
    throw createError({ statusCode: 400, message: 'envio_id é obrigatório' })
  }

  // 1. Buscar envio e atualizar status → processando
  const { data: envio, error: envioErr } = await client
    .from('envios')
    .select('*, atividades(id, anexos, escola_id, professor_id)')
    .eq('id', envio_id)
    .single()

  if (envioErr || !envio) {
    throw createError({ statusCode: 404, message: 'Envio não encontrado' })
  }

  // Verificar permissão (professor dono ou admin)
  const assignment = envio.atividades as any
  if (profile.role !== 'admin' && assignment.professor_id !== profile.id) {
    throw createError({ statusCode: 403, message: 'Sem permissão para corrigir este envio' })
  }

  await client
    .from('envios')
    .update({ status_processamento: 'processando' })
    .eq('id', envio_id)

  try {
    // 2. Buscar tópicos da atividade
    const { data: topicos } = await client
      .from('topicos_atividade')
      .select('id, nome, descricao')
      .eq('atividade_id', envio.atividade_id)

    // 3. Chamar IA (mock por enquanto)
    const gabarito = assignment.anexos?.[0]?.url || null
    const resposta = envio.anexos?.[0]?.url || null

    const resultado = await corrigirComIA(resposta, gabarito, topicos || [])

    // 4. Insert em correcoes_ia
    const { data: correcao, error: correcaoErr } = await client
      .from('correcoes_ia')
      .upsert({
        envio_id,
        nota_geral: resultado.nota_geral,
        total_questoes: resultado.total_questoes,
        acertos: resultado.acertos,
        resumo_ia: resultado.resumo,
        resposta_raw: resultado,
        modelo_ia: 'mock-v1',
        processado_em: new Date().toISOString()
      }, { onConflict: 'envio_id' })
      .select()
      .single()

    if (correcaoErr) throw correcaoErr

    // 5. Insert em desempenho_topico
    if (resultado.topicos.length > 0 && correcao) {
      // Limpar desempenhos anteriores
      await client
        .from('desempenho_topico')
        .delete()
        .eq('correcao_id', correcao.id)

      const desempenhos = resultado.topicos.map(t => ({
        correcao_id: correcao.id,
        topico_id: t.topico_id,
        acertos: t.acertos,
        total: t.total,
        percentual: t.percentual,
        nivel: t.nivel,
        observacao_ia: t.observacao
      }))

      const { error: desempErr } = await client
        .from('desempenho_topico')
        .insert(desempenhos)

      if (desempErr) throw desempErr
    }

    // 6. Atualizar envio → corrigido + nota
    await client
      .from('envios')
      .update({
        status_processamento: 'corrigido',
        nota: resultado.nota_geral,
        comentario: resultado.resumo,
        corrigido_em: new Date().toISOString()
      })
      .eq('id', envio_id)

    return { success: true, nota: resultado.nota_geral, resumo: resultado.resumo }
  } catch (e: any) {
    // 7. Erro → status erro
    await client
      .from('envios')
      .update({ status_processamento: 'erro' })
      .eq('id', envio_id)

    throw createError({ statusCode: 500, message: 'Erro na correção: ' + e.message })
  }
})
