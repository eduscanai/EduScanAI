<template>
  <div class="bg-bg-card rounded-2xl border border-gray-200 shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 class="text-heading-3">Preview do Scanner</h3>
      </div>
      <button
        class="text-text-secondary hover:text-primary-500 transition-colors"
        type="button"
        @click="manipularCliqueMenu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>
    </div>

    <!-- Body: Document Preview -->
    <div class="relative bg-gray-50 rounded-lg overflow-hidden mb-4" style="min-height: 300px;">
      <img
        v-if="imagemDocumento"
        :src="imagemDocumento"
        alt="Preview do documento"
        class="w-full h-auto"
      />

      <!-- Text Regions Overlay -->
      <div
        v-for="(regiao, indice) in regioes"
        :key="indice"
        class="absolute border-2 border-primary-500 bg-primary-500/5 transition-opacity hover:opacity-100"
        :style="{
          left: `${regiao.x}%`,
          top: `${regiao.y}%`,
          width: `${regiao.largura}%`,
          height: `${regiao.altura}%`,
          opacity: regiaoAtiva === indice ? 1 : 0.6
        }"
        @mouseenter="regiaoAtiva = indice"
        @mouseleave="regiaoAtiva = null"
      >
        <div
          v-if="regiaoAtiva === indice"
          class="absolute -top-8 left-0 bg-text-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap"
        >
          {{ regiao.rotulo }}
        </div>
      </div>

      <!-- Processing Progress -->
      <div v-if="status === 'escaneando'" class="absolute bottom-4 left-4 right-4">
        <div class="bg-white rounded-full p-2 shadow-md">
          <BarraProgresso
            :valor="progresso"
            variante="sucesso"
            :mostrar-porcentagem="false"
            :altura="6"
          />
        </div>
      </div>

      <!-- Completed Check -->
      <div
        v-if="status === 'concluido'"
        class="absolute top-4 right-4 bg-success-500 text-white rounded-full p-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <!-- Failed State -->
      <div
        v-if="status === 'falhou'"
        class="absolute inset-0 bg-critical-500/10 flex items-center justify-center"
      >
        <div class="text-center">
          <svg class="w-12 h-12 text-critical-500 mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p class="text-body font-semibold text-critical-500">Escaneamento Falhou</p>
        </div>
      </div>
    </div>

    <!-- Footer: Confidence Score -->
    <div v-if="status === 'concluido'">
      <div class="flex items-center justify-between mb-2">
        <span class="text-caption text-text-secondary">ÍNDICE DE CONFIANÇA</span>
        <span class="text-body font-bold text-success-500">{{ indiceConfianca }}%</span>
      </div>
      <BarraProgresso
        :valor="indiceConfianca"
        variante="sucesso"
        :mostrar-porcentagem="false"
        :altura="8"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

export interface RegiaoTexto {
  x: number
  y: number
  largura: number
  altura: number
  rotulo: string
}

export interface PropriedadesPreviewScanner {
  imagemDocumento?: string
  regioes?: RegiaoTexto[]
  progresso?: number
  indiceConfianca?: number
  status?: 'escaneando' | 'concluido' | 'falhou'
}

const props = withDefaults(defineProps<PropriedadesPreviewScanner>(), {
  regioes: () => [],
  progresso: 0,
  indiceConfianca: 0,
  status: 'escaneando'
})

const emit = defineEmits<{
  cliqueMenu: []
}>()

const regiaoAtiva = ref<number | null>(null)

const manipularCliqueMenu = () => {
  emit('cliqueMenu')
}
</script>
