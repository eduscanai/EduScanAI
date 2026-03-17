interface Subject {
  id: string
  school_id: string
  name: string
  code: string | null
}

export const useSubjects = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const subjects = ref<Subject[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSubjects = async () => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('disciplinas')
        .select('id, school_id, name, code')
        .eq('school_id', usuario.value.schoolId)
        .order('name')
      if (err) throw err
      subjects.value = (data || []) as Subject[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createSubject = async (subject: { name: string; code?: string }) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('disciplinas')
        .insert({
          name: subject.name,
          code: subject.code || null,
          school_id: usuario.value.schoolId
        })
        .select('id, school_id, name, code')
        .single()
      if (err) throw err
      return data as Subject
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateSubject = async (id: string, updates: { name?: string; code?: string }) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('disciplinas')
        .update(updates)
        .eq('id', id)
        .eq('school_id', usuario.value.schoolId)
        .select('id, school_id, name, code')
        .single()
      if (err) throw err
      return data as Subject
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteSubject = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id)
        .eq('school_id', usuario.value.schoolId)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const bulkCreateSubjects = async (items: { name: string; code?: string }[]) => {
    if (!usuario.value.schoolId || !items.length) return { created: 0, errors: [] as string[] }
    loading.value = true
    error.value = null
    try {
      const inserts = items.map(item => ({
        school_id: usuario.value.schoolId,
        name: item.name.trim(),
        code: item.code?.trim() || null
      }))
      const { data, error: err } = await supabase
        .from('disciplinas')
        .insert(inserts)
        .select('id')
      if (err) throw err
      return { created: data?.length || 0, errors: [] as string[] }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { subjects, loading, error, fetchSubjects, createSubject, updateSubject, deleteSubject, bulkCreateSubjects }
}
