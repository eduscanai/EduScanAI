<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Simulados</h1>
        <p class="text-body text-text-secondary mt-1">Provas corrigidas automaticamente por leitura óptica (OMR)</p>
      </div>
      <NuxtLink v-if="canScanExams" to="/simulados/criar" class="btn-primary flex items-center gap-2 no-underline">
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </Icone>
        Novo Simulado
      </NuxtLink>
    </div>

    <Cartao class="mb-6">
      <div class="w-full sm:w-56">
        <CampoSelecao
          :modelValue="filtroTurma"
          @update:modelValue="filtroTurma = $event as string"
          texto-reservado="Todas as turmas"
          :opcoes="opcoesTurma"
        />
      </div>
    </Cartao>

    <Cartao>
      <Carregando v-if="loading" texto="Carregando simulados..." />

      <div v-else-if="simulados.length === 0" class="text-center py-8">
        <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </Icone>
        <p class="text-body text-text-secondary">Nenhum simulado encontrado</p>
      </div>

      <TabelaDados v-else :colunas="colunas" :dados="simulados">
        <template #celula-titulo="{ linha }">
          <NuxtLink
            :to="`/simulados/${linha.id}`"
            class="font-semibold text-primary-500 hover:text-primary-600 no-underline"
          >
            {{ linha.titulo }}
          </NuxtLink>
          <p class="text-xs text-gray-500 mt-0.5">{{ linha.turmas?.name }}</p>
        </template>

        <template #celula-questoes="{ linha }">
          {{ linha.questoes?.length || 0 }}
        </template>

        <template #celula-valor_maximo="{ linha }">
          <span class="font-medium">{{ linha.valor_maximo }}</span>
        </template>

        <template #celula-status="{ linha }">
          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', classeStatus(linha.status)]">
            {{ rotuloStatus(linha.status) }}
          </span>
        </template>

        <template #celula-criado_em="{ linha }">
          {{ formatarData(linha.criado_em) }}
        </template>

        <template #celula-acoes="{ linha }">
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="`/simulados/${linha.id}`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
              title="Ver detalhes"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </Icone>
            </NuxtLink>
            <NuxtLink
              v-if="canScanExams"
              :to="`/simulados/${linha.id}/escanear`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
              title="Escanear folhas"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-1.5m-12 0h12m-12 0l1.5-3h9l1.5 3m-13.5 0h13.5" />
              </Icone>
            </NuxtLink>
            <button
              v-if="canScanExams"
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
      </TabelaDados>
    </Cartao>

    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir"
      titulo="Excluir simulado"
      :mensagem="`Tem certeza que deseja excluir '${simuladoParaExcluir?.titulo}'? As correções já feitas também serão apagadas.`"
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
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'
definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student', 'collaborator']
})

const { canScanExams } = usePermissions()
const { simulados, loading, listSimulados, deleteSimulado } = useSimulados()
const { classes, fetchClasses } = useClasses()

const filtroTurma = ref('')

const opcoesTurma = computed(() => [
  { rotulo: 'Todas as turmas', valor: '' },
  ...classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
])

const colunas = [
  { chave: 'titulo', rotulo: 'Simulado' },
  { chave: 'questoes', rotulo: 'Questões' },
  { chave: 'valor_maximo', rotulo: 'Valor' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'criado_em', rotulo: 'Criado em' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const rotuloStatus = (s: string) => {
  const m: Record<string, string> = { rascunho: 'Rascunho', publicado: 'Publicado', encerrado: 'Encerrado' }
  return m[s] || s
}

const classeStatus = (s: string) => {
  const m: Record<string, string> = {
    rascunho: 'bg-gray-100 text-gray-600',
    publicado: 'bg-green-50 text-green-700',
    encerrado: 'bg-amber-50 text-amber-700'
  }
  return m[s] || ''
}

const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const carregar = () => listSimulados(filtroTurma.value || undefined)
watch(filtroTurma, carregar)

const dialogoExcluir = ref(false)
const simuladoParaExcluir = ref<any>(null)

const confirmarExcluir = (simulado: any) => {
  simuladoParaExcluir.value = simulado
  dialogoExcluir.value = true
}

const executarExclusao = async () => {
  if (!simuladoParaExcluir.value) return
  dialogoExcluir.value = false
  try {
    await deleteSimulado(simuladoParaExcluir.value.id)
    mostrarNotificacao('sucesso', 'Simulado excluído')
    carregar()
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir simulado')
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as 'sucesso' | 'critico', titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await fetchClasses()
  carregar()
})
</script>
