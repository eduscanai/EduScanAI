<template>
  <div>
    <div class="mb-8">
      <h1 class="text-heading-1">Quadro de Notas</h1>
      <p class="text-body text-text-secondary mt-1">Visualize e aprove as notas dos alunos</p>
    </div>

    <!-- Filtros -->
    <Cartao class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroTurma"
            @update:modelValue="filtroTurma = $event as string"
            rotulo="Turma"
            texto-reservado="Selecione a turma"
            :opcoes="opcoesTurma"
          />
        </div>
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroPeriodo"
            @update:modelValue="filtroPeriodo = $event as string"
            rotulo="Trimestre"
            texto-reservado="Selecione o trimestre"
            :opcoes="opcoesPeriodo"
          />
        </div>
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroDisciplina"
            @update:modelValue="filtroDisciplina = $event as string"
            rotulo="Disciplina"
            texto-reservado="Todas"
            :opcoes="opcoesDisciplina"
          />
        </div>
      </div>
    </Cartao>

    <!-- Estado vazio -->
    <Cartao v-if="!filtroTurma || !filtroPeriodo">
      <div class="py-12 text-center">
        <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </Icone>
        <p class="text-body text-text-secondary">Selecione uma turma e um trimestre</p>
      </div>
    </Cartao>

    <!-- Loading -->
    <Cartao v-else-if="loading">
      <Carregando texto="Carregando notas..." />
    </Cartao>

    <!-- Quadro de notas -->
    <template v-else>
      <div v-if="dadosFiltrados.length === 0">
        <Cartao>
          <div class="py-12 text-center">
            <p class="text-body text-text-secondary">Nenhum aluno ou atividade encontrada neste período</p>
          </div>
        </Cartao>
      </div>

      <div v-else v-for="disc in disciplinasVisiveis" :key="disc.subjectId" class="mb-6">
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">{{ disc.subjectName }}</h2>
            <div class="flex items-center gap-2">
              <button
                @click="salvarTodasNotas(disc.subjectId)"
                :disabled="salvando"
                class="btn-outline text-sm"
              >
                {{ salvando ? 'Salvando...' : 'Salvar Notas' }}
              </button>
              <button
                @click="confirmarAprovacao(disc.subjectId, disc.subjectName)"
                :disabled="salvando"
                class="btn-primary text-sm"
              >
                Aprovar Todas
              </button>
            </div>
          </div>

          <!-- Tabela de notas -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-3 font-semibold text-gray-700 sticky left-0 bg-white min-w-[180px]">Aluno</th>
                  <th
                    v-for="asgn in disc.assignments"
                    :key="asgn.id"
                    class="text-center py-3 px-2 font-medium text-gray-600 min-w-[80px]"
                    :title="asgn.title + (asgn.categoryName ? ` (${asgn.categoryName})` : '')"
                  >
                    <div class="truncate max-w-[80px]">{{ asgn.title }}</div>
                    <div v-if="asgn.categoryName" class="text-[10px] text-gray-400 font-normal">{{ asgn.categoryName }}</div>
                  </th>
                  <th class="text-center py-3 px-3 font-semibold text-primary-600 min-w-[80px]">Média</th>
                  <th class="text-center py-3 px-3 font-semibold text-primary-600 min-w-[90px]">Nota Final</th>
                  <th class="text-center py-3 px-3 font-semibold text-gray-700 min-w-[90px]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="aluno in dadosFiltrados"
                  :key="aluno.studentId"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-3 px-3 font-medium text-gray-900 sticky left-0 bg-white">
                    {{ aluno.studentName }}
                  </td>
                  <td
                    v-for="asgn in disc.assignments"
                    :key="asgn.id"
                    class="text-center py-3 px-2"
                  >
                    <span :class="corNota(getScore(aluno, disc.subjectId, asgn.id), asgn.maxScore)">
                      {{ formatScore(getScore(aluno, disc.subjectId, asgn.id)) }}
                    </span>
                  </td>
                  <td class="text-center py-3 px-3">
                    <span :class="['font-semibold', corMedia(getMedia(aluno, disc.subjectId))]">
                      {{ formatMedia(getMedia(aluno, disc.subjectId)) }}
                    </span>
                  </td>
                  <td class="text-center py-3 px-3">
                    <input
                      type="number"
                      :value="getNotaFinal(aluno, disc.subjectId)"
                      @change="setNotaFinal(aluno.studentId, disc.subjectId, Number(($event.target as HTMLInputElement).value))"
                      class="w-16 form-input text-sm text-center py-1 px-2 mx-auto"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </td>
                  <td class="text-center py-3 px-3">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(aluno, disc.subjectId)]">
                      {{ getStatusLabel(aluno, disc.subjectId) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Cartao>
      </div>
    </template>

    <!-- Diálogo de aprovação -->
    <DialogoConfirmacao
      :esta-aberto="dialogoAprovacao.visivel"
      titulo="Aprovar notas"
      :mensagem="dialogoAprovacao.mensagem"
      variante="info"
      texto-confirmar="Aprovar"
      @confirmar="executarAprovacao"
      @cancelar="dialogoAprovacao.visivel = false"
    />

    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      :mensagem="notificacao.mensagem"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'collaborator']
})

