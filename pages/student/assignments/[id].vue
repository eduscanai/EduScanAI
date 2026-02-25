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
        <h1 class="text-heading-1">{{ atividade?.title || 'Atividade' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ atividade?.classes?.name }}{{ atividade?.subjects?.name ? ' · ' + atividade.subjects.name : '' }}
        </p>
      </div>
    </div>

    <div v-if="carregando" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando...</p>
    </div>

    <div v-else-if="atividade" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteúdo da atividade -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Descrição -->
        <Cartao v-if="atividade.description">
          <h2 class="text-heading-3 mb-3">Descrição</h2>
          <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.description"></div>
        </Cartao>

        <!-- Anexos da atividade -->
        <Cartao v-if="atividade.attachments?.length">
          <h2 class="text-heading-3 mb-3">Material</h2>
          <div class="space-y-2">
            <a
              v-for="(anexo, i) in atividade.attachments"
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

        <!-- Formulário de entrega -->
        <Cartao v-if="!minhaSubmissao?.graded_at">
          <h2 class="text-heading-3 mb-4">
            {{ minhaSubmissao ? 'Atualizar Entrega' : 'Fazer Entrega' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label for="resposta" class="form-label">Sua resposta</label>
              <textarea
                id="resposta"
                v-model="formEntrega.content"
                class="form-input min-h-[150px] resize-y"
                placeholder="Escreva sua resposta aqui..."
              ></textarea>
            </div>

            <!-- Anexos do aluno -->
            <UploadArquivo
              v-model="formEntrega.attachments"
              rotulo="Anexos"
              bucket="submissions-files"
              :pasta="assignmentId"
            />

            <button @click="enviarEntrega" :disabled="loadingSub" class="btn-primary">
              {{ loadingSub ? 'Enviando...' : (minhaSubmissao ? 'Atualizar Entrega' : 'Enviar Entrega') }}
            </button>
          </div>
        </Cartao>

        <!-- Resultado (já corrigida) -->
        <Cartao v-if="minhaSubmissao?.graded_at">
          <div class="flex items-center gap-4 mb-4">
            <h2 class="text-heading-3">Resultado</h2>
            <span class="text-lg font-bold text-green-600">
              {{ minhaSubmissao.score }}/{{ atividade.max_score }}
            </span>
          </div>
          <div v-if="minhaSubmissao.feedback" class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Feedback do professor</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ minhaSubmissao.feedback }}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs font-medium text-gray-500 uppercase mb-1">Sua resposta</p>
            <div v-if="minhaSubmissao.content" class="text-sm text-gray-700 whitespace-pre-wrap">{{ minhaSubmissao.content }}</div>
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
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.profiles?.full_name || '-' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Nota máxima</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.max_score }} pontos</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p :class="['text-sm mt-0.5', prazoVencido ? 'text-critical-500 font-medium' : 'text-gray-900']">
                {{ atividade.due_date ? formatarDataHora(atividade.due_date) : 'Sem prazo' }}
                {{ prazoVencido ? '(Vencido)' : '' }}
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

const carregando = ref(true)
const atividade = ref<any>(null)
const minhaSubmissao = ref<any>(null)

const formEntrega = ref({
  content: '',
  attachments: [] as { name: string; url: string }[]
})

const prazoVencido = computed(() =>
  atividade.value?.due_date && new Date(atividade.value.due_date) < new Date()
)

const statusTexto = computed(() => {
  if (minhaSubmissao.value?.graded_at) return 'Corrigida'
  if (minhaSubmissao.value) return 'Entregue'
  if (prazoVencido.value) return 'Vencida'
  return 'Pendente'
})

const statusClasse = computed(() => {
  if (minhaSubmissao.value?.graded_at) return 'bg-green-50 text-green-700'
  if (minhaSubmissao.value) return 'bg-blue-50 text-blue-700'
  if (prazoVencido.value) return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
})

const enviarEntrega = async () => {
  try {
    minhaSubmissao.value = await submitWork(assignmentId, formEntrega.value.content, formEntrega.value.attachments)
    mostrarNotificacao('sucesso', 'Entrega enviada com sucesso!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao enviar entrega')
  }
}

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

  if (submissaoData && !submissaoData.graded_at) {
    formEntrega.value.content = submissaoData.content || ''
    formEntrega.value.attachments = submissaoData.attachments || []
  }

  carregando.value = false
})
</script>
