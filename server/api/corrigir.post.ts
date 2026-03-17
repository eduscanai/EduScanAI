import { serverSupabaseServiceRole } from '#supabase/server'

// Mock da IA — sera substituido pela IA real
// Recebe: gabarito URLs, resposta URLs, habilidades
// Retorna: nota, comentario, avaliacao por habilidade
async function corrigirComIA(
  respostaUrls: string[],
  gabaritoUrls: string[],
  habilidades: { id: string; code: string | null; description: string }[]
) {
  // Mock: gera resultado simulado
  const totalQuestoes = Math.max(habilidades.length * 2, 5)
  const acertos = Math.floor(Math.random() * (totalQuestoes + 1))
  const nota = Math.round((acertos / totalQuestoes) * 10 * 10) / 10

  const niveis = ['insatisfatorio', 'regular', 'satisfatorio'] as const
  const avaliacaoHabilidades = habilidades.map(h => {
    const nivelIdx = Math.floor(Math.random() * 3)
    const nivel = niveis[nivelIdx]
    return {
      habilidade_id: h.id,
      nivel,
      observacao: `${nivel === 'satisfatorio' ? 'Demonstrou dominio' : nivel === 'regular' ? 'Desempenho mediano' : 'Precisa de reforco'} em ${h.code || h.description.substring(0, 30)}.`
    }
  })

  const comentario = `O aluno acertou ${acertos} de ${totalQuestoes} questoes, obtendo nota ${nota}. ${acertos >= totalQuestoes * 0.7 ? 'Bom desempenho geral.' : 'Ha pontos a melhorar.'}`

  return {
    nota,
    total_questoes: totalQuestoes,
    acertos,
    comentario,
    avaliacao_habilidades: avaliacaoHabilidades,
    resposta_raw: { nota, acertos, totalQuestoes, avaliacaoHabilidades, modelo: 'mock-v1' }
  }
}

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const client = await serverSupabaseServiceRole(event)
  const { envio_id } = await readBody(event)

  if (!envio_id) {
    throw createError({ statusCode: 400, message: 'envio_id é obrigatório' })
  }

  // 1. Buscar envio com atividade
  const { data: envio, error: envioErr } = await client
    .from('envios')
    .select('*, atividades(id, anexos, gabarito, escola_id, professor_id)')
    .eq('id', envio_id)
    .single()

  if (envioErr || !envio) {
    throw createError({ statusCode: 404, message: 'Envio não encontrado' })
  }

  const atividade = envio.atividades as any
  if (profile.role !== 'admin' && atividade.professor_id !== profile.id) {
    throw createError({ statusCode: 403, message: 'Sem permissão para corrigir este envio' })
  }

  // 2. Marcar como processando
  await client
    .from('envios')
    .update({ status_processamento: 'processando' })
    .eq('id', envio_id)

  try {
    // 3. Buscar habilidades BNCC vinculadas a atividade
    const { data: habLinks } = await client
      .from('atividade_habilidades')
      .select('habilidade_id, bncc_habilidades(id, code, description)')
      .eq('atividade_id', envio.atividade_id)

    const habilidades = (habLinks || []).map((h: any) => ({
      id: h.bncc_habilidades.id,
      code: h.bncc_habilidades.code,
      description: h.bncc_habilidades.description
    }))

    // 4. Extrair URLs do gabarito e da resposta
    const gabaritoUrls = (atividade.gabarito || []).map((g: any) => g.url)
    const respostaUrls = (envio.anexos || []).map((a: any) => a.url)

    // 5. Chamar IA (mock por enquanto)
    const resultado = await corrigirComIA(respostaUrls, gabaritoUrls, habilidades)

    // 6. Gravar em correcoes_ia
    const { data: correcao, error: correcaoErr } = await client
      .from('correcoes_ia')
      .upsert({
        envio_id,
        nota_geral: resultado.nota,
        total_questoes: resultado.total_questoes,
        acertos: resultado.acertos,
        resumo_ia: resultado.comentario,
        resposta_raw: resultado.resposta_raw,
        modelo_ia: 'mock-v1',
        processado_em: new Date().toISOString()
      }, { onConflict: 'envio_id' })
      .select()
      .single()

    if (correcaoErr) throw correcaoErr

    // 7. Gravar avaliacao por habilidade
    if (resultado.avaliacao_habilidades.length > 0) {
      // Limpar anteriores
      await client
        .from('avaliacao_habilidades')
        .delete()
        .eq('envio_id', envio_id)

      const avaliacoes = resultado.avaliacao_habilidades.map(a => ({
        envio_id,
        habilidade_id: a.habilidade_id,
        nivel: a.nivel,
        observacao: a.observacao
      }))

      const { error: avErr } = await client
        .from('avaliacao_habilidades')
        .insert(avaliacoes)

      if (avErr) console.error('Erro ao gravar avaliacao_habilidades:', avErr.message)
    }

    // 8. Atualizar envio com nota e status
    const isLote = envio.origem === 'professor_lote'
    await client
      .from('envios')
      .update({
        status_processamento: 'corrigido',
        nota: resultado.nota,
        comentario: resultado.comentario,
        corrigido_em: new Date().toISOString(),
        // Lote ja vem validado, envio do aluno precisa validacao
        validado_professor: isLote
      })
      .eq('id', envio_id)

    return { success: true, nota: resultado.nota, comentario: resultado.comentario }
  } catch (e: any) {
    await client
      .from('envios')
      .update({ status_processamento: 'erro' })
      .eq('id', envio_id)

    throw createError({ statusCode: 500, message: 'Erro na correção: ' + e.message })
  }
})
