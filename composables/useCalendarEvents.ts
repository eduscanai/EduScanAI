interface CalendarEvent {
  id: string
  school_id: string
  created_by: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  all_day: boolean
  color: string
  type: 'custom' | 'holiday' | 'meeting'
  created_at: string
  updated_at: string
}

export const useCalendarEvents = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const user = useSupabaseUser()

  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchEvents = async (startDate: string, endDate: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('school_id', usuario.value.schoolId)
        .gte('start_at', startDate)
        .lte('start_at', endDate)
        .order('start_at', { ascending: true })
      if (err) throw err
      events.value = (data || []) as CalendarEvent[]
      return events.value
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchAssignmentsDueDates = async (startDate: string, endDate: string) => {
    try {
      const { data, error: err } = await supabase
        .from('atividades')
        .select('id, title, due_date, status, turmas(name), disciplinas(name)')
        .eq('school_id', usuario.value.schoolId)
        .not('due_date', 'is', null)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
      if (err) throw err
      return (data || []) as any[]
    } catch {
      return []
    }
  }

  const fetchAnnouncementsDates = async (startDate: string, endDate: string) => {
    try {
      const { data, error: err } = await supabase
        .from('comunicados')
        .select('id, title, priority, published_at, target_type, perfis(full_name)')
        .eq('school_id', usuario.value.schoolId)
        .not('published_at', 'is', null)
        .gte('published_at', startDate)
        .lte('published_at', endDate)
      if (err) throw err
      return (data || []) as any[]
    } catch {
      return []
    }
  }

  const createEvent = async (data: {
    title: string
    description?: string
    start_at: string
    end_at?: string
    all_day?: boolean
    color?: string
    type?: 'custom' | 'holiday' | 'meeting'
  }) => {
    if (!user.value?.id) throw new Error('Usuário não autenticado')
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
        .from('eventos_calendario')
        .insert({
          ...data,
          school_id: usuario.value.schoolId,
          created_by: user.value.id
        })
        .select()
        .single()
      if (err) throw err
      return result as CalendarEvent
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: string, data: Partial<CalendarEvent>) => {
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
        .from('eventos_calendario')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      return result as CalendarEvent
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('eventos_calendario')
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

  return {
    events, loading, error,
    fetchEvents, fetchAssignmentsDueDates, fetchAnnouncementsDates,
    createEvent, updateEvent, deleteEvent
  }
}
