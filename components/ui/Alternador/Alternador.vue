<template>
  <div class="flex items-center">
    <button
      :class="classeAlternador"
      :aria-checked="modelValue"
      role="switch"
      type="button"
      @click="manipularAlternancia"
    >
      <span :class="classeIndicador"></span>
    </button>
    <span v-if="rotulo" class="toggle-label">{{ rotulo }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesAlternador {
  modelValue?: boolean
  rotulo?: string
  desabilitado?: boolean
}

const props = withDefaults(defineProps<PropriedadesAlternador>(), {
  modelValue: false,
  desabilitado: false
})

const emit = defineEmits<{
  'update:modelValue': [valor: boolean]
}>()

const classeAlternador = computed(() => {
  const classes = ['toggle']

  if (props.modelValue) {
    classes.push('toggle-active')
  } else {
    classes.push('toggle-inactive')
  }

  if (props.desabilitado) {
    classes.push('opacity-50 cursor-not-allowed')
  }

  return classes.join(' ')
})

const classeIndicador = computed(() => {
  const classes = ['toggle-thumb']

  if (props.modelValue) {
    classes.push('toggle-thumb-active')
  } else {
    classes.push('toggle-thumb-inactive')
  }

  return classes.join(' ')
})

const manipularAlternancia = () => {
  if (!props.desabilitado) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>
