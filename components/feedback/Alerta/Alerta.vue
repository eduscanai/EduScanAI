<template>
  <div :class="classeAlerta" role="alert">
    <div class="flex items-start gap-3">
      <svg
        class="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path
          v-if="variante === 'sucesso'"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          v-else-if="variante === 'aviso'"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
        <path
          v-else-if="variante === 'critico'"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="flex-1">
        <slot></slot>
      </div>
      <button
        v-if="descartavel"
        class="flex-shrink-0 hover:opacity-70 transition-opacity"
        type="button"
        @click="manipularDescarte"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesAlerta {
  variante?: 'sucesso' | 'aviso' | 'critico'
  descartavel?: boolean
}

const props = withDefaults(defineProps<PropriedadesAlerta>(), {
  variante: 'sucesso',
  descartavel: false
})

const emit = defineEmits<{
  descartar: []
}>()

const classeAlerta = computed(() => {
  const classes: Record<string, string> = {
    sucesso: 'alert-success',
    aviso: 'alert-warning',
    critico: 'alert-critical'
  }

  return classes[props.variante]
})

const manipularDescarte = () => {
  emit('descartar')
}
</script>
