<template>
  <div class="relative">
    <div class="relative">
      <svg
        class="form-input-icon"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        :id="id"
        type="text"
        :value="modelValue"
        :placeholder="textoReservado"
        :disabled="desabilitado"
        class="form-input form-input-with-icon"
        @input="manipularEntrada"
        @keydown.enter="manipularBusca"
      />
      <button
        v-if="modelValue && limpavel"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors"
        type="button"
        @click="manipularLimpeza"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PropriedadesBarraBusca {
  id?: string
  modelValue?: string
  textoReservado?: string
  desabilitado?: boolean
  limpavel?: boolean
}

const props = withDefaults(defineProps<PropriedadesBarraBusca>(), {
  textoReservado: 'Buscar...',
  desabilitado: false,
  limpavel: true
})

const emit = defineEmits<{
  'update:modelValue': [valor: string]
  busca: [valor: string]
  limpar: []
}>()

const manipularEntrada = (evento: Event) => {
  const target = evento.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const manipularBusca = () => {
  if (props.modelValue) {
    emit('busca', props.modelValue)
  }
}

const manipularLimpeza = () => {
  emit('update:modelValue', '')
  emit('limpar')
}
</script>
