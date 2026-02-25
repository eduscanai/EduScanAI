<template>
  <div class="bg-bg-card rounded-2xl border border-gray-200 shadow-sm p-6">
    <!-- Header Row -->
    <div class="flex items-center gap-4 mb-6">
      <div
        class="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-bold"
      >
        {{ estudante.iniciais }}
      </div>
      <div class="flex-1 flex flex-col justify-center h-12">
        <h2 class="text-heading-2 leading-tight">{{ estudante.nome }}</h2>
        <p class="text-body text-text-secondary leading-tight">
          {{ estudante.serie }} • {{ estudante.curso }}
        </p>
      </div>
      <button
        class="text-text-secondary hover:text-primary-500 transition-colors"
        type="button"
        @click="manipularEdicao"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </button>
    </div>

    <!-- Metrics Row -->
    <div class="mb-6">
      <div class="bg-gray-50 rounded-xl p-4 text-center">
        <p class="text-4xl font-black text-text-primary mb-1">{{ notaAtual }}</p>
        <p class="text-caption text-text-secondary">NOTA ATUAL</p>
      </div>
    </div>

    <!-- Areas of Focus -->
    <div class="mb-6">
      <h3 class="text-heading-3 mb-4">Áreas de Foco</h3>
      <div class="space-y-3">
        <div v-for="(area, indice) in areasFoco" :key="indice">
          <div class="flex items-center justify-between gap-3 mb-2">
            <span class="text-body text-text-primary">{{ area.topico }}</span>
            <Etiqueta :variante="obterVarianteStatus(area.status)" />
          </div>
          <BarraProgresso
            :valor="area.progresso"
            :variante="obterVarianteProgresso(area.status)"
            :mostrar-porcentagem="false"
            :altura="6"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Botao variante="contorno" class="w-full" @click="manipularVerRelatorio">
      Ver Relatório Completo
    </Botao>
  </div>
</template>

<script setup lang="ts">
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import Botao from '~/components/ui/Botao/Botao.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

export interface InformacoesEstudante {
  nome: string
  iniciais: string
  serie: string
  curso: string
  avatar?: string
}

export interface AreaFoco {
  topico: string
  status: 'dominado' | 'em_progresso' | 'precisa_ajuda'
  progresso: number
}

export interface PropriedadesCartaoPerfilEstudante {
  estudante: InformacoesEstudante
  notaAtual: string
  areasFoco: AreaFoco[]
}

const props = defineProps<PropriedadesCartaoPerfilEstudante>()

const emit = defineEmits<{
  editar: []
  verRelatorio: []
}>()

const obterVarianteStatus = (status: string) => {
  const variantes: Record<string, 'dominado' | 'em-progresso' | 'em-risco'> = {
    dominado: 'dominado',
    em_progresso: 'em-progresso',
    precisa_ajuda: 'em-risco'
  }
  return variantes[status] || 'em-progresso'
}

const obterVarianteProgresso = (status: string) => {
  const variantes: Record<string, 'sucesso' | 'aviso' | 'critico'> = {
    dominado: 'sucesso',
    em_progresso: 'aviso',
    precisa_ajuda: 'critico'
  }
  return variantes[status] || 'aviso'
}

const manipularEdicao = () => {
  emit('editar')
}

const manipularVerRelatorio = () => {
  emit('verRelatorio')
}
</script>
