import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
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

  // serverSupabaseUser pode retornar o JWT payload (sub/email) ou User object (id/email)
  const userId = (user as any).id || (user as any).sub
  const userEmail = (user as any).email

  if (!userId) {
    throw createError({ statusCode: 401, message: 'ID do usuário não encontrado na sessão' })
  }

  // Usa service role para buscar perfil (bypassa RLS)
  const client = await serverSupabaseServiceRole(event)
  const { data: profile, error } = await client
    .from('perfis')
    .select('id, school_id, role')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw createError({ statusCode: 403, message: 'Perfil não encontrado' })
  }

  return { user: { id: userId, email: userEmail }, profile }
}

export const requireAdmin = async (event: H3Event): Promise<AuthResult> => {
  const result = await requireAuth(event)
  if (result.profile.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acesso negado: apenas administradores' })
  }
  return result
}
