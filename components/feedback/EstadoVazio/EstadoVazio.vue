<template>
  <div class="flex flex-col items-center justify-center p-12 text-center">
    <div class="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <slot name="icone">
        <svg
          class="w-8 h-8 text-text-secondary"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </slot>
    </div>
    <h3 class="text-heading-3 mb-2">{{ titulo }}</h3>
    <p class="text-body text-text-secondary mb-6 max-w-sm">{{ descricao }}</p>
    <slot name="acao"></slot>
  </div>
</template>

<script setup lang="ts">
export interface PropriedadesEstadoVazio {
  titulo: string
  descricao?: string
}

defineProps<PropriedadesEstadoVazio>()
</script>
