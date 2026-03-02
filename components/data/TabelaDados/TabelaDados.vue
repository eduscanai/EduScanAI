<template>
  <div>
    <table class="w-full">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th
            v-for="coluna in colunas"
            :key="coluna.chave"
            class="text-left text-xs font-semibold text-text-primary uppercase tracking-wider"
            :class="[
              coluna.alinhamento === 'direita' ? 'text-right' : '',
              compacto ? 'px-6 py-2' : 'px-6 py-3'
            ]"
          >
            {{ coluna.rotulo }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="(linha, indice) in dados"
          :key="indice"
          class="hover:bg-gray-50 transition-colors"
        >
          <td
            v-for="coluna in colunas"
            :key="coluna.chave"
            class="whitespace-nowrap text-text-primary"
            :class="[
              coluna.alinhamento === 'direita' ? 'text-right' : '',
              compacto ? 'px-6 py-2.5 text-xs' : 'px-6 py-4 text-body'
            ]"
          >
            <slot :name="`celula-${coluna.chave}`" :linha="linha" :valor="linha[coluna.chave]">
              {{ linha[coluna.chave] }}
            </slot>
          </td>
        </tr>
        <tr v-if="dados.length === 0">
          <td :colspan="colunas.length" class="px-6 py-12 text-center">
            <slot name="vazio">
              <p class="text-body text-text-secondary">Nenhum dado encontrado</p>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface ColunaTabelaDados {
  chave: string
  rotulo: string
  alinhamento?: 'esquerda' | 'direita'
}

export interface PropriedadesTabelaDados {
  colunas: ColunaTabelaDados[]
  dados: Record<string, any>[]
  compacto?: boolean
}

withDefaults(defineProps<PropriedadesTabelaDados>(), {
  compacto: false
})
</script>