const { classes, fetchClasses } = useClasses()
const { gradingPeriods, fetchGradingPeriods } = useGradingPeriods()
const { academicYears, fetchAcademicYears } = useAcademicYear()
const { fetchClassBoletim, saveReportCard, approveReportCards, loading } = useBoletim()

const filtroTurma = ref('')
const filtroPeriodo = ref('')
const filtroDisciplina = ref('')
const salvando = ref(false)

// Dados do boletim
const dadosBoletim = ref<any[]>([])

// Edições de nota final pendentes
const edicoes = ref<Map<string, number>>(new Map())

const opcoesTurma = computed(() =>
  classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
)

const opcoesPeriodo = computed(() =>
  gradingPeriods.value.map(p => ({ rotulo: p.name, valor: p.id }))
)

// Disciplinas disponíveis nos dados
const disciplinasDosDados = computed(() => {
  const map = new Map<string, string>()
  for (const aluno of dadosBoletim.value) {
    for (const s of aluno.subjects) {
      map.set(s.subjectId, s.subjectName)
    }
  }
  return [...map.entries()].map(([id, name]) => ({ subjectId: id, subjectName: name }))
})

const opcoesDisciplina = computed(() => [
  { rotulo: 'Todas', valor: '' },
  ...disciplinasDosDados.value.map(d => ({ rotulo: d.subjectName, valor: d.subjectId }))
])

// Disciplinas visíveis (filtradas)
const disciplinasVisiveis = computed(() => {
  if (!dadosBoletim.value.length) return []

  let discs = disciplinasDosDados.value
  if (filtroDisciplina.value) {
    discs = discs.filter(d => d.subjectId === filtroDisciplina.value)
  }

  // Enriquecer com a lista de atividades
  return discs.map(d => {
    const assignments: any[] = []
    const seen = new Set<string>()
    for (const aluno of dadosBoletim.value) {
      const subj = aluno.subjects.find((s: any) => s.subjectId === d.subjectId)
      if (subj) {
        for (const a of subj.assignments) {
          if (!seen.has(a.id)) {
            seen.add(a.id)
            assignments.push(a)
          }
        }
      }
    }
    return { ...d, assignments }
  })
})

const dadosFiltrados = computed(() => dadosBoletim.value)

// Helpers para acessar dados do aluno
const getScore = (aluno: any, subjectId: string, assignmentId: string) => {
  const subj = aluno.subjects.find((s: any) => s.subjectId === subjectId)
  if (!subj) return null
  const asgn = subj.assignments.find((a: any) => a.id === assignmentId)
  return asgn?.score ?? null
}

const getMedia = (aluno: any, subjectId: string) => {
  const subj = aluno.subjects.find((s: any) => s.subjectId === subjectId)
  return subj?.calculatedAverage ?? null
}

const getNotaFinal = (aluno: any, subjectId: string) => {
  const key = `${aluno.studentId}_${subjectId}`
  if (edicoes.value.has(key)) return edicoes.value.get(key)
  const subj = aluno.subjects.find((s: any) => s.subjectId === subjectId)
  return subj?.reportCard?.final_grade ?? subj?.calculatedAverage ?? null
}

const setNotaFinal = (studentId: string, subjectId: string, value: number) => {
  edicoes.value.set(`${studentId}_${subjectId}`, value)
}

