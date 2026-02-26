<template>
  <div>
    <h1 class="text-heading-1 mb-8">Dashboard</h1>

    <!-- Filtros do Aluno -->
    <div v-if="isStudent" class="flex gap-4 mb-6">
      <CampoSelecao
        :modelValue="filtroDisciplina"
        @update:modelValue="filtroDisciplina = $event as string"
        texto-reservado="Todas as Disciplinas"
        :opcoes="opcoesDisciplina"
      />
      <CampoSelecao
        :modelValue="filtroPeriodo"
        @update:modelValue="filtroPeriodo = $event as string"
        texto-reservado="Ano Todo"
        :opcoes="opcoesPeriodo"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <CartaoEstatistica
        v-for="stat in statsVisiveis"
        :key="stat.rotulo"
        :rotulo="stat.rotulo"
        :valor="stat.valor"
        :mudanca="stat.mudanca"
        :formato="stat.formato"
        :icone="stat.icone"
        :fundo-icone="stat.fundoIcone"
      />
    </div>

    <!-- Cards por role -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Admin / Pedagogue -->
      <template v-if="isAdmin || isPedagogue">
        <!-- Painel da Escola -->
        <Cartao class="lg:col-span-2">
          <h2 class="text-heading-2 mb-6">Painel da Escola</h2>

          <div v-if="loadingSchool" class="py-4 text-center">
            <p class="text-sm text-gray-500">Carregando informações...</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Informações Gerais -->
            <div class="space-y-3">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informações</h3>
              <div>
                <p class="text-xs text-gray-500">Nome</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.name || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">CNPJ</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.cnpj || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Endereço</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.endereco || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">CEP</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.cep || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Telefone</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.telefone || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">E-mail</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.email || '-' }}</p>
              </div>
            </div>

            <!-- Equipe Diretiva -->
            <div class="space-y-3">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Equipe Diretiva</h3>
              <div>
                <p class="text-xs text-gray-500">Diretor(a)</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.diretor || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Vice-Diretor(a)</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.vice_diretor || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Coord. Pedagógica</p>
                <p class="text-sm font-medium text-gray-900">{{ school?.coord_pedagogica || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Ano Letivo</p>
                <p class="text-sm font-medium text-gray-900">{{ anoLetivo || '-' }}</p>
              </div>
            </div>

            <!-- Números -->
            <div class="space-y-3">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Números</h3>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-600">Turmas</span>
                <span class="text-lg font-bold text-gray-900">{{ counts.turmas }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-600">Alunos</span>
                <span class="text-lg font-bold text-gray-900">{{ counts.alunos }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-600">Professores</span>
                <span class="text-lg font-bold text-gray-900">{{ counts.professores }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-600">Pedagogos</span>
                <span class="text-lg font-bold text-gray-900">{{ counts.pedagogos }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm text-gray-600">Plano</span>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    school?.plan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-primary-50 text-primary-500'
                  ]"
                >
                  {{ school?.plan === 'free' ? 'Gratuito' : school?.plan || '-' }}
                </span>
              </div>
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Visão Geral das Turmas</h2>
          <p class="text-body text-text-secondary mb-4">Acompanhe o desempenho geral de todas as turmas.</p>
          <div v-if="turmasResumo.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma turma cadastrada.</p>
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="turma in turmasResumo"
              :key="turma.id"
              :to="`/turmas/${turma.id}`"
              class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 no-underline hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
            >
              <span class="text-sm font-medium text-gray-900">{{ turma.nome }}</span>
              <span class="text-xs text-gray-500">{{ turma.alunos }} alunos</span>
            </NuxtLink>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Atividades Recentes</h2>
          <p class="text-body text-text-secondary mb-4">Últimas atividades registradas na plataforma.</p>
          <div v-if="atividadesRecentes.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma atividade registrada.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="atividade in atividadesRecentes" :key="atividade.id" class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
              <span class="text-lg">{{ atividade.icone }}</span>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ atividade.descricao }}</p>
                <p class="text-xs text-gray-500">{{ atividade.tempo }}</p>
              </div>
            </div>
          </div>
        </Cartao>
      </template>

      <!-- Teacher -->
      <template v-if="isTeacher">
        <Cartao>
          <h2 class="text-heading-2 mb-4">Minhas Turmas</h2>
          <p class="text-body text-text-secondary mb-4">Turmas que você está lecionando atualmente.</p>
          <div v-if="minhasTurmas.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma turma vinculada.</p>
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="turma in minhasTurmas"
              :key="turma.id"
              :to="`/turmas/${turma.id}`"
              class="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors no-underline"
            >
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ turma.nome }}</p>
                <p class="text-xs text-gray-500">{{ turma.alunos }} alunos</p>
              </div>
            </NuxtLink>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Pendentes de Correção</h2>
          <p class="text-body text-text-secondary mb-4">Provas e atividades aguardando revisão.</p>
          <div v-if="pendentesCorrecao.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma correção pendente.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in pendentesCorrecao" :key="item.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.titulo }}</p>
                <p class="text-xs text-gray-500">{{ item.turma }}</p>
              </div>
              <span class="text-xs font-semibold text-warning-600 bg-warning-50 px-2 py-1 rounded-full">{{ item.aluno }}</span>
            </div>
          </div>
        </Cartao>
      </template>

      <!-- Student -->
      <template v-if="isStudent">
        <!-- Gráfico de Performance + Resumo -->
        <div class="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Cartao class="lg:col-span-2">
            <h2 class="text-heading-2 mb-4">Evolução de Desempenho</h2>
            <p class="text-body text-text-secondary mb-4">Acompanhe a evolução das suas notas ao longo do tempo.</p>
            <template v-if="filtroDisciplina">
              <div v-if="dadosPerformance.rotulos.length === 0" class="w-full h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <span class="text-3xl mb-2">📈</span>
                <p class="text-sm font-medium text-gray-500">Sem dados de notas</p>
                <p class="text-xs text-gray-400 mt-1">para esta disciplina</p>
              </div>
              <ClientOnly v-else>
                <GraficoPerformance :dados="dadosPerformance" />
                <template #fallback>
                  <div class="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p class="text-gray-500 text-sm">Carregando gráfico...</p>
                  </div>
                </template>
              </ClientOnly>
            </template>
            <div v-else class="w-full h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
              <span class="text-3xl mb-2">📊</span>
              <p class="text-sm font-medium text-gray-500">Selecione uma disciplina</p>
              <p class="text-xs text-gray-400 mt-1">para ver a evolução de desempenho</p>
            </div>
          </Cartao>

          <Cartao>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumo</p>
            <template v-if="filtroDisciplina">
              <div class="space-y-4">
                <div class="bg-green-50 rounded-xl p-4 text-center">
                  <p class="text-2xl font-black text-green-700">{{ melhorNota }}</p>
                  <p class="text-xs text-green-600">Melhor Nota</p>
                </div>
                <div class="bg-red-50 rounded-xl p-4 text-center">
                  <p class="text-2xl font-black text-red-700">{{ piorNota }}</p>
                  <p class="text-xs text-red-600">Pior Nota</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 text-center">
                  <p class="text-2xl font-black text-gray-900">{{ notasRecentes.length }}</p>
                  <p class="text-xs text-gray-600">Avaliações</p>
                </div>
                <div class="bg-primary-50 rounded-xl p-4 text-center">
                  <p class="text-2xl font-black text-primary-500">{{ mediaFormatada }}</p>
                  <p class="text-xs text-primary-400">Média Geral</p>
                </div>
              </div>
            </template>
            <div v-else class="h-full flex flex-col items-center justify-center py-12">
              <span class="text-3xl mb-2">📋</span>
              <p class="text-sm font-medium text-gray-500">Selecione uma disciplina</p>
              <p class="text-xs text-gray-400 mt-1">para ver o resumo</p>
            </div>
          </Cartao>
        </div>

        <!-- Áreas de Dificuldade (MOCK — sem tabela no banco ainda) -->
        <Cartao class="lg:col-span-2">
          <h2 class="text-heading-2 mb-4">Áreas de Dificuldade</h2>
          <p class="text-body text-text-secondary mb-4">Tópicos que precisam de mais atenção.</p>

          <div v-if="dificuldadesFiltradas.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma dificuldade identificada para os filtros selecionados.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="dif in dificuldadesFiltradas"
              :key="dif.nome"
              class="flex items-center gap-4 p-3 rounded-lg"
              :class="dif.nivel === 'critico' ? 'bg-red-50' : 'bg-yellow-50'"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-sm font-semibold text-gray-900">{{ dif.nome }}</p>
                  <Etiqueta :variante="dif.nivel === 'critico' ? 'em-risco' : 'em-progresso'" :mostrar-ponto="true">
                    {{ dif.nivel === 'critico' ? 'Crítico' : 'Em Desenvolvimento' }}
                  </Etiqueta>
                </div>
                <p class="text-xs text-gray-500">{{ dif.disciplina }}</p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm font-bold" :class="dif.nivel === 'critico' ? 'text-red-600' : 'text-yellow-600'">
                  {{ dif.pontuacao }}%
                </span>
                <div class="w-24">
                  <BarraProgresso
                    :valor="dif.pontuacao"
                    :maximo="100"
                    :altura="6"
                    :variante="dif.nivel === 'critico' ? 'critico' : 'aviso'"
                    :mostrar-porcentagem="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </Cartao>

        <!-- Atividades Pendentes + Notas Recentes -->
        <Cartao>
          <h2 class="text-heading-2 mb-4">Atividades Pendentes</h2>
          <p class="text-body text-text-secondary mb-4">Atividades que você precisa completar.</p>
          <div v-if="atividadesPendentes.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma atividade pendente.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in atividadesPendentes" :key="item.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.titulo }}</p>
                <p class="text-xs text-gray-500">{{ item.disciplina }}{{ item.prazo ? ` · Entrega: ${item.prazo}` : '' }}</p>
              </div>
              <Etiqueta variante="em-progresso">Pendente</Etiqueta>
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Notas Recentes</h2>
          <p class="text-body text-text-secondary mb-4">Suas últimas avaliações corrigidas.</p>
          <div v-if="notasRecentes.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma nota disponível.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="nota in notasRecentes" :key="nota.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ nota.avaliacao }}</p>
                <p class="text-xs text-gray-500">{{ nota.disciplina }}</p>
              </div>
              <span :class="['text-sm font-bold', nota.valor >= 7 ? 'text-success-600' : 'text-critical-500']">
                {{ nota.valor.toFixed(1) }}
              </span>
            </div>
          </div>
        </Cartao>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import GraficoPerformance from '~/components/composed/GraficoPerformance/GraficoPerformance.vue'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const user = useSupabaseUser()
