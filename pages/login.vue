<template>
  <div class="min-h-screen bg-bg-page flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-md">
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
        <h2 class="text-2xl font-black text-gray-900 mb-2">Bem-vindo de volta</h2>
        <p class="text-sm text-gray-400">Entre com suas credenciais para acessar a plataforma</p>
      </div>

        <!-- Formulário -->
        <form @submit.prevent="fazerLogin" class="space-y-5">
          <!-- Email -->
          <CampoFormulario
            id="email"
            tipo="email"
            v-model="formulario.email"
            rotulo="E-mail"
            texto-reservado="seu@email.com"
            :erro="erros.email"
          />

          <!-- Senha -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="senha" class="form-label !mb-0">Senha</label>
              <button
                type="button"
                class="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                @click="esqueceuSenha"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div class="relative">
              <input
                id="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                v-model="formulario.senha"
                placeholder="Digite sua senha"
                class="form-input pr-12"
                :class="{ 'form-input-error border-critical-500': erros.senha }"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                @click="mostrarSenha = !mostrarSenha"
              >
                <Icone :tamanho="18">
                  <path
                    v-if="!mostrarSenha"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    v-if="!mostrarSenha"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    v-if="mostrarSenha"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </Icone>
              </button>
            </div>
            <p v-if="erros.senha" class="mt-1 text-xs text-critical-500">{{ erros.senha }}</p>
          </div>

          <!-- Lembrar-me -->
          <div class="flex items-center gap-2">
            <input
              id="lembrar"
              type="checkbox"
              v-model="formulario.lembrar"
              class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
            />
            <label for="lembrar" class="text-sm text-gray-600 cursor-pointer select-none">
              Manter conectado
            </label>
          </div>

          <!-- Erro geral -->
          <div
            v-if="erroGeral"
            class="p-3 rounded-lg border-l-4 border-critical-500 bg-critical-50 text-sm text-critical-700"
          >
            {{ erroGeral }}
          </div>

          <!-- Botão entrar -->
          <button
            type="submit"
            :disabled="carregando"
            class="w-full px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!carregando">Entrar</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          </button>
        </form>

        <!-- Separador -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400 font-medium">ou</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- Login com Google -->
        <button
          class="w-full px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold text-sm text-gray-700 flex items-center justify-center gap-3"
          @click="loginGoogle"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <!-- Criar conta -->
        <p class="text-center text-sm text-gray-500 mt-6">
          Ainda não tem uma conta?
          <button
            type="button"
            class="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            @click="criarConta"
          >
            Criar conta
          </button>
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { navigateTo } from '#app'
import Icone from '~/components/ui/Icone/Icone.vue'
import CampoFormulario from '~/components/form/CampoFormulario/CampoFormulario.vue'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Se já está logado, redireciona para o dashboard
if (user.value) {
  navigateTo('/dashboard', { replace: true })
}

const mostrarSenha = ref(false)
const carregando = ref(false)
const erroGeral = ref('')

const formulario = reactive({
  email: '',
  senha: '',
  lembrar: false
})

const erros = reactive({
  email: '',
  senha: ''
})

const validar = (): boolean => {
  erros.email = ''
  erros.senha = ''
  erroGeral.value = ''

  let valido = true

  if (!formulario.email) {
    erros.email = 'Informe seu e-mail'
    valido = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
    erros.email = 'E-mail inválido'
    valido = false
  }

  if (!formulario.senha) {
    erros.senha = 'Informe sua senha'
    valido = false
  } else if (formulario.senha.length < 6) {
    erros.senha = 'A senha deve ter pelo menos 6 caracteres'
    valido = false
  }

  return valido
}

const fazerLogin = async () => {
  if (!validar()) return

  carregando.value = true
  erroGeral.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: formulario.email,
    password: formulario.senha
  })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      erroGeral.value = 'E-mail ou senha incorretos. Tente novamente.'
    } else if (error.message === 'Email not confirmed') {
      erroGeral.value = 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
    } else {
      erroGeral.value = 'Erro ao fazer login. Tente novamente.'
    }
    carregando.value = false
    return
  }

  navigateTo('/dashboard')
}

const esqueceuSenha = async () => {
  if (!formulario.email) {
    erros.email = 'Informe seu e-mail para recuperar a senha'
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(formulario.email, {
    redirectTo: `${window.location.origin}/login`
  })

  if (error) {
    erroGeral.value = 'Erro ao enviar e-mail de recuperação. Tente novamente.'
  } else {
    erroGeral.value = ''
    alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
  }
}

const loginGoogle = () => {
  // TODO: implementar login com Google
}

const criarConta = () => {
  navigateTo('/cadastro')
}
</script>
