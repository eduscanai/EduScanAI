<template>
  <div>
    <label v-if="rotulo" :for="id" class="form-label">{{ rotulo }}</label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="desabilitado"
        class="form-input appearance-none pr-10"
        @change="manipularMudanca"
      >
        <option v-if="textoReservado" value="" disabled>{{ textoReservado }}</option>
        <option
          v-for="opcao in opcoes"
          :key="opcao.valor"
          :value="opcao.valor"
        >
          {{ opcao.rotulo }}
        </option>
      </select>
      <svg
        class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
    <p v-if="erro" class="mt-1 text-xs text-critical-500">{{ erro }}</p>
    <p v-else-if="dica" class="mt-1 text-xs text-text-secondary">{{ dica }}</p>
  </div>
</template>

<script setup lang="ts">
export interface OpcaoSelecao {
  rotulo: string
  valor: string | number
}

export interface PropriedadesCampoSelecao {
  id?: string
  modelValue?: string | number
  rotulo?: string
  textoReservado?: string
  opcoes: OpcaoSelecao[]
  desabilitado?: boolean
  erro?: string
  dica?: string
}

const props = withDefaults(defineProps<PropriedadesCampoSelecao>(), {
  desabilitado: false
})

const emit = defineEmits<{
  'update:modelValue': [valor: string | number]
}>()

const manipularMudanca = (evento: Event) => {
  const target = evento.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
