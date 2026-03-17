<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Minhas Atividades</h1>
        <p class="text-body text-text-secondary mt-1">Gerencie atividades das suas turmas</p>
      </div>
      <NuxtLink v-if="canCreateAssignments" to="/teacher/assignments/create" class="btn-primary flex items-center gap-2 no-underline">
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </Icone>
        Nova Atividade
      </NuxtLink>
    </div>

    <!-- Filtros -->
    <Cartao class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BarraBusca
            v-model="termoBusca"
            texto-reservado="Buscar atividade..."
          />
        </div>
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroTurma"
            @update:modelValue="filtroTurma = $event as string"
            texto-reservado="Todas as turmas"
            :opcoes="opcoesTurma"
          />
        </div>
        <div class="w-full sm:w-48">
          <CampoSelecao
            :modelValue="filtroStatus"
            @update:modelValue="filtroStatus = $event as string"
            texto-reservado="Todos os status"
            :opcoes="opcoesStatus"
          />
        </div>
      </div>
    </Cartao>

    <!-- Lista -->
    <Cartao>
      <Carregando v-if="loading" texto="Carregando atividades..." />

      <TabelaDados v-else :colunas="colunas" :dados="assignmentsPaginados">
        <template #celula-titulo="{ linha }">
          <NuxtLink
            :to="`/teacher/assignments/${linha.id}`"
            class="font-semibold text-primary-500 hover:text-primary-600 no-underline"
          >
            {{ linha.titulo }}
          </NuxtLink>
          <p class="text-xs text-gray-500 mt-0.5">{{ linha.turmas?.name }}</p>
        </template>

        <template #celula-disciplina="{ linha }">
          {{ linha.disciplinas?.name || '-' }}
        </template>

        <template #celula-nota_maxima="{ linha }">
          <span class="font-medium">{{ linha.nota_maxima }}</span>
        </template>

        <template #celula-status="{ linha }">
          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', classeStatus(linha.status)]">
            {{ rotuloStatus(linha.status) }}
          </span>
        </template>

        <template #celula-visibilidade="{ linha }">
          <span :class="[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            linha.visivel_aluno ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          ]">
            {{ linha.visivel_aluno ? 'Visivel' : 'Oculta' }}
          </span>
        </template>

        <template #celula-data_entrega="{ linha }">
          <span v-if="linha.data_entrega" :class="{ 'text-critical-500 font-medium': estaVencida(linha.data_entrega) && linha.status === 'published' }">
            {{ formatarData(linha.data_entrega) }}
          </span>
          <span v-else class="text-gray-400">Sem prazo</span>
        </template>

        <template #celula-acoes="{ linha }">
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="`/teacher/assignments/${linha.id}`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
              title="Ver detalhes"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </Icone>
            </NuxtLink>
            <button
              v-if="linha.status === 'draft'"
              @click="publicar(linha)"
              :disabled="acaoId === linha.id"
              class="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
              title="Publicar"
            >
              <svg v-if="acaoId === linha.id" class="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <Icone v-else :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </Icone>
            </button>
            <button
              v-if="linha.status === 'draft'"
              @click="confirmarExcluir(linha)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
              title="Excluir"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </Icone>
            </button>
          </div>
        </template>

        <template #vazio>
          <div class="text-center py-8">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </Icone>
            <p class="text-body text-text-secondary">Nenhuma atividade encontrada</p>
          </div>
        </template>
      </TabelaDados>

      <!-- Paginação -->
      <div v-if="!loading && totalPaginas > 1" class="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
        <p class="text-sm text-text-secondary">
          Mostrando {{ inicioItem }}–{{ fimItem }} de {{ assignmentsFiltrados.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="paginaAtual = paginaAtual - 1"
            :disabled="paginaAtual === 1"
            class="p-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </Icone>
          </button>
          <button
            v-for="pg in paginasVisiveis"
            :key="pg"
            @click="paginaAtual = pg"
            :class="[
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              pg === paginaAtual ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 text-text-secondary'
            ]"
          >
            {{ pg }}
          </button>
          <button
            @click="paginaAtual = paginaAtual + 1"
            :disabled="paginaAtual === totalPaginas"
            class="p-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </Icone>
          </button>
        </div>
      </div>
    </Cartao>

    <!-- Diálogo -->
    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir"
      titulo="Excluir atividade"
      :mensagem="`Tem certeza que deseja excluir '${atividadeParaExcluir?.titulo}'?`"
      variante="perigo"
      texto-confirmar="Excluir"
      @confirmar="executarExclusao"
      @cancelar="dialogoExcluir = false"
    />

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
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const { canCreateAssignments } = usePermissions()
const { assignments, loading, listAssignments, publishAssignment, deleteAssignment } = useAssignments()
const { classes, fetchClasses } = useClasses()

const filtroTurma = ref('')
const filtroStatus = ref('')
const termoBusca = ref('')
const paginaAtual = ref(1)
const itensPorPagina = 10

const opcoesTurma = computed(() => [
  { rotulo: 'Todas as turmas', valor: '' },
  ...classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
])

const opcoesStatus = [
  { rotulo: 'Todos', valor: '' },
  { rotulo: 'Rascunho', valor: 'draft' },
  { rotulo: 'Publicada', valor: 'published' },
  { rotulo: 'Encerrada', valor: 'closed' }
]

const colunas = [
  { chave: 'titulo', rotulo: 'Atividade' },
  { chave: 'disciplina', rotulo: 'Disciplina' },
  { chave: 'nota_maxima', rotulo: 'Valor' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'visibilidade', rotulo: 'Visibilidade' },
  { chave: 'data_entrega', rotulo: 'Prazo' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

// Busca + Paginação
const assignmentsFiltrados = computed(() => {
  if (!termoBusca.value.trim()) return assignments.value
  const termo = termoBusca.value.toLowerCase().trim()
  return assignments.value.filter(a =>
    a.titulo.toLowerCase().includes(termo) ||
    (a as any).turmas?.name?.toLowerCase().includes(termo) ||
    (a as any).disciplinas?.name?.toLowerCase().includes(termo)
  )
})

const totalPaginas = computed(() => Math.ceil(assignmentsFiltrados.value.length / itensPorPagina))

const assignmentsPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  return assignmentsFiltrados.value.slice(inicio, inicio + itensPorPagina)
})

const inicioItem = computed(() => Math.min((paginaAtual.value - 1) * itensPorPagina + 1, assignmentsFiltrados.value.length))
const fimItem = computed(() => Math.min(paginaAtual.value * itensPorPagina, assignmentsFiltrados.value.length))

const paginasVisiveis = computed(() => {
  const total = totalPaginas.value
  const atual = paginaAtual.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (atual <= 3) return [1, 2, 3, 4, 5]
  if (atual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total]
  return [atual - 2, atual - 1, atual, atual + 1, atual + 2]
})

const carregarAtividades = () => {
  paginaAtual.value = 1
  listAssignments(filtroTurma.value || undefined, filtroStatus.value || undefined)
}

watch([filtroTurma, filtroStatus], carregarAtividades)
watch(termoBusca, () => { paginaAtual.value = 1 })

// Ação em andamento (rastreia qual item está processando)
const acaoId = ref<string | null>(null)

// Publicar
const publicar = async (atividade: any) => {
  acaoId.value = atividade.id
  try {
    await publishAssignment(atividade.id)
    mostrarNotificacao('sucesso', 'Atividade publicada! Alunos foram notificados.')
    carregarAtividades()
  } catch {
    mostrarNotificacao('critico', 'Erro ao publicar atividade')
  } finally {
    acaoId.value = null
  }
}

// Excluir
const dialogoExcluir = ref(false)
const atividadeParaExcluir = ref<any>(null)

const confirmarExcluir = (atividade: any) => {
  atividadeParaExcluir.value = atividade
  dialogoExcluir.value = true
}

const executarExclusao = async () => {
  if (!atividadeParaExcluir.value) return
  dialogoExcluir.value = false
  try {
    await deleteAssignment(atividadeParaExcluir.value.id)
    mostrarNotificacao('sucesso', 'Atividade excluída')
    carregarAtividades()
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir. Apenas rascunhos podem ser excluídos.')
  }
}

// Helpers
const rotuloStatus = (s: string) => {
  const m: Record<string, string> = { draft: 'Rascunho', published: 'Publicada', closed: 'Encerrada' }
  return m[s] || s
}

const classeStatus = (s: string) => {
  const m: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-50 text-green-700',
    closed: 'bg-amber-50 text-amber-700'
  }
  return m[s] || ''
}

const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const estaVencida = (d: string) => new Date(d) < new Date()

// Notificação
const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await fetchClasses()
  carregarAtividades()
})
</script>
