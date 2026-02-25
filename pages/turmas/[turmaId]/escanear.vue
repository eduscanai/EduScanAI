<template>
  <div class="h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <!-- Conteúdo principal: duas colunas -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Coluna Esquerda — Captura -->
        <div class="flex-1 flex flex-col p-4 overflow-hidden">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              @click="navigateTo('/turmas')"
              class="hover:text-gray-900 transition-colors"
            >
              Turmas
            </button>
            <span class="text-gray-400 text-base">›</span>
            <button
              @click="navigateTo(`/turmas/${turmaId}`)"
              class="hover:text-gray-900 transition-colors"
            >
              {{ turma.disciplina }}
            </button>
            <span class="text-gray-400 text-base">›</span>
            <span class="text-gray-900 font-semibold">Escanear</span>
          </div>

          <!-- Tabs -->
          <div class="flex items-center bg-white border border-gray-200 rounded-xl p-1 w-fit mb-4">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              :class="tabAtiva === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
              @click="tabAtiva = tab.id"
            >
              <Icone :tamanho="16" :class="tabAtiva === tab.id ? 'text-white' : 'text-gray-400'">
                <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icone" />
              </Icone>
              {{ tab.rotulo }}
            </button>
          </div>

          <!-- Área principal de captura -->
          <div class="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative flex items-center justify-center min-h-0">
            <!-- Tab: Câmera -->
            <div v-if="tabAtiva === 'camera'" class="w-full h-full flex flex-col items-center justify-center relative">
              <!-- Guia de texto -->
              <div class="absolute top-6 z-10">
                <div class="bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
                  Posicione a folha dentro da área tracejada
                </div>
              </div>

              <!-- Feed da câmera (simulado) -->
              <div class="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                <!-- Moldura tracejada -->
                <div class="relative w-[70%] aspect-[3/4] max-h-[80%]">
                  <div class="absolute inset-0 border-2 border-dashed border-primary-400/60 rounded-lg"></div>
                  <!-- Cantos destacados -->
                  <div class="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-primary-400 rounded-tl-md"></div>
                  <div class="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-primary-400 rounded-tr-md"></div>
                  <div class="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-primary-400 rounded-bl-md"></div>
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-primary-400 rounded-br-md"></div>
                </div>
              </div>

              <!-- Botão de captura -->
              <div class="absolute bottom-8">
                <button
                  class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  @click="capturarFoto"
                >
                  <div class="w-12 h-12 rounded-full bg-primary-500"></div>
                </button>
              </div>
            </div>

            <!-- Tab: Upload PDF -->
            <div v-if="tabAtiva === 'upload'" class="w-full h-full flex items-center justify-center p-8">
              <div
                class="w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer"
                :class="arrastando ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-gray-400'"
                @dragover.prevent="arrastando = true"
                @dragleave="arrastando = false"
                @drop.prevent="manipularDrop"
                @click="selecionarArquivos"
              >
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Icone :tamanho="32" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </Icone>
                </div>
                <p class="text-white font-semibold text-lg mb-1">Arraste os PDFs aqui</p>
                <p class="text-gray-400 text-sm mb-4">ou clique para selecionar arquivos</p>
                <button
                  class="px-4 py-2 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                  @click.stop="selecionarArquivos"
                >
                  Selecionar Arquivos
                </button>
              </div>
            </div>

            <!-- Tab: Lote -->
            <div v-if="tabAtiva === 'lote'" class="w-full h-full flex items-center justify-center p-8">
              <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-5">
                  <Icone :tamanho="40" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.011.668-1.867 1.586-2.148" />
                  </Icone>
                </div>
                <h3 class="text-white font-bold text-xl mb-2">Escaneamento em Lote</h3>
                <p class="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  Escaneie múltiplas provas de uma vez. O sistema detecta automaticamente a separação entre documentos.
                </p>
                <button
                  class="flex items-center gap-2 px-4 py-2 mx-auto bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                  @click="iniciarLote"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </Icone>
                  Iniciar Escaneamento em Lote
                </button>
              </div>
            </div>
          </div>

          <!-- Barra de progresso -->
          <div v-if="processamento.ativo" class="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span
                  class="text-xs font-bold uppercase px-2 py-1 rounded-full"
                  :class="processamento.concluido
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ processamento.concluido ? 'CONCLUÍDO' : 'EM PROGRESSO' }}
                </span>
                <span class="text-sm text-gray-600">
                  Processando {{ processamento.atual }}/{{ processamento.total }} provas...
                </span>
              </div>
              <span class="text-sm font-bold text-gray-900">{{ processamento.porcentagem }}%</span>
            </div>
            <BarraProgresso
              :valor="processamento.porcentagem"
              :variante="processamento.concluido ? 'sucesso' : 'primario'"
              :mostrar-porcentagem="false"
              :altura="8"
            />
          </div>
        </div>

        <!-- Coluna Direita — Revisão de IA -->
        <div class="w-[420px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
          <!-- Header do painel -->
          <div class="p-5 border-b border-gray-200">
            <div class="flex items-center gap-2 mb-1">
              <Icone :tamanho="20" class="text-primary-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </Icone>
              <h2 class="text-lg font-bold text-gray-900">Revisão de IA</h2>
              <span
                v-if="revisoesPendentes.length > 0"
                class="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full"
              >
                {{ revisoesPendentes.length }} Pendentes
              </span>
            </div>
            <p class="text-xs text-gray-500">
              Verifique as respostas onde a confiança da IA foi baixa (&lt; 80%).
            </p>
          </div>

          <!-- Área scrollável de cards -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <!-- Estado: processando -->
            <div
              v-if="processamento.ativo && !processamento.concluido && revisoes.length === 0"
              class="flex flex-col items-center justify-center py-16"
            >
              <div class="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p class="text-sm text-gray-500 font-medium">Analisando respostas...</p>
              <p class="text-xs text-gray-400 mt-1">Detecções aparecerão aqui automaticamente.</p>
            </div>

            <!-- Estado: vazio (sem provas escaneadas) -->
            <div
              v-else-if="revisoes.length === 0"
              class="flex flex-col items-center justify-center py-16"
            >
              <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Icone :tamanho="32" class="text-gray-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </Icone>
              </div>
              <p class="text-sm font-semibold text-gray-500">Nenhuma prova escaneada</p>
              <p class="text-xs text-gray-400 mt-1">Capture ou faça upload de provas para começar.</p>
            </div>

            <!-- Cards de revisão -->
            <div
              v-for="revisao in revisoes"
              :key="revisao.id"
              class="border rounded-xl p-4 cursor-pointer transition-all"
              :class="revisaoSelecionada === revisao.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'"
              @click="revisaoSelecionada = revisao.id"
            >
              <!-- Topo: questão + badge confiança -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Questão {{ revisao.questao }}
                </span>
                <span
                  class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  :class="obterClasseConfianca(revisao.confianca)"
                >
                  <Icone v-if="revisao.confianca < 50" :tamanho="12">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </Icone>
                  {{ revisao.confianca }}%
                </span>
              </div>

              <!-- Nome do aluno -->
              <p class="text-sm text-gray-700 mb-3">
                Aluno: <span class="font-semibold">{{ revisao.aluno }}</span>
              </p>

              <!-- Preview da resposta -->
              <div class="bg-gray-100 rounded-lg h-16 mb-3 flex items-center justify-center overflow-hidden">
                <div class="flex flex-col gap-1 w-full px-3">
                  <div class="h-1.5 bg-gray-300 rounded" style="width: 90%"></div>
                  <div class="h-1.5 bg-gray-300 rounded" style="width: 70%"></div>
                  <div class="h-1.5 bg-gray-300 rounded" style="width: 80%"></div>
                </div>
              </div>

              <!-- Input + ações -->
              <div class="flex items-center gap-2">
                <input
                  :value="revisao.textoDetectado"
                  class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @input="(e) => revisao.textoDetectado = (e.target as HTMLInputElement).value"
                />
                <button
                  class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                  @click.stop="confirmarRevisao(revisao.id)"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </Icone>
                </button>
                <button
                  class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                  @click.stop="rejeitarRevisao(revisao.id)"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </Icone>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer fixo -->
          <div class="p-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">
                Total Digitalizado — <span class="font-semibold text-gray-900">{{ totalDigitalizado }} arquivos</span>
              </span>
            </div>
            <Botao
              variante="primario"
              largura-completa
              :desabilitado="!podeFinalizar"
              @click="finalizarDistribuir"
            >
              <template #default>Finalizar e Distribuir</template>
              <template #icone-direita>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </Icone>
              </template>
            </Botao>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, navigateTo } from '#app'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'

