interface Notification {
  id: string
  user_id: string
  school_id: string | null
  type: string
  title: string
  message: string | null
  data: Record<string, any>
  read_at: string | null
  created_at: string
}

export const useNotifications = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const unreadCount = ref(0)

  let realtimeChannel: any = null

  const fetchNotifications = async (limit = 50) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.value!.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      notifications.value = (data || []) as Notification[]
      calcularNaoLidas()
    } catch (e: any) {
      console.error('Erro ao buscar notificações:', e.message)
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value!.id)
        .is('read_at', null)

      if (error) throw error
      unreadCount.value = count || 0
    } catch (e: any) {
      console.error('Erro ao contar notificações:', e.message)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      const notif = notifications.value.find(n => n.id === id)
      if (notif && !notif.read_at) {
        notif.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (e: any) {
      console.error('Erro ao marcar como lida:', e.message)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.value!.id)
        .is('read_at', null)

      if (error) throw error

      notifications.value.forEach(n => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (e: any) {
      console.error('Erro ao marcar todas como lidas:', e.message)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        if (!notifications.value[index].read_at) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    } catch (e: any) {
      console.error('Erro ao deletar notificação:', e.message)
    }
  }

  const calcularNaoLidas = () => {
    unreadCount.value = notifications.value.filter(n => !n.read_at).length
  }

  // Realtime subscription
  const subscribe = () => {
    if (!user.value || realtimeChannel) return

    realtimeChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.value.id}`
        },
        (payload: any) => {
          const newNotif = payload.new as Notification
          notifications.value.unshift(newNotif)
          unreadCount.value++
        }
      )
      .subscribe()
  }

  const unsubscribe = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  // Link para recurso referenciado pela notificação
  const getNotificationLink = (notif: Notification): string | null => {
    const data = notif.data || {}

    if (notif.type === 'assignment' && data.assignment_id) {
      return `/student/assignments/${data.assignment_id}`
    }
    if (notif.type === 'announcement' && data.announcement_id) {
      return `/announcements/${data.announcement_id}`
    }
    if (notif.type === 'grade' && data.assignment_id) {
      return `/student/assignments/${data.assignment_id}`
    }

    return null
  }

  return {
    notifications, loading, unreadCount,
    fetchNotifications, fetchUnreadCount,
    markAsRead, markAllAsRead, deleteNotification,
    subscribe, unsubscribe, getNotificationLink
  }
}
