<template>
  <div class="bg-bg-card rounded-2xl border border-gray-200 shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-heading-3">Domínio da Turma</h3>
      <div
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
        :class="classeTendencia"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path
            v-if="tendencia >= 0"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
          />
        </svg>
        <span>{{ textoTendencia }}</span>
      </div>
    </div>

    <!-- Main Value -->
    <div class="mb-4">
      <p class="text-5xl font-black text-text-primary">{{ valor }}%</p>
    </div>

    <!-- Distribution Bar (Stacked) -->
    <div class="mb-3">
      <div class="flex gap-0.5 h-3 rounded-full overflow-hidden">
        <div
          class="bg-success-500 transition-all duration-300"
          :style="{ width: `${distribuicao.dominado}%` }"
        ></div>
        <div
          class="bg-warning-500 transition-all duration-300"
          :style="{ width: `${distribuicao.aprendendo}%` }"
        ></div>
        <div
          class="bg-critical-500 transition-all duration-300"
          :style="{ width: `${distribuicao.dificuldade}%` }"
        ></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 text-caption">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-success-500"></span>
        <span class="text-text-secondary">DOMINADO</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-warning-500"></span>
        <span class="text-text-secondary">APRENDENDO</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-critical-500"></span>
        <span class="text-text-secondary">DIFICULDADE</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface DistribuicaoDominioTurma {
  dominado: number
  aprendendo: number
  dificuldade: number
}

export interface PropriedadesCartaoDominioTurma {
  valor: number
  tendencia: number
  distribuicao: DistribuicaoDominioTurma
}

const props = defineProps<PropriedadesCartaoDominioTurma>()

const classeTendencia = computed(() => {
  return props.tendencia >= 0
    ? 'bg-green-50 text-success-500'
    : 'bg-red-50 text-critical-500'
})

const textoTendencia = computed(() => {
  const sinal = props.tendencia >= 0 ? '+' : ''
  return `${sinal}${props.tendencia.toFixed(1)}%`
})
</script>
