<template>
  <div>
        <!-- Loading -->
        <div v-if="loadingPage" class="py-12 text-center">
          <p class="text-sm text-gray-500">Carregando turma...</p>
        </div>

        <!-- Not found -->
        <div v-else-if="!turmaData" class="py-12 text-center">
          <p class="text-lg font-semibold text-gray-500">Turma não encontrada</p>
        </div>

        <template v-else>
        <!-- Header da página -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-black text-gray-900">{{ turmaData.name }}</h1>
            <p class="text-base text-gray-500 mt-1">
              {{ turmaData.grade_level || '' }}{{ turmaData.academic_years?.name ? ` · ${turmaData.academic_years.name}` : '' }}
            </p>
          </div>
        </div>

        <!-- Layout 2 colunas: conteúdo principal + sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- COLUNA PRINCIPAL (2/3) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Termômetro de Conteúdo (MOCK — sem tabela topic_proficiency) -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                  <Icone :tamanho="20">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </Icone>
                  <h2 class="text-xl font-bold text-gray-900">Termômetro de Conteúdo</h2>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CartaoTopico
                  v-for="topico in topicosMock"
                  :key="topico.nome"
                  :categoria="topico.categoria"
                  :nome="topico.nome"
                  :pontuacao="topico.pontuacao"
                  :tendencia="topico.tendencia"
                  :rotulo-tendencia="topico.rotuloTendencia"
                />
              </div>
            </div>

            <!-- Desempenho dos Alunos -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                  <Icone :tamanho="20">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </Icone>
                  <h2 class="text-xl font-bold text-gray-900">Desempenho dos Alunos</h2>
                </div>
              </div>

              <div v-if="alunosTabela.length === 0" class="py-6 text-center">
                <p class="text-sm text-gray-500">Nenhum aluno na turma.</p>
              </div>

              <TabelaDados v-else :colunas="colunasAlunos" :dados="alunosTabela">
                <template #celula-nome="{ linha }">
                  <div
                    class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                    @click="navigateTo(`/turmas/${turmaId}/alunos/${linha.id}`)"
                  >
                    <Avatar
                      :image="linha.avatar || ''"
                      :alt="linha.nome"
                      :size="32"
                    />
                    <span class="font-semibold text-primary-500 hover:text-primary-600">{{ linha.nome }}</span>
                  </div>
                </template>

                <template #celula-nota="{ linha }">
                  <span
                    v-if="linha.nota !== null"
                    class="px-3 py-1 rounded-lg text-sm font-bold text-white"
                    :class="classeCorNota(linha.nota)"
                  >
                    {{ linha.nota }}
                  </span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </template>

                <template #celula-avaliacoes="{ linha }">
                  <span class="text-sm text-gray-600">{{ linha.avaliacoes }}</span>
                </template>

                <template #celula-acoes="{ linha }">
                  <button
                    class="text-sm font-semibold text-primary-500 hover:text-primary-600"
                    @click="navigateTo(`/turmas/${turmaId}/alunos/${linha.id}`)"
                  >
                    Ver Base Individual
                  </button>
                </template>
              </TabelaDados>
            </div>

          </div>

          <!-- SIDEBAR DIREITA (1/3) -->
          <div class="flex flex-col gap-6">

            <!-- Ações Rápidas -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-4">
                <Icone :tamanho="20">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </Icone>
                <h2 class="text-lg font-bold text-gray-900">Ações Rápidas</h2>
              </div>

              <div class="flex flex-col gap-3">
                <Botao
                  variante="primario"
                  :largura-completa="true"
                  @click="abrirModalScan"
                >
                  <div class="flex flex-col items-start py-1">
                    <span class="font-semibold">Escanear Novas Provas</span>
                    <span class="text-xs opacity-90">Processar lote de avaliações</span>
                  </div>
                </Botao>

                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition"
                  @click="exportarPDF"
                >
                  <span class="text-sm text-gray-700">Exportar Relatório PDF</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </Icone>
                </button>
              </div>
            </div>

            <!-- Resumo da Turma -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumo da Turma</p>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-700">Média Geral</span>
                <span class="text-sm font-bold text-gray-900">{{ mediaTurma }}</span>
              </div>
              <BarraProgresso
                :valor="mediaTurmaPct"
                :maximo="100"
                :altura="6"
                variante="primario"
                :mostrar-porcentagem="false"
              />

              <div class="flex justify-between items-center mb-2 mt-4">
                <span class="text-sm text-gray-700">Alunos</span>
                <span class="text-sm font-bold text-gray-900">{{ classStudents.length }}</span>
              </div>

              <div class="flex justify-between items-center mb-2 mt-4">
                <span class="text-sm text-gray-700">Professores</span>
                <span class="text-sm font-bold text-gray-900">{{ classTeachers.length }}</span>
              </div>

              <div v-if="classTeachers.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                <div v-for="t in classTeachers" :key="t.teacher_id" class="flex items-center gap-2 py-1">
                  <Avatar :image="t.profiles?.avatar_url || ''" :alt="t.profiles?.full_name || ''" :size="24" />
                  <div>
                    <p class="text-xs font-medium text-gray-900">{{ t.profiles?.full_name }}</p>
                    <p class="text-xs text-gray-400">{{ t.subjects?.name || '' }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute, navigateTo } from '#app'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import CartaoTopico from '~/components/composed/CartaoTopico/CartaoTopico.vue'

