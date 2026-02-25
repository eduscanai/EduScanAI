<template>
  <div class="card">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h3 class="text-heading-2 mb-2">Resultado do Scan</h3>
        <p class="text-body text-text-secondary">{{ resultadoScan.nomeEstudante }}</p>
      </div>
      <Etiqueta :variante="statusGeral" :rotulo="rotuloStatusGeral" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-caption text-text-secondary mb-1">Score Total</p>
        <p class="text-heading-1 text-primary-500">{{ resultadoScan.pontuacaoTotal }}%</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-caption text-text-secondary mb-1">Questões Corretas</p>
        <p class="text-heading-1 text-success-500">
          {{ resultadoScan.respostasCorretas }}/{{ resultadoScan.totalQuestoes }}
        </p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-caption text-text-secondary mb-1">Tempo Gasto</p>
        <p class="text-heading-1">{{ tempoFormatado }}</p>
      </div>
    </div>

    <div v-if="resultadoScan.pontuacoesTopico && resultadoScan.pontuacoesTopico.length > 0" class="mb-6">
      <h4 class="text-heading-3 mb-4">Desempenho por Tópico</h4>
      <div class="space-y-3">
        <div
          v-for="topico in resultadoScan.pontuacoesTopico"
          :key="topico.nome"
        >
          <BarraProgresso
            :valor="topico.pontuacao"
            :rotulo="topico.nome"
            :variante="obterVarianteTopico(topico.pontuacao)"
          />
        </div>
      </div>
    </div>

    <div v-if="resultadoScan.feedback" class="bg-blue-50 border border-primary-200 rounded-lg p-4">
      <h4 class="text-heading-3 mb-2 text-primary-500">Feedback</h4>
      <p class="text-body">{{ resultadoScan.feedback }}</p>
    </div>

    <div v-if="$slots.acoes" class="mt-6 pt-6 border-t border-gray-200 flex gap-3">
      <slot name="acoes"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

export interface PontuacaoTopico {
  nome: string
  pontuacao: number
}

export interface ResultadoScan {
  id: string
  nomeEstudante: string
  pontuacaoTotal: number
  respostasCorretas: number
  totalQuestoes: number
  tempoGasto?: number // em minutos
  pontuacoesTopico?: PontuacaoTopico[]
  feedback?: string
}

export interface PropriedadesPainelResultadoScan {
  resultadoScan: ResultadoScan
}

const props = defineProps<PropriedadesPainelResultadoScan>()

const statusGeral = computed(() => {
  const pontuacao = props.resultadoScan.pontuacaoTotal
  if (pontuacao >= 80) return 'dominado'
  if (pontuacao >= 60) return 'em-progresso'
  return 'em-risco'
})

const rotuloStatusGeral = computed(() => {
  const rotulos: Record<string, string> = {
    'dominado': 'Dominado',
    'em-progresso': 'Em Progresso',
    'em-risco': 'Em Risco'
  }
  return rotulos[statusGeral.value]
})

const tempoFormatado = computed(() => {
  if (!props.resultadoScan.tempoGasto) return 'N/A'
  const minutos = props.resultadoScan.tempoGasto
  if (minutos < 60) return `${minutos}min`
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return `${horas}h ${mins}min`
})

const obterVarianteTopico = (pontuacao: number) => {
  if (pontuacao >= 80) return 'sucesso'
  if (pontuacao >= 60) return 'aviso'
  return 'critico'
}
</script>
