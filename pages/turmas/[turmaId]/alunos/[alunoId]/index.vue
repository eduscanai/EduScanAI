<template>
  <div>
        <!-- Header do Aluno -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
          <div class="flex items-center gap-5">
            <Avatar
              :image="aluno.avatar"
              :alt="aluno.nome"
              :size="72"
            />
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-black text-gray-900">{{ aluno.nome }}</h1>
                <Etiqueta :variante="varianteStatus(aluno.status)">
                  {{ aluno.statusTexto }}
                </Etiqueta>
              </div>
              <p class="text-base text-gray-500 mt-1">{{ aluno.serie }} • {{ aluno.disciplina }}</p>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <Icone :tamanho="14">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </Icone>
                  Última avaliação: {{ aluno.dataUltimaProva }}
                </span>
              </div>
            </div>
          </div>
          <Botao
            variante="primario"
            icone="✨"
            posicao-icone="esquerda"
            @click="gerarPlano"
          >
            <template #icone-esquerda>
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </Icone>
            </template>
            <template #default>Gerar Plano Personalizado</template>
          </Botao>
        </div>

        <!-- Performance Geral + Análise de Competências -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <!-- Performance Geral -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-5">
              <div class="flex items-center gap-3">
                <h2 class="text-lg font-bold text-gray-900">Performance Geral</h2>
                <div class="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                  <Icone :tamanho="12" class="text-green-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </Icone>
                  <span class="text-xs font-semibold text-green-600">+15%</span>
                </div>
              </div>
              <select
                v-model="periodoPerformance"
                class="text-sm text-gray-500 bg-transparent border-none outline-none cursor-pointer font-medium appearance-none"
              >
                <option v-for="op in opcoesPeriodoPerformance" :key="op.valor" :value="op.valor">
                  {{ op.rotulo }}
                </option>
              </select>
            </div>

            <ClientOnly>
              <GraficoPerformance :dados="dadosPerformanceFiltrados" />
              <template #fallback>
                <div class="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p class="text-gray-500">Carregando gráfico...</p>
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- Análise de Competências -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-lg font-bold text-gray-900">Análise de Competências</h2>
              <select
                v-model="periodoCompetencias"
                class="text-sm text-gray-500 bg-transparent border-none outline-none cursor-pointer font-medium appearance-none"
              >
                <option v-for="op in opcoesPeriodoPerformance" :key="op.valor" :value="op.valor">
                  {{ op.rotulo }}
                </option>
              </select>
            </div>

            <!-- Legenda -->
            <div class="flex items-center gap-5 mb-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                <span class="text-xs text-gray-600">{{ aluno.nome }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                <span class="text-xs text-gray-600">Média da Turma</span>
              </div>
            </div>

            <!-- Radar Chart -->
            <ClientOnly>
              <div class="w-full h-64">
                <canvas ref="radarRef"></canvas>
              </div>
              <template #fallback>
                <div class="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p class="text-gray-500">Carregando gráfico...</p>
                </div>
              </template>
            </ClientOnly>
          </div>

        </div>

        <!-- Nuvem de Tópicos -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 class="text-lg font-bold text-gray-900">Nuvem de Tópicos</h2>
          <p class="text-sm text-gray-500 mt-1 mb-5">Proficiência por tema</p>

          <div class="flex flex-wrap gap-8">
            <div v-for="grupo in aluno.gruposTopicos" :key="grupo.nivel">
              <div class="flex items-center gap-2 mb-2">
                <Icone
                  :tamanho="16"
                  :class="corGrupoTopico(grupo.nivel)"
                >
                  <path
                    v-if="grupo.nivel === 'critico'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                  <path
                    v-else-if="grupo.nivel === 'desenvolvimento'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </Icone>
                <span class="text-sm font-bold" :class="corGrupoTopico(grupo.nivel)">
                  {{ grupo.rotulo }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="topico in grupo.topicos"
                  :key="topico"
                  class="px-3 py-1.5 text-sm border rounded-lg"
                  :class="classeTagTopico(grupo.nivel)"
                >
                  {{ topico }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- O que a IA detectou -->
        <div class="bg-[#f0f4ff] border-l-4 border-primary-500 rounded-2xl p-6 mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <!-- Texto -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icone :tamanho="20" class="text-primary-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </Icone>
                <h2 class="text-lg font-bold text-gray-900">O que a IA detectou</h2>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                Ana apresenta dificuldade consistente em <strong class="text-gray-900">operações básicas</strong> e
                <strong class="text-gray-900">interpretação de problemas</strong>, com queda de rendimento no 2º trimestre.
                Porém, demonstra boa evolução em <strong class="text-gray-900">geometria plana</strong> e
                <strong class="text-gray-900">probabilidade</strong>. Recomenda-se foco em exercícios práticos de álgebra
                e reforço na leitura de enunciados.
              </p>
            </div>

            <!-- Ação -->
            <div class="shrink-0">
              <!-- Estado inicial: botão gerar -->
              <Botao
                v-if="!gerandoPlano && !planoGerado"
                variante="primario"
                icone="alvo"
                posicao-icone="esquerda"
                @click="gerarPlanoAtividades"
              >
                <template #icone-esquerda>
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </Icone>
                </template>
                <template #default>Gerar Plano de Atividades</template>
              </Botao>

              <!-- Barra de progresso -->
              <div v-else-if="gerandoPlano" class="w-64">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold text-primary-500">{{ etapaPlano }}</span>
                  <span class="text-xs font-semibold text-gray-500">{{ progressoPlano }}%</span>
                </div>
                <div class="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: progressoPlano + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Plano gerado: botões -->
              <div v-else class="flex items-center gap-2">
                <Botao variante="primario" icone="alvo" posicao-icone="esquerda" @click="gerarPlanoAtividades">
                  <template #icone-esquerda>
                    <Icone :tamanho="16">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </Icone>
                  </template>
                  <template #default>Gerar Plano de Atividades</template>
                </Botao>
                <Botao variante="contorno" icone="pdf" posicao-icone="esquerda" @click="exportarPDF">
                  <template #icone-esquerda>
                    <Icone :tamanho="16">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </Icone>
                  </template>
                  <template #default>PDF</template>
                </Botao>
              </div>
            </div>
          </div>
        </div>

        <!-- Pasta Digital -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
              <Icone :tamanho="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </Icone>
              <h2 class="text-xl font-bold text-gray-900">Pasta Digital</h2>
            </div>
            <button
              class="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:text-primary-600"
              @click="navigateTo(`/turmas/${turmaId}/alunos/${alunoId}/historico`)"
            >
              Ver todo o histórico
              <Icone :tamanho="14">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </Icone>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CartaoProva
              v-for="prova in aluno.provas"
              :key="prova.id"
              :titulo="prova.titulo"
              :data="prova.data"
              :categoria="prova.categoria"
              :nota="prova.nota"
              @click="navigateTo(`/turmas/${turmaId}/alunos/${alunoId}/provas/${prova.id}`)"
            />
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import GraficoPerformance from '~/components/composed/GraficoPerformance/GraficoPerformance.vue'
import CartaoProva from '~/components/composed/CartaoProva/CartaoProva.vue'

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const route = useRoute()
const turmaId = route.params.turmaId as string
const alunoId = route.params.alunoId as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

// Filtros de período
const periodoPerformance = ref('ano-todo')
const periodoCompetencias = ref('ano-todo')

const opcoesPeriodoPerformance = [
  { rotulo: 'Ano Todo', valor: 'ano-todo' },
  { rotulo: '1º Trimestre', valor: '1tri' },
  { rotulo: '2º Trimestre', valor: '2tri' },
  { rotulo: '3º Trimestre', valor: '3tri' }
]

// Dados de performance por período
const dadosPerformancePorPeriodo: Record<string, { rotulos: string[]; valores: number[] }> = {
  'ano-todo': {
    rotulos: ['MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT'],
    valores: [2.3, 3.8, 4.2, 5.0, 6.5, 7.8]
  },
  '1tri': {
    rotulos: ['MAR', 'ABR'],
    valores: [2.3, 3.8]
  },
  '2tri': {
    rotulos: ['MAI', 'JUN', 'JUL'],
    valores: [4.2, 5.0, 5.5]
  },
  '3tri': {
    rotulos: ['AGO', 'SET', 'OUT'],
    valores: [6.5, 6.8, 7.8]
  }
}

const dadosPerformanceFiltrados = computed(() => {
  return dadosPerformancePorPeriodo[periodoPerformance.value] || dadosPerformancePorPeriodo['ano-todo']
})

// Dados do radar por período
const dadosCompetenciasPorPeriodo: Record<string, { aluno: number[]; turma: number[] }> = {
  'ano-todo': {
    aluno: [7.8, 4.5, 6.2, 8.5, 5.0, 7.0],
    turma: [6.5, 6.0, 6.8, 7.0, 6.2, 6.5]
  },
  '1tri': {
    aluno: [3.5, 2.8, 4.0, 5.5, 3.2, 4.0],
    turma: [5.8, 5.5, 6.0, 6.2, 5.8, 6.0]
  },
  '2tri': {
    aluno: [5.5, 3.8, 5.2, 7.0, 4.0, 5.5],
    turma: [6.2, 5.8, 6.5, 6.8, 6.0, 6.2]
  },
  '3tri': {
    aluno: [7.8, 4.5, 6.2, 8.5, 5.0, 7.0],
    turma: [6.5, 6.0, 6.8, 7.0, 6.2, 6.5]
  }
}

const competenciasRotulos = ['Geometria', 'Funções', 'Álgebra', 'Probabilidade', 'Equações', 'Estatística']

// Radar chart
const radarRef = ref<HTMLCanvasElement | null>(null)
let radarInstancia: Chart | null = null

const criarRadar = () => {
  if (!radarRef.value) return
  const ctx = radarRef.value.getContext('2d')
  if (!ctx) return

  if (radarInstancia) radarInstancia.destroy()

  const dados = dadosCompetenciasPorPeriodo[periodoCompetencias.value] || dadosCompetenciasPorPeriodo['ano-todo']

  radarInstancia = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: competenciasRotulos,
      datasets: [
        {
          label: aluno.nome,
          data: dados.aluno,
          borderColor: '#1132d4',
          backgroundColor: 'rgba(17, 50, 212, 0.15)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#1132d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Média da Turma',
          data: dados.turma,
          borderColor: '#d1d5db',
          backgroundColor: 'rgba(209, 213, 219, 0.15)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#d1d5db',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2.5,
            color: '#9ca3af',
            font: { size: 10 },
            backdropColor: 'transparent'
          },
          grid: { color: '#f1f3f5' },
          angleLines: { color: '#e5e7eb' },
          pointLabels: {
            color: '#6b7280',
            font: { size: 11, weight: '500' }
          }
        }
      }
    }
  })
}

