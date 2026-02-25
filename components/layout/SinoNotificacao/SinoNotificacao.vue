<template>
  <div class="relative" ref="containerRef">
    <!-- Botão do sino -->
    <button
      @click="aberto = !aberto"
      class="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Notificações"
    >
      <Icone :tamanho="20">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </Icone>
      <!-- Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-critical-500 rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="aberto"
        class="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
      >
        <!-- Header do dropdown -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Notificações</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="unreadCount > 0"
              @click="marcarTodasLidas"
              class="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              Marcar todas como lidas
            </button>
            <NuxtLink
              to="/notifications"
              @click="aberto = false"
              class="text-xs text-gray-500 hover:text-gray-700 no-underline"
            >
              Ver todas
            </NuxtLink>
          </div>
        </div>

        <!-- Lista -->
        <div class="max-h-[400px] overflow-y-auto">
          <div v-if="loading" class="py-8 text-center">
            <p class="text-sm text-gray-500">Carregando...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="py-8 text-center">
            <Icone :tamanho="32" class="text-gray-300 mx-auto mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </Icone>
            <p class="text-sm text-gray-500">Nenhuma notificação</p>
          </div>

          <template v-else>
            <div
              v-for="notif in notificacoesRecentes"
              :key="notif.id"
              :class="[
                'flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
                notif.read_at ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
              ]"
              @click="handleClick(notif)"
            >
              <!-- Ícone por tipo -->
              <div :class="['flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', iconeNotificacao(notif.type).bg]">
                <Icone :tamanho="16" :class="iconeNotificacao(notif.type).text">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="iconeNotificacao(notif.type).path" />
                </Icone>
              </div>

              <div class="flex-1 min-w-0">
                <p :class="['text-sm truncate', notif.read_at ? 'text-gray-700' : 'text-gray-900 font-medium']">
                  {{ notif.title }}
                </p>
                <p v-if="notif.message" class="text-xs text-gray-500 truncate mt-0.5">
                  {{ notif.message }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatarTempo(notif.created_at) }}
                </p>
              </div>

              <!-- Indicador não lida -->
              <div v-if="!notif.read_at" class="flex-shrink-0 mt-2">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="border-t border-gray-100">
          <NuxtLink
            to="/notifications"
            @click="aberto = false"
            class="block text-center py-2.5 text-sm text-primary-500 hover:bg-gray-50 no-underline font-medium"
          >
            Ver todas as notificações
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'

const {
  notifications, loading, unreadCount,
  fetchNotifications, fetchUnreadCount,
  markAsRead, markAllAsRead,
  subscribe, unsubscribe, getNotificationLink
} = useNotifications()

const aberto = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const notificacoesRecentes = computed(() =>
  notifications.value.slice(0, 10)
)

const handleClick = async (notif: any) => {
  if (!notif.read_at) {
    await markAsRead(notif.id)
  }
  const link = getNotificationLink(notif)
  if (link) {
    aberto.value = false
    navigateTo(link)
  }
}

const marcarTodasLidas = async () => {
  await markAllAsRead()
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

const formatarTempo = (dateStr: string) => {
  const date = new Date(dateStr)
  const agora = new Date()
  const diff = agora.getTime() - date.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `${minutos}min atrás`
  if (horas < 24) return `${horas}h atrás`
  if (dias < 7) return `${dias}d atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Fechar ao clicar fora
const handleClickFora = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    aberto.value = false
  }
}

// Carregar quando abrir o dropdown
watch(aberto, (val) => {
  if (val && notifications.value.length === 0) {
    fetchNotifications()
  }
})

onMounted(() => {
  fetchUnreadCount()
  subscribe()
  document.addEventListener('click', handleClickFora)
})

onUnmounted(() => {
  unsubscribe()
  document.removeEventListener('click', handleClickFora)
})
</script>
