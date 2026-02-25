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
          class="relative bg-bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div v-if="$slots.cabecalho || titulo" class="flex items-start justify-between p-6 border-b border-gray-200">
            <slot name="cabecalho">
              <h3 class="text-heading-3">{{ titulo }}</h3>
            </slot>
            <button
              v-if="fechavel"
              class="text-text-secondary hover:text-primary-500 transition-colors"
              type="button"
              @click="manipularFechamento"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <slot></slot>
          </div>
          <div v-if="$slots.rodape" class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <slot name="rodape"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export interface PropriedadesModal {
  estaAberto?: boolean
  titulo?: string
  fechavel?: boolean
  fecharAoClicarFundo?: boolean
}

const props = withDefaults(defineProps<PropriedadesModal>(), {
  estaAberto: false,
  fechavel: true,
  fecharAoClicarFundo: true
})

const emit = defineEmits<{
  fechar: []
}>()

const manipularFechamento = () => {
  emit('fechar')
}

const manipularCliqueFundo = () => {
  if (props.fecharAoClicarFundo) {
    manipularFechamento()
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
