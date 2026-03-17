<template>
  <div class="min-h-screen bg-bg-page flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-[#e9ecef] transition-all duration-300',
        sidebarAberta ? 'w-64' : 'w-[72px]'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-5 border-b border-[#e9ecef]">
        <NuxtLink to="/dashboard" class="flex items-center gap-[10px] no-underline">
          <div class="bg-primary-500 p-[6px] rounded-lg flex-shrink-0">
            <Icone :tamanho="22" class="text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </Icone>
          </div>
          <span v-if="sidebarAberta" class="text-[16px] font-extrabold text-gray-900 whitespace-nowrap">EduScan AI</span>
        </NuxtLink>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in itensNavegacao"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium no-underline transition-colors',
            rotaAtiva(item.to)
              ? 'bg-primary-50 text-primary-500 font-semibold'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <Icone :tamanho="20" class="flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icone" />
          </Icone>
          <span v-if="sidebarAberta" class="whitespace-nowrap">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Toggle sidebar -->
      <div class="p-3 border-t border-[#e9ecef]">
        <button
          @click="sidebarAberta = !sidebarAberta"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
        >
          <Icone :tamanho="20" class="flex-shrink-0">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="sidebarAberta
                ? 'M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5'
                : 'M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5'"
            />
          </Icone>
          <span v-if="sidebarAberta" class="whitespace-nowrap">Recolher</span>
        </button>
      </div>
    </aside>

    <!-- Conteúdo principal -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarAberta ? 'ml-64' : 'ml-[72px]']">
      <!-- Header -->
      <header class="sticky top-0 z-30 h-16 bg-white border-b border-[#e9ecef] px-6 flex items-center justify-between">
        <!-- Busca -->
        <BarraBusca
          :modelValue="busca"
          @update:modelValue="busca = $event"
          texto-reservado="Buscar turmas, alunos..."
          class="w-[320px] [&_input]:h-9 [&_input]:bg-[#f0f2f5] [&_input]:border-[#e9ecef] [&_input]:rounded-[10px] [&_input]:focus:bg-white [&_input]:focus:border-primary-500"
        />

        <!-- Notificações + Perfil + Logout -->
        <div class="flex items-center gap-4">
          <SinoNotificacao />

          <div class="text-right leading-none">
            <p class="text-[14px] font-semibold text-gray-900">{{ usuario.name }}</p>
            <p class="text-[12px] font-normal text-gray-500 -mt-0.5">{{ rotuloRole }}</p>
          </div>

          <Avatar
            :image="usuario.avatar"
            :alt="usuario.name"
            :size="36"
            border-color="#f0c27a"
            :border-width="2"
          />

          <button
            @click="logout"
            class="p-2 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
            title="Sair"
          >
            <Icone :tamanho="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </Icone>
          </button>
        </div>
      </header>

      <!-- Conteúdo da página -->
      <main class="flex-1 p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Overlay mobile -->
    <div
      v-if="sidebarAberta"
      class="fixed inset-0 bg-black/30 z-30 lg:hidden"
      @click="sidebarAberta = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import SinoNotificacao from '~/components/layout/SinoNotificacao/SinoNotificacao.vue'

const { usuario, logout, ensureProfile } = useUsuario()
const { isAdmin, isPedagogue, isTeacher, isStudent, canViewAllStudents } = usePermissions()
const route = useRoute()

// Garantir user ID, role e school_id em TODAS as páginas protegidas
onMounted(async () => {
  await ensureProfile()
})

const sidebarAberta = ref(true)
const busca = ref('')

const rotuloRole = computed(() => {
  const mapa: Record<string, string> = {
    admin: 'Administrador',
    pedagogue: 'Pedagogo',
    teacher: 'Professor',
    student: 'Estudante'
  }
  return mapa[usuario.value.role] || usuario.value.role
})

interface ItemNav {
  label: string
  to: string
  icone: string
  visivel: boolean
}

const itensNavegacao = computed<ItemNav[]>(() => [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icone: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    visivel: true
  },
  {
    label: 'Turmas',
    to: '/turmas',
    icone: 'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342',
    visivel: !isStudent.value
  },
  {
    label: 'Alunos',
    to: '/alunos',
    icone: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    visivel: canViewAllStudents.value
  },
  {
    label: 'Atividades',
    to: isStudent.value ? '/student/assignments' : '/teacher/assignments',
    icone: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    visivel: true
  },
  {
    label: 'Boletim',
    to: isAdmin.value ? '/admin/boletim' : isStudent.value ? '/student/boletim' : '/teacher/boletim',
    icone: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    visivel: true
  },
  {
    label: 'Avisos',
    to: '/announcements',
    icone: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46',
    visivel: true
  },
  {
    label: 'Relatórios',
    to: '/relatorios',
    icone: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    visivel: isAdmin.value || isPedagogue.value
  },
  {
    label: 'Calendário',
    to: '/calendario',
    icone: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    visivel: true
  },
  {
    label: 'Ger. Turmas',
    to: '/admin/classes',
    icone: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
    visivel: isAdmin.value
  },
  {
    label: 'Disciplinas',
    to: '/admin/subjects',
    icone: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    visivel: isAdmin.value
  },
  {
    label: 'Grade Curricular',
    to: '/admin/curricula',
    icone: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
    visivel: isAdmin.value
  },
  {
    label: 'Usuários',
    to: '/admin/users',
    icone: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    visivel: isAdmin.value
  },
  {
    label: 'Configurações',
    to: '/admin/settings',
    icone: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
    visivel: isAdmin.value
  }
].filter(item => item.visivel))

const rotaAtiva = (to: string) => {
  if (to === '/dashboard') return route.path === '/dashboard'
  // Boletim: highlight para qualquer rota */boletim
  if (to.endsWith('/boletim')) return route.path.includes('/boletim')
  return route.path.startsWith(to)
}
</script>
