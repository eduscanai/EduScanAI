<template>
  <div
    class="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition"
    @click="emit('click')"
  >
    <!-- Preview do documento -->
    <div class="relative w-full h-24 bg-[#f8f9fa] rounded-lg p-3 mb-4">
      <!-- Linhas simulando texto -->
      <div class="space-y-2">
        <div class="h-1 bg-[#dee2e6] rounded" style="width: 85%"></div>
        <div class="h-1 bg-[#dee2e6] rounded" style="width: 70%"></div>
        <div class="h-1 bg-[#dee2e6] rounded" style="width: 90%"></div>
        <div class="h-1 bg-[#dee2e6] rounded" style="width: 60%"></div>
      </div>

      <!-- Badge da nota (circulo) -->
      <div
        class="absolute -bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md"
        :class="fundoNota"
      >
        <span class="text-sm font-bold" :class="textoNota">
          {{ nota.toFixed(1) }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="mt-4">
      <h3 class="text-sm font-bold text-gray-900 mb-1">{{ titulo }}</h3>
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>{{ data }}</span>
        <span>•</span>
        <span>{{ categoria }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesCartaoProva {
  titulo: string
  data: string
  categoria: string
  nota: number
}

const props = defineProps<PropriedadesCartaoProva>()

const emit = defineEmits<{
  click: []
}>()

const fundoNota = computed(() => {
  if (props.nota >= 7) return 'bg-green-100 border-green-300'
  if (props.nota >= 5) return 'bg-yellow-100 border-yellow-300'
  return 'bg-red-100 border-red-300'
})

const textoNota = computed(() => {
  if (props.nota >= 7) return 'text-green-700'
  if (props.nota >= 5) return 'text-yellow-700'
  return 'text-red-700'
})
</script>
