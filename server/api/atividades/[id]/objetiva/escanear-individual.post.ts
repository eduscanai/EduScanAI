import { serverSupabaseServiceRole } from '#supabase/server'

// Correção (ou recorreção) de UM envio para um aluno já conhecido — mesmo
// papel de server/api/simulados/[id]/envios/individual.post.ts: reenvio
// avulso ou resolução manual de uma página que o /escanear-lote não
// conseguiu casar (ver nao_identificados).
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
    .eq('class_id', atividade.turma_id)
    .eq('student_id', alunoId)
    .maybeSingle()

  if (!matricula) {
    throw createError({ statusCode: 400, message: 'Este aluno não está matriculado na turma da atividade.' })
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

  const correcao = await corrigirFolhaOMR({
    sheetBuffer: arquivo.data,
    sheetFilename: arquivo.filename || 'folha.png',
    sheetContentType: arquivo.type || 'image/png',
    templateJson: config.template_json,
    configJson: config.config_json,
    markerBuffer: marcadorBuffer,
    // O aluno já é conhecido (selecionado manualmente) — não precisa de QR
    // nem de OCR de matrícula aqui.
    matriculaEmBlocos: false,
    gabarito: {
      questoes: config.questoes,
      valorMaximo: atividade.nota_maxima
    }
  })

  const basePath = `${profile.school_id}/${alunoId}/atividades-objetivas/${atividadeId}`
  const timestamp = Date.now()
  const caminhoOriginal = `${basePath}/original_${timestamp}.png`

  const { error: uploadOriginalErr } = await client.storage
    .from('submissions-files')
    .upload(caminhoOriginal, arquivo.data, {
      contentType: arquivo.type || 'image/png',
      upsert: true
    })

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
        status_processamento: 'aguardando_confirmacao',
        nota: nota?.nota ?? null,
        corrigido_em: null,
        validado_professor: false
      },
      { onConflict: 'atividade_id,aluno_id' }
    )
    .select()
    .single()

  if (envioErr || !envio) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar o resultado: ' + envioErr?.message })
  }

  const { error: omrResultErr } = await client
    .from('envio_objetivo')
    .upsert(
      {
        envio_id: envio.id,
        arquivo_original_url: uploadOriginalErr ? null : caminhoOriginal,
        matricula_detectada: correcao.matricula?.valor || null,
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
    throw createError({ statusCode: 500, message: 'Erro ao salvar o detalhe da correção: ' + omrResultErr.message })
  }

  return envio
})
