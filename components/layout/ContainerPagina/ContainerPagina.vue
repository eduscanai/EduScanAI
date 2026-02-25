<template>
  <div class="min-h-screen bg-bg-page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="$slots.cabecalho || titulo" class="mb-6">
        <slot name="cabecalho">
          <h1 v-if="titulo" class="text-heading-1">{{ titulo }}</h1>
        </slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PropriedadesContainerPagina {
  titulo?: string
}

defineProps<PropriedadesContainerPagina>()
</script>