const getStatus = (aluno: any, subjectId: string) => {
  const subj = aluno.subjects.find((s: any) => s.subjectId === subjectId)
  return subj?.reportCard?.status || 'pending'
}

const getStatusClass = (aluno: any, subjectId: string) => {
  return getStatus(aluno, subjectId) === 'approved'
    ? 'bg-green-50 text-green-700'
    : 'bg-amber-50 text-amber-700'
}

const getStatusLabel = (aluno: any, subjectId: string) => {
  return getStatus(aluno, subjectId) === 'approved' ? 'Aprovado' : 'Pendente'
}

// Formatação
const formatScore = (score: number | null) => {
  if (score === null) return '-'
  return score % 1 === 0 ? score.toString() : score.toFixed(1)
}

const formatMedia = (media: number | null) => {
  if (media === null) return '-'
  return media.toFixed(1)
}

const corNota = (score: number | null, maxScore: number) => {
  if (score === null) return 'text-gray-400'
  const normalized = (score / maxScore) * 10
  if (normalized >= 7) return 'text-green-600 font-medium'
  if (normalized >= 5) return 'text-amber-600 font-medium'
  return 'text-critical-500 font-medium'
}

const corMedia = (media: number | null) => {
  if (media === null) return 'text-gray-400'
  if (media >= 7) return 'text-green-600'
  if (media >= 5) return 'text-amber-600'
  return 'text-critical-500'
}

// Salvar notas de uma disciplina
const salvarTodasNotas = async (subjectId: string) => {
  salvando.value = true
  try {
    for (const aluno of dadosBoletim.value) {
      const subj = aluno.subjects.find((s: any) => s.subjectId === subjectId)
      if (!subj) continue

      const key = `${aluno.studentId}_${subjectId}`
      const notaFinal = edicoes.value.get(key) ?? subj.calculatedAverage

      await saveReportCard({
        student_id: aluno.studentId,
        class_id: filtroTurma.value,
        subject_id: subjectId,
        grading_period_id: filtroPeriodo.value,
        calculated_average: subj.calculatedAverage,
        final_grade: notaFinal
      })
    }
    edicoes.value.clear()
    await carregarDados()
    mostrarNotificacao('sucesso', 'Notas salvas com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar notas')
  } finally {
    salvando.value = false
  }
}

// Aprovar notas
const dialogoAprovacao = ref({ visivel: false, mensagem: '', subjectId: '' })

const confirmarAprovacao = (subjectId: string, subjectName: string) => {
  dialogoAprovacao.value = {
    visivel: true,
    mensagem: `Aprovar todas as notas de "${subjectName}"? Os alunos poderão visualizar o boletim.`,
    subjectId
  }
}

const executarAprovacao = async () => {
  const { subjectId } = dialogoAprovacao.value
  dialogoAprovacao.value.visivel = false
  salvando.value = true

  try {
    // Primeiro salvar notas pendentes
    await salvarTodasNotas(subjectId)

    // Buscar IDs dos report_cards desta disciplina
    const ids = dadosBoletim.value
      .map((a: any) => a.subjects.find((s: any) => s.subjectId === subjectId)?.reportCard?.id)
      .filter(Boolean) as string[]

    if (ids.length > 0) {
      await approveReportCards(ids)
    }

    await carregarDados()
    mostrarNotificacao('sucesso', 'Notas aprovadas! Alunos podem visualizar o boletim.')
  } catch {
    mostrarNotificacao('critico', 'Erro ao aprovar notas')
  } finally {
    salvando.value = false
  }
}

// Carregar dados
const carregarDados = async () => {
  if (!filtroTurma.value || !filtroPeriodo.value) return
  dadosBoletim.value = await fetchClassBoletim(filtroTurma.value, filtroPeriodo.value)
}

watch([filtroTurma, filtroPeriodo], () => {
  edicoes.value.clear()
  filtroDisciplina.value = ''
  carregarDados()
})

// Notificação
const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await Promise.all([fetchClasses(), fetchAcademicYears()])
  // Carregar períodos do ano corrente
  const anoCorrente = academicYears.value.find(a => a.is_current)
  if (anoCorrente) {
    await fetchGradingPeriods(anoCorrente.id)
  }
})
</script>