onMounted(() => {
  criarRadar()
})

watch(periodoCompetencias, () => {
  criarRadar()
})

const corGrupoTopico = (nivel: string) => {
  if (nivel === 'critico') return 'text-red-600'
  if (nivel === 'desenvolvimento') return 'text-yellow-600'
  return 'text-green-600'
}

const classeTagTopico = (nivel: string) => {
  if (nivel === 'critico') return 'border-red-200 bg-red-50 text-red-700'
  if (nivel === 'desenvolvimento') return 'border-yellow-200 bg-yellow-50 text-yellow-700'
  return 'border-green-200 bg-green-50 text-green-700'
}

const varianteStatus = (status: string) => {
  const map: Record<string, 'dominado' | 'em-progresso' | 'em-risco'> = {
    'em_evolucao': 'em-progresso',
    'excelente': 'dominado',
    'atencao': 'em-risco'
  }
  return map[status] || 'em-progresso'
}

// TODO: substituir por useFetch() quando conectar ao backend
const aluno = {
  nome: 'Ana Silva',
  iniciais: 'AS',
  avatar: '',
  status: 'em_evolucao',
  statusTexto: 'Em Evolução',
  serie: '8º Ano B',
  disciplina: 'Matemática',
  dataUltimaProva: '12 Out',
  gruposTopicos: [
    {
      nivel: 'critico',
      rotulo: 'Crítico (Revisar Urgente)',
      topicos: ['Equações de 1º grau', 'Funções']
    },
    {
      nivel: 'desenvolvimento',
      rotulo: 'Em Desenvolvimento',
      topicos: ['Regra de Três', 'Porcentagem', 'Álgebra Básica']
    },
    {
      nivel: 'dominado',
      rotulo: 'Domina',
      topicos: ['Frações', 'Geometria Plana', 'Probabilidade', 'Conjuntos']
    }
  ],
  provas: [
    {
      id: 'prova-3tri',
      titulo: 'Prova Mensal - 3º Tri',
      data: '12 Out 2023',
      categoria: 'Álgebra',
      nota: 4.5
    },
    {
      id: 'lista-04',
      titulo: 'Lista de Exercícios 04',
      data: '28 Set 2023',
      categoria: 'Funções',
      nota: 6.8
    },
    {
      id: 'trabalho-grupo',
      titulo: 'Trabalho em Grupo',
      data: '15 Set 2023',
      categoria: 'Geometria',
      nota: 9.5
    },
    {
      id: 'simulado',
      titulo: 'Simulado Nacional',
      data: '01 Set 2023',
      categoria: 'Geral',
      nota: 8.0
    }
  ]
}

