import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const client = await serverSupabaseServiceRole(event)
  const { atividade_id, arquivos } = await readBody(event)

  if (!atividade_id || !arquivos || !Array.isArray(arquivos) || arquivos.length === 0) {
    throw createError({ statusCode: 400, message: 'atividade_id e arquivos[] são obrigatórios' })
  }

  // Verificar atividade
  const { data: atividade, error: atividadeErr } = await client
    .from('atividades')
    .select('id, status, escola_id, professor_id, turma_id')
    .eq('id', atividade_id)
    .single()

  if (atividadeErr || !atividade) {
    throw createError({ statusCode: 404, message: 'Atividade não encontrada' })
  }

  if (profile.role !== 'admin' && atividade.professor_id !== profile.id) {
    throw createError({ statusCode: 403, message: 'Sem permissão' })
  }

  if (atividade.status !== 'published') {
    throw createError({ statusCode: 400, message: 'A atividade precisa estar publicada' })
  }

  // Buscar alunos da turma
  const { data: matriculas } = await client
    .from('turma_alunos')
    .select('student_id')
    .eq('class_id', atividade.turma_id)

  const alunoIds = (matriculas || []).map((m: any) => m.student_id)

  if (alunoIds.length === 0) {
    throw createError({ statusCode: 400, message: 'Nenhum aluno matriculado nesta turma' })
  }

  // Criar um envio por aluno com os arquivos anexados
  // A IA vai processar depois e identificar cada aluno nos PDFs
  // Por enquanto, criamos envios para todos os alunos com os mesmos arquivos
  const envios = alunoIds.map((alunoId: string) => ({
    atividade_id,
    aluno_id: alunoId,
    conteudo: null,
    anexos: arquivos,
    origem: 'professor_lote',
    status_processamento: 'pendente',
    validado_professor: true, // Lote do professor ja vem validado
    enviado_em: new Date().toISOString()
  }))

  // Upsert para nao duplicar (atividade_id + aluno_id e unique)
  const { data: criados, error: insertErr } = await client
    .from('envios')
    .upsert(envios, { onConflict: 'atividade_id,aluno_id' })
    .select('id, aluno_id')

  if (insertErr) {
    throw createError({ statusCode: 500, message: 'Erro ao criar envios: ' + insertErr.message })
  }

  // Disparar correcao IA para cada envio (fire and forget)
  const enviosCriados = criados || []
  for (const envio of enviosCriados) {
    $fetch('/api/corrigir', {
      method: 'POST',
      body: { envio_id: envio.id },
      headers: event.headers
    }).catch(err => {
      console.error(`Erro ao processar envio ${envio.id}:`, err.message)
    })
  }

  return {
    total_envios: enviosCriados.length,
    total_alunos: alunoIds.length,
    status: 'processando'
  }
})
