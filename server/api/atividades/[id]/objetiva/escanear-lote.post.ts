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
  pagina_base64?: string
}

// Espelha server/api/simulados/[id]/envios/lote.post.ts, mas grava em
// envios + envio_objetivo (ver migration 036) em vez de simulado_envios.
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const atividadeId = getRouterParam(event, 'id')

  if (!atividadeId) {
    throw createError({ statusCode: 400, message: 'Atividade inválida.' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: atividade, error: atividadeErr } = await client
    .from('atividades')
    .select('*, atividade_objetiva(*)')
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
    throw createError({ statusCode: 403, message: 'Sem permissão para corrigir esta atividade.' })
  }

  const config = atividade.atividade_objetiva

  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find((parte) => parte.name === 'arquivo')

  if (!arquivo || !arquivo.data?.length) {
    throw createError({
      statusCode: 400,
      message: 'Envie o arquivo escaneado no campo "arquivo" (PDF com várias páginas ou uma imagem).'
    })
  }

  const { data: marcadorBlob, error: marcadorErr } = await client.storage
    .from('assignments-files')
    .download(config.marcador_url)

  if (marcadorErr || !marcadorBlob) {
    throw createError({
      statusCode: 500,
      message: 'Não foi possível carregar o marcador gerado para esta atividade.'
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
    .eq('class_id', atividade.turma_id)

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
        templateJson: config.template_json,
        configJson: config.config_json,
        markerBuffer: marcadorBuffer,
        matriculaEmBlocos: false,
        gabarito: {
          questoes: config.questoes,
          valorMaximo: atividade.nota_maxima
        }
      })
    } catch (err: any) {
      naoIdentificados.push({
        pagina: pagina.nome,
        motivo: 'Falha ao processar a folha: ' + (err?.data?.detail || err.message)
      })
      continue
    }

    // Identificação 100% via QR — o campo "simulado_id" do serviço OMR é um
    // identificador genérico de prova; aqui carrega o atividade_id.
    let alunoId: string | null = null
    if (
      correcao.qr &&
      correcao.qr.simulado_id === atividadeId &&
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

    const basePath = `${profile.school_id}/${alunoId}/atividades-objetivas/${atividadeId}`
    const timestamp = Date.now()
    const caminhoOriginal = `${basePath}/original_${timestamp}.png`

    const { error: uploadOriginalErr } = await client.storage
      .from('submissions-files')
      .upload(caminhoOriginal, paginaBuffer, { contentType: 'image/png', upsert: true })

    let imagemProcessadaUrl: string | null = null
    if (correcao.imagem_processada_base64) {
      const caminhoProcessada = `${basePath}/processada_${timestamp}.png`
      const { error: uploadProcessadaErr } = await client.storage
        .from('submissions-files')
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
      .from('envios')
      .upsert(
        {
          atividade_id: atividadeId,
          aluno_id: alunoId,
          origem: 'professor_lote',
          // Fica aguardando o professor revisar e confirmar — só vira
          // "corrigido" (e passa a contar pro aluno) depois da confirmação
          // manual (ver /objetiva/envios/[envioId]/confirmar).
          status_processamento: 'aguardando_confirmacao',
          nota: nota?.nota ?? null,
          corrigido_em: null,
          validado_professor: false
        },
        { onConflict: 'atividade_id,aluno_id' }
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

    const { error: omrResultErr } = await client
      .from('envio_objetivo')
      .upsert(
        {
          envio_id: envio.id,
          arquivo_original_url: uploadOriginalErr ? null : caminhoOriginal,
          imagem_processada_url: imagemProcessadaUrl,
          respostas_detectadas: correcao.respostas_detectadas,
          percentual: nota?.percentual ?? null,
          acertos: nota?.acertos ?? null,
          erros: nota?.erros ?? null,
          em_branco: nota?.em_branco ?? null,
          detalhes: nota?.detalhes ?? null,
          log_excerto: correcao.log_excerto
        },
        { onConflict: 'envio_id' }
      )

    if (omrResultErr) {
      naoIdentificados.push({
        pagina: pagina.nome,
        motivo: 'Erro ao salvar o detalhe da correção: ' + omrResultErr.message
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
