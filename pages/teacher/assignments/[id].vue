<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/teacher/assignments"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-heading-1">{{ atividade?.title || 'Detalhes da Atividade' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ atividade?.classes?.name }}{{ atividade?.subjects?.name ? ' · ' + atividade.subjects.name : '' }}
        </p>
      </div>
      <div v-if="atividade" class="flex items-center gap-2">
        <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', classeStatus(atividade.status)]">
          {{ rotuloStatus(atividade.status) }}
        </span>
        <button v-if="canCreateAssignments && atividade.status === 'draft'" @click="publicar" class="btn-primary text-sm">
          Publicar
        </button>
        <button v-if="canCreateAssignments && atividade.status === 'published'" @click="encerrar" class="btn-outline text-sm">
          Encerrar
        </button>
      </div>
    </div>

    <div v-if="carregando" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando...</p>
    </div>

    <div v-else-if="atividade" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Submissões -->
      <div class="lg:col-span-2">
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Submissões</h2>
            <span class="text-sm text-gray-500">
              {{ submissoes.length }} entrega{{ submissoes.length !== 1 ? 's' : '' }}
              · {{ corrigidas }} corrigida{{ corrigidas !== 1 ? 's' : '' }}
            </span>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="sub in submissoes"
              :key="sub.id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <Avatar
                  :alt="sub.profiles?.full_name || 'Aluno'"
                  :image="sub.profiles?.avatar_url"
                  :size="36"
                />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ sub.profiles?.full_name || 'Sem nome' }}</p>
                  <p class="text-xs text-gray-500">
                    Enviado em {{ formatarDataHora(sub.submitted_at) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="sub.graded_at" class="text-sm font-semibold text-green-600">
                  {{ sub.score }}/{{ atividade.max_score }}
                </span>
                <span v-else class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  Pendente
                </span>
                <NuxtLink
                  :to="`/teacher/submissions/${sub.id}`"
                  class="btn-outline text-xs px-3 py-1 no-underline"
                >
                  {{ sub.graded_at ? 'Ver' : 'Corrigir' }}
                </NuxtLink>
              </div>
            </div>
            <p v-if="submissoes.length === 0" class="py-8 text-center text-sm text-gray-500">
              Nenhuma submissão recebida ainda
            </p>
          </div>
        </Cartao>
      </div>

      <!-- Info lateral -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Detalhes</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Nota máxima</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.max_score }} pontos</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p class="text-sm text-gray-900 mt-0.5">
                {{ atividade.due_date ? formatarDataHora(atividade.due_date) : 'Sem prazo' }}
              </p>
            </div>
            <div v-if="atividade.published_at">
              <p class="text-xs font-medium text-gray-500 uppercase">Publicada em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarDataHora(atividade.published_at) }}</p>
            </div>
            <div v-if="mediaNotas !== null">
              <p class="text-xs font-medium text-gray-500 uppercase">Média da turma</p>
              <p class="text-sm text-gray-900 font-semibold mt-0.5">{{ mediaNotas.toFixed(1) }}</p>
            </div>
          </div>
        </Cartao>

        <!-- Descrição -->
        <Cartao v-if="atividade.description">
          <h2 class="text-heading-3 mb-3">Descrição</h2>
          <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.description"></div>
        </Cartao>

        <!-- Anexos -->
        <Cartao v-if="atividade.attachments?.length">
          <h2 class="text-heading-3 mb-3">Anexos</h2>
          <div class="space-y-2">
            <a
              v-for="(anexo, i) in atividade.attachments"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const { canCreateAssignments } = usePermissions()
const route = useRoute()
const assignmentId = route.params.id as string

const { getAssignment, publishAssignment, closeAssignment } = useAssignments()
const { submissions: submissoes, getSubmissionsForAssignment } = useSubmissions()

const carregando = ref(true)
const atividade = ref<any>(null)

const corrigidas = computed(() => submissoes.value.filter(s => s.graded_at).length)
const mediaNotas = computed(() => {
  const notas = submissoes.value.filter(s => s.score !== null).map(s => s.score as number)
  if (notas.length === 0) return null
  return notas.reduce((a, b) => a + b, 0) / notas.length
})

const publicar = async () => {
  try {
    atividade.value = await publishAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade publicada!')
  } catch { mostrarNotificacao('critico', 'Erro ao publicar') }
}

const encerrar = async () => {
  try {
    atividade.value = await closeAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade encerrada')
  } catch { mostrarNotificacao('critico', 'Erro ao encerrar') }
}

const rotuloStatus = (s: string) => ({ draft: 'Rascunho', published: 'Publicada', closed: 'Encerrada' }[s] || s)
const classeStatus = (s: string) => ({
  draft: 'bg-gray-100 text-gray-600', published: 'bg-green-50 text-green-700', closed: 'bg-amber-50 text-amber-700'
}[s] || '')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}

onMounted(async () => {
  const [atividadeData] = await Promise.all([
    getAssignment(assignmentId),
    getSubmissionsForAssignment(assignmentId)
  ])
  atividade.value = atividadeData
  carregando.value = false
})
</script>
