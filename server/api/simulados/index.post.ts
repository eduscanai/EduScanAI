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
      message: 'O simulado deve ter entre 1 e 100 questões.'
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

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)

  if (!['admin', 'teacher'].includes(profile.role)) {
    throw createError({ statusCode: 403, message: 'Sem permissão para criar simulados.' })
  }

  const body = await readBody(event)
  const {
    titulo,
    turma_id: turmaId,
    questoes,
    matricula_em_blocos: matriculaEmBlocos = true,
    valor_maximo: valorMaximo = 10
  } = body || {}

  if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
    throw createError({ statusCode: 400, message: 'Informe o título do simulado.' })
  }
  if (!turmaId) {
    throw createError({ statusCode: 400, message: 'turma_id é obrigatório.' })
  }
  if (!(Number(valorMaximo) > 0)) {
    throw createError({ statusCode: 400, message: 'O valor total do simulado deve ser positivo.' })
  }

  const questoesNormalizadas = normalizarQuestoes(questoes)

  const client = await serverSupabaseServiceRole(event)

  const { data: turma, error: turmaErr } = await client
    .from('turmas')
    .select('id, school_id, name')
    .eq('id', turmaId)
    .single()

  if (turmaErr || !turma || turma.school_id !== profile.school_id) {
    throw createError({ statusCode: 404, message: 'Turma não encontrada nesta escola.' })
  }

  if (profile.role === 'teacher') {
    const { data: vinculo } = await client
      .from('turma_professores')
      .select('class_id')
      .eq('class_id', turmaId)
      .eq('teacher_id', profile.id)
      .maybeSingle()

    if (!vinculo) {
      throw createError({ statusCode: 403, message: 'Você não leciona nesta turma.' })
    }
  }

  const simuladoId = randomUUID()

  const { data: matriculados } = await client
    .from('turma_alunos')
    .select('student_id, perfis:student_id (id, full_name, matricula)')
    .eq('class_id', turmaId)

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
    identificador: simuladoId,
    matriculaEmBlocos,
    questoes: questoesNormalizadas,
    alunos: alunosParaFolha,
    turma: turma.name || ''
  })

  const basePath = `${profile.school_id}/simulados/${simuladoId}/gabarito`

  const arquivosParaEnviar: Array<[string, Buffer, string]> = [
    [
      'template.json',
      Buffer.from(JSON.stringify(gerado.arquivos.template_json)),
      'application/json'
    ],
    [
      'config.json',
      Buffer.from(JSON.stringify(gerado.arquivos.config_json)),
      'application/json'
    ],
    [
      'marcador.jpg',
      Buffer.from(gerado.arquivos.marcador_base64, 'base64'),
      'image/jpeg'
    ],
    [
      'folha_respostas.pdf',
      Buffer.from(gerado.arquivos.folha_respostas_base64, 'base64'),
      'application/pdf'
    ],
    [
      'folha_solucao.pdf',
      Buffer.from(gerado.arquivos.folha_solucao_base64, 'base64'),
      'application/pdf'
    ]
  ]

  // Um PDF só com a folha de todos os alunos (uma página cada), pra
  // imprimir a turma inteira de uma vez — só existe se houver alunos.
  if (gerado.folha_completa_base64) {
    arquivosParaEnviar.push([
      'todas_as_folhas.pdf',
      Buffer.from(gerado.folha_completa_base64, 'base64'),
      'application/pdf'
    ])
  }

  for (const [nomeArquivo, buffer, contentType] of arquivosParaEnviar) {
    const { error: uploadErr } = await client.storage
      .from('simulados-files')
      .upload(`${basePath}/${nomeArquivo}`, buffer, { contentType, upsert: true })

    if (uploadErr) {
      throw createError({
        statusCode: 500,
        message: `Erro ao salvar ${nomeArquivo}: ${uploadErr.message}`
      })
    }
  }

  // Folha personalizada por aluno (com QR) — caminho determinístico,
  // resolvido sob demanda na hora de baixar (não precisa gravar no banco).
  for (const folha of gerado.folhas_alunos) {
    const { error: uploadErr } = await client.storage
      .from('simulados-files')
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

  const { data: simulado, error: insertErr } = await client
    .from('simulados')
    .insert({
      id: simuladoId,
      escola_id: profile.school_id,
      turma_id: turmaId,
      professor_id: profile.id,
      titulo,
      questoes: questoesNormalizadas,
      gabarito: gerado.gabarito,
      pesos: gerado.pesos,
      valor_maximo: valorMaximo,
      matricula_em_blocos: matriculaEmBlocos,
      template_json: gerado.arquivos.template_json,
      config_json: gerado.arquivos.config_json,
      marcador_url: `${basePath}/marcador.jpg`,
      folha_respostas_url: `${basePath}/folha_respostas.pdf`,
      folha_solucao_url: `${basePath}/folha_solucao.pdf`
    })
    .select()
    .single()

  if (insertErr) {
    throw createError({ statusCode: 500, message: 'Erro ao criar simulado: ' + insertErr.message })
  }

  return simulado
})
