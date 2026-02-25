<template>
  <svg
    :class="classeIcone"
    :width="tamanho"
    :height="tamanho"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <slot></slot>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesIcone {
  nome?: string
  tamanho?: number | string
  ativo?: boolean
}

const props = withDefaults(defineProps<PropriedadesIcone>(), {
  tamanho: 24,
  ativo: false
})

const classeIcone = computed(() => {
  const classes = ['icon']

  if (props.ativo) {
    classes.push('icon-active')
  }

  return classes.join(' ')
})
</script>
