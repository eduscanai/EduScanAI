<template>
  <div class="card">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span class="text-heading-3 text-primary-500">{{ iniciais }}</span>
          </div>
        </div>
        <div>
          <h3 class="text-heading-3 mb-1">{{ estudante.nome }}</h3>
          <p class="text-sm text-text-secondary">{{ estudante.email }}</p>
        </div>
      </div>
      <Etiqueta
        v-if="estudante.status"
        :variante="estudante.status"
        :rotulo="rotuloStatus"
      />
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <p class="text-caption text-text-secondary mb-1">Atividades</p>
        <p class="text-heading-3">{{ estudante.atividadesConcluidas || 0 }}</p>
      </div>
      <div>
        <p class="text-caption text-text-secondary mb-1">Média</p>
        <p class="text-heading-3">{{ estudante.mediaNotas || 0 }}%</p>
      </div>
      <div>
        <p class="text-caption text-text-secondary mb-1">Progresso</p>
        <p class="text-heading-3">{{ estudante.progresso || 0 }}%</p>
      </div>
    </div>

    <BarraProgresso
      v-if="estudante.progresso !== undefined"
      :valor="estudante.progresso"
      :variante="varianteProgresso"
      :mostrar-porcentagem="false"
    />

    <div v-if="$slots.acoes" class="mt-4 pt-4 border-t border-gray-200">
      <slot name="acoes"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

export interface Estudante {
  id: string
  nome: string
  email: string
  status?: 'dominado' | 'em-progresso' | 'em-risco'
  atividadesConcluidas?: number
  mediaNotas?: number
  progresso?: number
}

export interface PropriedadesCartaoEstudante {
  estudante: Estudante
}

const props = defineProps<PropriedadesCartaoEstudante>()

const iniciais = computed(() => {
  const nomes = props.estudante.nome.split(' ')
  if (nomes.length >= 2) {
    return `${nomes[0][0]}${nomes[1][0]}`.toUpperCase()
  }
  return props.estudante.nome.substring(0, 2).toUpperCase()
})

const rotuloStatus = computed(() => {
  const rotulos: Record<string, string> = {
    'dominado': 'Dominado',
    'em-progresso': 'Em Progresso',
    'em-risco': 'Em Risco'
  }
  return rotulos[props.estudante.status || 'em-progresso']
})

const varianteProgresso = computed(() => {
  const progresso = props.estudante.progresso || 0
  if (progresso >= 80) return 'sucesso'
  if (progresso >= 50) return 'aviso'
  return 'critico'
})
</script>
