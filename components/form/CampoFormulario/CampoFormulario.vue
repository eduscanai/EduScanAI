<template>
  <div>
    <label v-if="rotulo" :for="id" class="form-label">{{ rotulo }}</label>
    <div :class="{ 'relative': icone }">
      <div v-if="icone" class="relative">
        <slot name="icone">
          <span class="form-input-icon">{{ icone }}</span>
        </slot>
        <input
          :id="id"
          :type="tipo"
          :value="modelValue"
          :placeholder="textoReservado"
          :readonly="apenasLeitura"
          :disabled="desabilitado"
          :class="classeEntrada"
          @input="manipularEntrada"
          @blur="manipularDesfoque"
          @focus="manipularFoco"
        />
      </div>
      <input
        v-else
        :id="id"
        :type="tipo"
        :value="modelValue"
        :placeholder="textoReservado"
        :readonly="apenasLeitura"
        :disabled="desabilitado"
        :class="classeEntrada"
        @input="manipularEntrada"
        @blur="manipularDesfoque"
        @focus="manipularFoco"
      />
    </div>
    <p v-if="erro" class="mt-1 text-xs text-critical-500">{{ erro }}</p>
    <p v-else-if="dica" class="mt-1 text-xs text-text-secondary">{{ dica }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesCampoFormulario {
  id?: string
  tipo?: 'texto' | 'email' | 'senha' | 'numero' | 'tel' | 'url'
  modelValue?: string | number
  rotulo?: string
  textoReservado?: string
  icone?: string
  apenasLeitura?: boolean
  desabilitado?: boolean
  erro?: string
  dica?: string
}

const props = withDefaults(defineProps<PropriedadesCampoFormulario>(), {
  tipo: 'texto',
  apenasLeitura: false,
  desabilitado: false
})

const emit = defineEmits<{
  'update:modelValue': [valor: string]
  desfoque: [evento: FocusEvent]
  foco: [evento: FocusEvent]
}>()

const classeEntrada = computed(() => {
  const classes = []

  if (props.apenasLeitura) {
    classes.push('form-input-readonly')
  } else if (props.erro) {
    classes.push('form-input-error')
  } else {
    classes.push('form-input')
  }

  if (props.icone) {
    classes.push('form-input-with-icon')
  }

  return classes.join(' ')
})

const manipularEntrada = (evento: Event) => {
  const target = evento.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const manipularDesfoque = (evento: FocusEvent) => {
  emit('desfoque', evento)
}

const manipularFoco = (evento: FocusEvent) => {
  emit('foco', evento)
}
</script>
