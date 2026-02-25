interface ClassData {
  id: string
  school_id: string
  academic_year_id: string | null
  teacher_id: string | null
  name: string
  grade_level: string | null
  shift: string | null
  academic_years?: { name: string } | null
  profiles?: { id: string; full_name: string | null } | null
}

interface ClassStudent {
  class_id: string
  student_id: string
  enrolled_at: string
  profiles?: { id: string; full_name: string; email: string; avatar_url: string | null }
}

interface ClassTeacher {
  class_id: string
  teacher_id: string
  subject_id: string
  profiles?: { id: string; full_name: string; email: string; avatar_url: string | null }
  subjects?: { id: string; name: string; code: string | null }
}

interface FetchClassesParams {
  academicYearId?: string
  search?: string
}

export const useClasses = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const user = useSupabaseUser()
  const { isAdmin, isPedagogue, isTeacher, isStudent } = usePermissions()

  const classes = ref<ClassData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchClasses = async (params: FetchClassesParams = {}) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null

    try {
      if (isTeacher.value) {
        const { data: linked } = await supabase
          .from('class_teachers')
          .select('class_id')
          .eq('teacher_id', user.value!.id)
        const classIds = linked?.map((c: any) => c.class_id) || []
        if (classIds.length === 0) {
          classes.value = []
          return
        }
        let query = supabase
          .from('classes')
          .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
          .in('id', classIds)
        if (params.academicYearId) query = query.eq('academic_year_id', params.academicYearId)
        if (params.search) query = query.ilike('name', `%${params.search}%`)
        query = query.order('name')
        const { data, error: err } = await query
        if (err) throw err
        classes.value = (data || []) as ClassData[]
      } else if (isStudent.value) {
        const { data: linked } = await supabase
          .from('class_students')
          .select('class_id')
          .eq('student_id', user.value!.id)
        const classIds = linked?.map((c: any) => c.class_id) || []
        if (classIds.length === 0) {
          classes.value = []
          return
        }
        let query = supabase
          .from('classes')
          .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
          .in('id', classIds)
        if (params.academicYearId) query = query.eq('academic_year_id', params.academicYearId)
        if (params.search) query = query.ilike('name', `%${params.search}%`)
        query = query.order('name')
        const { data, error: err } = await query
        if (err) throw err
        classes.value = (data || []) as ClassData[]
      } else {
        let query = supabase
          .from('classes')
          .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
          .eq('school_id', usuario.value.schoolId)
        if (params.academicYearId) query = query.eq('academic_year_id', params.academicYearId)
        if (params.search) query = query.ilike('name', `%${params.search}%`)
        query = query.order('name')
        const { data, error: err } = await query
        if (err) throw err
        classes.value = (data || []) as ClassData[]
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchClass = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
        .eq('id', id)
        .single()
      if (err) throw err
      return data as ClassData
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createClass = async (classData: { name: string; grade_level?: string; shift?: string; academic_year_id?: string; teacher_id?: string }) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .insert({ ...classData, school_id: usuario.value.schoolId })
        .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
        .single()
      if (err) throw err
      return data as ClassData
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateClass = async (id: string, updates: Partial<ClassData>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select('*, academic_years(name), profiles!teacher_id(id, full_name)')
        .single()
      if (err) throw err
      return data as ClassData
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteClass = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('classes')
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

  // --- Class Students ---
  const fetchClassStudents = async (classId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('class_students')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('class_id', classId)
        .order('enrolled_at', { ascending: false })
      if (err) throw err
      return (data || []) as ClassStudent[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const addStudent = async (classId: string, studentId: string) => {
    try {
      const { error: err } = await supabase
        .from('class_students')
        .insert({ class_id: classId, student_id: studentId })
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const removeStudent = async (classId: string, studentId: string) => {
    try {
      const { error: err } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  // --- Class Teachers ---
  const fetchClassTeachers = async (classId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('class_teachers')
        .select('*, profiles(id, full_name, email, avatar_url), subjects(id, name, code)')
        .eq('class_id', classId)
      if (err) throw err
      return (data || []) as ClassTeacher[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const addTeacher = async (classId: string, teacherId: string, subjectId: string) => {
    try {
      const { error: err } = await supabase
        .from('class_teachers')
        .insert({ class_id: classId, teacher_id: teacherId, subject_id: subjectId })
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const removeTeacher = async (classId: string, teacherId: string, subjectId: string) => {
    try {
      const { error: err } = await supabase
        .from('class_teachers')
        .delete()
        .eq('class_id', classId)
        .eq('teacher_id', teacherId)
        .eq('subject_id', subjectId)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  // --- Fetch available profiles for linking ---
  const fetchAvailableStudents = async (schoolId: string, search = '') => {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('school_id', schoolId)
        .eq('role', 'student')
        .eq('is_active', true)
        .order('full_name')
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      const { data, error: err } = await query
      if (err) throw err
      return (data || []) as { id: string; full_name: string; email: string; avatar_url: string | null }[]
    } catch {
      return []
    }
  }

  const fetchAvailableTeachers = async (schoolId: string, search = '') => {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('school_id', schoolId)
        .in('role', ['teacher', 'admin', 'pedagogue'])
        .eq('is_active', true)
        .order('full_name')
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      const { data, error: err } = await query
      if (err) throw err
      return (data || []) as { id: string; full_name: string; email: string; avatar_url: string | null }[]
    } catch {
      return []
    }
  }

  const bulkCreateClasses = async (items: { name: string; grade_level?: string; shift?: string }[], academicYearId?: string) => {
    if (!usuario.value.schoolId || !items.length) return { created: 0 }
    loading.value = true
    error.value = null
    try {
      const inserts = items.map(item => ({
        school_id: usuario.value.schoolId,
        name: item.name.trim(),
        grade_level: item.grade_level?.trim() || null,
        shift: item.shift || null,
        academic_year_id: academicYearId || null
      }))
      const { data, error: err } = await supabase
        .from('classes')
        .insert(inserts)
        .select('id')
      if (err) throw err
      return { created: data?.length || 0 }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    classes, loading, error,
    fetchClasses, fetchClass, createClass, updateClass, deleteClass,
    fetchClassStudents, addStudent, removeStudent,
    fetchClassTeachers, addTeacher, removeTeacher,
    fetchAvailableStudents, fetchAvailableTeachers,
    bulkCreateClasses
  }
}
