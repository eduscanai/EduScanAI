<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="estaVisivel"
        class="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      >
        <div
          :class="classeNotificacao"
          role="alert"
        >
          <div class="flex items-start gap-3">
            <svg
              class="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                v-if="variante === 'sucesso'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                v-else-if="variante === 'aviso'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
              <path
                v-else-if="variante === 'critico'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="flex-1">
              <p class="font-semibold">{{ titulo }}</p>
              <p v-if="mensagem" class="text-sm mt-1">{{ mensagem }}</p>
            </div>
            <button
              class="flex-shrink-0 hover:opacity-70 transition-opacity"
              type="button"
              @click="manipularFechamento"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface PropriedadesNotificacao {
  estaVisivel?: boolean
  variante?: 'sucesso' | 'aviso' | 'critico'
  titulo: string
  mensagem?: string
  duracao?: number
}

const props = withDefaults(defineProps<PropriedadesNotificacao>(), {
  estaVisivel: false,
  variante: 'sucesso',
  duracao: 3000
})

const emit = defineEmits<{
  fechar: []
}>()

let temporizador: ReturnType<typeof setTimeout> | null = null

const classeNotificacao = computed(() => {
  const classes: Record<string, string> = {
    sucesso: 'alert-success shadow-lg',
    aviso: 'alert-warning shadow-lg',
    critico: 'alert-critical shadow-lg'
  }

  return classes[props.variante]
})

watch(() => props.estaVisivel, (novoValor) => {
  if (novoValor && props.duracao > 0) {
    if (temporizador) clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      manipularFechamento()
    }, props.duracao)
  }
})

const manipularFechamento = () => {
  if (temporizador) clearTimeout(temporizador)
  emit('fechar')
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
