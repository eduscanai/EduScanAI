import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const client = await serverSupabaseServiceRole(event)
  const { atividade_id, arquivos } = await readBody(event)

  if (!atividade_id || !arquivos || !Array.isArray(arquivos) || arquivos.length === 0) {
    throw createError({ statusCode: 400, message: 'atividade_id e arquivos[] são obrigatórios' })
  }

  // Verificar atividade
  const { data: assignment, error: assignmentErr } = await client
    .from('atividades')
    .select('id, status, escola_id, professor_id, turma_id')
    .eq('id', atividade_id)
    .single()

  if (assignmentErr || !assignment) {
    throw createError({ statusCode: 404, message: 'Atividade não encontrada' })
  }

  // Verificar permissão
  if (profile.role !== 'admin' && assignment.professor_id !== profile.id) {
    throw createError({ statusCode: 403, message: 'Sem permissão' })
  }

  // Verificar status
  if (assignment.status !== 'published') {
    throw createError({ statusCode: 400, message: 'A atividade precisa estar publicada para receber envios' })
  }

  // Criar envio em lote (a IA processará os arquivos e identificará os alunos)
  const { data: submission, error: subErr } = await client
    .from('envios')
    .insert({
      atividade_id,
      aluno_id: profile.id,
      conteudo: null,
      anexos: arquivos,
      origem: 'professor_lote',
      status_processamento: 'pendente',
      enviado_em: new Date().toISOString()
    })
    .select()
    .single()

  if (subErr) {
    throw createError({ statusCode: 500, message: 'Erro ao criar envio: ' + subErr.message })
  }

  // Disparar correção assíncrona (fire and forget)
  if (submission) {
    $fetch('/api/corrigir', {
      method: 'POST',
      body: { envio_id: submission.id, modo: 'lote' },
      headers: event.headers
    }).catch(err => {
      console.error(`Erro ao processar lote ${submission.id}:`, err.message)
    })
  }

  return { id: submission.id, status: 'pendente', arquivos: arquivos.length }
})
