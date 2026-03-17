<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Gestão de Usuários</h1>
        <p class="text-body text-text-secondary mt-1">Gerencie os usuários da sua escola</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/users/import" class="btn-outline flex items-center gap-2 no-underline">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </Icone>
          Importar
        </NuxtLink>
        <NuxtLink to="/admin/users/create" class="btn-primary flex items-center gap-2 no-underline">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </Icone>
          Novo Usuário
        </NuxtLink>
      </div>
    </div>

    <!-- Filtros -->
    <Cartao class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BarraBusca
            :modelValue="busca"
            @update:modelValue="busca = $event"
            texto-reservado="Buscar por nome ou email..."
          />
        </div>
        <div class="w-full sm:w-48">
          <CampoSelecao
            :modelValue="filtroRole"
            @update:modelValue="filtroRole = $event as string"
            texto-reservado="Todos os perfis"
            :opcoes="opcoesRole"
          />
        </div>
      </div>
    </Cartao>

    <!-- Tabela -->
    <Cartao>
      <Carregando v-if="loading" texto="Carregando usuários..." />

      <TabelaDados v-else :colunas="colunas" :dados="users">
        <template #celula-full_name="{ linha }">
          <div class="flex items-center gap-3">
            <Avatar
              :alt="linha.full_name || 'Usuário'"
              :image="linha.avatar_url"
              :size="32"
            />
            <div>
              <p class="font-semibold text-gray-900">{{ linha.full_name || 'Sem nome' }}</p>
              <p class="text-xs text-gray-500">{{ linha.email }}</p>
            </div>
          </div>
        </template>

        <template #celula-matricula="{ valor }">
          <span class="text-sm text-gray-700">{{ valor || '-' }}</span>
        </template>

        <template #celula-cpf="{ valor }">
          <span class="text-sm text-gray-700">{{ valor || '-' }}</span>
        </template>

        <template #celula-sexo="{ valor }">
          <span class="text-sm text-gray-700">{{ valor === 'M' ? 'Masculino' : valor === 'F' ? 'Feminino' : '-' }}</span>
        </template>

        <template #celula-data_nascimento="{ valor }">
          <span class="text-sm text-gray-700">{{ valor ? formatarData(valor) : '-' }}</span>
        </template>

        <template #celula-role="{ valor }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              classeRole(valor)
            ]"
          >
            {{ rotuloRole(valor) }}
          </span>
        </template>

        <template #celula-is_active="{ valor }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              valor ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            ]"
          >
            {{ valor ? 'Ativo' : 'Inativo' }}
          </span>
        </template>

        <template #celula-created_at="{ valor }">
          {{ formatarData(valor) }}
        </template>

        <template #celula-acoes="{ linha }">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/admin/users/${linha.id}`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
              title="Editar"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </Icone>
            </NuxtLink>
            <button
              @click="confirmarAlterarStatus(linha)"
              :class="[
                'p-1.5 rounded-lg transition-colors',
                linha.is_active
                  ? 'text-gray-400 hover:text-critical-500 hover:bg-critical-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              ]"
              :title="linha.is_active ? 'Desativar' : 'Ativar'"
            >
              <Icone :tamanho="18">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :d="linha.is_active
                    ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                    : 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  "
                />
              </Icone>
            </button>
          </div>
        </template>

        <template #vazio>
          <div class="text-center py-8">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </Icone>
            <p class="text-body text-text-secondary">Nenhum usuário encontrado</p>
          </div>
        </template>
      </TabelaDados>

      <!-- Paginação -->
      <div v-if="totalPaginas > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          {{ total }} usuário{{ total !== 1 ? 's' : '' }} encontrado{{ total !== 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="paginaAtual > 1 && irParaPagina(paginaAtual - 1)"
            :disabled="paginaAtual <= 1"
            class="btn-outline px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-500">
            Página {{ paginaAtual }} de {{ totalPaginas }}
          </span>
          <button
            @click="paginaAtual < totalPaginas && irParaPagina(paginaAtual + 1)"
            :disabled="paginaAtual >= totalPaginas"
            class="btn-outline px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </Cartao>

    <!-- Diálogo de confirmação -->
    <DialogoConfirmacao
      :esta-aberto="dialogoAberto"
      :titulo="dialogoTitulo"
      :mensagem="dialogoMensagem"
      :variante="dialogoVariante"
      :texto-confirmar="dialogoTextoConfirmar"
      @confirmar="executarAlteracaoStatus"
      @cancelar="dialogoAberto = false"
    />

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
import { ref, computed, watch, onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { users, total, loading, fetchUsers, toggleUserActive } = useUsers()

// Filtros
const busca = ref('')
const filtroRole = ref('')
const paginaAtual = ref(1)
const porPagina = 10

const opcoesRole = [
  { rotulo: 'Todos', valor: '' },
  { rotulo: 'Pedagogo', valor: 'pedagogue' },
  { rotulo: 'Professor', valor: 'teacher' },
  { rotulo: 'Estudante', valor: 'student' }
]

const colunasBase = [
  { chave: 'full_name', rotulo: 'Usuário' },
  { chave: 'role', rotulo: 'Perfil' },
  { chave: 'is_active', rotulo: 'Status' },
  { chave: 'created_at', rotulo: 'Criado em' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const colunasAluno = [
  { chave: 'full_name', rotulo: 'Aluno' },
  { chave: 'matricula', rotulo: 'Matrícula' },
  { chave: 'cpf', rotulo: 'CPF' },
  { chave: 'sexo', rotulo: 'Sexo' },
  { chave: 'data_nascimento', rotulo: 'Data Nasc.' },
  { chave: 'is_active', rotulo: 'Status' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const colunas = computed(() => filtroRole.value === 'student' ? colunasAluno : colunasBase)

const totalPaginas = computed(() => Math.ceil(total.value / porPagina))

// Carregar dados
const carregarUsuarios = () => {
  fetchUsers({
    page: paginaAtual.value,
    perPage: porPagina,
    search: busca.value,
    role: filtroRole.value
  })
}

const irParaPagina = (pagina: number) => {
  paginaAtual.value = pagina
  carregarUsuarios()
}

// Debounce na busca
let timeoutBusca: ReturnType<typeof setTimeout> | null = null
watch(busca, () => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(() => {
    paginaAtual.value = 1
    carregarUsuarios()
  }, 300)
})

watch(filtroRole, () => {
  paginaAtual.value = 1
  carregarUsuarios()
})

// Diálogo de confirmação
const dialogoAberto = ref(false)
const dialogoTitulo = ref('')
const dialogoMensagem = ref('')
const dialogoVariante = ref<'perigo' | 'info'>('info')
const dialogoTextoConfirmar = ref('')
const usuarioSelecionado = ref<any>(null)

const confirmarAlterarStatus = (usuario: any) => {
  usuarioSelecionado.value = usuario
  if (usuario.is_active) {
    dialogoTitulo.value = 'Desativar usuário'
    dialogoMensagem.value = `Tem certeza que deseja desativar "${usuario.full_name || usuario.email}"? O usuário não poderá acessar o sistema.`
    dialogoVariante.value = 'perigo'
    dialogoTextoConfirmar.value = 'Desativar'
  } else {
    dialogoTitulo.value = 'Ativar usuário'
    dialogoMensagem.value = `Deseja reativar "${usuario.full_name || usuario.email}"?`
    dialogoVariante.value = 'info'
    dialogoTextoConfirmar.value = 'Ativar'
  }
  dialogoAberto.value = true
}

const executarAlteracaoStatus = async () => {
  if (!usuarioSelecionado.value) return
  dialogoAberto.value = false

  try {
    await toggleUserActive(usuarioSelecionado.value.id, !usuarioSelecionado.value.is_active)
    mostrarNotificacao(
      'sucesso',
      `Usuário ${usuarioSelecionado.value.is_active ? 'desativado' : 'ativado'} com sucesso`
    )
    carregarUsuarios()
  } catch {
    mostrarNotificacao('critico', 'Erro ao alterar status do usuário')
  }
}

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

// Helpers
const rotuloRole = (role: string) => {
  const mapa: Record<string, string> = {
    admin: 'Administrador',
    pedagogue: 'Pedagogo',
    teacher: 'Professor',
    student: 'Estudante'
  }
  return mapa[role] || role
}

const classeRole = (role: string) => {
  const mapa: Record<string, string> = {
    admin: 'bg-purple-50 text-purple-700',
    pedagogue: 'bg-blue-50 text-blue-700',
    teacher: 'bg-amber-50 text-amber-700',
    student: 'bg-green-50 text-green-700'
  }
  return mapa[role] || 'bg-gray-100 text-gray-700'
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  carregarUsuarios()
})
</script>
