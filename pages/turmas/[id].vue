<template>
  <div>
    <!-- Loading -->
    <Carregando v-if="loadingPage" texto="Carregando turma..." />

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

            <div v-else class="-mx-6">
              <TabelaDados :colunas="colunasAlunos" :dados="alunosTabela" compacto>
                <template #celula-nome="{ linha }">
                  <div
                    class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    @click="navigateTo(`/turmas/${turmaId}/alunos/${linha.id}`)"
                  >
                    <Avatar
                      :image="linha.avatar || ''"
                      :alt="linha.nome"
                      :size="28"
                    />
                    <span class="text-xs font-semibold text-primary-500 hover:text-primary-600">{{ linha.nome }}</span>
                  </div>
                </template>

                <template #celula-nota="{ linha }">
                  <span
                    v-if="linha.nota !== null"
                    class="px-2 py-0.5 rounded-md text-xs font-bold text-white"
                    :class="classeCorNota(linha.nota)"
                  >
                    {{ linha.nota }}
                  </span>
                  <span v-else class="text-xs text-gray-400">—</span>
                </template>

                <template #celula-avaliacoes="{ linha }">
                  <span class="text-xs text-gray-600">{{ linha.avaliacoes }}</span>
                </template>

                <template #celula-acoes="{ linha }">
                  <button
                    class="text-xs font-semibold text-primary-500 hover:text-primary-600"
                    @click="navigateTo(`/turmas/${turmaId}/alunos/${linha.id}`)"
                  >
                    Ver Base Individual
                  </button>
                </template>
              </TabelaDados>
            </div>
          </div>

        </div>

        <!-- SIDEBAR DIREITA (1/3) -->
        <div class="flex flex-col gap-6">

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
              <span class="text-sm text-gray-700">Disciplinas</span>
              <span class="text-sm font-bold text-gray-900">{{ disciplinasGrid.length }}</span>
            </div>

            <div class="flex justify-between items-center mb-2 mt-4">
              <span class="text-sm text-gray-700">Professores</span>
              <span class="text-sm font-bold text-gray-900">{{ classTeachers.length }}</span>
            </div>
          </div>

          <!-- Disciplinas e Professores -->
          <div class="bg-white border border-gray-200 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disciplinas e Professores</p>
              <button
                v-if="isAdmin"
                @click="abrirModalVincular"
                class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                title="Vincular disciplina e professor"
              >
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </Icone>
              </button>
            </div>

            <div v-if="disciplinasGrid.length === 0" class="py-4 text-center">
              <p class="text-xs text-gray-400">Nenhuma disciplina vinculada</p>
            </div>

            <div v-else class="space-y-2.5">
              <div
                v-for="item in disciplinasGrid"
                :key="item.subjectId"
                class="flex items-start justify-between gap-2"
              >
                <div class="flex items-start gap-2 min-w-0 flex-1">
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full shrink-0 mt-1.5',
                      item.teacher ? 'bg-green-400' : 'bg-gray-300'
                    ]"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 leading-tight">{{ item.subjectName }}</p>
                    <p v-if="item.teacher" class="text-xs text-gray-500 truncate">{{ item.teacher.full_name }}</p>
                    <p v-else class="text-xs text-amber-500">Sem professor</p>
                  </div>
                </div>

                <button
                  v-if="isAdmin && item.teacher"
                  @click="confirmarRemover(item)"
                  class="p-1 rounded text-gray-300 hover:text-critical-500 transition-colors shrink-0"
                  title="Desvincular"
                >
                  <Icone :tamanho="14">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </Icone>
                </button>

                <select
                  v-if="isAdmin && !item.teacher"
                  class="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-500 shrink-0 max-w-[120px]"
                  @change="atribuirProfessor(item.subjectId, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">Atribuir</option>
                  <option
                    v-for="prof in professoresDisponiveis"
                    :key="prof.id"
                    :value="prof.id"
                  >
                    {{ prof.full_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Modal Vincular Professor + Disciplina -->
    <Modal
      :esta-aberto="modalVincularAberto"
      titulo="Vincular Disciplina e Professor"
      @fechar="modalVincularAberto = false"
    >
      <div class="space-y-4">
        <div>
          <CampoSelecao
            rotulo="Disciplina"
            :modelValue="formVinculo.subjectId"
            @update:modelValue="formVinculo.subjectId = $event as string"
            texto-reservado="Selecione a disciplina"
            :opcoes="opcoesDiscExtra"
          />
        </div>
        <div>
          <label class="form-label">Professor</label>
          <input
            type="text"
            v-model="buscaProfessor"
            class="form-input"
            placeholder="Buscar professor por nome..."
            @input="buscarProfessores"
          />
          <div v-if="resultadosBusca.length > 0 && !formVinculo.teacherId" class="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
            <button
              v-for="prof in resultadosBusca"
              :key="prof.id"
              @click="selecionarProfessor(prof)"
              class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Avatar :alt="prof.full_name" :image="prof.avatar_url" :size="28" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ prof.full_name }}</p>
                <p class="text-xs text-gray-500">{{ prof.email }}</p>
              </div>
            </button>
          </div>
          <div v-if="professorSelecionado" class="mt-2 flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-lg">
            <Avatar :alt="professorSelecionado.full_name" :image="professorSelecionado.avatar_url" :size="28" />
            <span class="text-sm font-medium text-primary-700 flex-1">{{ professorSelecionado.full_name }}</span>
            <button @click="limparProfessor" class="text-primary-400 hover:text-primary-600">
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </Icone>
            </button>
          </div>
        </div>
      </div>
      <template #rodape>
        <button @click="modalVincularAberto = false" class="btn-outline">Cancelar</button>
        <button
          @click="vincular"
          :disabled="!formVinculo.subjectId || !formVinculo.teacherId"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !formVinculo.subjectId || !formVinculo.teacherId }"
        >
          Vincular
        </button>
      </template>
    </Modal>

    <!-- Diálogo de confirmação -->
    <DialogoConfirmacao
      :esta-aberto="dialogoAberto"
      :titulo="dialogoTitulo"
      :mensagem="dialogoMensagem"
      variante="perigo"
      texto-confirmar="Remover"
      @confirmar="executarRemocao"
      @cancelar="dialogoAberto = false"
    />

    <!-- Notificação -->
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
import { useRoute, navigateTo } from '#app'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import CartaoTopico from '~/components/composed/CartaoTopico/CartaoTopico.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

