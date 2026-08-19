import { serverSupabaseServiceRole } from '#supabase/server'
import { randomUUID } from 'node:crypto'

interface QuestaoPayload {
  numero?: number
  option_count: number
  resposta: string
  peso?: number
}

const normalizarQuestoes = (questoes: unknown) => {
  if (!Array.isArray(questoes) || questoes.length === 0 || questoes.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'A prova objetiva deve ter entre 1 e 100 questões.'
    })
  }

  return questoes.map((questaoBruta: QuestaoPayload, index: number) => {
    const numero = Number(questaoBruta.numero ?? index + 1)
    const optionCount = Number(questaoBruta.option_count)
    const resposta = String(questaoBruta.resposta || '').toUpperCase().trim()
    const peso = Number(questaoBruta.peso ?? 1)

    if (!Number.isInteger(optionCount) || optionCount < 2 || optionCount > 5) {
      throw createError({
        statusCode: 400,
        message: `A questão ${numero} deve ter entre 2 e 5 alternativas.`
      })
    }

    if (!(peso >= 0.1 && peso <= 1)) {
      throw createError({
        statusCode: 400,
        message: `O peso da questão ${numero} deve estar entre 0,1 e 1.`
      })
    }

    const permitido = Array.from({ length: optionCount }, (_, i) =>
      String.fromCharCode(65 + i)
    )
    if (!permitido.includes(resposta)) {
      throw createError({
        statusCode: 400,
        message: `Marque uma resposta válida na questão ${numero}.`
      })
    }

    return { numero, option_count: optionCount, resposta, peso }
  })
}

