import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
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
  // (o trigger pode falhar ao ler role do app_metadata)
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
    // Se falhou ao criar profile, remove o auth user para não ficar órfão
    await client.auth.admin.deleteUser(userId)
    throw createError({
      statusCode: 500,
      message: 'Erro ao criar perfil do usuário: ' + profileError.message
    })
  }

  return { user: authData.user }
})
