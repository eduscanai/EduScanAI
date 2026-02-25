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
        <h1 class="text-heading-1">Editar Usuário</h1>
        <p class="text-body text-text-secondary mt-1">Atualize as informações do usuário</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingUser" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando dados do usuário...</p>
    </div>

    <!-- Formulário -->
    <div v-else-if="form" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Informações do usuário -->
      <div class="lg:col-span-2">
        <Cartao>
          <h2 class="text-heading-3 mb-6">Informações Pessoais</h2>

          <div class="space-y-4">
            <div>
              <label for="full_name" class="form-label">Nome completo</label>
              <input
                id="full_name"
                type="text"
                v-model="form.full_name"
                class="form-input"
                placeholder="Nome do usuário"
              />
              <p v-if="erros.full_name" class="mt-1 text-xs text-critical-500">{{ erros.full_name }}</p>
            </div>

            <div>
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                :value="form.email"
                class="form-input bg-gray-50 cursor-not-allowed"
                disabled
              />
              <p class="mt-1 text-xs text-text-secondary">O email não pode ser alterado</p>
            </div>

            <div>
              <label for="role" class="form-label">Perfil</label>
              <CampoSelecao
                id="role"
                :modelValue="form.role"
                @update:modelValue="form.role = $event as string"
                :opcoes="opcoesRole"
              />
              <p v-if="erros.role" class="mt-1 text-xs text-critical-500">{{ erros.role }}</p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                @click="form.is_active = !form.is_active"
                :class="[
                  'toggle',
                  form.is_active ? 'toggle-active' : 'toggle-inactive'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
              <span class="text-sm font-medium text-gray-700">
                {{ form.is_active ? 'Usuário ativo' : 'Usuário inativo' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <NuxtLink to="/admin/users" class="btn-outline no-underline">
              Cancelar
            </NuxtLink>
            <button @click="salvar" :disabled="loading" class="btn-primary">
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </Cartao>
      </div>

      <!-- Sidebar info -->
      <div>
        <Cartao>
          <h2 class="text-heading-3 mb-4">Detalhes</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">ID</p>
              <p class="text-sm text-gray-900 font-mono mt-0.5">{{ form.id?.slice(0, 8) }}...</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Criado em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarData(form.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5',
                  form.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ form.is_active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </Cartao>
      </div>
    </div>

    <!-- Usuário não encontrado -->
    <Cartao v-else>
      <div class="text-center py-12">
        <p class="text-body text-text-secondary">Usuário não encontrado</p>
        <NuxtLink to="/admin/users" class="btn-primary mt-4 inline-block no-underline">
          Voltar para lista
        </NuxtLink>
      </div>
    </Cartao>

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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const route = useRoute()
const userId = route.params.id as string

const { loading, fetchUser, updateUser } = useUsers()
const loadingUser = ref(true)

const form = ref<any>(null)
const erros = ref<Record<string, string>>({})

const opcoesRole = [
  { rotulo: 'Administrador', valor: 'admin' },
  { rotulo: 'Pedagogo', valor: 'pedagogue' },
  { rotulo: 'Professor', valor: 'teacher' },
  { rotulo: 'Estudante', valor: 'student' }
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

  if (!form.value.full_name?.trim()) {
    erros.value.full_name = 'Nome é obrigatório'
  }

  if (!form.value.role) {
    erros.value.role = 'Perfil é obrigatório'
  }

  return Object.keys(erros.value).length === 0
}

// Salvar
const salvar = async () => {
  if (!validar()) return

  try {
    await updateUser(userId, {
      full_name: form.value.full_name,
      role: form.value.role,
      is_active: form.value.is_active
    })
    mostrarNotificacao('sucesso', 'Usuário atualizado com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar', 'Não foi possível atualizar o usuário')
  }
}

// Formatar data
const formatarData = (data: string) => {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Carregar usuário
onMounted(async () => {
  const user = await fetchUser(userId)
  if (user) {
    form.value = { ...user }
  }
  loadingUser.value = false
})
</script>
