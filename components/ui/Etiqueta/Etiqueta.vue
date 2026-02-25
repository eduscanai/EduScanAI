<template>
  <span :class="classeEtiqueta">
    <span v-if="mostrarPonto" :class="classePonto"></span>
    <slot>{{ rotulo }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesEtiqueta {
  variante?: 'dominado' | 'em-progresso' | 'em-risco' | 'processando'
  rotulo?: string
  mostrarPonto?: boolean
}

const props = withDefaults(defineProps<PropriedadesEtiqueta>(), {
  variante: 'dominado',
  mostrarPonto: true
})

const classeEtiqueta = computed(() => {
  const classes: Record<string, string> = {
    'dominado': 'badge-mastered',
    'em-progresso': 'badge-in-progress',
    'em-risco': 'badge-at-risk',
    'processando': 'badge-processing'
  }

  return classes[props.variante]
})

const classePonto = computed(() => {
  const classesPonto: Record<string, string> = {
    'dominado': 'badge-dot badge-dot-success',
    'em-progresso': 'badge-dot badge-dot-warning',
    'em-risco': 'badge-dot badge-dot-critical',
    'processando': 'badge-dot badge-dot-processing'
  }

  return classesPonto[props.variante]
})
</script>
