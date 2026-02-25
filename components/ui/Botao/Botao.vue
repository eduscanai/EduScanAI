<template>
  <button
    :type="tipo"
    :class="classeBotao"
    :disabled="desabilitado"
    @click="manipularClique"
  >
    <span v-if="icone && posicaoIcone === 'esquerda'" class="flex items-center">
      <slot name="icone-esquerda">{{ icone }}</slot>
    </span>
    <slot>{{ rotulo }}</slot>
    <span v-if="icone && posicaoIcone === 'direita'" class="flex items-center">
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
  rotulo?: string
  icone?: string
  posicaoIcone?: 'esquerda' | 'direita'
  larguraCompleta?: boolean
}

const props = withDefaults(defineProps<PropriedadesBotao>(), {
  variante: 'primario',
  tipo: 'botao',
  desabilitado: false,
  posicaoIcone: 'esquerda',
  larguraCompleta: false
})

const emit = defineEmits<{
  click: [evento: MouseEvent]
}>()

const classeBotao = computed(() => {
  const classesBase: Record<string, string> = {
    primario: 'btn-primary',
    secundario: 'btn-secondary',
    contorno: 'btn-outline',
    destrutivo: 'btn-destructive'
  }

  const classes = [classesBase[props.variante]]

  if (props.icone) {
    classes.push('flex items-center gap-2')
  }

  if (props.desabilitado) {
    classes.push('opacity-50 cursor-not-allowed')
  }

  if (props.larguraCompleta) {
    classes.push('w-full')
  }

  return classes.join(' ')
})

const manipularClique = (evento: MouseEvent) => {
  if (!props.desabilitado) {
    emit('click', evento)
  }
}
</script>
