interface AcademicYear {
  id: string
  school_id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
}

export const useAcademicYear = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const academicYears = ref<AcademicYear[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAcademicYears = async () => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', usuario.value.schoolId)
        .order('start_date', { ascending: false })
      if (err) throw err
      academicYears.value = (data || []) as AcademicYear[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createAcademicYear = async (year: { name: string; start_date?: string; end_date?: string; is_current?: boolean }) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('academic_years')
        .insert({ ...year, school_id: usuario.value.schoolId })
        .select()
        .single()
      if (err) throw err
      return data as AcademicYear
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAcademicYear = async (id: string, updates: Partial<AcademicYear>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('academic_years')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      return data as AcademicYear
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteAcademicYear = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('academic_years')
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

  return { academicYears, loading, error, fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear }
}
