<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-caption text-text-secondary mb-2">{{ rotulo }}</p>
        <p class="text-heading-1 mb-1">{{ valorFormatado }}</p>
        <div v-if="mudanca !== undefined" class="flex items-center gap-1">
          <svg
            v-if="mudanca > 0"
            class="w-4 h-4 text-success-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          <svg
            v-else-if="mudanca < 0"
            class="w-4 h-4 text-critical-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
          <span
            class="text-sm font-semibold"
            :class="classeCorMudanca"
          >
            {{ textoMudanca }}
          </span>
        </div>
      </div>
      <div
        v-if="icone"
        class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
        :class="classeFundoIcone"
      >
        <slot name="icone">
          <span class="text-2xl">{{ icone }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesCartaoEstatistica {
  rotulo: string
  valor: number | string
  mudanca?: number
  icone?: string
  fundoIcone?: string
  formato?: 'numero' | 'porcentagem' | 'moeda'
}

const props = withDefaults(defineProps<PropriedadesCartaoEstatistica>(), {
  formato: 'numero',
  fundoIcone: 'bg-primary-50'
})

const valorFormatado = computed(() => {
  if (typeof props.valor === 'string') return props.valor

  switch (props.formato) {
    case 'porcentagem':
      return `${props.valor}%`
    case 'moeda':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(props.valor)
    default:
      return props.valor.toLocaleString('pt-BR')
  }
})

const textoMudanca = computed(() => {
  if (props.mudanca === undefined) return ''
  const sinal = props.mudanca > 0 ? '+' : ''
  return `${sinal}${props.mudanca}%`
})

const classeCorMudanca = computed(() => {
  if (props.mudanca === undefined) return ''
  if (props.mudanca > 0) return 'text-success-500'
  if (props.mudanca < 0) return 'text-critical-500'
  return 'text-text-secondary'
})

const classeFundoIcone = computed(() => {
  return props.fundoIcone
})
</script>
