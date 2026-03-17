import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const client = await serverSupabaseServiceRole(event)
  const { atividade_id, conteudo, anexos } = await readBody(event)

  if (!atividade_id) {
    throw createError({ statusCode: 400, message: 'atividade_id é obrigatório' })
  }

  // Buscar atividade
  const { data: atividade, error: atividadeErr } = await client
    .from('atividades')
    .select('id, status, data_entrega, escola_id, turma_id')
    .eq('id', atividade_id)
    .single()

  if (atividadeErr || !atividade) {
    throw createError({ statusCode: 404, message: 'Atividade não encontrada' })
  }

  if (atividade.status !== 'published') {
    throw createError({ statusCode: 400, message: 'Só é possível enviar respostas para atividades publicadas' })
  }

  // Validar prazo
  if (atividade.data_entrega && new Date(atividade.data_entrega) < new Date()) {
    throw createError({ statusCode: 400, message: 'O prazo de entrega desta atividade já expirou' })
  }

  // Verificar matricula
  const { data: matricula } = await client
    .from('turma_alunos')
    .select('id')
    .eq('class_id', atividade.turma_id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!matricula) {
    throw createError({ statusCode: 403, message: 'Você não está matriculado nesta turma' })
  }

  // Verificar se ja foi corrigida e validada
  const { data: existing } = await client
    .from('envios')
    .select('id, corrigido_em, validado_professor')
    .eq('atividade_id', atividade_id)
    .eq('aluno_id', user.id)
    .maybeSingle()

  if (existing?.corrigido_em && existing?.validado_professor) {
    throw createError({ statusCode: 400, message: 'Esta atividade já foi corrigida e validada, não pode ser reenviada' })
  }

  // Criar/atualizar envio
  const { data: submission, error: subErr } = await client
    .from('envios')
    .upsert({
      atividade_id,
      aluno_id: user.id,
      conteudo: conteudo || null,
      anexos: anexos || [],
      origem: 'aluno',
      status_processamento: 'pendente',
      validado_professor: false, // Envio do aluno precisa validacao
      enviado_em: new Date().toISOString()
    }, { onConflict: 'atividade_id,aluno_id' })
    .select()
    .single()

  if (subErr) {
    throw createError({ statusCode: 500, message: 'Erro ao enviar: ' + subErr.message })
  }

  // Disparar correcao IA automaticamente (fire and forget)
  if (submission) {
    $fetch('/api/corrigir', {
      method: 'POST',
      body: { envio_id: submission.id },
      headers: event.headers
    }).catch(err => {
      console.error(`Erro ao corrigir envio ${submission.id}:`, err.message)
    })
  }

  return submission
})