const { isAdmin, isPedagogue, isTeacher, isStudent } = usePermissions()
const { school, counts, fetchSchool, fetchCounts } = useSchool()
const { classes, fetchClasses } = useClasses()
const { countAssignments, fetchRecentAssignments, fetchPendingForStudent } = useAssignments()
const { fetchGradedForStudent, fetchUngradedForTeacher, countUngradedForTeacher, fetchStudentScoresOverTime } = useSubmissions()
const { subjects, fetchSubjects } = useSubjects()

const loadingSchool = ref(true)
const anoLetivo = ref<string | null>(null)

// --- Shared data ---
const totalAssignments = ref(0)
const totalUngraded = ref(0)

// --- Admin/Pedagogue data ---
const turmasResumo = ref<{ id: string; nome: string; alunos: number }[]>([])
const atividadesRecentes = ref<{ id: string; icone: string; descricao: string; tempo: string }[]>([])

// --- Teacher data ---
const minhasTurmas = ref<{ id: string; nome: string; alunos: number }[]>([])
const pendentesCorrecao = ref<{ id: string; titulo: string; turma: string; aluno: string }[]>([])

// --- Student data ---
const filtroDisciplina = ref('')
const filtroPeriodo = ref('')
const rawPendentes = ref<any[]>([])
const rawNotas = ref<any[]>([])
const dadosPerformance = ref<{ rotulos: string[]; valores: number[] }>({ rotulos: [], valores: [] })

