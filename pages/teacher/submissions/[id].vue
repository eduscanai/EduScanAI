<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="voltar"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </button>
      <div>
        <h1 class="text-heading-1">Correção</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ submissao?.profiles?.full_name || 'Aluno' }}
        </p>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="submissao" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteúdo da submissão -->
      <div class="lg:col-span-2">
        <Cartao>
          <div class="flex items-center gap-3 mb-4">
            <Avatar
              :alt="submissao.profiles?.full_name || 'Aluno'"
              :image="submissao.profiles?.avatar_url"
              :size="40"
            />
            <div>
              <p class="font-semibold text-gray-900">{{ submissao.profiles?.full_name }}</p>
              <p class="text-xs text-gray-500">{{ submissao.profiles?.email }}</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">
              Enviado em {{ formatarDataHora(submissao.submitted_at) }}
            </span>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Resposta do aluno</h3>
            <div v-if="submissao.content" class="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg" v-html="submissao.content"></div>
            <p v-else class="text-sm text-gray-500 italic">Nenhum conteúdo de texto enviado</p>
          </div>

          <!-- Anexos do aluno -->
          <div v-if="submissao.attachments?.length" class="border-t border-gray-200 pt-4 mt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Anexos</h3>
            <div class="space-y-2">
              <a
                v-for="(anexo, i) in submissao.attachments"
                :key="i"
                :href="anexo.url"
                target="_blank"
                class="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 no-underline"
              >
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </Icone>
                {{ anexo.name }}
              </a>
            </div>
          </div>
        </Cartao>
      </div>

      <!-- Painel de correção -->
      <div>
        <Cartao>
          <h2 class="text-heading-3 mb-4">{{ submissao.graded_at ? 'Avaliação' : 'Avaliar' }}</h2>

          <!-- Formulário de correção (apenas teacher/admin) -->
          <div v-if="canGradeAssignments" class="space-y-4">
            <div>
              <label for="nota" class="form-label">Nota (max: {{ atividade?.max_score || 10 }})</label>
              <input
                id="nota"
                type="number"
                v-model.number="formNota.score"
                class="form-input"
                :max="atividade?.max_score || 10"
                min="0"
                step="0.5"
              />
              <p v-if="erros.score" class="mt-1 text-xs text-critical-500">{{ erros.score }}</p>
            </div>

            <div>
              <label for="feedback" class="form-label">Feedback</label>
              <textarea
                id="feedback"
                v-model="formNota.feedback"
                class="form-input min-h-[120px] resize-y"
                placeholder="Comentários sobre a entrega do aluno..."
              ></textarea>
            </div>

            <button
              @click="salvarCorrecao"
              :disabled="salvando"
              class="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg v-if="salvando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ salvando ? 'Salvando...' : (submissao.graded_at ? 'Atualizar Nota' : 'Salvar Correção') }}
            </button>
          </div>

          <!-- Visualização somente-leitura (pedagogue) -->
          <div v-else-if="submissao.graded_at" class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Nota</p>
              <p class="text-2xl font-bold text-gray-900">{{ submissao.score }}<span class="text-sm font-normal text-gray-400"> / {{ atividade?.max_score || 10 }}</span></p>
            </div>
            <div v-if="submissao.feedback">
              <p class="text-sm text-gray-500">Feedback</p>
              <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{{ submissao.feedback }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 italic">
            Ainda não corrigido
          </div>

          <div v-if="submissao.graded_at" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              Corrigido em {{ formatarDataHora(submissao.graded_at) }}
            </p>
          </div>
        </Cartao>
      </div>
    </div>

    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const { canGradeAssignments } = usePermissions()
const route = useRoute()
const router = useRouter()
const submissionId = route.params.id as string

const { getSubmission, gradeSubmission } = useSubmissions()
const salvando = ref(false)
const { getAssignment } = useAssignments()

const carregando = ref(true)
const submissao = ref<any>(null)
const atividade = ref<any>(null)

const formNota = ref({ score: 0 as number, feedback: '' })
const erros = ref<Record<string, string>>({})

const voltar = () => {
  if (atividade.value) {
    router.push(`/teacher/assignments/${atividade.value.id}`)
  } else {
    router.push('/teacher/assignments')
  }
}

const salvarCorrecao = async () => {
  erros.value = {}
  if (formNota.value.score < 0) {
    erros.value.score = 'Nota não pode ser negativa'
    return
  }
  if (atividade.value && formNota.value.score > atividade.value.max_score) {
    erros.value.score = `Nota máxima é ${atividade.value.max_score}`
    return
  }

  salvando.value = true
  try {
    submissao.value = await gradeSubmission(submissionId, formNota.value.score, formNota.value.feedback)
    mostrarNotificacao('sucesso', 'Correção salva com sucesso!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar correção')
  } finally {
    salvando.value = false
  }
}

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}

onMounted(async () => {
  submissao.value = await getSubmission(submissionId)
  if (submissao.value) {
    formNota.value = {
      score: submissao.value.score ?? 0,
      feedback: submissao.value.feedback || ''
    }
    atividade.value = await getAssignment(submissao.value.assignment_id)
  }
  carregando.value = false
})
</script>
