export const useUsuario = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Fallback: quando app_metadata não tem role/school_id (JWT claims não carregaram),
  // usamos dados buscados da tabela profiles
  const profileRole = useState<string | null>('usuario_profile_role', () => null)
  const profileSchoolId = useState<string | null>('usuario_profile_school_id', () => null)
  // Fallback para user.id (useSupabaseUser pode não ter id na hidratação do cookie)
  const cachedUserId = useState<string | null>('usuario_cached_user_id', () => null)

  const userId = computed(() => user.value?.id || cachedUserId.value || null)

  const usuario = computed(() => ({
    id: userId.value,
    name: user.value?.user_metadata?.nome || user.value?.email || 'Usuário',
    role: user.value?.app_metadata?.role || profileRole.value || 'teacher',
    avatar: user.value?.user_metadata?.avatar_url || '',
    schoolId: user.value?.app_metadata?.school_id || profileSchoolId.value || null
  }))

  // Garante que temos user ID, role e school_id
  const ensureProfile = async () => {
    // Garantir user ID via getSession() se useSupabaseUser() não trouxe
    if (!user.value?.id && !cachedUserId.value) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        cachedUserId.value = session.user.id
      }
    }

    if (user.value?.app_metadata?.role && user.value?.app_metadata?.school_id) return

    const uid = userId.value
    if (!uid) return
    if (profileRole.value && profileSchoolId.value) return

    const { data } = await supabase
      .from('perfis')
      .select('role, school_id')
      .eq('id', uid)
      .single()

    if (data) {
      profileRole.value = data.role
      profileSchoolId.value = data.school_id
    }
  }

  const logout = async () => {
    profileRole.value = null
    profileSchoolId.value = null
    cachedUserId.value = null
    await supabase.auth.signOut()
    navigateTo('/login', { replace: true })
  }

  return { usuario, user, logout, ensureProfile }
}