const opcoesPeriodo = [
  { rotulo: '1º Trimestre', valor: '1tri' },
  { rotulo: '2º Trimestre', valor: '2tri' },
  { rotulo: '3º Trimestre', valor: '3tri' }
]

const opcoesDisciplina = computed(() =>
  subjects.value.map(s => ({ rotulo: s.name, valor: s.id }))
)

// --- Fetch academic year ---
const fetchAnoLetivo = async () => {
  if (!usuario.value.schoolId) return
  const { data } = await supabase
    .from('academic_years')
    .select('name')
    .eq('school_id', usuario.value.schoolId)
    .eq('is_current', true)
    .single()
  anoLetivo.value = (data as any)?.name || null
}

// --- Fetch class student counts ---
const fetchTurmasComAlunos = async () => {
  const result: { id: string; nome: string; alunos: number }[] = []
  for (const c of classes.value) {
    const { count } = await supabase
      .from('class_students')
      .select('student_id', { count: 'exact', head: true })
      .eq('class_id', c.id)
    result.push({ id: c.id, nome: c.name, alunos: count || 0 })
  }
  return result
}

// --- Format time ago ---
const tempoAtras = (dateStr: string) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `Há ${diffMin} min`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `Há ${diffHrs}h`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Ontem'
  return `Há ${diffDays} dias`
}

