<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/student/assignments"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">{{ atividade?.titulo || 'Atividade' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ atividade?.turmas?.name }}{{ atividade?.disciplinas?.name ? ' · ' + atividade.disciplinas.name : '' }}
        </p>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="atividade" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteúdo da atividade -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Descrição -->
        <Cartao v-if="atividade.descricao">
          <h2 class="text-heading-3 mb-3">Descrição</h2>
          <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.descricao"></div>
        </Cartao>

        <!-- Anexos da atividade (sem gabarito) -->
        <Cartao v-if="anexosVisiveis.length">
          <h2 class="text-heading-3 mb-3">Material</h2>
          <div class="space-y-2">
            <a
              v-for="(anexo, i) in anexosVisiveis"
              :key="i"
              :href="anexo.url"
              target="_blank"
              class="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 no-underline bg-gray-50 px-3 py-2 rounded-lg"
            >
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </Icone>
              {{ anexo.name }}
            </a>
          </div>
        </Cartao>

        <!-- Formulário de entrega (apenas modo individual e se não corrigida) -->
        <Cartao v-if="atividade.modo_envio !== 'lote' && !minhaSubmissao?.corrigido_em">
          <h2 class="text-heading-3 mb-4">
            {{ minhaSubmissao ? 'Atualizar Entrega' : 'Fazer Entrega' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label for="resposta" class="form-label">Sua resposta</label>
              <textarea
                id="resposta"
                v-model="formEntrega.conteudo"
                class="form-input min-h-[150px] resize-y"
                placeholder="Escreva sua resposta aqui..."
              ></textarea>
            </div>

            <UploadArquivo
              v-model="formEntrega.anexos"
              rotulo="Anexos"
              bucket="submissions-files"
              :pasta="assignmentId"
            />

            <button @click="enviarEntrega" :disabled="loadingSub" class="btn-primary">
              {{ loadingSub ? 'Enviando...' : (minhaSubmissao ? 'Atualizar Entrega' : 'Enviar Entrega') }}
            </button>
          </div>
        </Cartao>

        <!-- Modo lote - aviso -->
        <Cartao v-if="atividade.modo_envio === 'lote' && !minhaSubmissao">
          <div class="text-center py-6">
            <p class="text-sm text-gray-500">Esta atividade será corrigida pelo professor. Aguarde o envio das suas respostas.</p>
          </div>
        </Cartao>

        <!-- Status processamento IA -->
        <Cartao v-if="minhaSubmissao?.status_processamento === 'processando'">
          <div class="flex items-center gap-3 py-4">
            <svg class="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <p class="text-sm font-semibold text-gray-900">Correção em andamento</p>
              <p class="text-xs text-gray-500">A IA está analisando sua resposta. Aguarde alguns instantes...</p>
            </div>
          </div>
        </Cartao>

        <!-- Resultado (já corrigida) -->
        <Cartao v-if="minhaSubmissao?.corrigido_em">
          <div class="flex items-center gap-4 mb-4">
            <h2 class="text-heading-3">Resultado</h2>
            <span class="text-lg font-bold text-green-600">
              {{ minhaSubmissao.nota }}/{{ atividade.nota_maxima }}
            </span>
          </div>
          <div v-if="minhaSubmissao.comentario" class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Feedback</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ minhaSubmissao.comentario }}</p>
          </div>

          <!-- Desempenho por tópico (correção IA) -->
          <div v-if="correcaoIA && correcaoIA.desempenhos.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Desempenho por Tópico</h3>
            <div class="space-y-3">
              <div
                v-for="d in correcaoIA.desempenhos"
                :key="d.id"
                class="bg-gray-50 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-medium text-gray-900">{{ d.topicos_atividade?.nome || 'Tópico' }}</p>
                  <span :class="['text-sm font-bold', corNota(d.percentual)]">
                    {{ d.acertos }}/{{ d.total }} ({{ d.percentual }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    :class="['h-1.5 rounded-full', bgNota(d.percentual)]"
                    :style="{ width: `${d.percentual}%` }"
                  />
                </div>
                <p v-if="d.observacao_ia" class="text-xs text-gray-500">{{ d.observacao_ia }}</p>
                <span :class="['inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1', nivelClasse(d.nivel)]">
                  {{ nivelRotulo(d.nivel) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="minhaSubmissao.conteudo" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs font-medium text-gray-500 uppercase mb-1">Sua resposta</p>
            <div class="text-sm text-gray-700 whitespace-pre-wrap">{{ minhaSubmissao.conteudo }}</div>
          </div>
        </Cartao>
      </div>

      <!-- Info lateral -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Informações</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Professor</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.perfis?.full_name || '-' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Nota máxima</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.nota_maxima }} pontos</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p :class="['text-sm mt-0.5', prazoVencido ? 'text-critical-500 font-medium' : 'text-gray-900']">
                {{ atividade.data_entrega ? formatarDataHora(atividade.data_entrega) : 'Sem prazo' }}
                {{ prazoVencido ? '(Atrasado)' : '' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5', statusClasse]">
                {{ statusTexto }}
              </span>
            </div>
          </div>
        </Cartao>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import UploadArquivo from '~/components/form/UploadArquivo/UploadArquivo.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'student']
})

const route = useRoute()
const assignmentId = route.params.id as string

const { getAssignment } = useAssignments()
const { loading: loadingSub, getMySubmission, submitWork } = useSubmissions()
const { getCorrecao } = useCorrecoesIA()

const carregando = ref(true)
const atividade = ref<any>(null)
const minhaSubmissao = ref<any>(null)
const correcaoIA = ref<any>(null)

const formEntrega = ref({
  conteudo: '',
  anexos: [] as { name: string; url: string }[]
})

// Anexos da atividade (gabarito ja e campo separado, nao aparece aqui)
const anexosVisiveis = computed(() =>
  (atividade.value?.anexos || [])
)

const prazoVencido = computed(() =>
  atividade.value?.data_entrega && new Date(atividade.value.data_entrega) < new Date()
)

const statusTexto = computed(() => {
  if (minhaSubmissao.value?.status_processamento === 'processando') return 'Processando IA'
  if (minhaSubmissao.value?.corrigido_em) return 'Corrigida'
  if (minhaSubmissao.value) return 'Entregue'
  if (prazoVencido.value) return 'Atrasada'
  return 'Pendente'
})

const statusClasse = computed(() => {
  if (minhaSubmissao.value?.status_processamento === 'processando') return 'bg-purple-50 text-purple-700'
  if (minhaSubmissao.value?.corrigido_em) return 'bg-green-50 text-green-700'
  if (minhaSubmissao.value) return 'bg-blue-50 text-blue-700'
  if (prazoVencido.value) return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
})

const enviarEntrega = async () => {
  try {
    minhaSubmissao.value = await submitWork(assignmentId, formEntrega.value.conteudo, formEntrega.value.anexos)
    mostrarNotificacao('sucesso', 'Entrega enviada com sucesso!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao enviar entrega')
  }
}

// Helpers visuais
const corNota = (p: number) => p >= 70 ? 'text-green-600' : p >= 40 ? 'text-amber-600' : 'text-critical-500'
const bgNota = (p: number) => p >= 70 ? 'bg-green-500' : p >= 40 ? 'bg-amber-500' : 'bg-critical-500'
const nivelRotulo = (n: string) => ({ facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' }[n] || n)
const nivelClasse = (n: string) => ({
  facil: 'bg-green-100 text-green-700',
  medio: 'bg-amber-100 text-amber-700',
  dificil: 'bg-red-100 text-red-700'
}[n] || 'bg-gray-100 text-gray-700')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  const [atividadeData, submissaoData] = await Promise.all([
    getAssignment(assignmentId),
    getMySubmission(assignmentId)
  ])
  atividade.value = atividadeData
  minhaSubmissao.value = submissaoData

  if (submissaoData && !submissaoData.corrigido_em) {
    formEntrega.value.conteudo = submissaoData.conteudo || ''
    formEntrega.value.anexos = submissaoData.anexos || []
  }

  // Carregar correção IA se existir
  if (submissaoData?.corrigido_em) {
    correcaoIA.value = await getCorrecao(submissaoData.id)
  }

  carregando.value = false
})
</script>