const route = useRoute()
const turmaId = route.params.turmaId as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'teacher']
})

const turma = {
  disciplina: 'Matemática 9º Ano A'
}

// Tabs
const tabs = [
  { id: 'camera', rotulo: 'Câmera', icone: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z' },
  { id: 'upload', rotulo: 'Upload PDF', icone: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m.75-9V3.375c0-.621-.504-1.125-1.125-1.125H6.375c-.621 0-1.125.504-1.125 1.125v3.659M9.75 8.25H6.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125z' },
  { id: 'lote', rotulo: 'Escanear em Lote', icone: 'M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.011.668-1.867 1.586-2.148' }
]

const tabAtiva = ref('camera')

// Drag & Drop
const arrastando = ref(false)

// Processamento
const processamento = reactive({
  ativo: false,
  atual: 0,
  total: 0,
  porcentagem: 0,
  concluido: false
})

// Revisões de IA
interface Revisao {
  id: string
  questao: number
  aluno: string
  confianca: number
  textoDetectado: string
  status: 'pendente' | 'confirmado' | 'rejeitado'
}

const revisoes = ref<Revisao[]>([])
const revisaoSelecionada = ref<string | null>(null)

const revisoesPendentes = computed(() =>
  revisoes.value.filter(r => r.status === 'pendente')
)

const totalDigitalizado = ref(0)

const podeFinalizar = computed(() =>
  totalDigitalizado.value > 0
  && revisoesPendentes.value.length === 0
  && (!processamento.ativo || processamento.concluido)
)

// Ações
const capturarFoto = () => {
  processamento.ativo = true
  processamento.total = 1
  processamento.atual = 0
  processamento.concluido = false

  // Simular processamento
  setTimeout(() => {
    processamento.atual = 1
    processamento.porcentagem = 100
    processamento.concluido = true
    totalDigitalizado.value++

    revisoes.value.push(
      { id: `rev-${Date.now()}-1`, questao: 3, aluno: 'Ana Silva', confianca: 62, textoDetectado: 'x² + 2x = -1', status: 'pendente' },
      { id: `rev-${Date.now()}-2`, questao: 7, aluno: 'Ana Silva', confianca: 45, textoDetectado: 'f(x) = 3x + ?', status: 'pendente' }
    )
  }, 2000)
}

const selecionarArquivos = () => {
  processamento.ativo = true
  processamento.total = 3
  processamento.atual = 0
  processamento.porcentagem = 0
  processamento.concluido = false

  const intervalo = setInterval(() => {
    processamento.atual++
    processamento.porcentagem = Math.round((processamento.atual / processamento.total) * 100)

    if (processamento.atual >= processamento.total) {
      clearInterval(intervalo)
      processamento.concluido = true
      totalDigitalizado.value += 3

      revisoes.value.push(
        { id: `rev-${Date.now()}-a`, questao: 2, aluno: 'Carlos Mendes', confianca: 73, textoDetectado: 'sen(30°) = 0.5', status: 'pendente' },
        { id: `rev-${Date.now()}-b`, questao: 5, aluno: 'Maria Costa', confianca: 38, textoDetectado: 'Δ = b² - 4ac = ?', status: 'pendente' },
        { id: `rev-${Date.now()}-c`, questao: 1, aluno: 'João Pedro', confianca: 71, textoDetectado: '2x + 3 = 7, x = 2', status: 'pendente' }
      )
    }
  }, 800)
}

const manipularDrop = (e: DragEvent) => {
  arrastando.value = false
  selecionarArquivos()
}

const iniciarLote = () => {
  processamento.ativo = true
  processamento.total = 8
  processamento.atual = 0
  processamento.porcentagem = 0
  processamento.concluido = false

  const intervalo = setInterval(() => {
    processamento.atual++
    processamento.porcentagem = Math.round((processamento.atual / processamento.total) * 100)

    if (processamento.atual >= processamento.total) {
      clearInterval(intervalo)
      processamento.concluido = true
      totalDigitalizado.value += 8

      revisoes.value.push(
        { id: `rev-${Date.now()}-l1`, questao: 4, aluno: 'Lucas Ferreira', confianca: 55, textoDetectado: 'A = π × r²', status: 'pendente' },
        { id: `rev-${Date.now()}-l2`, questao: 9, aluno: 'Beatriz Lima', confianca: 42, textoDetectado: 'log₂(8) = ?', status: 'pendente' },
        { id: `rev-${Date.now()}-l3`, questao: 1, aluno: 'Rafael Santos', confianca: 68, textoDetectado: '3x - 5 = 10', status: 'pendente' }
      )
    }
  }, 600)
}

const confirmarRevisao = (id: string) => {
  const revisao = revisoes.value.find(r => r.id === id)
  if (revisao) revisao.status = 'confirmado'
}

const rejeitarRevisao = (id: string) => {
  revisoes.value = revisoes.value.filter(r => r.id !== id)
}

const obterClasseConfianca = (confianca: number) => {
  if (confianca >= 70) return 'bg-yellow-100 text-yellow-700'
  if (confianca >= 50) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

const finalizarDistribuir = () => {
  navigateTo(`/turmas/${turmaId}`)
}
</script>
