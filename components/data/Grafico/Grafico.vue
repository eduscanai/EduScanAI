<template>
  <div class="card">
    <div v-if="titulo" class="mb-4">
      <h3 class="text-heading-3">{{ titulo }}</h3>
    </div>
    <div ref="containerGrafico" class="w-full" :style="{ height: `${altura}px` }">
      <slot>
        <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <p class="text-body text-text-secondary">
            Visualização de gráfico (integrar com biblioteca de charts)
          </p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface PropriedadesGrafico {
  titulo?: string
  altura?: number
  tipo?: 'linha' | 'barra' | 'pizza' | 'rosca'
  dados?: any
}

const props = withDefaults(defineProps<PropriedadesGrafico>(), {
  altura: 300,
  tipo: 'linha'
})

const containerGrafico = ref<HTMLElement>()

// Este componente serve como wrapper
// Você pode integrar com Chart.js, ApexCharts, ou outra biblioteca
</script>
