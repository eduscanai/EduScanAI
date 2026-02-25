<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/users"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Novo Usuário</h1>
        <p class="text-body text-text-secondary mt-1">Cadastre um novo usuário na sua escola</p>
      </div>
    </div>

    <!-- Formulário -->
    <div class="max-w-2xl">
      <Cartao>
        <h2 class="text-heading-3 mb-6">Informações do Usuário</h2>

        <div class="space-y-4">
          <div>
            <label for="full_name" class="form-label">Nome completo *</label>
            <input
              id="full_name"
              type="text"
              v-model="form.full_name"
              class="form-input"
              placeholder="Ex: Maria da Silva"
            />
            <p v-if="erros.full_name" class="mt-1 text-xs text-critical-500">{{ erros.full_name }}</p>
          </div>

          <div>
            <label for="email" class="form-label">Email *</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              class="form-input"
              placeholder="email@escola.com"
            />
            <p v-if="erros.email" class="mt-1 text-xs text-critical-500">{{ erros.email }}</p>
          </div>

          <div>
            <label for="password" class="form-label">Senha *</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              class="form-input"
              placeholder="Mínimo 6 caracteres"
            />
            <p v-if="erros.password" class="mt-1 text-xs text-critical-500">{{ erros.password }}</p>
          </div>

          <div>
            <label for="role" class="form-label">Perfil *</label>
            <CampoSelecao
              id="role"
              :modelValue="form.role"
              @update:modelValue="form.role = $event as string"
              texto-reservado="Selecione um perfil"
              :opcoes="opcoesRole"
            />
            <p v-if="erros.role" class="mt-1 text-xs text-critical-500">{{ erros.role }}</p>
          </div>
        </div>

        <!-- Campos extras para Estudante -->
        <div v-if="form.role === 'student'" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-4">Dados do Aluno</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="matricula" class="form-label">Matrícula</label>
              <input id="matricula" type="text" v-model="form.matricula" class="form-input" placeholder="Nº da matrícula" />
            </div>
            <div>
              <label for="cpf" class="form-label">CPF</label>
              <input id="cpf" type="text" v-model="form.cpf" class="form-input" placeholder="000.000.000-00" />
            </div>
            <div>
              <label for="sexo" class="form-label">Sexo</label>
              <CampoSelecao
                id="sexo"
                :modelValue="form.sexo"
                @update:modelValue="form.sexo = $event as string"
                texto-reservado="Selecione"
                :opcoes="opcoesSexo"
              />
            </div>
            <div>
              <label for="data_nascimento" class="form-label">Data de Nascimento</label>
              <input id="data_nascimento" type="date" v-model="form.data_nascimento" class="form-input" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <NuxtLink to="/admin/users" class="btn-outline no-underline">
            Cancelar
          </NuxtLink>
          <button @click="criar" :disabled="loading" class="btn-primary">
            {{ loading ? 'Criando...' : 'Criar Usuário' }}
          </button>
        </div>
      </Cartao>
    </div>

    <!-- Notificação -->
    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      :mensagem="notificacao.mensagem"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { loading, createUser } = useUsers()

const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: '',
  matricula: '',
  cpf: '',
  sexo: '',
  data_nascimento: ''
})

const erros = ref<Record<string, string>>({})

const opcoesRole = [
  { rotulo: 'Pedagogo', valor: 'pedagogue' },
  { rotulo: 'Professor', valor: 'teacher' },
  { rotulo: 'Estudante', valor: 'student' }
]

const opcoesSexo = [
  { rotulo: 'Masculino', valor: 'M' },
  { rotulo: 'Feminino', valor: 'F' }
]

// Notificação
const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

// Validação
const validar = () => {
  erros.value = {}

  if (!form.value.full_name.trim()) {
    erros.value.full_name = 'Nome é obrigatório'
  }

  if (!form.value.email.trim()) {
    erros.value.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    erros.value.email = 'Email inválido'
  }

  if (!form.value.password) {
    erros.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 6) {
    erros.value.password = 'Senha deve ter no mínimo 6 caracteres'
  }

  if (!form.value.role) {
    erros.value.role = 'Perfil é obrigatório'
  }

  return Object.keys(erros.value).length === 0
}

// Criar usuário
const criar = async () => {
  if (!validar()) return

  try {
    const payload: any = {
      email: form.value.email,
      password: form.value.password,
      full_name: form.value.full_name,
      role: form.value.role
    }
    if (form.value.role === 'student') {
      if (form.value.matricula) payload.matricula = form.value.matricula
      if (form.value.cpf) payload.cpf = form.value.cpf
      if (form.value.sexo) payload.sexo = form.value.sexo
      if (form.value.data_nascimento) payload.data_nascimento = form.value.data_nascimento
    }
    await createUser(payload)
    mostrarNotificacao('sucesso', 'Usuário criado com sucesso')

    // Limpar formulário
    form.value = { full_name: '', email: '', password: '', role: '', matricula: '', cpf: '', sexo: '', data_nascimento: '' }

    // Redirecionar após 1.5s
    setTimeout(() => {
      navigateTo('/admin/users')
    }, 1500)
  } catch (e: any) {
    const msg = e.data?.message || e.message || 'Erro desconhecido'
    mostrarNotificacao('critico', 'Erro ao criar usuário', msg)
  }
}
</script>
