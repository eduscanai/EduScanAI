interface Assignment {
  id: string
  escola_id: string
  turma_id: string
  disciplina_id: string | null
  categoria_id: string | null
  periodo_id: string | null
  professor_id: string
  titulo: string
  descricao: string | null
  data_entrega: string | null
  nota_maxima: number
  peso: number
  status: 'draft' | 'published' | 'closed'
  modo_envio: 'individual' | 'lote'
  visivel_aluno: boolean
  publicado_em: string | null
  anexos: { name: string; url: string }[]
  gabarito: { name: string; url: string }[]
  criado_em: string
  atualizado_em: string
  turmas?: { name: string }
  disciplinas?: { name: string }
  perfis?: { full_name: string }
  categorias_avaliacao?: { name: string }
  periodos_avaliacao?: { name: string }
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
      .from('turma_professores')
      .select('class_id')
      .eq('teacher_id', usuario.value.id)
    return data?.map((c: any) => c.class_id) || []
  }


  const listAssignments = async (classId?: string, status?: string) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('atividades')
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
        .order('criado_em', { ascending: false })

      if (classId) {
        query = query.eq('turma_id', classId)
      } else if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) { assignments.value = []; return }
        query = query.in('turma_id', classIds)
      } else if (isStudent.value) {
        // Query direta — a RLS (assignments_select_student) já filtra por turmas matriculadas
        query = query.eq('escola_id', usuario.value.schoolId).eq('status', 'published')
      } else {
        // Admin / pedagogue
        query = query.eq('escola_id', usuario.value.schoolId)
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
        .from('atividades')
        .select('id', { count: 'exact', head: true })

      if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) return 0
        query = query.in('turma_id', classIds)
      } else {
        query = query.eq('escola_id', usuario.value.schoolId)
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
        .from('atividades')
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
        .order('criado_em', { ascending: false })
        .limit(limit)

      if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) return []
        query = query.in('turma_id', classIds)
      } else {
        query = query.eq('escola_id', usuario.value.schoolId)
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
        .from('atividades')
        .select('*, turmas(name), disciplinas(name)')
        .eq('escola_id', usuario.value.schoolId)
        .eq('status', 'published')
        .order('data_entrega', { ascending: true })

      if (err1) throw err1
      if (!allAssignments || allAssignments.length === 0) return []

      const { data: mySubmissions } = await supabase
        .from('envios')
        .select('atividade_id')
        .eq('aluno_id', usuario.value.id!)

      const submittedIds = new Set((mySubmissions || []).map((s: any) => s.atividade_id))
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
        .from('atividades')
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
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
    disciplina_id?: string
    categoria_id?: string
    periodo_id?: string
    titulo: string
    descricao?: string
    data_entrega?: string
    nota_maxima?: number
    peso?: number
    modo_envio?: 'individual' | 'lote'
    visivel_aluno?: boolean
    anexos?: { name: string; url: string }[]
    gabarito?: { name: string; url: string }[]
  }) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser?.id) throw new Error('Usuário não autenticado')
    if (!data.class_ids.length) throw new Error('Selecione ao menos uma turma')
    loading.value = true
    error.value = null
    try {
      const { class_ids, ...rest } = data
      const inserts = class_ids.map(turma_id => ({
        ...rest,
        turma_id,
        escola_id: usuario.value.schoolId,
        professor_id: currentUser.id,
        status: 'draft' as const
      }))
      const { data: result, error: err } = await supabase
        .from('atividades')
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
        .from('atividades')
        .update(data)
        .eq('id', id)
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
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
        .from('atividades')
        .update({ status: 'published', publicado_em: new Date().toISOString() })
        .eq('id', id)
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
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
        .from('atividades')
        .update({ status: 'closed' })
        .eq('id', id)
        .select('*, turmas(name), disciplinas(name), perfis(full_name), categorias_avaliacao(name), periodos_avaliacao(name)')
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
        .from('atividades')
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

  const toggleVisibilidade = async (id: string, visivel: boolean) => {
    return updateAssignment(id, { visivel_aluno: visivel } as any)
  }

  const fetchHabilidades = async (atividadeId: string) => {
    const { data, error: err } = await supabase
      .from('atividade_habilidades')
      .select('*, bncc_habilidades(*, bncc_topicos(id, name))')
      .eq('atividade_id', atividadeId)
    if (err) throw err
    return data || []
  }

  const saveHabilidades = async (atividadeId: string, habilidadeIds: string[]) => {
    // Remove existing
    await supabase
      .from('atividade_habilidades')
      .delete()
      .eq('atividade_id', atividadeId)

    if (habilidadeIds.length === 0) return

    const inserts = habilidadeIds.map(hid => ({
      atividade_id: atividadeId,
      habilidade_id: hid
    }))
    const { error: err } = await supabase
      .from('atividade_habilidades')
      .insert(inserts)
    if (err) throw err
  }

  return {
    assignments, loading, error,
    listAssignments, getAssignment, createAssignment,
    updateAssignment, publishAssignment, closeAssignment, deleteAssignment,
    countAssignments, fetchRecentAssignments, fetchPendingForStudent,
    toggleVisibilidade, fetchHabilidades, saveHabilidades
  }
}
