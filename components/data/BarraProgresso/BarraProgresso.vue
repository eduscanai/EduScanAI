<template>
  <div>
    <div v-if="rotulo || mostrarPorcentagem" class="flex items-center justify-between mb-2">
      <span v-if="rotulo" class="text-sm font-semibold text-text-primary">{{ rotulo }}</span>
      <span v-if="mostrarPorcentagem" class="text-sm font-semibold" :class="classeCorPorcentagem">
        {{ porcentagem }}%
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full overflow-hidden" :style="{ height: `${altura}px` }">
      <div
        class="h-full rounded-full transition-all duration-300 ease-out"
        :class="classeCorBarra"
        :style="{ width: `${porcentagem}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesBarraProgresso {
  valor: number
  maximo?: number
  rotulo?: string
  mostrarPorcentagem?: boolean
  altura?: number
  variante?: 'primario' | 'sucesso' | 'aviso' | 'critico'
}

const props = withDefaults(defineProps<PropriedadesBarraProgresso>(), {
  maximo: 100,
  mostrarPorcentagem: true,
  altura: 8,
  variante: 'primario'
})

const porcentagem = computed(() => {
  return Math.min(Math.round((props.valor / props.maximo) * 100), 100)
})

const classeCorBarra = computed(() => {
  const classes: Record<string, string> = {
    primario: 'bg-primary-500',
    sucesso: 'bg-success-500',
    aviso: 'bg-warning-500',
    critico: 'bg-critical-500'
  }

  return classes[props.variante]
})

const classeCorPorcentagem = computed(() => {
  const classes: Record<string, string> = {
    primario: 'text-primary-500',
    sucesso: 'text-success-500',
    aviso: 'text-warning-500',
    critico: 'text-critical-500'
  }

  return classes[props.variante]
})
</script>
