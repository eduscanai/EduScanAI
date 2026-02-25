<template>
  <header class="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-[#e9ecef] px-8 flex items-center justify-between font-['Lexend']">
    <!-- LADO ESQUERDO - Logo + Busca -->
    <div class="flex items-center gap-10">
      <!-- Logo -->
      <NuxtLink to="/dashboard" class="flex items-center gap-[10px] no-underline">
        <div class="bg-primary-500 p-[6px] rounded-lg">
          <Icone :tamanho="24" class="text-white">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </Icone>
        </div>
        <span class="text-[18px] font-extrabold text-gray-900">EduScan AI</span>
      </NuxtLink>

      <!-- Busca -->
      <BarraBusca
        :modelValue="buscaInterna"
        @update:modelValue="manipularBusca"
        texto-reservado="Buscar turmas, alunos..."
        class="w-[280px] [&_input]:h-10 [&_input]:bg-[#f0f2f5] [&_input]:border-[#e9ecef] [&_input]:rounded-[10px] [&_input]:focus:bg-white [&_input]:focus:border-primary-500"
      />
    </div>

    <!-- LADO DIREITO - Navegação + Perfil -->
    <div class="flex items-center gap-6">
      <!-- Navegação -->
      <nav class="flex items-center gap-8">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'text-[14px] font-medium text-gray-500 no-underline hover:text-gray-900 transition-colors pb-1',
            rotaAtiva === item.to ? 'font-bold text-gray-900 border-b-2 border-primary-500' : ''
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Barra divisória -->
      <div class="h-12 w-px bg-gray-300 mx-6"></div>

      <!-- Perfil -->
      <div class="flex items-center gap-3">
        <div class="text-right leading-none">
          <p class="text-[14px] font-semibold text-gray-900">{{ user.name }}</p>
          <p class="text-[12px] font-normal text-gray-500 -mt-0.5">{{ user.role }}</p>
        </div>

        <Avatar
          :image="user.avatar"
          :alt="user.name"
          :size="40"
          border-color="#f0c27a"
          :border-width="2"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'

export interface Usuario {
  name: string
  role: string
  avatar?: string
}

export interface ItemNavegacao {
  label: string
  to: string
}

export interface PropriedadesCabecalho {
  user: Usuario
  navItems?: ItemNavegacao[]
}

const props = withDefaults(defineProps<PropriedadesCabecalho>(), {
  navItems: () => [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Turmas', to: '/turmas' },
    { label: 'Relatórios', to: '/relatorios' },
    { label: 'Configurações', to: '/config' }
  ]
})

const emit = defineEmits<{
  search: [query: string]
}>()

const route = useRoute()
const buscaInterna = ref('')

const rotaAtiva = computed(() => route.path)

const manipularBusca = (valor: string) => {
  buscaInterna.value = valor
  emit('search', valor)
}
</script>
