interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string | null
  attachments: { name: string; url: string }[]
  submitted_at: string
  score: number | null
  feedback: string | null
  graded_at: string | null
  graded_by: string | null
  profiles?: { id: string; full_name: string; email: string; avatar_url: string | null }
}

export const useSubmissions = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSubmissionsForAssignment = async (assignmentId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })
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
        .from('submissions')
        .select('*, profiles(id, full_name, email, avatar_url)')
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
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.value!.id)
        .maybeSingle()
      if (err) throw err
      return data as Submission | null
    } catch {
      return null
    }
  }

  const submitWork = async (assignmentId: string, content: string, attachments: { name: string; url: string }[] = []) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.value!.id,
          content,
          attachments,
          submitted_at: new Date().toISOString()
        }, { onConflict: 'assignment_id,student_id' })
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
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: user.value!.id
        })
        .eq('id', submissionId)
        .select('*, profiles(id, full_name, email, avatar_url)')
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

  // --- New aggregation functions ---

  const fetchGradedForStudent = async (subjectId?: string, limit = 10) => {
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*, assignments(id, title, class_id, subject_id, max_score, due_date, subjects(id, name), classes(name))')
        .eq('student_id', user.value!.id)
        .not('score', 'is', null)
        .order('graded_at', { ascending: false })
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
    try {
      const { data: linked } = await supabase
        .from('class_teachers')
        .select('class_id')
        .eq('teacher_id', user.value!.id)
      const classIds = linked?.map((c: any) => c.class_id) || []
      if (classIds.length === 0) return []

      const { data: teacherAssignments } = await supabase
        .from('assignments')
        .select('id')
        .in('class_id', classIds)

      if (!teacherAssignments || teacherAssignments.length === 0) return []
      const assignmentIds = teacherAssignments.map((a: any) => a.id)

      const { data, error: err } = await supabase
        .from('submissions')
        .select('*, profiles(id, full_name, email, avatar_url), assignments(id, title, class_id, classes(name))')
        .in('assignment_id', assignmentIds)
        .is('score', null)
        .order('submitted_at', { ascending: false })
        .limit(limit)

      if (err) throw err
      return (data || []) as any[]
    } catch {
      return []
    }
  }

  const countUngradedForTeacher = async () => {
    try {
      const { data: linked } = await supabase
        .from('class_teachers')
        .select('class_id')
        .eq('teacher_id', user.value!.id)
      const classIds = linked?.map((c: any) => c.class_id) || []
      if (classIds.length === 0) return 0

      const { data: teacherAssignments } = await supabase
        .from('assignments')
        .select('id')
        .in('class_id', classIds)

      if (!teacherAssignments || teacherAssignments.length === 0) return 0
      const assignmentIds = teacherAssignments.map((a: any) => a.id)

      const { count } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .is('score', null)

      return count || 0
    } catch {
      return 0
    }
  }

  const fetchStudentScoresOverTime = async (studentId: string, subjectId?: string) => {
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('score, graded_at, assignments(subject_id, title, max_score)')
        .eq('student_id', studentId)
        .not('score', 'is', null)
        .not('graded_at', 'is', null)
        .order('graded_at', { ascending: true })

      if (err) throw err
      let results = (data || []) as any[]

      if (subjectId) {
        results = results.filter(s => s.assignments?.subject_id === subjectId)
      }

      // Group by month and average scores
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
      const monthMap = new Map<string, number[]>()

      results.forEach(s => {
        const d = new Date(s.graded_at)
        const key = meses[d.getMonth()]
        const maxScore = s.assignments?.max_score || 10
        const normalized = (s.score / maxScore) * 10 // Normalize to 0-10
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
        .from('assignments')
        .select('id, max_score')
        .eq('class_id', classId)

      if (!classAssignments || classAssignments.length === 0) return []
      const assignmentIds = classAssignments.map((a: any) => a.id)

      const { data: subs } = await supabase
        .from('submissions')
        .select('student_id, score, assignment_id')
        .in('assignment_id', assignmentIds)
        .not('score', 'is', null)

      const maxScoreMap = new Map<string, number>()
      classAssignments.forEach((a: any) => maxScoreMap.set(a.id, a.max_score || 10))

      const studentScores = new Map<string, { total: number; count: number }>()
      ;(subs || []).forEach((s: any) => {
        const existing = studentScores.get(s.student_id) || { total: 0, count: 0 }
        const maxScore = maxScoreMap.get(s.assignment_id) || 10
        existing.total += (s.score / maxScore) * 10
        existing.count++
        studentScores.set(s.student_id, existing)
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
    submitWork, gradeSubmission,
    fetchGradedForStudent, fetchUngradedForTeacher, countUngradedForTeacher,
    fetchStudentScoresOverTime, fetchClassStudentScores
  }
}