const route = useRoute()
const turmaId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const { fetchClass, fetchClassStudents, fetchClassTeachers } = useClasses()
const { fetchClassStudentScores } = useSubmissions()

const loadingPage = ref(true)
const turmaData = ref<any>(null)
const classStudents = ref<any[]>([])
const classTeachers = ref<any[]>([])
const studentScores = ref<{ studentId: string; media: number; totalAvaliacoes: number }[]>([])

const colunasAlunos = [
  { chave: 'nome', rotulo: 'Nome do Aluno' },
  { chave: 'nota', rotulo: 'Média' },
  { chave: 'avaliacoes', rotulo: 'Avaliações' },
  { chave: 'acoes', rotulo: 'Ações' }
]

const classeCorNota = (nota: number) => {
  if (nota >= 7) return 'bg-green-500'
  if (nota >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Build student table
const alunosTabela = computed(() => {
  const scoreMap = new Map(studentScores.value.map(s => [s.studentId, s]))
  return classStudents.value.map(cs => {
    const score = scoreMap.get(cs.profiles?.id || cs.student_id)
    return {
      id: cs.profiles?.id || cs.student_id,
      nome: cs.profiles?.full_name || 'Sem nome',
      avatar: cs.profiles?.avatar_url || '',
      nota: score ? score.media : null,
      avaliacoes: score?.totalAvaliacoes || 0
    }
  }).sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1))
})

// Class average
const mediaTurma = computed(() => {
  const notas = alunosTabela.value.filter(a => a.nota !== null)
  if (notas.length === 0) return '—'
  const avg = notas.reduce((acc, a) => acc + (a.nota || 0), 0) / notas.length
  return avg.toFixed(1)
})

const mediaTurmaPct = computed(() => {
  const notas = alunosTabela.value.filter(a => a.nota !== null)
  if (notas.length === 0) return 0
  const avg = notas.reduce((acc, a) => acc + (a.nota || 0), 0) / notas.length
  return Math.round(avg * 10)
})

// Tópicos (MOCK — sem tabela topic_proficiency)
const topicosMock = [
  { categoria: 'CONTEÚDO', nome: 'Tópico A', pontuacao: 82, tendencia: 'up' as const, rotuloTendencia: '+5% vs semana passada' },
  { categoria: 'CONTEÚDO', nome: 'Tópico B', pontuacao: 45, tendencia: 'stable' as const, rotuloTendencia: '— Estável' },
  { categoria: 'CONTEÚDO', nome: 'Tópico C', pontuacao: 35, tendencia: 'down' as const, rotuloTendencia: 'Crítico' }
]

const abrirModalScan = () => {
  navigateTo(`/turmas/${turmaId}/escanear`)
}

const exportarPDF = () => {
  // TODO: implementar exportação PDF
}

// Init
onMounted(async () => {
  const [classData, students, teachers] = await Promise.all([
    fetchClass(turmaId),
    fetchClassStudents(turmaId),
    fetchClassTeachers(turmaId)
  ])
  turmaData.value = classData
  classStudents.value = students
  classTeachers.value = teachers

  // Fetch student scores
  studentScores.value = await fetchClassStudentScores(turmaId)
  loadingPage.value = false
})
</script>
