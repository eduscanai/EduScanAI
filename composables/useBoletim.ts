interface ReportCard {
  id: string
  school_id: string
  student_id: string
  class_id: string
  subject_id: string
  grading_period_id: string
  calculated_average: number | null
  final_grade: number | null
  status: 'pending' | 'approved'
  approved_by: string | null
  approved_at: string | null
  observations: string | null
  created_at: string
  updated_at: string
  subjects?: { name: string }
  profiles?: { full_name: string }
  grading_periods?: { name: string; number: number }
}

interface StudentGrade {
  studentId: string
  studentName: string
  subjects: {
    subjectId: string
    subjectName: string
    assignments: {
      id: string
      title: string
      categoryId: string | null
      categoryName: string | null
      maxScore: number
      score: number | null
    }[]
    calculatedAverage: number | null
    reportCard: ReportCard | null
  }[]
}

interface StudentSubjectDetail {
  subjectId: string
  subjectName: string
  assignments: {
    id: string
    title: string
    categoryName: string | null
    maxScore: number
    score: number | null
  }[]
  calculatedAverage: number | null
  finalGrade: number | null
  status: 'pending' | 'approved' | null
  observations: string | null
}

export const useBoletim = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const { isStudent } = usePermissions()

  const reportCards = ref<ReportCard[]>([])
  const studentDetails = ref<StudentSubjectDetail[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Calcula média ponderada por categoria
  const computeWeightedAverage = (
    scores: { score: number; maxScore: number; categoryId: string | null }[],
    categories: { id: string; weight: number }[]
  ): number | null => {
    if (scores.length === 0) return null

    const gradedScores = scores.filter(s => s.score !== null)
    if (gradedScores.length === 0) return null

    const categoryMap = new Map(categories.map(c => [c.id, c.weight]))

    // Agrupar por categoria
    const groups = new Map<string, number[]>()
    for (const s of gradedScores) {
      const key = s.categoryId || '__none__'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push((s.score / s.maxScore) * 10)
    }

    let totalWeight = 0
    let weightedSum = 0

    for (const [key, values] of groups) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const weight = key === '__none__' ? 1 : (categoryMap.get(key) || 1)
      weightedSum += avg * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null
  }

  // Busca quadro de notas de uma turma para um período
  const fetchClassBoletim = async (
    classId: string,
    periodId: string
  ): Promise<StudentGrade[]> => {
    loading.value = true
    error.value = null
    try {
      // 1. Buscar período para saber as datas
      const { data: period, error: errP } = await supabase
        .from('periodos_avaliacao')
        .select('*')
        .eq('id', periodId)
        .single()
      if (errP) throw errP

      // 2. Buscar alunos da turma
      const { data: students, error: errS } = await supabase
        .from('turma_alunos')
        .select('student_id, perfis(id, full_name)')
        .eq('class_id', classId)
        .order('perfis(full_name)', { ascending: true } as any)
      if (errS) throw errS

      // 3. Buscar atividades do período (por due_date ou created_at)
      const { data: assignments, error: errA } = await supabase
        .from('atividades')
        .select('id, title, subject_id, category_id, max_score, due_date, created_at, categorias_avaliacao(id, name, weight)')
        .eq('class_id', classId)
        .in('status', ['published', 'closed'])
        .gte('due_date', period.start_date)
        .lte('due_date', period.end_date + 'T23:59:59')
      if (errA) throw errA

      if (!assignments || assignments.length === 0) {
        // Retornar alunos sem notas
        return (students || []).map((s: any) => ({
          studentId: s.student_id,
          studentName: s.profiles?.full_name || '',
          subjects: []
        }))
      }

      const assignmentIds = assignments.map((a: any) => a.id)

      // 4. Buscar submissões corrigidas
      const { data: submissions, error: errSub } = await supabase
        .from('envios')
        .select('assignment_id, student_id, score')
        .in('assignment_id', assignmentIds)
      if (errSub) throw errSub

      // 5. Buscar report_cards existentes
      const { data: existingCards, error: errRC } = await supabase
        .from('boletins')
        .select('*')
        .eq('class_id', classId)
        .eq('grading_period_id', periodId)
      if (errRC) throw errRC

      // 6. Buscar categorias da escola
      const { data: categoriesData } = await supabase
        .from('categorias_avaliacao')
        .select('id, weight')
        .eq('school_id', usuario.value.schoolId)
      const cats = (categoriesData || []) as { id: string; weight: number }[]

      // 7. Montar dados por aluno
      const submissionMap = new Map<string, Map<string, number | null>>()
      for (const sub of (submissions || []) as any[]) {
        const key = sub.student_id
        if (!submissionMap.has(key)) submissionMap.set(key, new Map())
        submissionMap.get(key)!.set(sub.assignment_id, sub.score)
      }

      const reportCardMap = new Map<string, ReportCard>()
      for (const rc of (existingCards || []) as ReportCard[]) {
        reportCardMap.set(`${rc.student_id}_${rc.subject_id}`, rc)
      }

      // Agrupar atividades por disciplina
      const subjectAssignments = new Map<string, any[]>()
      const subjectNames = new Map<string, string>()
      for (const a of assignments as any[]) {
        const sid = a.subject_id || '__none__'
        if (!subjectAssignments.has(sid)) subjectAssignments.set(sid, [])
        subjectAssignments.get(sid)!.push(a)
      }

      // Buscar nomes das disciplinas
      const subjectIds = [...subjectAssignments.keys()].filter(s => s !== '__none__')
      if (subjectIds.length > 0) {
        const { data: subjectsData } = await supabase
          .from('disciplinas')
          .select('id, name')
          .in('id', subjectIds)
        for (const s of (subjectsData || []) as any[]) {
          subjectNames.set(s.id, s.name)
        }
      }

      return (students || []).map((s: any) => {
        const studentId = s.student_id
        const studentSubs = submissionMap.get(studentId) || new Map()

        const subjects = [...subjectAssignments.entries()].map(([subjectId, subjectAsgns]) => {
          const assignmentsList = subjectAsgns.map((a: any) => ({
            id: a.id,
            title: a.title,
            categoryId: a.category_id,
            categoryName: a.assignment_categories?.name || null,
            maxScore: a.max_score,
            score: studentSubs.get(a.id) ?? null
          }))

          const scores = assignmentsList
            .filter((a: any) => a.score !== null)
            .map((a: any) => ({
              score: a.score,
              maxScore: a.maxScore,
              categoryId: a.categoryId
            }))

          return {
            subjectId,
            subjectName: subjectNames.get(subjectId) || 'Sem disciplina',
            assignments: assignmentsList,
            calculatedAverage: computeWeightedAverage(scores, cats),
            reportCard: reportCardMap.get(`${studentId}_${subjectId}`) || null
          }
        })

        return {
          studentId,
          studentName: s.profiles?.full_name || '',
          subjects
        }
      })
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Busca detalhes de notas do aluno (disciplinas + atividades + notas)
  const fetchStudentGradeDetails = async (studentId: string, periodId: string) => {
    loading.value = true
    error.value = null
    try {
      // 1. Período (datas)
      const { data: period, error: errP } = await supabase
        .from('periodos_avaliacao')
        .select('*')
        .eq('id', periodId)
        .single()
      if (errP) throw errP

      // 2. Turmas do aluno
      const { data: enrollments, error: errE } = await supabase
        .from('turma_alunos')
        .select('class_id')
        .eq('student_id', studentId)
      if (errE) throw errE
      const classIds = (enrollments || []).map((e: any) => e.class_id)
      if (classIds.length === 0) { studentDetails.value = []; return }

      // 3. Atividades das turmas no período
      const { data: assignments, error: errA } = await supabase
        .from('atividades')
        .select('id, title, subject_id, category_id, max_score, categorias_avaliacao(name)')
        .in('class_id', classIds)
        .in('status', ['published', 'closed'])
        .gte('due_date', period.start_date)
        .lte('due_date', period.end_date + 'T23:59:59')
      if (errA) throw errA
      if (!assignments || assignments.length === 0) { studentDetails.value = []; return }

      // 4. Submissões do aluno
      const assignmentIds = assignments.map((a: any) => a.id)
      const { data: submissions, error: errS } = await supabase
        .from('envios')
        .select('assignment_id, score')
        .eq('student_id', studentId)
        .in('assignment_id', assignmentIds)
      if (errS) throw errS
      const scoreMap = new Map((submissions || []).map((s: any) => [s.assignment_id, s.score]))

      // 5. Report cards do aluno (aprovados se for aluno)
      let rcQuery = supabase
        .from('boletins')
        .select('*')
        .eq('student_id', studentId)
        .eq('grading_period_id', periodId)
      if (isStudent.value) {
        rcQuery = rcQuery.eq('status', 'approved')
      }
      const { data: cards } = await rcQuery
      const rcMap = new Map((cards || []).map((rc: any) => [rc.subject_id, rc]))

      // 6. Categorias (para média ponderada)
      const { data: catsData } = await supabase
        .from('categorias_avaliacao')
        .select('id, weight')
        .eq('school_id', usuario.value.schoolId)
      const cats = (catsData || []) as { id: string; weight: number }[]

      // 7. Agrupar atividades por disciplina
      const subjectMap = new Map<string, any[]>()
      for (const a of assignments as any[]) {
        const sid = a.subject_id || '__none__'
        if (!subjectMap.has(sid)) subjectMap.set(sid, [])
        subjectMap.get(sid)!.push(a)
      }

      // 8. Buscar nomes das disciplinas
      const subjectIds = [...subjectMap.keys()].filter(s => s !== '__none__')
      const subjectNames = new Map<string, string>()
      if (subjectIds.length > 0) {
        const { data: subData } = await supabase
          .from('disciplinas')
          .select('id, name')
          .in('id', subjectIds)
        for (const s of (subData || []) as any[]) {
          subjectNames.set(s.id, s.name)
        }
      }

      // 9. Montar resultado
      studentDetails.value = [...subjectMap.entries()].map(([subjectId, asgns]) => {
        const assignmentsList = asgns.map((a: any) => ({
          id: a.id,
          title: a.title,
          categoryName: a.assignment_categories?.name || null,
          maxScore: a.max_score,
          score: scoreMap.get(a.id) ?? null
        }))

        const scores = assignmentsList
          .filter(a => a.score !== null)
          .map(a => ({ score: a.score!, maxScore: a.maxScore, categoryId: (asgns.find((x: any) => x.id === a.id))?.category_id || null }))

        const rc = rcMap.get(subjectId) as ReportCard | undefined

        return {
          subjectId,
          subjectName: subjectNames.get(subjectId) || 'Sem disciplina',
          assignments: assignmentsList,
          calculatedAverage: computeWeightedAverage(scores, cats),
          finalGrade: rc?.final_grade ?? null,
          status: rc?.status ?? null,
          observations: rc?.observations ?? null
        }
      }).sort((a, b) => a.subjectName.localeCompare(b.subjectName))
    } catch (e: any) {
      error.value = e.message
      studentDetails.value = []
    } finally {
      loading.value = false
    }
  }

  // Busca boletim individual do aluno
  const fetchStudentBoletim = async (studentId: string, academicYearId?: string) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('boletins')
        .select('*, disciplinas(name), periodos_avaliacao(name, number)')
        .eq('student_id', studentId)
        .order('periodos_avaliacao(number)', { ascending: true } as any)

      if (isStudent.value) {
        query = query.eq('status', 'approved')
      }

      if (academicYearId) {
        query = query.eq('grading_period_id.academic_year_id' as any, academicYearId)
      }

      const { data, error: err } = await query
      if (err) throw err
      reportCards.value = (data || []) as ReportCard[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Salvar/atualizar nota final
  const saveReportCard = async (data: {
    student_id: string
    class_id: string
    subject_id: string
    grading_period_id: string
    calculated_average?: number | null
    final_grade?: number | null
    observations?: string | null
  }) => {
    const { data: result, error: err } = await supabase
      .from('boletins')
      .upsert(
        {
          ...data,
          school_id: usuario.value.schoolId,
          status: 'pending'
        },
        { onConflict: 'student_id,class_id,subject_id,grading_period_id' }
      )
      .select()
      .single()
    if (err) throw err
    return result as ReportCard
  }

  // Aprovar notas em lote
  const approveReportCards = async (ids: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('boletins')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .in('id', ids)
    if (err) throw err
  }

  return {
    reportCards, studentDetails, loading, error,
    fetchClassBoletim, fetchStudentBoletim, fetchStudentGradeDetails,
    saveReportCard, approveReportCards,
    computeWeightedAverage
  }
}
