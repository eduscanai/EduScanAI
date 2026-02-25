<template>
  <div class="bg-bg-card rounded-2xl border border-gray-200 shadow-sm p-6">
    <!-- Header -->
    <h2 class="text-heading-2 mb-4">Fila em Tempo Real</h2>

    <!-- Queue Items -->
    <div class="space-y-0">
      <div
        v-for="(item, indice) in itens"
        :key="indice"
        class="flex items-center gap-4 py-4"
        :class="{ 'border-t border-gray-100 ml-14': indice > 0 }"
      >
        <!-- Status Icon -->
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="obterClasseIcone(item.status)"
        >
          <svg
            v-if="item.status === 'processando'"
            class="w-5 h-5 text-purple-500 animate-spin"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <svg
            v-else-if="item.status === 'concluido'"
            class="w-5 h-5 text-success-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg
            v-else-if="item.status === 'falhou'"
            class="w-5 h-5 text-critical-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-body font-semibold text-text-primary truncate">
            {{ item.nomeArquivo }}
          </p>
          <p class="text-caption text-text-secondary">
            <span :class="obterClasseTextoStatus(item.status)">{{ obterTextoStatus(item.status) }}</span>
            <span> • {{ item.tempoDecorrido }}</span>
          </p>
        </div>

        <!-- Action -->
        <div class="flex-shrink-0">
          <div
            v-if="item.status === 'processando'"
            class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <button
            v-else-if="item.status === 'concluido'"
            class="text-gray-300 hover:text-primary-500 transition-colors"
            type="button"
            @click="manipularCliqueItem(item)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            v-else-if="item.status === 'falhou'"
            class="text-body font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            type="button"
            @click="manipularTentarNovamente(item)"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="itens.length === 0" class="text-center py-8">
      <p class="text-body text-text-secondary">Nenhum item na fila</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ItemFila {
  nomeArquivo: string
  status: 'processando' | 'concluido' | 'falhou'
  tempoDecorrido: string
  aoTentarNovamente?: () => void
  aoClicar?: () => void
}

export interface PropriedadesCartaoFilaTempoReal {
  itens: ItemFila[]
}

defineProps<PropriedadesCartaoFilaTempoReal>()

const emit = defineEmits<{
  tentarNovamente: [item: ItemFila]
  cliqueItem: [item: ItemFila]
}>()

const obterClasseIcone = (status: string) => {
  const classes: Record<string, string> = {
    processando: 'bg-purple-50',
    concluido: 'bg-green-50',
    falhou: 'bg-red-50'
  }
  return classes[status] || 'bg-gray-50'
}

const obterTextoStatus = (status: string) => {
  const textos: Record<string, string> = {
    processando: 'Processando',
    concluido: 'Concluído',
    falhou: 'Falhou'
  }
  return textos[status] || status
}

const obterClasseTextoStatus = (status: string) => {
  const classes: Record<string, string> = {
    processando: 'text-purple-500',
    concluido: 'text-success-500',
    falhou: 'text-critical-500'
  }
  return classes[status] || ''
}

const manipularTentarNovamente = (item: ItemFila) => {
  if (item.aoTentarNovamente) {
    item.aoTentarNovamente()
  }
  emit('tentarNovamente', item)
}

const manipularCliqueItem = (item: ItemFila) => {
  if (item.aoClicar) {
    item.aoClicar()
  }
  emit('cliqueItem', item)
}
</script>
