<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Notificações</h1>
        <p class="text-body text-text-secondary mt-1">Suas notificações e alertas</p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="marcarTodasLidas"
        class="btn-outline text-sm"
      >
        Marcar todas como lidas
      </button>
    </div>

    <Carregando v-if="loading" texto="Carregando..." />

    <div v-else class="space-y-2">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="[
          'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer',
          notif.read_at
            ? 'bg-white border-gray-200 hover:bg-gray-50'
            : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
        ]"
        @click="handleClick(notif)"
      >
        <!-- Ícone -->
        <div :class="['flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', iconeNotificacao(notif.type).bg]">
          <Icone :tamanho="18" :class="iconeNotificacao(notif.type).text">
            <path stroke-linecap="round" stroke-linejoin="round" :d="iconeNotificacao(notif.type).path" />
          </Icone>
        </div>

        <div class="flex-1 min-w-0">
          <p :class="['text-sm', notif.read_at ? 'text-gray-700' : 'text-gray-900 font-medium']">
            {{ notif.title }}
          </p>
          <p v-if="notif.message" class="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {{ notif.message }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatarDataHora(notif.created_at) }}
          </p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div v-if="!notif.read_at" class="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
          <button
            @click.stop="remover(notif.id)"
            class="p-1 text-gray-400 hover:text-critical-500 transition-colors"
            title="Remover"
          >
            <Icone :tamanho="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </Icone>
          </button>
        </div>
      </div>

      <div v-if="notifications.length === 0" class="text-center py-12">
        <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </Icone>
        <p class="text-body text-text-secondary">Nenhuma notificação</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student']
})

const {
  notifications, loading, unreadCount,
  fetchNotifications, markAsRead, markAllAsRead,
  deleteNotification, getNotificationLink
} = useNotifications()

const handleClick = async (notif: any) => {
  if (!notif.read_at) {
    await markAsRead(notif.id)
  }
  const link = getNotificationLink(notif)
  if (link) navigateTo(link)
}

const marcarTodasLidas = async () => {
  await markAllAsRead()
}

const remover = async (id: string) => {
  await deleteNotification(id)
}

const iconeNotificacao = (type: string) => {
  const mapa: Record<string, { bg: string; text: string; path: string }> = {
    assignment: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      path: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
    },
    announcement: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      path: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46'
    },
    grade: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    info: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
    }
  }
  return mapa[type] || mapa.info
}

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

onMounted(() => {
  fetchNotifications(100)
})
</script>
