import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

interface AuthResult {
  user: { id: string; email?: string }
  profile: { id: string; school_id: string; role: string }
}

export const requireAuth = async (event: H3Event): Promise<AuthResult> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const client = await serverSupabaseClient(event)
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, school_id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw createError({ statusCode: 403, message: 'Perfil não encontrado' })
  }

  return { user: { id: user.id, email: user.email }, profile }
}

export const requireAdmin = async (event: H3Event): Promise<AuthResult> => {
  const result = await requireAuth(event)
  if (result.profile.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acesso negado: apenas administradores' })
  }
  return result
}
