import { serverSupabaseServiceRole } from '#supabase/server'

interface UserData {
  full_name: string
  email: string
  matricula?: string
  cpf?: string
  sexo?: string
  data_nascimento?: string
}

export default defineEventHandler(async (event) => {
  // Verificar autenticação e permissão de admin
  const { profile: adminProfile } = await requireAdmin(event)

  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { students, school_id, password, role } = body as {
    students: UserData[]
    school_id: string
    password: string
    role?: string
  }

  const userRole = role || 'student'

  // Impedir criação de admin em massa
  const rolesValidos = ['pedagogue', 'teacher', 'student']
  if (!rolesValidos.includes(userRole)) {
    throw createError({
      statusCode: 400,
      message: `Role inválido. Valores aceitos: ${rolesValidos.join(', ')}`
    })
  }

  if (!students?.length || !school_id || !password) {
    throw createError({
      statusCode: 400,
      message: 'Campos obrigatórios: students (array), school_id, password'
    })
  }

  // Validar que o admin só pode criar usuários na própria escola
  if (school_id !== adminProfile.school_id) {
    throw createError({
      statusCode: 403,
      message: 'Não é possível criar usuários em outra escola'
    })
  }

  // Validar senha
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve ter pelo menos 8 caracteres'
    })
  }

  const results = {
    total: students.length,
    created: 0,
    errors: [] as { email: string; error: string }[]
  }

  // Processar em lotes de 5 para não sobrecarregar
  const BATCH_SIZE = 5
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (user) => {
      try {
        const { data: authData, error: authError } = await client.auth.admin.createUser({
          email: user.email,
          password,
          email_confirm: true,
          user_metadata: { nome: user.full_name },
          app_metadata: { role: userRole, school_id }
        })

        if (authError) {
          results.errors.push({ email: user.email, error: authError.message })
          return
        }

        const profileData: Record<string, any> = {
          id: authData.user.id,
          school_id,
          full_name: user.full_name,
          role: userRole,
          email: user.email,
          is_active: true
        }

        if (userRole === 'student') {
          profileData.matricula = user.matricula || null
          profileData.cpf = user.cpf || null
          profileData.sexo = user.sexo || null
          profileData.data_nascimento = user.data_nascimento || null
        }

        const { error: profileError } = await client
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' })

        if (profileError) {
          await client.auth.admin.deleteUser(authData.user.id)
          results.errors.push({ email: user.email, error: profileError.message })
          return
        }

        results.created++
      } catch (e: any) {
        results.errors.push({ email: user.email, error: e.message || 'Erro desconhecido' })
      }
    }))
  }

  return results
})