// Cria uma atividade do tipo "objetiva" por turma selecionada — mesma ideia
// de server/api/simulados/index.post.ts (gera gabarito + folha por aluno via
// o microserviço OMR), mas a atividade continua vivendo em atividades/envios
// (turma, disciplina, categoria, período, prazo, peso, habilidades) em vez
// de duplicar simulados/simulado_envios. Ver migration 036.
export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)

  if (!['admin', 'teacher'].includes(profile.role)) {
    throw createError({ statusCode: 403, message: 'Sem permissão para criar atividades.' })
  }

  const body = await readBody(event)
  const {
    titulo,
    descricao,
    turma_ids: turmaIds,
    disciplina_id: disciplinaId,
    categoria_id: categoriaId,
    periodo_id: periodoId,
    data_entrega: dataEntrega,
    nota_maxima: notaMaxima = 10,
    peso = 1,
    visivel_aluno: visivelAluno = false,
    questoes,
    matricula_em_blocos: matriculaEmBlocos = false
  } = body || {}

  if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
    throw createError({ statusCode: 400, message: 'Informe o título da atividade.' })
  }
  if (!Array.isArray(turmaIds) || turmaIds.length === 0) {
    throw createError({ statusCode: 400, message: 'Selecione ao menos uma turma.' })
  }
  if (!(Number(notaMaxima) > 0)) {
    throw createError({ statusCode: 400, message: 'O valor da atividade deve ser positivo.' })
  }

  const questoesNormalizadas = normalizarQuestoes(questoes)

  const client = await serverSupabaseServiceRole(event)

  const { data: turmas, error: turmasErr } = await client
    .from('turmas')
    .select('id, school_id, name')
    .in('id', turmaIds)

  if (turmasErr || !turmas || turmas.length !== turmaIds.length) {
    throw createError({ statusCode: 404, message: 'Uma ou mais turmas não foram encontradas nesta escola.' })
  }
  if (turmas.some((t: any) => t.school_id !== profile.school_id)) {
    throw createError({ statusCode: 404, message: 'Uma ou mais turmas não foram encontradas nesta escola.' })
  }

  if (profile.role === 'teacher') {
    const { data: vinculos } = await client
      .from('turma_professores')
      .select('class_id')
      .in('class_id', turmaIds)
      .eq('teacher_id', profile.id)

    const turmasVinculadas = new Set((vinculos || []).map((v: any) => v.class_id))
    if (turmaIds.some((id: string) => !turmasVinculadas.has(id))) {
      throw createError({ statusCode: 403, message: 'Você não leciona em uma ou mais turmas selecionadas.' })
    }
  }

  const atividadesCriadas: any[] = []

  for (const turma of turmas) {
    const atividadeId = randomUUID()

    const { data: matriculados } = await client
      .from('turma_alunos')
      .select('student_id, perfis:student_id (id, full_name, matricula)')
      .eq('class_id', turma.id)

    const alunosParaFolha = (matriculados || [])
      .map((registro: any) => registro.perfis)
      .filter((aluno: any) => aluno && aluno.id)
      .map((aluno: any) => ({
        aluno_id: aluno.id,
        nome: aluno.full_name || '',
        matricula: aluno.matricula || ''
      }))

    const gerado = await gerarGabaritoOMR({
      titulo,
      identificador: atividadeId,
      matriculaEmBlocos,
      questoes: questoesNormalizadas,
      alunos: alunosParaFolha,
      turma: turma.name || ''
    })

    const basePath = `${profile.school_id}/atividades/${atividadeId}/gabarito`

    const arquivosParaEnviar: Array<[string, Buffer, string]> = [
      ['template.json', Buffer.from(JSON.stringify(gerado.arquivos.template_json)), 'application/json'],
      ['config.json', Buffer.from(JSON.stringify(gerado.arquivos.config_json)), 'application/json'],
      ['marcador.jpg', Buffer.from(gerado.arquivos.marcador_base64, 'base64'), 'image/jpeg'],
      ['folha_respostas.pdf', Buffer.from(gerado.arquivos.folha_respostas_base64, 'base64'), 'application/pdf'],
      ['folha_solucao.pdf', Buffer.from(gerado.arquivos.folha_solucao_base64, 'base64'), 'application/pdf']
    ]

    if (gerado.folha_completa_base64) {
      arquivosParaEnviar.push([
        'todas_as_folhas.pdf',
        Buffer.from(gerado.folha_completa_base64, 'base64'),
        'application/pdf'
      ])
    }

    for (const [nomeArquivo, buffer, contentType] of arquivosParaEnviar) {
      const { error: uploadErr } = await client.storage
        .from('assignments-files')
        .upload(`${basePath}/${nomeArquivo}`, buffer, { contentType, upsert: true })

      if (uploadErr) {
        throw createError({
          statusCode: 500,
          message: `Erro ao salvar ${nomeArquivo}: ${uploadErr.message}`
        })
      }
    }

    for (const folha of gerado.folhas_alunos) {
      const { error: uploadErr } = await client.storage
        .from('assignments-files')
        .upload(
          `${basePath}/alunos/${folha.aluno_id}.pdf`,
          Buffer.from(folha.folha_base64, 'base64'),
          { contentType: 'application/pdf', upsert: true }
        )

      if (uploadErr) {
        throw createError({
          statusCode: 500,
          message: `Erro ao salvar folha do aluno ${folha.aluno_id}: ${uploadErr.message}`
        })
      }
    }

    const { data: atividade, error: insertErr } = await client
      .from('atividades')
      .insert({
        id: atividadeId,
        escola_id: profile.school_id,
        turma_id: turma.id,
        professor_id: profile.id,
        titulo,
        descricao: descricao || null,
        disciplina_id: disciplinaId || null,
        categoria_id: categoriaId || null,
        periodo_id: periodoId || null,
        data_entrega: dataEntrega || null,
        nota_maxima: notaMaxima,
        peso,
        tipo: 'objetiva',
        modo_envio: 'lote',
        visivel_aluno: visivelAluno,
        status: 'draft'
      })
      .select()
      .single()

    if (insertErr || !atividade) {
      throw createError({ statusCode: 500, message: 'Erro ao criar atividade: ' + insertErr?.message })
    }

    const { error: omrErr } = await client
      .from('atividade_objetiva')
      .insert({
        atividade_id: atividadeId,
        questoes: questoesNormalizadas,
        gabarito: gerado.gabarito,
        pesos: gerado.pesos,
        matricula_em_blocos: matriculaEmBlocos,
        template_json: gerado.arquivos.template_json,
        config_json: gerado.arquivos.config_json,
        marcador_url: `${basePath}/marcador.jpg`,
        folha_respostas_url: `${basePath}/folha_respostas.pdf`,
        folha_solucao_url: `${basePath}/folha_solucao.pdf`
      })

    if (omrErr) {
      throw createError({ statusCode: 500, message: 'Erro ao salvar config da prova objetiva: ' + omrErr.message })
    }

    atividadesCriadas.push(atividade)
  }

  return atividadesCriadas
})
