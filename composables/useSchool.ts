interface School {
  id: string
  name: string
  slug: string
  logo_url: string | null
  settings: Record<string, any>
  plan: string
  created_at: string
  cnpj: string | null
  endereco: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  diretor: string | null
  vice_diretor: string | null
  coord_pedagogica: string | null
}

interface SchoolCounts {
  turmas: number
  alunos: number
  professores: number
  pedagogos: number
}

export const useSchool = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const school = ref<School | null>(null)
  const counts = ref<SchoolCounts>({ turmas: 0, alunos: 0, professores: 0, pedagogos: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchool = async () => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('schools')
        .select('*')
        .eq('id', usuario.value.schoolId)
        .single()
      if (err) throw err
      school.value = data as School
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchCounts = async () => {
    if (!usuario.value.schoolId) return
    const schoolId = usuario.value.schoolId

    const [turmas, alunos, professores, pedagogos] = await Promise.all([
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'pedagogue')
    ])

    counts.value = {
      turmas: turmas.count || 0,
      alunos: alunos.count || 0,
      professores: professores.count || 0,
      pedagogos: pedagogos.count || 0
    }
  }

  const updateSchool = async (updates: Partial<Omit<School, 'id' | 'created_at' | 'plan' | 'settings'>>) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', usuario.value.schoolId)
        .select()
        .single()
      if (err) throw err
      school.value = data as School
      return data as School
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { school, counts, loading, error, fetchSchool, fetchCounts, updateSchool }
}
