import { serverSupabaseServiceRole } from '#supabase/server'

interface ResultadoPagina {
  id: string
  aluno_id: string
  nota: number | null
  status_processamento: string
}

interface PaginaNaoIdentificada {
  pagina: string
  motivo: string
  // PNG em base64 da própria página já processada, só quando a correção deu
  // certo mas não achou o aluno — permite atribuir manualmente na UI sem
  // escanear de novo (ver /envios/individual).
  pagina_base64?: string
}

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

  if (!arquivo || !arquivo.data?.length) {
    throw createError({
      statusCode: 400,
      message: 'Envie o arquivo escaneado no campo "arquivo" (PDF com várias páginas ou uma imagem).'
    })
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

  const { paginas } = await dividirFolhaOMR(
    arquivo.filename || 'lote.pdf',
    arquivo.data,
    arquivo.type || 'application/octet-stream'
  )

  const { data: matriculados } = await client
    .from('turma_alunos')
    .select('student_id')
    .eq('class_id', simulado.turma_id)

  const idsMatriculados = new Set((matriculados || []).map((registro: any) => registro.student_id))

  const resultados: ResultadoPagina[] = []
  const naoIdentificados: PaginaNaoIdentificada[] = []

  for (const pagina of paginas) {
    const paginaBuffer = Buffer.from(pagina.conteudo_base64, 'base64')

    let correcao
    try {
      correcao = await corrigirFolhaOMR({
        sheetBuffer: paginaBuffer,
        sheetFilename: pagina.nome,
        sheetContentType: 'image/png',
        templateJson: simulado.template_json,
        configJson: simulado.config_json,
        markerBuffer: marcadorBuffer,
        matriculaEmBlocos: false,
        gabarito: {
          questoes: simulado.questoes,
          valorMaximo: simulado.valor_maximo
        }
      })
    } catch (err: any) {
      naoIdentificados.push({
        pagina: pagina.nome,
        motivo: 'Falha ao processar a folha: ' + (err?.data?.detail || err.message)
      })
      continue
    }

    // Identificação é 100% via QR (a folha personalizada de cada aluno tem
    // um QR único) — sem fallback por matrícula, sem OCR de caligrafia.
    // Folhas sem QR legível (ou de simulados antigos, sem folha
    // personalizada) caem em "não identificados" pra atribuição manual.
    let alunoId: string | null = null
    if (
      correcao.qr &&
      correcao.qr.simulado_id === simuladoId &&
      idsMatriculados.has(correcao.qr.aluno_id)
    ) {
      alunoId = correcao.qr.aluno_id
    }

    if (!alunoId) {
      naoIdentificados.push({
        pagina: pagina.nome,
        motivo: correcao.qr
          ? 'O QR lido não corresponde a um aluno matriculado nesta turma.'
          : 'Não foi possível ler o QR desta folha.',
        pagina_base64: pagina.conteudo_base64
      })
      continue
    }

    const basePath = `${profile.school_id}/simulados/${simuladoId}/envios/${alunoId}`
    const timestamp = Date.now()
    const caminhoOriginal = `${basePath}/original_${timestamp}.png`

    const { error: uploadOriginalErr } = await client.storage
      .from('simulados-files')
      .upload(caminhoOriginal, paginaBuffer, { contentType: 'image/png', upsert: true })

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
          // Fica aguardando o professor revisar e confirmar — só vira
          // "corrigido" (e passa a contar pro aluno) depois da confirmação
          // manual (ver /envios/[envioId]/confirmar).
          status_processamento: 'aguardando_confirmacao',
          arquivo_original_url: uploadOriginalErr ? null : caminhoOriginal,
          imagem_processada_url: imagemProcessadaUrl,
          respostas_detectadas: correcao.respostas_detectadas,
          nota: nota?.nota ?? null,
          percentual: nota?.percentual ?? null,
          acertos: nota?.acertos ?? null,
          erros: nota?.erros ?? null,
          em_branco: nota?.em_branco ?? null,
          detalhes: nota?.detalhes ?? null,
          log_excerto: correcao.log_excerto,
          corrigido_em: null
        },
        { onConflict: 'simulado_id,aluno_id' }
      )
      .select('id, aluno_id, nota, status_processamento')
      .single()

    if (envioErr || !envio) {
      naoIdentificados.push({
        pagina: pagina.nome,
        motivo: 'Erro ao salvar o resultado: ' + (envioErr?.message || 'desconhecido')
      })
      continue
    }

    resultados.push(envio)
  }

  return {
    total_paginas: paginas.length,
    aguardando_confirmacao: resultados.length,
    envios: resultados,
    nao_identificados: naoIdentificados
  }
})
