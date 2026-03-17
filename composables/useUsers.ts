interface Profile {
  id: string
  school_id: string
  full_name: string | null
  role: string
  avatar_url: string | null
  email: string | null
  is_active: boolean
  created_at: string
  matricula: string | null
  cpf: string | null
  sexo: string | null
  data_nascimento: string | null
}

interface FetchUsersParams {
  page?: number
  perPage?: number
  search?: string
  role?: string
}

export const useUsers = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const users = ref<Profile[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async (params: FetchUsersParams = {}) => {
    const { page = 1, perPage = 10, search = '', role = '' } = params
    if (!usuario.value.schoolId) return

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('perfis')
        .select('*', { count: 'exact' })
        .eq('school_id', usuario.value.schoolId)
        .neq('role', 'admin')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (role) {
        query = query.eq('role', role)
      }

      const from = (page - 1) * perPage
      const to = from + perPage - 1
      query = query.range(from, to)

      const { data, error: err, count } = await query

      if (err) throw err

      users.value = (data || []) as Profile[]
      total.value = count || 0
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', id)
        .single()
      if (err) throw err
      return data as Profile
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('perfis')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      return data as Profile
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const toggleUserActive = async (id: string, isActive: boolean) => {
    return updateUser(id, { is_active: isActive } as Partial<Profile>)
  }

  const createUser = async (userData: { email: string; password: string; full_name: string; role: string; matricula?: string; cpf?: string; sexo?: string; data_nascimento?: string }) => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
          ...userData,
          school_id: usuario.value.schoolId
        }
      })
      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const bulkCreateUsers = async (users: { full_name: string; email: string; matricula?: string; cpf?: string; sexo?: string; data_nascimento?: string }[], password: string, role: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/admin/bulk-students', {
        method: 'POST',
        body: {
          students: users,
          school_id: usuario.value.schoolId,
          password,
          role
        }
      })
      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchStudentsList = async (params: { search?: string; classId?: string; page?: number; perPage?: number } = {}) => {
    const { search = '', classId = '', page = 1, perPage = 20 } = params
    if (!usuario.value.schoolId) return { students: [] as Profile[], total: 0 }

    loading.value = true
    error.value = null
    try {
      let studentIds: string[] | null = null

      if (classId) {
        const { data: classStudents } = await supabase
          .from('turma_alunos')
          .select('student_id')
          .eq('class_id', classId)
        studentIds = classStudents?.map((cs: any) => cs.student_id) || []
        if (studentIds.length === 0) return { students: [] as Profile[], total: 0 }
      }

      let query = supabase
        .from('perfis')
        .select('*', { count: 'exact' })
        .eq('school_id', usuario.value.schoolId)
        .eq('role', 'student')
        .order('full_name')

      if (studentIds) {
        query = query.in('id', studentIds)
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,matricula.ilike.%${search}%`)
      }

      const from = (page - 1) * perPage
      const to = from + perPage - 1
      query = query.range(from, to)

      const { data, error: err, count } = await query
      if (err) throw err

      return { students: (data || []) as Profile[], total: count || 0 }
    } catch (e: any) {
      error.value = e.message
      return { students: [] as Profile[], total: 0 }
    } finally {
      loading.value = false
    }
  }

  return { users, total, loading, error, fetchUsers, fetchUser, updateUser, toggleUserActive, createUser, bulkCreateUsers, fetchStudentsList }
}
