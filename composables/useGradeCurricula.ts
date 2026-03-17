interface GradeCurriculum {
  id: string
  school_id: string
  grade_level: string
  subject_id: string
  subjects?: { id: string; name: string }
}

export const useGradeCurricula = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCurriculum = async (gradeLevel: string): Promise<GradeCurriculum[]> => {
    if (!usuario.value.schoolId || !gradeLevel) return []
    try {
      const { data, error: err } = await supabase
        .from('grade_curricular')
        .select('*, disciplinas(id, name)')
        .eq('school_id', usuario.value.schoolId)
        .eq('grade_level', gradeLevel)
        .order('disciplinas(name)')
      if (err) throw err
      return (data || []) as GradeCurriculum[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const fetchAllGradeLevels = async (): Promise<string[]> => {
    if (!usuario.value.schoolId) return []
    try {
      // Get grade_levels from both grade_curricula and classes
      const [{ data: fromCurricula }, { data: fromClasses }] = await Promise.all([
        supabase
          .from('grade_curricular')
          .select('grade_level')
          .eq('school_id', usuario.value.schoolId),
        supabase
          .from('turmas')
          .select('grade_level')
          .eq('school_id', usuario.value.schoolId)
          .not('grade_level', 'is', null)
      ])
      const levels = new Set<string>()
      fromCurricula?.forEach((r: any) => levels.add(r.grade_level))
      fromClasses?.forEach((r: any) => { if (r.grade_level) levels.add(r.grade_level) })
      return [...levels].sort()
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const addSubjectToGrade = async (gradeLevel: string, subjectId: string) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('grade_curricular')
        .insert({
          school_id: usuario.value.schoolId,
          grade_level: gradeLevel,
          subject_id: subjectId
        })
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const removeSubjectFromGrade = async (gradeLevel: string, subjectId: string) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('grade_curricular')
        .delete()
        .eq('school_id', usuario.value.schoolId)
        .eq('grade_level', gradeLevel)
        .eq('subject_id', subjectId)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const bulkSetCurriculum = async (gradeLevel: string, subjectIds: string[]) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      // Delete all existing for this grade_level
      const { error: delErr } = await supabase
        .from('grade_curricular')
        .delete()
        .eq('school_id', usuario.value.schoolId)
        .eq('grade_level', gradeLevel)
      if (delErr) throw delErr

      // Insert new ones
      if (subjectIds.length > 0) {
        const inserts = subjectIds.map(sid => ({
          school_id: usuario.value.schoolId,
          grade_level: gradeLevel,
          subject_id: sid
        }))
        const { error: insErr } = await supabase
          .from('grade_curricular')
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

  return {
    loading,
    error,
    fetchCurriculum,
    fetchAllGradeLevels,
    addSubjectToGrade,
    removeSubjectFromGrade,
    bulkSetCurriculum
  }
}
