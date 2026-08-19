interface DisciplinaDaTurma {
  turma_id: string
  disciplina_id: string
  disciplinas?: { id: string; name: string; code: string | null }
}

export const useTurmaDisciplinas = () => {
  const supabase = useSupabaseClient()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDisciplinasDaTurma = async (turmaId: string): Promise<DisciplinaDaTurma[]> => {
    if (!turmaId) return []
    try {
      const { data, error: err } = await supabase
        .from('turma_disciplinas')
        .select('*, disciplinas(id, name, code)')
        .eq('turma_id', turmaId)
        .order('disciplinas(name)')
      if (err) throw err
      return (data || []) as DisciplinaDaTurma[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const bulkSetDisciplinasDaTurma = async (turmaId: string, disciplinaIds: string[]) => {
    loading.value = true
    error.value = null
    try {
      const { error: delErr } = await supabase
        .from('turma_disciplinas')
        .delete()
        .eq('turma_id', turmaId)
      if (delErr) throw delErr

      if (disciplinaIds.length > 0) {
        const inserts = disciplinaIds.map(disciplinaId => ({ turma_id: turmaId, disciplina_id: disciplinaId }))
        const { error: insErr } = await supabase
          .from('turma_disciplinas')
          .insert(inserts)
        if (insErr) throw insErr
      }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Disciplinas em comum a todas as turmas informadas — usado pra filtrar
  // o campo "Disciplina" na criação de atividade quando várias turmas são
  // selecionadas de uma vez.
  const fetchDisciplinasComuns = async (turmaIds: string[]): Promise<{ id: string; name: string }[]> => {
    if (turmaIds.length === 0) return []
    try {
      const { data, error: err } = await supabase
        .from('turma_disciplinas')
        .select('turma_id, disciplinas(id, name)')
        .in('turma_id', turmaIds)
      if (err) throw err

      const porTurma = new Map<string, Map<string, { id: string; name: string }>>()
      for (const row of (data || []) as any[]) {
        const disciplina = row.disciplinas
        if (!disciplina) continue
        if (!porTurma.has(row.turma_id)) porTurma.set(row.turma_id, new Map())
        porTurma.get(row.turma_id)!.set(disciplina.id, disciplina)
      }

      // Alguma turma selecionada sem nenhuma disciplina -> interseção vazia
      if (turmaIds.some(id => !porTurma.has(id))) return []

      const conjuntos = turmaIds.map(id => porTurma.get(id)!)
      const [primeiro, ...resto] = conjuntos
      const comuns = [...primeiro.values()].filter(d =>
        resto.every(conjunto => conjunto.has(d.id))
      )
      return comuns.sort((a, b) => a.name.localeCompare(b.name))
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  return {
    loading,
    error,
    fetchDisciplinasDaTurma,
    bulkSetDisciplinasDaTurma,
    fetchDisciplinasComuns
  }
}
