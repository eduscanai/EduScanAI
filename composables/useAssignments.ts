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
  const user = useSupabaseUser()

  const assignments = ref<Assignment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const listAssignments = async (classId?: string, status?: string) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('assignments')
        .select('*, classes(name), subjects(name), profiles(full_name)')
        .order('created_at', { ascending: false })

      if (classId) query = query.eq('class_id', classId)
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
    class_id: string
    subject_id?: string
    title: string
    description?: string
    due_date?: string
    max_score?: number
    attachments?: { name: string; url: string }[]
  }) => {
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
        .from('assignments')
        .insert({
          ...data,
          school_id: usuario.value.schoolId,
          teacher_id: user.value!.id,
          status: 'draft'
        })
        .select()
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

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
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
    return updateAssignment(id, {
      status: 'published',
      published_at: new Date().toISOString()
    } as Partial<Assignment>)
  }

  const closeAssignment = async (id: string) => {
    return updateAssignment(id, { status: 'closed' } as Partial<Assignment>)
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
    updateAssignment, publishAssignment, closeAssignment, deleteAssignment
  }
}
