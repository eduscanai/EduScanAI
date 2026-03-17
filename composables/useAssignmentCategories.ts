interface AssignmentCategory {
  id: string
  school_id: string
  name: string
  weight: number
  created_at: string
}

export const useAssignmentCategories = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const categories = ref<AssignmentCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('categorias_avaliacao')
        .select('*')
        .eq('school_id', usuario.value.schoolId)
        .order('name', { ascending: true })
      if (err) throw err
      categories.value = (data || []) as AssignmentCategory[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data: { name: string; weight: number }) => {
    if (!usuario.value.schoolId) throw new Error('school_id não disponível')
    const { data: result, error: err } = await supabase
      .from('categorias_avaliacao')
      .insert({ ...data, school_id: usuario.value.schoolId })
      .select()
      .single()
    if (err) throw err
    return result as AssignmentCategory
  }

  const updateCategory = async (id: string, data: { name?: string; weight?: number }) => {
    const { data: result, error: err } = await supabase
      .from('categorias_avaliacao')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    return result as AssignmentCategory
  }

  const deleteCategory = async (id: string) => {
    const { error: err } = await supabase
      .from('categorias_avaliacao')
      .delete()
      .eq('id', id)
    if (err) throw err
  }

  return {
    categories, loading, error,
    fetchCategories, createCategory, updateCategory, deleteCategory
  }
}