// --- Format date ---
const formatarData = (dateStr: string | null) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

// --- INIT: Admin/Pedagogue ---
const initAdmin = async () => {
  await Promise.all([fetchSchool(), fetchCounts(), fetchAnoLetivo(), fetchClasses()])
  loadingSchool.value = false

  turmasResumo.value = await fetchTurmasComAlunos()
  totalAssignments.value = await countAssignments()

  const recent = await fetchRecentAssignments(5)
  atividadesRecentes.value = recent.map(a => ({
    id: a.id,
    icone: a.status === 'published' ? '📝' : a.status === 'closed' ? '✅' : '📋',
    descricao: `${a.title} — ${(a.classes as any)?.name || 'Sem turma'}`,
    tempo: tempoAtras(a.created_at)
  }))
}

// --- INIT: Teacher ---
const initTeacher = async () => {
  await fetchClasses()

  minhasTurmas.value = await fetchTurmasComAlunos()
  totalAssignments.value = await countAssignments()
  totalUngraded.value = await countUngradedForTeacher()

  const ungraded = await fetchUngradedForTeacher(10)
  pendentesCorrecao.value = ungraded.map((s: any) => ({
    id: s.id,
    titulo: s.assignments?.title || 'Sem título',
    turma: s.assignments?.classes?.name || '',
    aluno: s.profiles?.full_name || 'Aluno'
  }))
}

// --- INIT: Student ---
const initStudent = async () => {
  await fetchSubjects()

  const pending = await fetchPendingForStudent()
  rawPendentes.value = pending

  const graded = await fetchGradedForStudent(undefined, 20)
  rawNotas.value = graded
}

// --- Student computed data ---
const atividadesPendentes = computed(() => {
  return rawPendentes.value
    .filter(a => {
      const matchDisciplina = !filtroDisciplina.value || a.subject_id === filtroDisciplina.value
      return matchDisciplina
    })
    .map(a => ({
      id: a.id,
      titulo: a.title,
      disciplina: a.subjects?.name || 'Sem disciplina',
      prazo: formatarData(a.due_date)
    }))
})

const notasRecentes = computed(() => {
  return rawNotas.value
    .filter(s => {
      const matchDisciplina = !filtroDisciplina.value || s.assignments?.subject_id === filtroDisciplina.value
      return matchDisciplina
    })
    .map(s => {
      const maxScore = s.assignments?.max_score || 10
      return {
        id: s.id,
        avaliacao: s.assignments?.title || 'Avaliação',
        disciplina: s.assignments?.subjects?.name || 'Sem disciplina',
        valor: (s.score / maxScore) * 10
      }
    })
})

const mediaCalculada = computed(() => {
  const notas = notasRecentes.value
  if (notas.length === 0) return 0
  return Math.round(notas.reduce((acc: number, n) => acc + n.valor, 0) / notas.length * 10)
})

const melhorNota = computed(() => {
  const notas = notasRecentes.value
  if (notas.length === 0) return '-'
  return Math.max(...notas.map(n => n.valor)).toFixed(1)
})

const piorNota = computed(() => {
  const notas = notasRecentes.value
  if (notas.length === 0) return '-'
  return Math.min(...notas.map(n => n.valor)).toFixed(1)
})

const mediaFormatada = computed(() => {
  const notas = notasRecentes.value
  if (notas.length === 0) return '-'
  return (notas.reduce((acc, n) => acc + n.valor, 0) / notas.length).toFixed(1)
})

