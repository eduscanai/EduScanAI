<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/announcements"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-heading-1">{{ aviso?.title || 'Aviso' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ aviso?.profiles?.full_name }}
          · {{ aviso?.published_at ? formatarData(aviso.published_at) : 'Rascunho' }}
        </p>
      </div>
      <div v-if="aviso && podeEditar" class="flex items-center gap-2">
        <button
          v-if="!aviso.published_at"
          @click="publicarAviso"
          :disabled="processando"
          class="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="processando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ processando ? 'Publicando...' : 'Publicar' }}
        </button>
        <button
          @click="confirmarExclusao = true"
          :disabled="processando"
          class="btn-destructive text-sm disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="aviso" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteúdo -->
      <div class="lg:col-span-2">
        <Cartao>
          <div class="flex items-center gap-3 mb-6">
            <Avatar
              :alt="aviso.profiles?.full_name || 'Autor'"
              :image="aviso.profiles?.avatar_url"
              :size="44"
            />
            <div>
              <p class="font-semibold text-gray-900">{{ aviso.profiles?.full_name }}</p>
              <p class="text-xs text-gray-500">
                {{ aviso.published_at ? formatarDataHora(aviso.published_at) : 'Não publicado' }}
              </p>
            </div>
            <span v-if="aviso.priority === 'high'" class="ml-auto text-xs font-medium text-critical-500 bg-critical-50 px-2.5 py-1 rounded-full">
              Urgente
            </span>
          </div>

          <div v-if="aviso.content" class="prose prose-sm max-w-none text-gray-700" v-html="aviso.content"></div>
          <p v-else class="text-sm text-gray-500 italic">Sem conteúdo</p>
        </Cartao>
      </div>

      <!-- Info lateral -->
      <div>
        <Cartao>
          <h2 class="text-heading-3 mb-4">Detalhes</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Destinatário</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ rotuloDestino }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prioridade</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ rotuloPrioridade }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5', aviso.published_at ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600']">
                {{ aviso.published_at ? 'Publicado' : 'Rascunho' }}
              </span>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Criado em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarDataHora(aviso.created_at) }}</p>
            </div>
          </div>
        </Cartao>
      </div>
    </div>

    <!-- Confirmação de exclusão -->
    <DialogoConfirmacao
      :esta-aberto="confirmarExclusao"
      titulo="Excluir aviso"
      mensagem="Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita."
      texto-confirmar="Excluir"
      variante="critico"
      @confirmar="excluirAviso"
      @cancelar="confirmarExclusao = false"
    />

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
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student']
})

const route = useRoute()
const announcementId = route.params.id as string
const user = useSupabaseUser()
const { isAdmin } = usePermissions()

const { getAnnouncement, publishAnnouncement, deleteAnnouncement } = useAnnouncements()
const processando = ref(false)

const carregando = ref(true)
const aviso = ref<any>(null)
const confirmarExclusao = ref(false)

const podeEditar = computed(() =>
  aviso.value && (aviso.value.author_id === user.value?.id || isAdmin.value)
)

const rotuloDestino = computed(() => {
  if (!aviso.value) return ''
  if (aviso.value.target_type === 'school') return 'Toda a escola'
  if (aviso.value.target_type === 'class') return aviso.value.classes?.name || 'Turma'
  if (aviso.value.target_type === 'role') {
    const mapa: Record<string, string> = { student: 'Alunos', teacher: 'Professores', pedagogue: 'Pedagogos' }
    return mapa[aviso.value.target_role] || aviso.value.target_role
  }
  return ''
})

const rotuloPrioridade = computed(() => ({
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta (Urgente)'
}[aviso.value?.priority] || 'Normal'))

const publicarAviso = async () => {
  processando.value = true
  try {
    aviso.value = await publishAnnouncement(announcementId)
    mostrarNotificacao('sucesso', 'Aviso publicado!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao publicar')
  } finally {
    processando.value = false
  }
}

const excluirAviso = async () => {
  confirmarExclusao.value = false
  processando.value = true
  try {
    await deleteAnnouncement(announcementId)
    mostrarNotificacao('sucesso', 'Aviso excluído')
    setTimeout(() => navigateTo('/announcements'), 1000)
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir')
  } finally {
    processando.value = false
  }
}

const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}

onMounted(async () => {
  aviso.value = await getAnnouncement(announcementId)
  carregando.value = false
})
</script>
