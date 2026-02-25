<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/classes"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">{{ turma?.name || 'Detalhes da Turma' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ turma?.grade_level ? turma.grade_level + ' · ' : '' }}{{ rotuloTurno(turma?.shift) }}
          {{ turma?.academic_years?.name ? ' · ' + turma.academic_years.name : '' }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando turma...</p>
    </div>

    <div v-else-if="turma">
      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button
          v-for="tab in abas"
          :key="tab.id"
          @click="abaAtiva = tab.id"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            abaAtiva === tab.id
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Aba Alunos -->
      <div v-if="abaAtiva === 'alunos'">
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Alunos Matriculados</h2>
            <button @click="abrirModalAluno" class="btn-primary text-sm flex items-center gap-1.5">
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </Icone>
              Vincular Aluno
            </button>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in alunos"
              :key="item.student_id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <Avatar
                  :alt="item.profiles?.full_name || 'Aluno'"
                  :image="item.profiles?.avatar_url"
                  :size="36"
                />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ item.profiles?.full_name || 'Sem nome' }}</p>
                  <p class="text-xs text-gray-500">{{ item.profiles?.email }}</p>
                </div>
              </div>
              <button
                @click="confirmarRemoverAluno(item)"
                class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
                title="Remover"
              >
                <Icone :tamanho="18">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </Icone>
              </button>
            </div>
            <p v-if="alunos.length === 0" class="py-8 text-center text-sm text-gray-500">
              Nenhum aluno vinculado a esta turma
            </p>
          </div>
        </Cartao>
      </div>

      <!-- Aba Professores -->
      <div v-if="abaAtiva === 'professores'">
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Professores Vinculados</h2>
            <button @click="abrirModalProfessor" class="btn-primary text-sm flex items-center gap-1.5">
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </Icone>
              Vincular Professor
            </button>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in professores"
              :key="`${item.teacher_id}-${item.subject_id}`"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <Avatar
                  :alt="item.profiles?.full_name || 'Professor'"
                  :image="item.profiles?.avatar_url"
                  :size="36"
                />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ item.profiles?.full_name || 'Sem nome' }}</p>
                  <p class="text-xs text-gray-500">{{ item.profiles?.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  {{ item.subjects?.name || '-' }}
                </span>
                <button
                  @click="confirmarRemoverProfessor(item)"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
                  title="Remover"
                >
                  <Icone :tamanho="18">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </Icone>
                </button>
              </div>
            </div>
            <p v-if="professores.length === 0" class="py-8 text-center text-sm text-gray-500">
              Nenhum professor vinculado a esta turma
            </p>
          </div>
        </Cartao>
      </div>

      <!-- Aba Info -->
      <div v-if="abaAtiva === 'info'">
        <Cartao>
          <h2 class="text-heading-3 mb-6">Informações da Turma</h2>

          <div class="space-y-4 max-w-xl">
            <div>
              <label for="turma-nome" class="form-label">Nome *</label>
              <input id="turma-nome" type="text" v-model="formInfo.name" class="form-input" />
              <p v-if="errosInfo.name" class="mt-1 text-xs text-critical-500">{{ errosInfo.name }}</p>
            </div>
            <div>
              <label for="turma-serie" class="form-label">Série / Nível</label>
              <input id="turma-serie" type="text" v-model="formInfo.grade_level" class="form-input" />
            </div>
            <div>
              <CampoSelecao
                rotulo="Turno"
                :modelValue="formInfo.shift"
                @update:modelValue="formInfo.shift = $event as string"
                texto-reservado="Selecione o turno"
                :opcoes="opcoesTurno"
              />
            </div>
            <div>
              <CampoSelecao
                rotulo="Ano Letivo"
                :modelValue="formInfo.academic_year_id"
                @update:modelValue="formInfo.academic_year_id = $event as string"
                texto-reservado="Selecione o ano letivo"
                :opcoes="opcoesAno"
              />
            </div>
          </div>

          <div class="flex items-center justify-end mt-8 pt-6 border-t border-gray-200">
            <button @click="salvarInfo" :disabled="loading" class="btn-primary">
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </Cartao>
      </div>
    </div>

    <!-- Turma não encontrada -->
    <Cartao v-else>
      <div class="text-center py-12">
        <p class="text-body text-text-secondary">Turma não encontrada</p>
        <NuxtLink to="/admin/classes" class="btn-primary mt-4 inline-block no-underline">Voltar para lista</NuxtLink>
      </div>
    </Cartao>

    <!-- Modal Vincular Aluno -->
    <Modal
      :esta-aberto="modalAlunoAberto"
      titulo="Vincular Aluno"
      @fechar="modalAlunoAberto = false"
    >
      <div class="mb-4">
        <input
          type="text"
          v-model="buscaAluno"
          class="form-input"
          placeholder="Buscar aluno por nome ou email..."
          @input="buscarAlunos"
        />
      </div>
      <div class="max-h-64 overflow-y-auto divide-y divide-gray-100">
        <button
          v-for="aluno in alunosDisponiveis"
          :key="aluno.id"
          @click="vincularAluno(aluno.id)"
          class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <Avatar :alt="aluno.full_name || 'Aluno'" :image="aluno.avatar_url" :size="32" />
          <div>
            <p class="text-sm font-medium text-gray-900">{{ aluno.full_name || 'Sem nome' }}</p>
            <p class="text-xs text-gray-500">{{ aluno.email }}</p>
          </div>
        </button>
        <p v-if="alunosDisponiveis.length === 0 && buscaAluno" class="py-6 text-center text-sm text-gray-500">
          Nenhum aluno encontrado
        </p>
        <p v-if="!buscaAluno" class="py-6 text-center text-sm text-gray-500">
          Digite para buscar alunos
        </p>
      </div>
    </Modal>

    <!-- Modal Vincular Professor -->
    <Modal
      :esta-aberto="modalProfessorAberto"
      titulo="Vincular Professor"
      @fechar="modalProfessorAberto = false"
    >
      <div class="space-y-4">
        <!-- Buscar professor -->
        <div>
          <label class="form-label">Professor</label>
          <input
            type="text"
            v-model="buscaProfessor"
            class="form-input"
            placeholder="Buscar professor por nome ou email..."
            @input="buscarProfessores"
          />
          <!-- Lista de resultados -->
          <div v-if="professoresDisponiveis.length > 0 && !professorSelecionado" class="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
            <button
              v-for="prof in professoresDisponiveis"
              :key="prof.id"
              @click="selecionarProfessor(prof)"
              class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Avatar :alt="prof.full_name || 'Professor'" :image="prof.avatar_url" :size="28" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ prof.full_name || 'Sem nome' }}</p>
                <p class="text-xs text-gray-500">{{ prof.email }}</p>
              </div>
            </button>
          </div>
          <!-- Professor selecionado -->
          <div v-if="professorSelecionado" class="mt-2 flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-lg">
            <Avatar :alt="professorSelecionado.full_name" :image="professorSelecionado.avatar_url" :size="28" />
            <span class="text-sm font-medium text-primary-700 flex-1">{{ professorSelecionado.full_name }}</span>
            <button @click="professorSelecionado = null; buscaProfessor = ''" class="text-primary-400 hover:text-primary-600">
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </Icone>
            </button>
          </div>
        </div>

        <!-- Selecionar disciplina -->
        <div>
          <CampoSelecao
            rotulo="Disciplina"
            :modelValue="disciplinaSelecionada"
            @update:modelValue="disciplinaSelecionada = $event as string"
            texto-reservado="Selecione a disciplina"
            :opcoes="opcoesDisciplina"
          />
        </div>
      </div>
      <template #rodape>
        <button @click="modalProfessorAberto = false" class="btn-outline">Cancelar</button>
        <button
          @click="vincularProfessor"
          :disabled="!professorSelecionado || !disciplinaSelecionada"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !professorSelecionado || !disciplinaSelecionada }"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const route = useRoute()
