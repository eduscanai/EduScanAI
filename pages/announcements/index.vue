<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Avisos</h1>
        <p class="text-body text-text-secondary mt-1">Comunicados e avisos da escola</p>
      </div>
      <NuxtLink
        v-if="canCreateAnnouncements"
        to="/announcements/create"
        class="btn-primary no-underline inline-flex items-center gap-2"
      >
        <Icone :tamanho="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </Icone>
        Novo Aviso
      </NuxtLink>
    </div>

    <div v-if="loading" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando avisos...</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="aviso in announcements" :key="aviso.id">
        <NuxtLink :to="`/announcements/${aviso.id}`" class="no-underline block">
          <Cartao class="hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-start gap-4">
              <!-- Ícone prioridade -->
              <div :class="['flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', classePrioridade(aviso.priority)]">
                <Icone :tamanho="18">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </Icone>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-gray-900 truncate">{{ aviso.title }}</h3>
                  <span v-if="aviso.priority === 'high'" class="text-xs font-medium text-critical-500 bg-critical-50 px-2 py-0.5 rounded-full">
                    Urgente
                  </span>
                  <span v-if="!aviso.published_at" class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Rascunho
                  </span>
                </div>
                <p v-if="aviso.content" class="text-xs text-gray-500 line-clamp-2">
                  {{ stripHtml(aviso.content) }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{{ aviso.profiles?.full_name }}</span>
                  <span>{{ formatarData(aviso.published_at || aviso.created_at) }}</span>
                  <span>{{ rotuloDestino(aviso) }}</span>
                </div>
              </div>
            </div>
          </Cartao>
        </NuxtLink>
      </div>

      <div v-if="announcements.length === 0" class="text-center py-12">
        <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </Icone>
        <p class="text-body text-text-secondary">Nenhum aviso publicado</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student']
})

const { isAdmin, isPedagogue, isTeacher } = usePermissions()
const { announcements, loading, listAnnouncements } = useAnnouncements()

const canCreateAnnouncements = computed(() =>
  isAdmin.value || isPedagogue.value || isTeacher.value
)

const classePrioridade = (p: string) => ({
  high: 'bg-critical-50 text-critical-500',
  normal: 'bg-amber-50 text-amber-600',
  low: 'bg-gray-100 text-gray-500'
}[p] || 'bg-gray-100 text-gray-500')

const rotuloDestino = (aviso: any) => {
  if (aviso.target_type === 'school') return 'Toda a escola'
  if (aviso.target_type === 'class' && aviso.classes?.name) return aviso.classes.name
  if (aviso.target_type === 'role' && aviso.target_role) {
    const mapa: Record<string, string> = { student: 'Alunos', teacher: 'Professores', admin: 'Administradores', pedagogue: 'Pedagogos' }
    return mapa[aviso.target_role] || aviso.target_role
  }
  return ''
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '')

const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric'
})

onMounted(() => {
  listAnnouncements({ published: !canCreateAnnouncements.value })
})
</script>
