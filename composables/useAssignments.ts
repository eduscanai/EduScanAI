interface Assignment {
  id: string
  school_id: string
  class_id: string
  subject_id: string | null
  teacher_id: string
  title: string
  description: string | null
  due_date: string | null
  max_score: number
  status: 'draft' | 'published' | 'closed'
  published_at: string | null
  attachments: { name: string; url: string }[]
  created_at: string
  updated_at: string
  classes?: { name: string }
  subjects?: { name: string }
  profiles?: { full_name: string }
}

export const useAssignments = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const { isTeacher, isStudent } = usePermissions()

  const assignments = ref<Assignment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper: get teacher's class IDs
  const getTeacherClassIds = async (): Promise<string[]> => {
    if (!usuario.value.id) return []
    const { data } = await supabase
      .from('class_teachers')
      .select('class_id')
      .eq('teacher_id', usuario.value.id)
    return data?.map((c: any) => c.class_id) || []
  }


  const listAssignments = async (classId?: string, status?: string) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('assignments')
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .order('created_at', { ascending: false })

      if (classId) {
        query = query.eq('class_id', classId)
      } else if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) { assignments.value = []; return }
        query = query.in('class_id', classIds)
      } else if (isStudent.value) {
        // Query direta — a RLS (assignments_select_student) já filtra por turmas matriculadas
        query = query.eq('school_id', usuario.value.schoolId).eq('status', 'published')
      } else {
        // Admin / pedagogue
        query = query.eq('school_id', usuario.value.schoolId)
      }

      if (status) query = query.eq('status', status)

      const { data, error: err } = await query
      if (err) throw err
      assignments.value = (data || []) as Assignment[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const countAssignments = async () => {
    try {
      let query = supabase
        .from('assignments')
        .select('id', { count: 'exact', head: true })

      if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) return 0
        query = query.in('class_id', classIds)
      } else {
        query = query.eq('school_id', usuario.value.schoolId)
      }

      const { count } = await query
      return count || 0
    } catch {
      return 0
    }
  }

  const fetchRecentAssignments = async (limit = 5) => {
    try {
      let query = supabase
        .from('assignments')
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) return []
        query = query.in('class_id', classIds)
      } else {
        query = query.eq('school_id', usuario.value.schoolId)
      }

      const { data, error: err } = await query
      if (err) throw err
      return (data || []) as Assignment[]
    } catch {
      return []
    }
  }

  const fetchPendingForStudent = async () => {
    if (!usuario.value.id) return []
    try {
      // Query direta — a RLS (assignments_select_student) já filtra por turmas matriculadas
      const { data: allAssignments, error: err1 } = await supabase
        .from('assignments')
        .select('*, classes(name), subjects(name)')
        .eq('school_id', usuario.value.schoolId)
        .eq('status', 'published')
        .order('due_date', { ascending: true })

      if (err1) throw err1
      if (!allAssignments || allAssignments.length === 0) return []

      const { data: mySubmissions } = await supabase
        .from('submissions')
        .select('assignment_id')
        .eq('student_id', usuario.value.id!)

      const submittedIds = new Set((mySubmissions || []).map((s: any) => s.assignment_id))
      return (allAssignments as any[]).filter(a => !submittedIds.has(a.id))
    } catch {
      return []
    }
  }

  const getAssignment = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('assignments')
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .eq('id', id)
        .single()
      if (err) throw err
      return data as Assignment
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createAssignment = async (data: {
    class_ids: string[]
    subject_id?: string
    title: string
    description?: string
    due_date?: string
    max_score?: number
    attachments?: { name: string; url: string }[]
  }) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser?.id) throw new Error('Usuário não autenticado')
    if (!data.class_ids.length) throw new Error('Selecione ao menos uma turma')
    loading.value = true
    error.value = null
    try {
      const { class_ids, ...rest } = data
      const inserts = class_ids.map(class_id => ({
        ...rest,
        class_id,
        school_id: usuario.value.schoolId,
        teacher_id: currentUser.id,
        status: 'draft' as const
      }))
      const { data: result, error: err } = await supabase
        .from('assignments')
        .insert(inserts as any)
        .select()
      if (err) throw err
      return (result || []) as Assignment[]
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await (supabase as any)
        .from('assignments')
        .update(data)
        .eq('id', id)
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .single()
      if (err) throw err
      return result as Assignment
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const publishAssignment = async (id: string) => {
    loading.value = true
    try {
      const { data: result, error: err } = await (supabase as any)
        .from('assignments')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .single()
      if (err) throw err
      return result as Assignment
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const closeAssignment = async (id: string) => {
    loading.value = true
    try {
      const { data: result, error: err } = await (supabase as any)
        .from('assignments')
        .update({ status: 'closed' })
        .eq('id', id)
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .single()
      if (err) throw err
      return result as Assignment
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteAssignment = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    assignments, loading, error,
    listAssignments, getAssignment, createAssignment,
    updateAssignment, publishAssignment, closeAssignment, deleteAssignment,
    countAssignments, fetchRecentAssignments, fetchPendingForStudent
  }
}
