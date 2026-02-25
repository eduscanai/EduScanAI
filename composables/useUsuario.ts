export const useUsuario = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const usuario = computed(() => ({
    name: user.value?.user_metadata?.nome || user.value?.email || 'Usuário',
    role: user.value?.app_metadata?.role || 'teacher',
    avatar: user.value?.user_metadata?.avatar_url || '',
    schoolId: user.value?.app_metadata?.school_id || null
  }))

  const logout = async () => {
    await supabase.auth.signOut()
    navigateTo('/login', { replace: true })
  }

  return { usuario, user, logout }
}
