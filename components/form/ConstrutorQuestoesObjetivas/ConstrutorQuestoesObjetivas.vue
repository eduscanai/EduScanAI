<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <slot name="titulo">
        <h2 class="text-heading-3">Questões</h2>
      </slot>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model.number="quantidadeQuestoes"
          min="1"
          max="100"
          class="form-input w-20 text-center"
        />
        <Botao variante="contorno" @click="gerarQuestoes">Gerar</Botao>
      </div>
    </div>

    <p v-if="erro" class="mb-3 text-xs text-critical-500">{{ erro }}</p>

    <div v-if="questoes.length === 0" class="text-center py-8 text-sm text-gray-400">
      Informe a quantidade de questões e clique em "Gerar"
    </div>

    <template v-else>
      <div class="flex flex-wrap items-end gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Alternativas em todas</label>
          <select v-model.number="massaAlternativas" class="form-input py-1.5 text-sm w-40">
            <option v-for="n in [2, 3, 4, 5]" :key="n" :value="n">{{ n }} alternativas</option>
          </select>
        </div>
        <Botao variante="contorno" class="!px-3 !py-1.5 !text-sm" @click="aplicarAlternativasEmMassa">Aplicar a todas</Botao>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Peso em todas</label>
          <input type="number" v-model.number="massaPeso" min="0.1" max="1" step="0.1" class="form-input py-1.5 text-sm w-24" />
        </div>
        <Botao variante="contorno" class="!px-3 !py-1.5 !text-sm" @click="aplicarPesoEmMassa">Aplicar a todas</Botao>
      </div>

      <div class="space-y-2">
      <div class="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
        <div class="col-span-1">Nº</div>
        <div class="col-span-3">Alternativas</div>
        <div class="col-span-3">Resposta correta</div>
        <div class="col-span-3">Peso</div>
      </div>
      <div
        v-for="(questao, indice) in questoes"
        :key="indice"
        class="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg px-2 py-2"
      >
        <div class="col-span-1 text-sm font-semibold text-gray-700">{{ questao.numero }}</div>
        <div class="col-span-3">
          <select v-model.number="questao.option_count" @change="ajustarResposta(questao)" class="form-input py-1.5 text-sm">
            <option v-for="n in [2, 3, 4, 5]" :key="n" :value="n">{{ n }} alternativas</option>
          </select>
        </div>
        <div class="col-span-3">
          <select v-model="questao.resposta" class="form-input py-1.5 text-sm">
            <option v-for="letra in alternativasDe(questao.option_count)" :key="letra" :value="letra">{{ letra }}</option>
          </select>
        </div>
        <div class="col-span-3">
          <input type="number" v-model.number="questao.peso" min="0.1" max="1" step="0.1" class="form-input py-1.5 text-sm" />
        </div>
        <div class="col-span-2 flex justify-end">
          <button type="button" @click="removerQuestao(indice)" class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors">
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </Icone>
          </button>
        </div>
      </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Icone from '~/components/ui/Icone/Icone.vue'
import Botao from '~/components/ui/Botao/Botao.vue'

export interface LinhaQuestaoObjetiva {
  numero: number
  option_count: number
  resposta: string
  peso: number
}

const props = defineProps<{
  modelValue: LinhaQuestaoObjetiva[]
  erro?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LinhaQuestaoObjetiva[]]
}>()

const questoes = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const quantidadeQuestoes = ref(props.modelValue.length || 10)
const massaAlternativas = ref(4)
const massaPeso = ref(1)

const alternativasDe = (optionCount: number) =>
  Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i))

const ajustarResposta = (questao: LinhaQuestaoObjetiva) => {
  const permitidas = alternativasDe(questao.option_count)
  if (!permitidas.includes(questao.resposta)) {
    questao.resposta = permitidas[0]
  }
}

const gerarQuestoes = () => {
  const total = Math.min(100, Math.max(1, quantidadeQuestoes.value || 1))
  const atuais = questoes.value

  questoes.value = Array.from({ length: total }, (_, i) => {
    const existente = atuais[i]
    return existente
      ? { ...existente, numero: i + 1 }
      : { numero: i + 1, option_count: 4, resposta: 'A', peso: 1 }
  })
}

const aplicarAlternativasEmMassa = () => {
  const atualizadas = questoes.value.map(questao => {
    const copia = { ...questao, option_count: massaAlternativas.value }
    ajustarResposta(copia)
    return copia
  })
  questoes.value = atualizadas
}

const aplicarPesoEmMassa = () => {
  const peso = Math.min(1, Math.max(0.1, massaPeso.value || 1))
  questoes.value = questoes.value.map(questao => ({ ...questao, peso }))
}

const removerQuestao = (indice: number) => {
  const atualizadas = questoes.value.slice()
  atualizadas.splice(indice, 1)
  atualizadas.forEach((q, i) => { q.numero = i + 1 })
  questoes.value = atualizadas
}

defineExpose({ gerarQuestoes })
</script>