const classId = route.params.id as string
const { usuario } = useUsuario()

const {
  loading, fetchClass, updateClass,
  fetchClassStudents, addStudent, removeStudent,
  fetchClassTeachers, addTeacher, removeTeacher,
  fetchAvailableStudents, fetchAvailableTeachers
} = useClasses()

const { academicYears, fetchAcademicYears } = useAcademicYear()
const { subjects, fetchSubjects } = useSubjects()

const carregando = ref(true)
const turma = ref<any>(null)
const alunos = ref<any[]>([])
const professores = ref<any[]>([])

// Tabs
const abaAtiva = ref('alunos')
const abas = computed(() => [
  { id: 'alunos', label: 'Alunos', count: alunos.value.length },
  { id: 'professores', label: 'Professores', count: professores.value.length },
  { id: 'info', label: 'Informações' }
])

// Options
const opcoesTurno = [
  { rotulo: 'Matutino', valor: 'morning' },
  { rotulo: 'Vespertino', valor: 'afternoon' },
  { rotulo: 'Noturno', valor: 'evening' }
]

const opcoesAno = computed(() =>
  academicYears.value.map(a => ({ rotulo: a.name, valor: a.id }))
)

const opcoesDisciplina = computed(() =>
  subjects.value.map(s => ({ rotulo: s.name, valor: s.id }))
)

const rotuloTurno = (shift: string | null | undefined) => {
  if (!shift) return ''
  const mapa: Record<string, string> = { morning: 'Matutino', afternoon: 'Vespertino', evening: 'Noturno' }
  return mapa[shift] || shift
}

// --- Aba Info ---
const formInfo = ref({ name: '', grade_level: '', shift: '', academic_year_id: '' })
const errosInfo = ref<Record<string, string>>({})

const salvarInfo = async () => {
  errosInfo.value = {}
  if (!formInfo.value.name.trim()) {
    errosInfo.value.name = 'Nome é obrigatório'
    return
  }
  try {
    const updated = await updateClass(classId, {
      name: formInfo.value.name,
      grade_level: formInfo.value.grade_level || null,
      shift: formInfo.value.shift || null,
      academic_year_id: formInfo.value.academic_year_id || null
    })
    if (updated) turma.value = updated
    mostrarNotificacao('sucesso', 'Turma atualizada com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar')
  }
}

