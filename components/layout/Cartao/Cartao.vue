<template>
  <div class="card">
    <div v-if="$slots.cabecalho || titulo" class="flex items-start justify-between mb-4">
      <slot name="cabecalho">
        <h3 v-if="titulo" class="text-heading-3">{{ titulo }}</h3>
      </slot>
      <slot name="acoes"></slot>
    </div>
    <slot></slot>
    <div v-if="$slots.rodape" class="mt-4 pt-4 border-t border-gray-200">
      <slot name="rodape"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PropriedadesCartao {
  titulo?: string
}

defineProps<PropriedadesCartao>()
</script>
