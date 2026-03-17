<template>
  <div>
        <!-- Loading -->
        <Carregando v-if="loadingPage" texto="Carregando perfil do aluno..." />

        <template v-else-if="alunoData">
        <!-- Header do Aluno -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
          <div class="flex items-center gap-5">
            <Avatar
              :image="alunoData.avatar_url || ''"
              :alt="alunoData.full_name || ''"
              :size="72"
            />
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-black text-gray-900">{{ alunoData.full_name || 'Sem nome' }}</h1>
                <Etiqueta :variante="statusVariante">
                  {{ statusTexto }}
                </Etiqueta>
              </div>
              <p class="text-base text-gray-500 mt-1">{{ turmaData?.name || '' }}{{ turmaData?.grade_level ? ` · ${turmaData.grade_level}` : '' }}</p>
              <div v-if="ultimaNota" class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <Icone :tamanho="14">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </Icone>
                  Última avaliação: {{ ultimaNota }}
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
              <h2 class="text-lg font-bold text-gray-900">Performance Geral</h2>
            </div>

            <div v-if="dadosPerformance.rotulos.length === 0" class="w-full h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
              <span class="text-3xl mb-2">📈</span>
              <p class="text-sm font-medium text-gray-500">Sem dados de notas</p>
            </div>
            <ClientOnly v-else>
              <GraficoPerformance :dados="dadosPerformance" />
              <template #fallback>
                <Carregando texto="Carregando gráfico..." classe="w-full h-64 bg-gray-50 rounded-lg" />
              </template>
            </ClientOnly>
          </div>

          <!-- Análise de Competências (MOCK — sem tabela topic_proficiency) -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-lg font-bold text-gray-900">Análise de Competências</h2>
            </div>

            <!-- Legenda -->
            <div class="flex items-center gap-5 mb-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                <span class="text-xs text-gray-600">{{ alunoData.full_name }}</span>
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
                <Carregando texto="Carregando gráfico..." classe="w-full h-64 bg-gray-50 rounded-lg" />
              </template>
            </ClientOnly>
          </div>

        </div>

        <!-- Nuvem de Tópicos (MOCK) -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 class="text-lg font-bold text-gray-900">Nuvem de Tópicos</h2>
          <p class="text-sm text-gray-500 mt-1 mb-5">Proficiência por tema</p>

          <div class="flex flex-wrap gap-8">
            <div v-for="grupo in gruposTopicosMock" :key="grupo.nivel">
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

          <div v-if="provasRecentes.length === 0" class="py-6 text-center bg-white border border-gray-200 rounded-xl">
            <p class="text-sm text-gray-500">Nenhuma prova corrigida nesta turma.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CartaoProva
              v-for="prova in provasRecentes"
              :key="prova.id"
              :titulo="prova.titulo"
              :data="prova.data"
              :categoria="prova.categoria"
              :nota="prova.nota"
            />
          </div>
        </div>
        </template>
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

const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const { fetchUser } = useUsers()
const { fetchClass } = useClasses()
const { fetchStudentScoresOverTime } = useSubmissions()

const loadingPage = ref(true)
const alunoData = ref<any>(null)
const turmaData = ref<any>(null)
const rawSubmissions = ref<any[]>([])
const dadosPerformance = ref<{ rotulos: string[]; valores: number[] }>({ rotulos: [], valores: [] })

// Format date
const formatarData = (dateStr: string) => {
  const d = new Date(dateStr)
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
}

// Status based on average
const mediaAluno = computed(() => {
  if (rawSubmissions.value.length === 0) return 0
  return rawSubmissions.value.reduce((acc, s) => {
    const maxScore = s.assignments?.max_score || 10
    return acc + (s.score / maxScore) * 10
  }, 0) / rawSubmissions.value.length
})

const statusVariante = computed(() => {
  if (mediaAluno.value >= 7) return 'dominado' as const
  if (mediaAluno.value >= 5) return 'em-progresso' as const
  return 'em-risco' as const
})

const statusTexto = computed(() => {
  if (mediaAluno.value >= 7) return 'Bom Desempenho'
  if (mediaAluno.value >= 5) return 'Em Evolução'
  return 'Necessita Atenção'
})

const ultimaNota = computed(() => {
  if (rawSubmissions.value.length === 0) return ''
  const last = rawSubmissions.value[0]
  if (!last.graded_at) return ''
  const d = new Date(last.graded_at)
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${d.getDate()} ${meses[d.getMonth()]}`
})

// Provas recentes (from submissions in this class)
const provasRecentes = computed(() =>
  rawSubmissions.value.slice(0, 4).map(s => {
    const maxScore = s.assignments?.max_score || 10
    return {
      id: s.id,
      titulo: s.assignments?.title || 'Avaliação',
      data: s.graded_at ? formatarData(s.graded_at) : '',
      categoria: s.assignments?.subjects?.name || 'Geral',
      nota: Math.round((s.score / maxScore) * 100) / 10
    }
  })
)

// Radar chart (MOCK — sem tabela topic_proficiency)
const competenciasRotulos = ['Geometria', 'Funções', 'Álgebra', 'Probabilidade', 'Equações', 'Estatística']
const radarRef = ref<HTMLCanvasElement | null>(null)
let radarInstancia: Chart | null = null

const criarRadar = () => {
  if (!radarRef.value) return
  const ctx = radarRef.value.getContext('2d')
  if (!ctx) return

  if (radarInstancia) radarInstancia.destroy()

  radarInstancia = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: competenciasRotulos,
      datasets: [
        {
          label: alunoData.value?.full_name || 'Aluno',
          data: [7.8, 4.5, 6.2, 8.5, 5.0, 7.0],
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
          data: [6.5, 6.0, 6.8, 7.0, 6.2, 6.5],
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

// Topic groups (MOCK)
const gruposTopicosMock = [
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
]

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

const gerarPlano = () => {
  // TODO: implementar geração de plano personalizado
}

// Init
onMounted(async () => {
  const [userData, classData] = await Promise.all([
    fetchUser(alunoId),
    fetchClass(turmaId)
  ])

  // Verificar que aluno e turma pertencem à mesma escola
  if (!userData || userData.school_id !== usuario.value.schoolId) {
    loadingPage.value = false
    return
  }
  if (!classData || classData.school_id !== usuario.value.schoolId) {
    loadingPage.value = false
    return
  }

  alunoData.value = userData
  turmaData.value = classData

  // Fetch submissions for this student in this class's assignments
  const { data: classAssignments } = await supabase
    .from('atividades')
    .select('id')
    .eq('class_id', turmaId)

  if (classAssignments && classAssignments.length > 0) {
    const assignmentIds = classAssignments.map((a: any) => a.id)
    const { data: subs } = await supabase
      .from('envios')
      .select('*, atividades(id, title, max_score, subject_id, disciplinas(id, name))')
      .eq('student_id', alunoId)
      .in('assignment_id', assignmentIds)
      .not('score', 'is', null)
      .order('graded_at', { ascending: false })
    rawSubmissions.value = (subs || []) as any[]
  }

  // Fetch performance chart data
  dadosPerformance.value = await fetchStudentScoresOverTime(alunoId)

  loadingPage.value = false

  // Create radar after DOM update
  nextTick(() => criarRadar())
})
</script>
