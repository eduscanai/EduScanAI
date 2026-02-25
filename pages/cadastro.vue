<template>
  <div class="min-h-screen bg-bg-page flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-lg">
      <!-- Logo -->
      <div class="flex justify-center mb-10">
        <div class="flex items-center gap-[10px]">
          <div class="bg-primary-500 p-[6px] rounded-lg">
            <Icone :tamanho="24" class="text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </Icone>
          </div>
          <span class="text-[18px] font-extrabold text-gray-900">EduScan AI</span>
        </div>
      </div>

      <!-- Saudação -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-black text-gray-900 mb-2">Cadastre sua escola</h2>
        <p class="text-sm text-gray-400">Crie a conta da sua escola e comece a usar a plataforma</p>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="criarEscola" class="space-y-6">
        <!-- Dados da escola -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Dados da escola</h3>

          <div>
            <label for="nomeEscola" class="form-label">Nome da escola *</label>
            <input
              id="nomeEscola"
              type="text"
              v-model="form.schoolName"
              class="form-input"
              placeholder="Ex: Colégio São Paulo"
              @input="gerarSlug"
            />
            <p v-if="erros.schoolName" class="mt-1 text-xs text-critical-500">{{ erros.schoolName }}</p>
          </div>

          <div>
            <label for="slug" class="form-label">Identificador (slug)</label>
            <div class="relative">
              <input
                id="slug"
                type="text"
                v-model="form.slug"
                class="form-input pl-[130px]"
                placeholder="minha-escola"
                @input="slugManual = true"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">eduscanai.com/</span>
            </div>
            <p v-if="erros.slug" class="mt-1 text-xs text-critical-500">{{ erros.slug }}</p>
            <p v-else class="mt-1 text-xs text-gray-400">Usado para identificar sua escola no sistema</p>
          </div>
        </div>

        <!-- Dados do admin -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Conta do administrador</h3>

          <div>
            <label for="nome" class="form-label">Nome completo *</label>
            <input id="nome" type="text" v-model="form.fullName" class="form-input" placeholder="Seu nome completo" />
            <p v-if="erros.fullName" class="mt-1 text-xs text-critical-500">{{ erros.fullName }}</p>
          </div>

          <div>
            <label for="email" class="form-label">E-mail *</label>
            <input id="email" type="email" v-model="form.email" class="form-input" placeholder="admin@suaescola.com" />
            <p v-if="erros.email" class="mt-1 text-xs text-critical-500">{{ erros.email }}</p>
          </div>

          <div>
            <label for="senha" class="form-label">Senha *</label>
            <div class="relative">
              <input
                id="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                v-model="form.password"
                class="form-input pr-12"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                @click="mostrarSenha = !mostrarSenha"
              >
                <Icone :tamanho="18">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :d="mostrarSenha
                      ? 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                      : 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'"
                  />
                  <path
                    v-if="!mostrarSenha"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </Icone>
              </button>
            </div>
            <p v-if="erros.password" class="mt-1 text-xs text-critical-500">{{ erros.password }}</p>
          </div>
        </div>

        <!-- Erro geral -->
        <div
          v-if="erroGeral"
          class="p-3 rounded-lg border-l-4 border-critical-500 bg-critical-50 text-sm text-critical-700"
        >
          {{ erroGeral }}
        </div>

        <!-- Botão -->
        <button
          type="submit"
          :disabled="carregando"
          class="w-full px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!carregando">Criar escola e conta</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Criando...
          </span>
        </button>
      </form>

      <!-- Já tem conta -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Já tem uma conta?
        <NuxtLink to="/login" class="font-semibold text-primary-500 hover:text-primary-600 transition-colors no-underline">
          Entrar
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const carregando = ref(false)
const erroGeral = ref('')
const mostrarSenha = ref(false)
const slugManual = ref(false)

const form = ref({
  schoolName: '',
  slug: '',
  fullName: '',
  email: '',
  password: ''
})

const erros = ref<Record<string, string>>({})

const gerarSlug = () => {
  if (slugManual.value) return
  form.value.slug = form.value.schoolName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const validar = () => {
  erros.value = {}
  erroGeral.value = ''

  if (!form.value.schoolName.trim()) erros.value.schoolName = 'Nome da escola é obrigatório'
  if (!form.value.slug.trim()) {
    erros.value.slug = 'Slug é obrigatório'
  } else if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
    erros.value.slug = 'Apenas letras minúsculas, números e hífens'
  }
  if (!form.value.fullName.trim()) erros.value.fullName = 'Nome é obrigatório'
  if (!form.value.email.trim()) {
    erros.value.email = 'E-mail é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    erros.value.email = 'E-mail inválido'
  }
  if (!form.value.password) {
    erros.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 6) {
    erros.value.password = 'Mínimo 6 caracteres'
  }

  return Object.keys(erros.value).length === 0
}

const criarEscola = async () => {
  if (!validar()) return

  carregando.value = true
  erroGeral.value = ''

  try {
    await $fetch('/api/onboarding/create-school', {
      method: 'POST',
      body: {
        school_name: form.value.schoolName,
        slug: form.value.slug,
        full_name: form.value.fullName,
        email: form.value.email,
        password: form.value.password
      }
    })

    // Login automático
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (loginError) throw loginError

    // Redirecionar para o wizard de setup
    navigateTo('/onboarding/setup', { replace: true })
  } catch (e: any) {
    const msg = e.data?.message || e.message || 'Erro ao criar escola'
    if (msg.includes('slug') || msg.includes('unique')) {
      erros.value.slug = 'Este identificador já está em uso'
    } else if (msg.includes('already registered') || msg.includes('already been registered')) {
      erros.value.email = 'Este e-mail já está cadastrado'
    } else {
      erroGeral.value = msg
    }
  } finally {
    carregando.value = false
  }
}
</script>