const route = useRoute()
const turmaId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'collaborator']
})

const { usuario } = useUsuario()
const { isAdmin } = usePermissions()
const { fetchClass, fetchClassStudents, fetchClassTeachers, addTeacher, removeTeacher, fetchAvailableTeachers } = useClasses()
const { fetchClassStudentScores } = useSubmissions()
const { subjects, fetchSubjects } = useSubjects()
const { fetchCurriculum } = useGradeCurricula()

const loadingPage = ref(true)
const turmaData = ref<any>(null)
const classStudents = ref<any[]>([])
const classTeachers = ref<any[]>([])
const studentScores = ref<{ studentId: string; media: number; totalAvaliacoes: number }[]>([])
const curriculumSubjects = ref<{ id: string; name: string }[]>([])
const professoresDisponiveis = ref<any[]>([])

// --- Disciplinas Grid: merge curriculum + class_teachers ---
interface DisciplinaItem {
  subjectId: string
  subjectName: string
  teacher: { id: string; full_name: string; avatar_url: string | null } | null
  fromCurriculum: boolean
}

const disciplinasGrid = computed((): DisciplinaItem[] => {
  const items: DisciplinaItem[] = []
  const seen = new Set<string>()

  // 1. Start with curriculum subjects
  for (const cs of curriculumSubjects.value) {
    const ct = classTeachers.value.find(t => t.subjects?.id === cs.id)
    items.push({
      subjectId: cs.id,
      subjectName: cs.name,
      teacher: ct ? { id: ct.teacher_id, full_name: ct.profiles?.full_name || '', avatar_url: ct.profiles?.avatar_url || null } : null,
      fromCurriculum: true
    })
    seen.add(cs.id)
  }

  // 2. Add extra subjects from class_teachers not in curriculum
  for (const ct of classTeachers.value) {
    if (ct.subjects?.id && !seen.has(ct.subjects.id)) {
      items.push({
        subjectId: ct.subjects.id,
        subjectName: ct.subjects.name || '',
        teacher: { id: ct.teacher_id, full_name: ct.profiles?.full_name || '', avatar_url: ct.profiles?.avatar_url || null },
        fromCurriculum: false
      })
      seen.add(ct.subjects.id)
    }
  }

  return items.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
})

// --- Modal vincular ---
const modalVincularAberto = ref(false)
const buscaProfessor = ref('')
const resultadosBusca = ref<any[]>([])
const professorSelecionado = ref<any>(null)
const formVinculo = ref({ subjectId: '', teacherId: '' })
let timeoutBusca: ReturnType<typeof setTimeout> | null = null

