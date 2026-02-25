<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CartaoEstatistica
        rotulo="Total de Estudantes"
        :valor="analitico.totalEstudantes"
        :mudanca="analitico.mudancaEstudantes"
        icone="👥"
        fundo-icone="bg-primary-50"
      />
      <CartaoEstatistica
        rotulo="Atividades Ativas"
        :valor="analitico.atividadesAtivas"
        :mudanca="analitico.mudancaAtividades"
        icone="📝"
        fundo-icone="bg-purple-50"
      />
      <CartaoEstatistica
        rotulo="Taxa de Conclusão"
        :valor="analitico.taxaConclusao"
        :mudanca="analitico.mudancaConclusao"
        formato="porcentagem"
        icone="✅"
        fundo-icone="bg-green-50"
      />
      <CartaoEstatistica
        rotulo="Média Geral"
        :valor="analitico.mediaGeral"
        :mudanca="analitico.mudancaMedia"
        formato="porcentagem"
        icone="📊"
        fundo-icone="bg-blue-50"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Grafico
        titulo="Desempenho ao Longo do Tempo"
        :altura="300"
        tipo="linha"
      >
        <slot name="grafico-desempenho">
          <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p class="text-body text-text-secondary">
              Gráfico de desempenho (integrar Chart.js)
            </p>
          </div>
        </slot>
      </Grafico>

      <Grafico
        titulo="Distribuição de Status"
        :altura="300"
        tipo="rosca"
      >
        <slot name="grafico-status">
          <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p class="text-body text-text-secondary">
              Gráfico de distribuição (integrar Chart.js)
            </p>
          </div>
        </slot>
      </Grafico>
    </div>

    <div v-if="analitico.melhoresDesempenhos && analitico.melhoresDesempenhos.length > 0">
      <h3 class="text-heading-2 mb-4">Melhores Desempenhos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="estudante in analitico.melhoresDesempenhos"
          :key="estudante.id"
          class="card"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <span class="text-lg text-success-500">🏆</span>
            </div>
            <div class="flex-1">
              <p class="text-heading-3">{{ estudante.nome }}</p>
              <p class="text-sm text-text-secondary">{{ estudante.pontuacao }}% de média</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="analitico.atividadeRecente && analitico.atividadeRecente.length > 0">
      <h3 class="text-heading-2 mb-4">Atividade Recente</h3>
      <div class="card">
        <div class="space-y-4">
          <div
            v-for="(atividade, indice) in analitico.atividadeRecente"
            :key="indice"
            class="flex items-start gap-3 pb-4"
            :class="{ 'border-b border-gray-200': indice !== analitico.atividadeRecente.length - 1 }"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="text-sm">{{ atividade.icone }}</span>
            </div>
            <div class="flex-1">
              <p class="text-body">{{ atividade.descricao }}</p>
              <p class="text-caption text-text-secondary mt-1">{{ atividade.horario }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'
import Grafico from '~/components/data/Grafico/Grafico.vue'

export interface MelhorDesempenho {
  id: string
  nome: string
  pontuacao: number
}

export interface AtividadeRecente {
  icone: string
  descricao: string
  horario: string
}

export interface Analitico {
  totalEstudantes: number
  mudancaEstudantes?: number
  atividadesAtivas: number
  mudancaAtividades?: number
  taxaConclusao: number
  mudancaConclusao?: number
  mediaGeral: number
  mudancaMedia?: number
  melhoresDesempenhos?: MelhorDesempenho[]
  atividadeRecente?: AtividadeRecente[]
}

export interface PropriedadesDashboardAnalitico {
  analitico: Analitico
}

defineProps<PropriedadesDashboardAnalitico>()
</script>
