<template>
  <div class="card">
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1">
        <h3 class="text-heading-3 mb-2">{{ atividade.titulo }}</h3>
        <p v-if="atividade.descricao" class="text-body text-text-secondary mb-4">
          {{ atividade.descricao }}
        </p>

        <div class="flex items-center gap-6 text-sm text-text-secondary">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{{ dataFormatada }}</span>
          </div>
          <div v-if="atividade.envios !== undefined" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span>{{ atividade.envios }} envios</span>
          </div>
          <div v-if="atividade.idAtividade" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
            </svg>
            <span>{{ atividade.idAtividade }}</span>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0 flex items-center gap-3">
        <Etiqueta
          v-if="atividade.status"
          :variante="atividade.status"
          :rotulo="rotuloStatus"
        />
        <div v-if="$slots.acoes">
          <slot name="acoes"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'

export interface Atividade {
  id: string
  titulo: string
  descricao?: string
  status?: 'dominado' | 'em-progresso' | 'em-risco' | 'processando'
  dataPrazo?: Date | string
  idAtividade?: string
  envios?: number
}

export interface PropriedadesLinhaAtividade {
  atividade: Atividade
}

const props = defineProps<PropriedadesLinhaAtividade>()

const dataFormatada = computed(() => {
  if (!props.atividade.dataPrazo) return 'Sem prazo'

  const data = typeof props.atividade.dataPrazo === 'string'
    ? new Date(props.atividade.dataPrazo)
    : props.atividade.dataPrazo

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(data)
})

const rotuloStatus = computed(() => {
  const rotulos: Record<string, string> = {
    'dominado': 'Dominado',
    'em-progresso': 'Em Progresso',
    'em-risco': 'Em Risco',
    'processando': 'Processando'
  }
  return rotulos[props.atividade.status || 'em-progresso']
})
</script>
