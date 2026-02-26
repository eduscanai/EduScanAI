import { serverSupabaseServiceRole } from '#supabase/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  // Verificar autenticação e permissão de admin
  const { profile: adminProfile } = await requireAdmin(event)

  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { email, password, full_name, role, school_id, matricula, cpf, sexo, data_nascimento } = body

  // Validar campos obrigatórios
  if (!email || !password || !full_name || !role || !school_id) {
    throw createError({
      statusCode: 400,
      message: 'Campos obrigatórios: email, password, full_name, role, school_id'
    })
  }

  // Validar que o admin só pode criar usuários na própria escola
  if (school_id !== adminProfile.school_id) {
    throw createError({
      statusCode: 403,
      message: 'Não é possível criar usuários em outra escola'
    })
  }

  // Validar formato de email
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: 'Formato de email inválido'
    })
  }

  // Validar senha
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve ter pelo menos 8 caracteres'
    })
  }

  // Validar role
  const rolesValidos = ['admin', 'pedagogue', 'teacher', 'student']
  if (!rolesValidos.includes(role)) {
    throw createError({
      statusCode: 400,
      message: `Role inválido. Valores aceitos: ${rolesValidos.join(', ')}`
    })
  }

  // Criar usuário no auth.users com a service role key
  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: full_name },
    app_metadata: { role, school_id }
  })

  if (authError) {
    throw createError({
      statusCode: 400,
      message: authError.message
    })
  }

  // Garantir que o profile existe com os dados corretos
  const userId = authData.user.id
  const { error: profileError } = await client
    .from('profiles')
    .upsert({
      id: userId,
      school_id,
      full_name,
      role,
      email,
      is_active: true,
      matricula: matricula || null,
      cpf: cpf || null,
      sexo: sexo || null,
      data_nascimento: data_nascimento || null
    }, { onConflict: 'id' })

  if (profileError) {
    await client.auth.admin.deleteUser(userId)
    throw createError({
      statusCode: 500,
      message: 'Erro ao criar perfil do usuário: ' + profileError.message
    })
  }

  return { user: authData.user }
})
