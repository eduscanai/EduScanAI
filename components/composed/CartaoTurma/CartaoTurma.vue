<template>
  <NuxtLink
    :to="to"
    class="group block no-underline bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200"
  >
    <!-- HEADER: Ícone + Texto + Badge alunos -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3 min-w-0">
        <!-- Ícone da disciplina -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: iconBg }"
        >
          <Icone :tamanho="20" class="text-white">
            <component :is="iconeComponent" />
          </Icone>
        </div>

        <div class="min-w-0">
          <h3 class="text-base font-bold text-gray-900 truncate group-hover:text-primary-500 transition-colors">{{ subject }}</h3>
          <p v-if="grade" class="text-xs text-gray-500 mt-0.5">{{ grade }}</p>
        </div>
      </div>

      <!-- Badge de alunos -->
      <div class="flex items-center gap-1 text-xs text-gray-500 shrink-0 ml-2 bg-gray-50 px-2 py-1 rounded-full">
        <Icone :tamanho="12">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </Icone>
        <span>{{ studentCount }} alunos</span>
      </div>
    </div>

    <!-- INFO: Turno + Ano Letivo -->
    <div v-if="shift || academicYear" class="flex flex-wrap gap-2 mb-3">
      <span v-if="shift" class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
        {{ shift }}
      </span>
      <span v-if="academicYear" class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
        {{ academicYear }}
      </span>
    </div>

    <!-- SAÚDE DA TURMA (somente se > 0) -->
    <div v-if="healthScore > 0" class="mb-3">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saúde da Turma</span>
        <span class="text-xs font-bold" :class="corTextoSaude">{{ healthScore }}%</span>
      </div>
      <BarraProgresso
        :valor="healthScore"
        :maximo="100"
        :altura="6"
        :variante="varianteSaude"
        :mostrar-porcentagem="false"
      />
    </div>

    <!-- RESUMO (somente se informado e não é vazio placeholder) -->
    <p v-if="aiSummary && healthScore > 0" class="text-xs text-gray-500 line-clamp-2">{{ aiSummary }}</p>

    <!-- Seta sutil -->
    <div class="flex justify-end mt-3">
      <span class="text-xs font-medium text-gray-400 group-hover:text-primary-500 transition-colors flex items-center gap-1">
        Ver turma
        <Icone :tamanho="12">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </Icone>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

export interface PropriedadesCartaoTurma {
  subject: string
  grade?: string
  studentCount: number
  healthScore?: number
  aiSummary?: string
  shift?: string
  academicYear?: string
  icon: string
  iconBg: string
  to: string
}

const props = withDefaults(defineProps<PropriedadesCartaoTurma>(), {
  grade: '',
  healthScore: 0,
  aiSummary: '',
  shift: '',
  academicYear: ''
})

// Componentes de ícones
const iconeComponent = computed(() => {
  const icones: Record<string, any> = {
    'sigma': () => h('text', { class: 'text-xl font-bold' }, 'Σ'),
    'rocket': () => h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'd': 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'
    }),
    'book-open': () => h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'd': 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
    }),
    'globe': () => h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'd': 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
    }),
    'flask-conical': () => h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'd': 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5'
    }),
    'leaf': () => h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'd': 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
    })
  }

  return icones[props.icon] || icones['book-open']
})

const varianteSaude = computed(() => {
  if (props.healthScore >= 75) return 'sucesso'
  if (props.healthScore >= 50) return 'aviso'
  return 'critico'
})

const corTextoSaude = computed(() => {
  if (props.healthScore >= 75) return 'text-green-600'
  if (props.healthScore >= 50) return 'text-yellow-600'
  return 'text-red-600'
})
</script>
