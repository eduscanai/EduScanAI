<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="estaAberto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="manipularCliqueFundo"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div
          class="relative bg-bg-card rounded-lg shadow-xl max-w-md w-full"
          role="alertdialog"
          aria-modal="true"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                :class="classeFundoIcone"
              >
                <svg
                  class="w-6 h-6"
                  :class="classeCorIcone"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    v-if="variante === 'perigo'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-heading-3 mb-2">{{ titulo }}</h3>
                <p class="text-body text-text-secondary">{{ mensagem }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 pb-6">
            <button class="btn-outline" type="button" @click="manipularCancelamento">
              {{ textoCancelar }}
            </button>
            <button
              :class="classeBotaoConfirmar"
              type="button"
              @click="manipularConfirmacao"
            >
              {{ textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesDialogoConfirmacao {
  estaAberto?: boolean
  titulo: string
  mensagem: string
  variante?: 'perigo' | 'info'
  textoConfirmar?: string
  textoCancelar?: string
  fecharAoClicarFundo?: boolean
}

const props = withDefaults(defineProps<PropriedadesDialogoConfirmacao>(), {
  estaAberto: false,
  variante: 'info',
  textoConfirmar: 'Confirmar',
  textoCancelar: 'Cancelar',
  fecharAoClicarFundo: false
})

const emit = defineEmits<{
  confirmar: []
  cancelar: []
}>()

const classeFundoIcone = computed(() => {
  return props.variante === 'perigo' ? 'bg-red-50' : 'bg-blue-50'
})

const classeCorIcone = computed(() => {
  return props.variante === 'perigo' ? 'text-critical-500' : 'text-primary-500'
})

const classeBotaoConfirmar = computed(() => {
  return props.variante === 'perigo' ? 'btn-destructive' : 'btn-primary'
})

const manipularConfirmacao = () => {
  emit('confirmar')
}

const manipularCancelamento = () => {
  emit('cancelar')
}

const manipularCliqueFundo = () => {
  if (props.fecharAoClicarFundo) {
    manipularCancelamento()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