const opcoesDiscExtra = computed(() =>
  subjects.value
    .filter(s => !classTeachers.value.some(ct => ct.subjects?.id === s.id))
    .map(s => ({ rotulo: s.name, valor: s.id }))
)

const abrirModalVincular = () => {
  formVinculo.value = { subjectId: '', teacherId: '' }
  buscaProfessor.value = ''
  resultadosBusca.value = []
  professorSelecionado.value = null
  modalVincularAberto.value = true
}

const buscarProfessores = () => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(async () => {
    if (!buscaProfessor.value.trim() || professorSelecionado.value) {
      resultadosBusca.value = []
      return
    }
    resultadosBusca.value = await fetchAvailableTeachers(usuario.value.schoolId, buscaProfessor.value)
  }, 300)
}

const selecionarProfessor = (prof: any) => {
  professorSelecionado.value = prof
  formVinculo.value.teacherId = prof.id
  buscaProfessor.value = prof.full_name
  resultadosBusca.value = []
}

const limparProfessor = () => {
  professorSelecionado.value = null
  formVinculo.value.teacherId = ''
  buscaProfessor.value = ''
}

const vincular = async () => {
  if (!formVinculo.value.subjectId || !formVinculo.value.teacherId) return
  try {
    await addTeacher(turmaId, formVinculo.value.teacherId, formVinculo.value.subjectId)
    modalVincularAberto.value = false
    mostrarNotificacao('sucesso', 'Professor vinculado com sucesso')
    classTeachers.value = await fetchClassTeachers(turmaId)
  } catch {
    mostrarNotificacao('critico', 'Erro ao vincular. Verifique se o vínculo já existe.')
  }
}

// Atribuir professor inline (dropdown na grid)
const atribuirProfessor = async (subjectId: string, teacherId: string) => {
  if (!teacherId) return
  try {
    await addTeacher(turmaId, teacherId, subjectId)
    mostrarNotificacao('sucesso', 'Professor atribuído com sucesso')
    classTeachers.value = await fetchClassTeachers(turmaId)
  } catch {
    mostrarNotificacao('critico', 'Erro ao atribuir professor')
  }
}

// --- Remover vínculo ---
const dialogoAberto = ref(false)
const dialogoTitulo = ref('')
const dialogoMensagem = ref('')
const remocaoPendente = ref<(() => Promise<void>) | null>(null)

const confirmarRemover = (item: DisciplinaItem) => {
  if (!item.teacher) return
  dialogoTitulo.value = 'Desvincular professor'
  dialogoMensagem.value = `Deseja remover "${item.teacher.full_name}" da disciplina "${item.subjectName}" nesta turma?`
  remocaoPendente.value = async () => {
    await removeTeacher(turmaId, item.teacher!.id, item.subjectId)
    classTeachers.value = await fetchClassTeachers(turmaId)
  }
  dialogoAberto.value = true
}

const executarRemocao = async () => {
  dialogoAberto.value = false
  try {
    if (remocaoPendente.value) await remocaoPendente.value()
    mostrarNotificacao('sucesso', 'Vínculo removido com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao remover vínculo')
  }
}

// --- Notificação ---
const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

// --- Dados existentes ---
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

const topicosMock = [
  { categoria: 'CONTEÚDO', nome: 'Tópico A', pontuacao: 82, tendencia: 'up' as const, rotuloTendencia: '+5% vs semana passada' },
  { categoria: 'CONTEÚDO', nome: 'Tópico B', pontuacao: 45, tendencia: 'stable' as const, rotuloTendencia: '— Estável' },
  { categoria: 'CONTEÚDO', nome: 'Tópico C', pontuacao: 35, tendencia: 'down' as const, rotuloTendencia: 'Crítico' }
]

// --- Init ---
onMounted(async () => {
  const [classData, students, teachers] = await Promise.all([
    fetchClass(turmaId),
    fetchClassStudents(turmaId),
    fetchClassTeachers(turmaId),
    fetchSubjects()
  ])
  turmaData.value = classData
  classStudents.value = students
  classTeachers.value = teachers

  // Load curriculum subjects if class has a grade_level
  if (classData?.grade_level) {
    const curriculum = await fetchCurriculum(classData.grade_level)
    curriculumSubjects.value = curriculum
      .filter(c => c.subjects)
      .map(c => ({ id: c.subjects!.id, name: c.subjects!.name }))
  }

  // Load available teachers for inline assignment
  if (usuario.value.schoolId) {
    professoresDisponiveis.value = await fetchAvailableTeachers(usuario.value.schoolId)
  }

  studentScores.value = await fetchClassStudentScores(turmaId)
  loadingPage.value = false
})
</script>
