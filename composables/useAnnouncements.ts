interface Announcement {
  id: string
  school_id: string
  author_id: string
  title: string
  content: string | null
  target_type: 'school' | 'class' | 'role'
  target_id: string | null
  target_role: string | null
  priority: 'low' | 'normal' | 'high'
  published_at: string | null
  created_at: string
  updated_at: string
  profiles?: { full_name: string; avatar_url: string | null }
  classes?: { name: string }
}

export const useAnnouncements = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const user = useSupabaseUser()

  const announcements = ref<Announcement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const listAnnouncements = async (opts?: { published?: boolean }) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('announcements')
        .select('*, profiles(full_name, avatar_url), classes:target_id(name)')
        .eq('school_id', usuario.value.schoolId)
        .order('created_at', { ascending: false })

      if (opts?.published) {
        query = query.not('published_at', 'is', null)
      }

      const { data, error: err } = await query
      if (err) throw err
      announcements.value = (data || []) as Announcement[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const getAnnouncement = async (id: string) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('announcements')
        .select('*, profiles(full_name, avatar_url), classes:target_id(name)')
        .eq('id', id)
        .eq('school_id', usuario.value.schoolId)
        .single()
      if (err) throw err
      return data as Announcement
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createAnnouncement = async (data: {
    title: string
    content?: string
    target_type: 'school' | 'class' | 'role'
    target_id?: string
    target_role?: string
    priority?: 'low' | 'normal' | 'high'
    publish?: boolean
  }) => {
    if (!user.value?.id) throw new Error('Usuário não autenticado')
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
        .from('announcements')
        .insert({
          school_id: usuario.value.schoolId,
          author_id: user.value.id,
          title: data.title,
          content: data.content || null,
          target_type: data.target_type,
          target_id: data.target_id || null,
          target_role: data.target_role || null,
          priority: data.priority || 'normal',
          published_at: data.publish ? new Date().toISOString() : null
        })
        .select('*, profiles(full_name, avatar_url)')
        .single()
      if (err) throw err
      return result as Announcement
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    loading.value = true
    error.value = null
    try {
      const { data: result, error: err } = await supabase
        .from('announcements')
        .update(data)
        .eq('id', id)
        .eq('school_id', usuario.value.schoolId)
        .select('*, profiles(full_name, avatar_url)')
        .single()
      if (err) throw err
      return result as Announcement
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const publishAnnouncement = async (id: string) => {
    return updateAnnouncement(id, {
      published_at: new Date().toISOString()
    } as Partial<Announcement>)
  }

  const deleteAnnouncement = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .eq('school_id', usuario.value.schoolId)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    announcements, loading, error,
    listAnnouncements, getAnnouncement,
    createAnnouncement, updateAnnouncement,
    publishAnnouncement, deleteAnnouncement
  }
}
