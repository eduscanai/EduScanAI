interface Submission {
  id: string
  atividade_id: string
  aluno_id: string
  conteudo: string | null
  anexos: { name: string; url: string }[]
  enviado_em: string
  nota: number | null
  comentario: string | null
  corrigido_em: string | null
  corrigido_por: string | null
  origem: 'aluno' | 'professor_lote'
  status_processamento: 'pendente' | 'processando' | 'corrigido' | 'erro'
  profiles?: { id: string; full_name: string; email: string; avatar_url: string | null }
}

export const useSubmissions = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSubmissionsForAssignment = async (assignmentId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .select('*, perfis(id, full_name, email, avatar_url)')
        .eq('atividade_id', assignmentId)
        .order('enviado_em', { ascending: false })
      if (err) throw err
      submissions.value = (data || []) as Submission[]
      return submissions.value
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getSubmission = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .select('*, perfis(id, full_name, email, avatar_url)')
        .eq('id', id)
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const getMySubmission = async (assignmentId: string) => {
    if (!usuario.value.id) return null
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .select('*')
        .eq('atividade_id', assignmentId)
        .eq('aluno_id', usuario.value.id!)
        .maybeSingle()
      if (err) throw err
      return data as Submission | null
    } catch {
      return null
    }
  }

  const submitWork = async (assignmentId: string, content: string, attachments: { name: string; url: string }[] = []) => {
    if (!usuario.value.id) throw new Error('Usuário não autenticado')
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .upsert({
          atividade_id: assignmentId,
          aluno_id: usuario.value.id!,
          conteudo: content,
          anexos: attachments,
          enviado_em: new Date().toISOString()
        }, { onConflict: 'atividade_id,aluno_id' })
        .select()
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    if (!usuario.value.id) throw new Error('Usuário não autenticado')
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .update({
          nota: score,
          comentario: feedback,
          corrigido_em: new Date().toISOString(),
          corrigido_por: usuario.value.id!
        })
        .eq('id', submissionId)
        .select('*, perfis(id, full_name, email, avatar_url)')
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Envio em lote pelo professor (arquivos que a IA processará)
  const submitLote = async (assignmentId: string, arquivos: { name: string; url: string }[]) => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/envios/lote', {
        method: 'POST',
        body: { assignment_id: assignmentId, arquivos }
      })
      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // --- New aggregation functions ---

  const fetchGradedForStudent = async (subjectId?: string, limit = 10) => {
    if (!usuario.value.id) return []
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .select('*, atividades(id, titulo, turma_id, subject_id, max_score, due_date, disciplinas(id, name), turmas(name))')
        .eq('aluno_id', usuario.value.id!)
        .not('nota', 'is', null)
        .order('corrigido_em', { ascending: false })
        .limit(limit)

      if (err) throw err
      let results = (data || []) as any[]

      if (subjectId) {
        results = results.filter(s => s.assignments?.subject_id === subjectId)
      }

      return results
    } catch {
      return []
    }
  }

  const fetchUngradedForTeacher = async (limit = 10) => {
    if (!usuario.value.id) return []
    try {
      const { data: linked } = await supabase
        .from('turma_professores')
        .select('class_id')
        .eq('teacher_id', usuario.value.id!)
      const classIds = linked?.map((c: any) => c.class_id) || []
      if (classIds.length === 0) return []

      const { data: teacherAssignments } = await supabase
        .from('atividades')
        .select('id')
        .in('turma_id', classIds)

      if (!teacherAssignments || teacherAssignments.length === 0) return []
      const assignmentIds = teacherAssignments.map((a: any) => a.id)

      const { data, error: err } = await supabase
        .from('envios')
        .select('*, perfis(id, full_name, email, avatar_url), atividades(id, titulo, turma_id, turmas(name))')
        .in('atividade_id', assignmentIds)
        .is('nota', null)
        .order('enviado_em', { ascending: false })
        .limit(limit)

      if (err) throw err
      return (data || []) as any[]
    } catch {
      return []
    }
  }

  const countUngradedForTeacher = async () => {
    if (!usuario.value.id) return 0
    try {
      const { data: linked } = await supabase
        .from('turma_professores')
        .select('class_id')
        .eq('teacher_id', usuario.value.id!)
      const classIds = linked?.map((c: any) => c.class_id) || []
      if (classIds.length === 0) return 0

      const { data: teacherAssignments } = await supabase
        .from('atividades')
        .select('id')
        .in('turma_id', classIds)

      if (!teacherAssignments || teacherAssignments.length === 0) return 0
      const assignmentIds = teacherAssignments.map((a: any) => a.id)

      const { count } = await supabase
        .from('envios')
        .select('id', { count: 'exact', head: true })
        .in('atividade_id', assignmentIds)
        .is('nota', null)

      return count || 0
    } catch {
      return 0
    }
  }

  const fetchStudentScoresOverTime = async (studentId: string, subjectId?: string) => {
    try {
      const { data, error: err } = await supabase
        .from('envios')
        .select('nota, corrigido_em, atividades(subject_id, titulo, max_score)')
        .eq('aluno_id', studentId)
        .not('nota', 'is', null)
        .not('corrigido_em', 'is', null)
        .order('corrigido_em', { ascending: true })

      if (err) throw err
      let results = (data || []) as any[]

      if (subjectId) {
        results = results.filter(s => s.assignments?.subject_id === subjectId)
      }

      // Group by month and average scores
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
      const monthMap = new Map<string, number[]>()

      results.forEach(s => {
        const d = new Date(s.corrigido_em)
        const key = meses[d.getMonth()]
        const maxScore = s.assignments?.max_score || 10
        const normalized = (s.nota / maxScore) * 10 // Normalize to 0-10
        if (!monthMap.has(key)) monthMap.set(key, [])
        monthMap.get(key)!.push(normalized)
      })

      const rotulos: string[] = []
      const valores: number[] = []
      monthMap.forEach((scores, month) => {
        rotulos.push(month)
        valores.push(Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10)
      })

      return { rotulos, valores }
    } catch {
      return { rotulos: [] as string[], valores: [] as number[] }
    }
  }

  const fetchClassStudentScores = async (classId: string) => {
    try {
      const { data: classAssignments } = await supabase
        .from('atividades')
        .select('id, max_score')
        .eq('turma_id', classId)

      if (!classAssignments || classAssignments.length === 0) return []
      const assignmentIds = classAssignments.map((a: any) => a.id)

      const { data: subs } = await supabase
        .from('envios')
        .select('aluno_id, nota, atividade_id')
        .in('atividade_id', assignmentIds)
        .not('nota', 'is', null)

      const maxScoreMap = new Map<string, number>()
      classAssignments.forEach((a: any) => maxScoreMap.set(a.id, a.max_score || 10))

      const studentScores = new Map<string, { total: number; count: number }>()
      ;(subs || []).forEach((s: any) => {
        const existing = studentScores.get(s.aluno_id) || { total: 0, count: 0 }
        const maxScore = maxScoreMap.get(s.atividade_id) || 10
        existing.total += (s.nota / maxScore) * 10
        existing.count++
        studentScores.set(s.aluno_id, existing)
      })

      return Array.from(studentScores.entries()).map(([studentId, scores]) => ({
        studentId,
        media: scores.count > 0 ? Math.round((scores.total / scores.count) * 10) / 10 : 0,
        totalAvaliacoes: scores.count
      }))
    } catch {
      return []
    }
  }

  return {
    submissions, loading, error,
    getSubmissionsForAssignment, getSubmission, getMySubmission,
    submitWork, submitLote, gradeSubmission,
    fetchGradedForStudent, fetchUngradedForTeacher, countUngradedForTeacher,
    fetchStudentScoresOverTime, fetchClassStudentScores
  }
}
