interface GradingPeriod {
  id: string
  school_id: string
  academic_year_id: string
  name: string
  number: number
  start_date: string
  end_date: string
  created_at: string
}

export const useGradingPeriods = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const gradingPeriods = ref<GradingPeriod[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchGradingPeriods = async (academicYearId?: string) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('periodos_avaliacao')
        .select('*')
        .eq('school_id', usuario.value.schoolId)
        .order('number', { ascending: true })

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId)
      }

      const { data, error: err } = await query
      if (err) throw err
      gradingPeriods.value = (data || []) as GradingPeriod[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createGradingPeriod = async (data: {
    academic_year_id: string
    name: string
    number: number
    start_date: string
    end_date: string
  }) => {
    if (!usuario.value.schoolId) throw new Error('school_id não disponível')
    const { data: result, error: err } = await supabase
      .from('periodos_avaliacao')
      .insert({ ...data, school_id: usuario.value.schoolId })
      .select()
      .single()
    if (err) throw err
    return result as GradingPeriod
  }

  const updateGradingPeriod = async (id: string, data: Partial<GradingPeriod>) => {
    const { data: result, error: err } = await supabase
      .from('periodos_avaliacao')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    return result as GradingPeriod
  }

  const deleteGradingPeriod = async (id: string) => {
    const { error: err } = await supabase
      .from('periodos_avaliacao')
      .delete()
      .eq('id', id)
    if (err) throw err
  }

  const getCurrentPeriod = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return gradingPeriods.value.find(p => p.start_date <= today && p.end_date >= today) || null
  })

  return {
    gradingPeriods, loading, error,
    fetchGradingPeriods, createGradingPeriod, updateGradingPeriod, deleteGradingPeriod,
    getCurrentPeriod
  }
}
