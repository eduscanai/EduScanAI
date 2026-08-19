import { serverSupabaseServiceRole } from '#supabase/server'

// Correção (ou recorreção) de UM envio para um aluno já conhecido — usado
// tanto para reenvio individual quanto para resolver manualmente uma folha
// que o /lote não conseguiu casar por matrícula (ver nao_identificados).
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const simuladoId = getRouterParam(event, 'id')

  if (!simuladoId) {
    throw createError({ statusCode: 400, message: 'Simulado inválido.' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: simulado, error: simuladoErr } = await client
    .from('simulados')
    .select('*')
    .eq('id', simuladoId)
    .single()

  if (simuladoErr || !simulado) {
    throw createError({ statusCode: 404, message: 'Simulado não encontrado.' })
  }

  const podeGerenciar =
    simulado.professor_id === profile.id ||
    (profile.role === 'admin' && simulado.escola_id === profile.school_id)

  if (!podeGerenciar) {
    throw createError({ statusCode: 403, message: 'Sem permissão para corrigir este simulado.' })
  }

  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find((parte) => parte.name === 'arquivo')
  const alunoIdParte = partes?.find((parte) => parte.name === 'aluno_id')
  const alunoId = alunoIdParte?.data?.toString('utf-8').trim()

  if (!alunoId) {
    throw createError({ statusCode: 400, message: 'Envie o campo "aluno_id".' })
  }
  if (!arquivo || !arquivo.data?.length) {
    throw createError({ statusCode: 400, message: 'Envie o arquivo escaneado no campo "arquivo".' })
  }

  const { data: matricula } = await client
    .from('turma_alunos')
    .select('student_id')
    .eq('class_id', simulado.turma_id)
    .eq('student_id', alunoId)
    .maybeSingle()

  if (!matricula) {
    throw createError({ statusCode: 400, message: 'Este aluno não está matriculado na turma do simulado.' })
  }

  const { data: marcadorBlob, error: marcadorErr } = await client.storage
    .from('simulados-files')
    .download(simulado.marcador_url)

  if (marcadorErr || !marcadorBlob) {
    throw createError({
      statusCode: 500,
      message: 'Não foi possível carregar o marcador gerado para este simulado.'
    })
  }
  const marcadorBuffer = Buffer.from(await marcadorBlob.arrayBuffer())

  const correcao = await corrigirFolhaOMR({
    sheetBuffer: arquivo.data,
    sheetFilename: arquivo.filename || 'folha.png',
    sheetContentType: arquivo.type || 'image/png',
    templateJson: simulado.template_json,
    configJson: simulado.config_json,
    markerBuffer: marcadorBuffer,
    // Identificação é sempre via QR agora; aqui o aluno já é conhecido (foi
    // selecionado manualmente), então nem isso é necessário — sem OCR de
    // matrícula em lugar nenhum do fluxo.
    matriculaEmBlocos: false,
    gabarito: {
      questoes: simulado.questoes,
      valorMaximo: simulado.valor_maximo
    }
  })

  const basePath = `${profile.school_id}/simulados/${simuladoId}/envios/${alunoId}`
  const timestamp = Date.now()
  const caminhoOriginal = `${basePath}/original_${timestamp}.png`

  const { error: uploadOriginalErr } = await client.storage
    .from('simulados-files')
    .upload(caminhoOriginal, arquivo.data, {
      contentType: arquivo.type || 'image/png',
      upsert: true
    })

  let imagemProcessadaUrl: string | null = null
  if (correcao.imagem_processada_base64) {
    const caminhoProcessada = `${basePath}/processada_${timestamp}.png`
    const { error: uploadProcessadaErr } = await client.storage
      .from('simulados-files')
      .upload(
        caminhoProcessada,
        Buffer.from(correcao.imagem_processada_base64, 'base64'),
        { contentType: 'image/png', upsert: true }
      )
    if (!uploadProcessadaErr) {
      imagemProcessadaUrl = caminhoProcessada
    }
  }

  const nota = correcao.nota

  const { data: envio, error: envioErr } = await client
    .from('simulado_envios')
    .upsert(
      {
        simulado_id: simuladoId,
        aluno_id: alunoId,
        status_processamento: 'corrigido',
        arquivo_original_url: uploadOriginalErr ? null : caminhoOriginal,
        matricula_detectada: correcao.matricula?.valor || null,
        imagem_processada_url: imagemProcessadaUrl,
        respostas_detectadas: correcao.respostas_detectadas,
        nota: nota?.nota ?? null,
        percentual: nota?.percentual ?? null,
        acertos: nota?.acertos ?? null,
        erros: nota?.erros ?? null,
        em_branco: nota?.em_branco ?? null,
        detalhes: nota?.detalhes ?? null,
        log_excerto: correcao.log_excerto,
        corrigido_em: new Date().toISOString()
      },
      { onConflict: 'simulado_id,aluno_id' }
    )
    .select()
    .single()

  if (envioErr) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar o resultado: ' + envioErr.message })
  }

  return envio
})