// --- Modal Vincular Aluno ---
const modalAlunoAberto = ref(false)
const buscaAluno = ref('')
const alunosDisponiveis = ref<any[]>([])

let timeoutBuscaAluno: ReturnType<typeof setTimeout> | null = null

const abrirModalAluno = () => {
  buscaAluno.value = ''
  alunosDisponiveis.value = []
  modalAlunoAberto.value = true
}

const buscarAlunos = () => {
  if (timeoutBuscaAluno) clearTimeout(timeoutBuscaAluno)
  timeoutBuscaAluno = setTimeout(async () => {
    if (!buscaAluno.value.trim()) {
      alunosDisponiveis.value = []
      return
    }
    const todos = await fetchAvailableStudents(usuario.value.schoolId, buscaAluno.value)
    // Filtrar alunos já vinculados
    const idsVinculados = new Set(alunos.value.map((a: any) => a.student_id))
    alunosDisponiveis.value = todos.filter(a => !idsVinculados.has(a.id))
  }, 300)
}

const vincularAluno = async (studentId: string) => {
  try {
    await addStudent(classId, studentId)
    modalAlunoAberto.value = false
    mostrarNotificacao('sucesso', 'Aluno vinculado com sucesso')
    alunos.value = await fetchClassStudents(classId)
  } catch {
    mostrarNotificacao('critico', 'Erro ao vincular aluno')
  }
}

// --- Modal Vincular Professor ---
const modalProfessorAberto = ref(false)
const buscaProfessor = ref('')
const professoresDisponiveis = ref<any[]>([])
const professorSelecionado = ref<any>(null)
const disciplinaSelecionada = ref('')

let timeoutBuscaProf: ReturnType<typeof setTimeout> | null = null

const abrirModalProfessor = () => {
  buscaProfessor.value = ''
  professoresDisponiveis.value = []
  professorSelecionado.value = null
  disciplinaSelecionada.value = ''
  modalProfessorAberto.value = true
}

const buscarProfessores = () => {
  if (timeoutBuscaProf) clearTimeout(timeoutBuscaProf)
  timeoutBuscaProf = setTimeout(async () => {
    if (!buscaProfessor.value.trim() || professorSelecionado.value) {
      professoresDisponiveis.value = []
      return
    }
    professoresDisponiveis.value = await fetchAvailableTeachers(usuario.value.schoolId, buscaProfessor.value)
  }, 300)
}

const selecionarProfessor = (prof: any) => {
  professorSelecionado.value = prof
  buscaProfessor.value = prof.full_name || prof.email
  professoresDisponiveis.value = []
}

const vincularProfessor = async () => {
  if (!professorSelecionado.value || !disciplinaSelecionada.value) return
  try {
    await addTeacher(classId, professorSelecionado.value.id, disciplinaSelecionada.value)
    modalProfessorAberto.value = false
    mostrarNotificacao('sucesso', 'Professor vinculado com sucesso')
    professores.value = await fetchClassTeachers(classId)
  } catch {
    mostrarNotificacao('critico', 'Erro ao vincular professor. Verifique se o vínculo já existe.')
  }
}

// --- Remover vínculos ---
const dialogoAberto = ref(false)
const dialogoTitulo = ref('')
const dialogoMensagem = ref('')
const remocaoPendente = ref<(() => Promise<void>) | null>(null)

const confirmarRemoverAluno = (item: any) => {
  dialogoTitulo.value = 'Remover aluno'
  dialogoMensagem.value = `Deseja remover "${item.profiles?.full_name || 'este aluno'}" desta turma?`
  remocaoPendente.value = async () => {
    await removeStudent(classId, item.student_id)
    alunos.value = await fetchClassStudents(classId)
  }
  dialogoAberto.value = true
}

const confirmarRemoverProfessor = (item: any) => {
  dialogoTitulo.value = 'Remover professor'
  dialogoMensagem.value = `Deseja remover "${item.profiles?.full_name || 'este professor'}" da disciplina "${item.subjects?.name || ''}" nesta turma?`
  remocaoPendente.value = async () => {
    await removeTeacher(classId, item.teacher_id, item.subject_id)
    professores.value = await fetchClassTeachers(classId)
  }
  dialogoAberto.value = true
}

const executarRemocao = async () => {
  dialogoAberto.value = false
  try {
    if (remocaoPendente.value) await remocaoPendente.value()
    mostrarNotificacao('sucesso', 'Removido com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao remover')
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

// --- Carregar dados ---
onMounted(async () => {
  const [turmaData] = await Promise.all([
    fetchClass(classId),
    fetchAcademicYears(),
    fetchSubjects()
  ])

  if (turmaData) {
    turma.value = turmaData
    formInfo.value = {
      name: turmaData.name || '',
      grade_level: turmaData.grade_level || '',
      shift: turmaData.shift || '',
      academic_year_id: turmaData.academic_year_id || ''
    }

    const [alunosData, professoresData] = await Promise.all([
      fetchClassStudents(classId),
      fetchClassTeachers(classId)
    ])
    alunos.value = alunosData
    professores.value = professoresData
  }

  carregando.value = false
})
</script>
