<template>
  <button
    :type="tipoHtml"
    :class="classeBotao"
    :disabled="desabilitado || carregando"
    @click="manipularClique"
  >
    <svg v-if="carregando" class="animate-spin -ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <span v-else-if="icone && posicaoIcone === 'esquerda'" class="flex items-center">
      <slot name="icone-esquerda">{{ icone }}</slot>
    </span>
    <slot>{{ rotulo }}</slot>
    <span v-if="!carregando && icone && posicaoIcone === 'direita'" class="flex items-center">
      <slot name="icone-direita">{{ icone }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesBotao {
  variante?: 'primario' | 'secundario' | 'contorno' | 'destrutivo'
  tipo?: 'botao' | 'enviar' | 'resetar'
  desabilitado?: boolean
  carregando?: boolean
  rotulo?: string
  icone?: string
  posicaoIcone?: 'esquerda' | 'direita'
  larguraCompleta?: boolean
}

const props = withDefaults(defineProps<PropriedadesBotao>(), {
  variante: 'primario',
  tipo: 'botao',
  desabilitado: false,
  carregando: false,
  posicaoIcone: 'esquerda',
  larguraCompleta: false
})

const emit = defineEmits<{
  click: [evento: MouseEvent]
}>()

const tipoMap: Record<string, string> = { botao: 'button', enviar: 'submit', resetar: 'reset' }
const tipoHtml = computed(() => tipoMap[props.tipo] || 'button')

const classeBotao = computed(() => {
  const classesBase: Record<string, string> = {
    primario: 'btn-primary',
    secundario: 'btn-secondary',
    contorno: 'btn-outline',
    destrutivo: 'btn-destructive'
  }

  const classes = [classesBase[props.variante], 'flex items-center justify-center gap-2']

  if (props.desabilitado || props.carregando) {
    classes.push('opacity-50 cursor-not-allowed')
  }

  if (props.larguraCompleta) {
    classes.push('w-full')
  }

  return classes.join(' ')
})

const manipularClique = (evento: MouseEvent) => {
  if (!props.desabilitado && !props.carregando) {
    emit('click', evento)
  }
}
</script>
