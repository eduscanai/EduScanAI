<template>
  <div ref="containerRef">
    <label v-if="rotulo" class="form-label">{{ rotulo }}</label>
    <div class="relative">
      <button
        type="button"
        class="form-input w-full text-left flex items-center justify-between pr-10"
        :class="{ 'border-critical-500': erro }"
        @click="estaAberto = !estaAberto"
      >
        <span :class="textoExibido === textoReservado ? 'text-gray-400' : 'text-gray-900'" class="truncate">
          {{ textoExibido }}
        </span>
      </button>
      <svg
        class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform"
        :class="{ 'rotate-180': estaAberto }"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>

      <div
        v-if="estaAberto"
        class="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <label
          v-for="opcao in opcoes"
          :key="opcao.valor"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            :checked="modelValue.includes(opcao.valor)"
            class="w-4 h-4 rounded border-gray-300 text-primary-500 accent-primary-500"
            @change="alternar(opcao.valor)"
          >
          <span class="text-sm text-gray-700">{{ opcao.rotulo }}</span>
        </label>
        <div v-if="opcoes.length === 0" class="px-4 py-3 text-sm text-gray-400">
          Nenhuma opção disponível
        </div>
      </div>
    </div>
    <p v-if="erro" class="mt-1 text-xs text-critical-500">{{ erro }}</p>
  </div>
</template>

<script setup lang="ts">
interface OpcaoSeletorMultiplo {
  rotulo: string
  valor: string
}

interface PropriedadesSeletorMultiplo {
  modelValue: string[]
  rotulo?: string
  textoReservado?: string
  opcoes: OpcaoSeletorMultiplo[]
  erro?: string
}

const props = withDefaults(defineProps<PropriedadesSeletorMultiplo>(), {
  textoReservado: 'Selecione...'
})

const emit = defineEmits<{
  'update:modelValue': [valor: string[]]
}>()

const estaAberto = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const textoExibido = computed(() => {
  if (props.modelValue.length === 0) return props.textoReservado
  if (props.modelValue.length === 1) {
    const opcao = props.opcoes.find(o => o.valor === props.modelValue[0])
    return opcao?.rotulo || props.textoReservado
  }
  return `${props.modelValue.length} turmas selecionadas`
})

const alternar = (valor: string) => {
  const atual = [...props.modelValue]
  const index = atual.indexOf(valor)
  if (index === -1) {
    atual.push(valor)
  } else {
    atual.splice(index, 1)
  }
  emit('update:modelValue', atual)
}

const fecharAoClicarFora = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    estaAberto.value = false
  }
}

onMounted(() => document.addEventListener('click', fecharAoClicarFora))
onUnmounted(() => document.removeEventListener('click', fecharAoClicarFora))
</script>
