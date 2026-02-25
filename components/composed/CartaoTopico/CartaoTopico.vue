<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <p
          class="text-xs uppercase tracking-wider font-semibold mb-1"
          :class="corCategoria"
        >
          {{ categoria }}
        </p>
        <h3 class="text-base font-bold text-gray-900">{{ nome }}</h3>
      </div>

      <!-- Score circular -->
      <div class="relative w-11 h-11 flex items-center justify-center">
        <svg class="w-11 h-11 transform -rotate-90">
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="currentColor"
            :class="corFundoCirculo"
            stroke-width="4"
            fill="none"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="currentColor"
            :class="corCirculo"
            stroke-width="4"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>
        <span
          class="absolute inset-0 flex items-center justify-center text-sm font-bold"
          :class="corTextoScore"
        >
          {{ pontuacao }}
        </span>
      </div>
    </div>

    <!-- Trend -->
    <div class="flex items-center gap-1 mt-3">
      <Icone :tamanho="14" :class="corTendencia">
        <path
          v-if="tendencia === 'up'"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
        <path
          v-else-if="tendencia === 'down'"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 12h14"
        />
      </Icone>
      <span class="text-xs" :class="corTendencia">{{ rotuloTendencia }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'

export interface PropriedadesCartaoTopico {
  categoria: string
  nome: string
  pontuacao: number
  tendencia: 'up' | 'down' | 'stable'
  rotuloTendencia: string
}

const props = defineProps<PropriedadesCartaoTopico>()

const corCategoria = computed(() => {
  const cores: Record<string, string> = {
    'ÁLGEBRA': 'text-blue-600',
    'GEOMETRIA': 'text-green-600',
    'ARITMÉTICA': 'text-purple-600',
    'ESTATÍSTICA': 'text-orange-600'
  }
  return cores[props.categoria] || 'text-gray-600'
})

const corCirculo = computed(() => {
  if (props.pontuacao >= 70) return 'text-green-500'
  if (props.pontuacao >= 40) return 'text-yellow-500'
  return 'text-red-500'
})

const corFundoCirculo = computed(() => {
  if (props.pontuacao >= 70) return 'text-green-100'
  if (props.pontuacao >= 40) return 'text-yellow-100'
  return 'text-red-100'
})

const corTextoScore = computed(() => {
  if (props.pontuacao >= 70) return 'text-green-600'
  if (props.pontuacao >= 40) return 'text-yellow-600'
  return 'text-red-600'
})

const corTendencia = computed(() => {
  if (props.tendencia === 'up') return 'text-green-500'
  if (props.tendencia === 'down') return 'text-red-500'
  return 'text-gray-400'
})

// SVG circle calculations
const radius = 18
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => {
  const progress = props.pontuacao / 100
  return circumference * (1 - progress)
})
</script>
