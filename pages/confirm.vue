<template>
  <div class="min-h-screen bg-bg-page flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-md text-center">
      <!-- Logo -->
      <div class="flex justify-center mb-10">
        <div class="flex items-center gap-[10px]">
          <div class="bg-primary-500 p-[6px] rounded-lg">
            <Icone :tamanho="24" class="text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </Icone>
          </div>
          <span class="text-[18px] font-extrabold text-gray-900">EduScan AI</span>
        </div>
      </div>

      <div v-if="carregando" class="space-y-4">
        <svg class="animate-spin w-8 h-8 text-primary-500 mx-auto" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-500">Confirmando sua conta...</p>
      </div>

      <div v-else class="space-y-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Icone :tamanho="32" class="text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </Icone>
        </div>
        <h2 class="text-2xl font-black text-gray-900">Conta confirmada!</h2>
        <p class="text-sm text-gray-500">Redirecionando para o dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateTo } from '#app'
import Icone from '~/components/ui/Icone/Icone.vue'

definePageMeta({
  layout: false
})

const carregando = ref(true)

onMounted(() => {
  setTimeout(() => {
    carregando.value = false
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 1500)
  }, 1000)
})
</script>
