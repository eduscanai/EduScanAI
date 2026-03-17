interface Topico {
  id: string
  atividade_id: string
  nome: string
  descricao: string | null
  created_at: string
}

export const useTopicos = () => {
  const supabase = useSupabaseClient()

  const topicos = ref<Topico[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTopicos = async (atividadeId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('topicos_atividade')
        .select('*')
        .eq('atividade_id', atividadeId)
        .order('created_at')
      if (err) throw err
      topicos.value = (data || []) as Topico[]
      return topicos.value
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createTopico = async (atividadeId: string, nome: string, descricao?: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('topicos_atividade')
        .insert({ atividade_id: atividadeId, nome, descricao: descricao || null })
        .select()
        .single()
      if (err) throw err
      topicos.value.push(data as Topico)
      return data as Topico
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const createTopicosEmLote = async (atividadeId: string, lista: { nome: string; descricao?: string }[]) => {
    if (!lista.length) return []
    loading.value = true
    error.value = null
    try {
      const inserts = lista.map(t => ({
        atividade_id: atividadeId,
        nome: t.nome,
        descricao: t.descricao || null
      }))
      const { data, error: err } = await supabase
        .from('topicos_atividade')
        .insert(inserts)
        .select()
      if (err) throw err
      topicos.value = [...topicos.value, ...(data as Topico[])]
      return data as Topico[]
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTopico = async (id: string, updates: { nome?: string; descricao?: string }) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('topicos_atividade')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      const idx = topicos.value.findIndex(t => t.id === id)
      if (idx >= 0) topicos.value[idx] = data as Topico
      return data as Topico
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTopico = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('topicos_atividade')
        .delete()
        .eq('id', id)
      if (err) throw err
      topicos.value = topicos.value.filter(t => t.id !== id)
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    topicos, loading, error,
    fetchTopicos, createTopico, createTopicosEmLote, updateTopico, deleteTopico
  }
}