// --- Fetch performance chart when discipline changes ---
watch(filtroDisciplina, async (newVal) => {
  if (newVal && user.value) {
    const data = await fetchStudentScoresOverTime(user.value.id, newVal)
    dadosPerformance.value = data
  } else {
    dadosPerformance.value = { rotulos: [], valores: [] }
  }
})

// --- Stats ---
interface StatItem {
  rotulo: string
  valor: number | string
  mudanca?: number
  formato?: 'porcentagem'
  icone: string
  fundoIcone: string
}

const statsAdmin = computed((): StatItem[] => [
  { rotulo: 'Total de Alunos', valor: counts.value.alunos, icone: '👥', fundoIcone: 'bg-primary-50' },
  { rotulo: 'Turmas Ativas', valor: counts.value.turmas, icone: '📚', fundoIcone: 'bg-purple-50' },
  { rotulo: 'Professores', valor: counts.value.professores, icone: '👨‍🏫', fundoIcone: 'bg-green-50' },
  { rotulo: 'Avaliações', valor: totalAssignments.value, icone: '📝', fundoIcone: 'bg-blue-50' }
])

const totalStudentsTeacher = computed(() =>
  minhasTurmas.value.reduce((acc, t) => acc + t.alunos, 0)
)

const statsTeacher = computed((): StatItem[] => [
  { rotulo: 'Meus Alunos', valor: totalStudentsTeacher.value, icone: '👥', fundoIcone: 'bg-primary-50' },
  { rotulo: 'Minhas Turmas', valor: minhasTurmas.value.length, icone: '📚', fundoIcone: 'bg-purple-50' },
  { rotulo: 'Pendentes de Correção', valor: totalUngraded.value, icone: '📝', fundoIcone: 'bg-warning-50' },
  { rotulo: 'Avaliações', valor: totalAssignments.value, icone: '📊', fundoIcone: 'bg-blue-50' }
])

const statsStudent = computed((): StatItem[] => [
  { rotulo: 'Atividades Pendentes', valor: rawPendentes.value.length, icone: '📝', fundoIcone: 'bg-warning-50' },
  { rotulo: 'Nota Média', valor: mediaCalculada.value, formato: 'porcentagem' as const, icone: '📊', fundoIcone: 'bg-blue-50' },
  { rotulo: 'Avaliações Concluídas', valor: rawNotas.value.length, icone: '✅', fundoIcone: 'bg-green-50' },
  { rotulo: 'Disciplinas', valor: subjects.value.length, icone: '📚', fundoIcone: 'bg-purple-50' }
])

const statsVisiveis = computed(() => {
  if (isAdmin.value || isPedagogue.value) return statsAdmin.value
  if (isTeacher.value) return statsTeacher.value
  return statsStudent.value
})

// Dificuldades por disciplina (MOCK — sem tabela no banco ainda)
const todasDificuldades = [
  { nome: 'Equações de 1º Grau', disciplinaId: '', disciplina: 'Matemática', pontuacao: 35, nivel: 'critico' },
  { nome: 'Funções', disciplinaId: '', disciplina: 'Matemática', pontuacao: 42, nivel: 'critico' },
  { nome: 'Regra de Três', disciplinaId: '', disciplina: 'Matemática', pontuacao: 58, nivel: 'desenvolvimento' },
  { nome: 'Interpretação de Texto', disciplinaId: '', disciplina: 'Língua Portuguesa', pontuacao: 45, nivel: 'critico' },
  { nome: 'Concordância Verbal', disciplinaId: '', disciplina: 'Língua Portuguesa', pontuacao: 62, nivel: 'desenvolvimento' },
  { nome: 'Revolução Francesa', disciplinaId: '', disciplina: 'História', pontuacao: 50, nivel: 'desenvolvimento' },
  { nome: 'Cinemática', disciplinaId: '', disciplina: 'Física', pontuacao: 38, nivel: 'critico' }
]

const dificuldadesFiltradas = computed(() =>
  todasDificuldades.sort((a, b) => a.pontuacao - b.pontuacao)
)

// --- onMounted ---
onMounted(async () => {
  if (isAdmin.value || isPedagogue.value) {
    await initAdmin()
  }
  if (isTeacher.value) {
    await initTeacher()
  }
  if (isStudent.value) {
    await initStudent()
  }
})
</script>