const manipularBusca = (query: string) => {
  console.log('Busca:', query)
}

const gerarPlano = () => {
  console.log('Gerar plano personalizado')
}

const gerandoPlano = ref(false)
const planoGerado = ref(false)
const progressoPlano = ref(0)
const etapaPlano = ref('')

const etapasPlano = [
  { progresso: 15, texto: 'Analisando dados...' },
  { progresso: 40, texto: 'Identificando lacunas...' },
  { progresso: 65, texto: 'Gerando atividades...' },
  { progresso: 85, texto: 'Montando plano...' },
  { progresso: 100, texto: 'Concluído!' }
]

const gerarPlanoAtividades = () => {
  gerandoPlano.value = true
  planoGerado.value = false
  progressoPlano.value = 0
  etapaPlano.value = etapasPlano[0].texto

  let i = 0
  const avancar = () => {
    if (i >= etapasPlano.length) return
    progressoPlano.value = etapasPlano[i].progresso
    etapaPlano.value = etapasPlano[i].texto
    i++
    if (i < etapasPlano.length) {
      setTimeout(avancar, 800 + Math.random() * 600)
    } else {
      setTimeout(() => {
        gerandoPlano.value = false
        planoGerado.value = true
      }, 1200)
    }
  }
  setTimeout(avancar, 400)
}

const exportarPDF = () => {
  console.log('Exportar diagnóstico em PDF')
}

const compartilharDiagnostico = () => {
  console.log('Compartilhar diagnóstico')
}
</script>
