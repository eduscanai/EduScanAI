import { serverSupabaseServiceRole } from '#supabase/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { school_name, slug, full_name, email, password } = body

  // Validações de campos obrigatórios
  if (!school_name || !slug || !full_name || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Campos obrigatórios: school_name, slug, full_name, email, password'
    })
  }

  // Validar tamanhos
  if (school_name.length > 200 || full_name.length > 200) {
    throw createError({
      statusCode: 400,
      message: 'Nome da escola e nome completo devem ter no máximo 200 caracteres'
    })
  }

  if (slug.length < 3 || slug.length > 50) {
    throw createError({
      statusCode: 400,
      message: 'Slug deve ter entre 3 e 50 caracteres'
    })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw createError({
      statusCode: 400,
      message: 'Slug deve conter apenas letras minúsculas, números e hífens'
    })
  }

  // Validar email
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: 'Formato de email inválido'
    })
  }

  // Validar senha (mín. 8 chars, 1 maiúscula, 1 número)
  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve ter pelo menos 8 caracteres, 1 letra maiúscula e 1 número'
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
      name: school_name.trim(),
      slug: slug.trim(),
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
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { nome: full_name.trim() },
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
  await client
    .from('academic_years')
    .insert({
      school_id: school.id,
      name: `${anoAtual}`,
      start_date: `${anoAtual}-02-01`,
      end_date: `${anoAtual}-12-15`,
      is_current: true
    })

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
