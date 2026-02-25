<template>
  <div>
    <label v-if="rotulo" :for="id" class="form-label">{{ rotulo }}</label>
    <div class="relative">
      <input
        :id="id"
        type="text"
        :value="valor"
        readonly
        class="form-input form-input-readonly pr-24"
      />
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
        @click="copiar"
      >
        {{ copiado ? 'Copiado!' : 'Copiar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface PropriedadesCampoCopiavel {
  id?: string
  valor: string
  rotulo?: string
}

const props = defineProps<PropriedadesCampoCopiavel>()

const copiado = ref(false)

const copiar = async () => {
  try {
    await navigator.clipboard.writeText(props.valor)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}
</script>
