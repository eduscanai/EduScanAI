import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { school_name, slug, full_name, email, password } = body

  // Validações
  if (!school_name || !slug || !full_name || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Campos obrigatórios: school_name, slug, full_name, email, password'
    })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw createError({
      statusCode: 400,
      message: 'Slug deve conter apenas letras minúsculas, números e hífens'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve ter pelo menos 6 caracteres'
    })
  }

  // 1. Verificar se slug já existe
  const { data: existingSchool } = await client
    .from('schools')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingSchool) {
    throw createError({
      statusCode: 409,
      message: 'Este slug já está em uso. Escolha outro identificador.'
    })
  }

  // 2. Criar a escola
  const { data: school, error: schoolError } = await client
    .from('schools')
    .insert({
      name: school_name,
      slug,
      plan: 'free'
    })
    .select()
    .single()

  if (schoolError) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao criar escola: ' + schoolError.message
    })
  }

  // 3. Criar o usuário admin no Auth
  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: full_name },
    app_metadata: { role: 'admin', school_id: school.id }
  })

  if (authError) {
    // Rollback: deletar a escola criada
    await client.from('schools').delete().eq('id', school.id)

    throw createError({
      statusCode: 400,
      message: authError.message
    })
  }

  // 4. Criar ano letivo padrão
  const anoAtual = new Date().getFullYear()
  const { error: yearError } = await client
    .from('academic_years')
    .insert({
      school_id: school.id,
      name: `${anoAtual}`,
      start_date: `${anoAtual}-02-01`,
      end_date: `${anoAtual}-12-15`,
      is_current: true
    })

  if (yearError) {
    console.warn('Aviso: erro ao criar ano letivo padrão:', yearError.message)
  }

  return {
    school: {
      id: school.id,
      name: school.name,
      slug: school.slug
    },
    user: {
      id: authData.user.id,
      email: authData.user.email
    }
  }
})
