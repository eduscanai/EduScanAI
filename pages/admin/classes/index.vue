<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Gestão de Turmas</h1>
        <p class="text-body text-text-secondary mt-1">Gerencie as turmas da sua escola</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="modalAnoAberto = true" class="btn-outline flex items-center gap-2">
          <Icone :tamanho="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </Icone>
          Anos Letivos
        </button>
        <NuxtLink to="/admin/classes/import" class="btn-outline flex items-center gap-2 no-underline">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </Icone>
          Importar
        </NuxtLink>
        <button @click="abrirModalCriar" class="btn-primary flex items-center gap-2">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </Icone>
          Nova Turma
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <Cartao class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BarraBusca
            :modelValue="busca"
            @update:modelValue="busca = $event"
            texto-reservado="Buscar turma por nome..."
          />
        </div>
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroAno"
            @update:modelValue="filtroAno = $event as string"
            texto-reservado="Todos os anos letivos"
            :opcoes="opcoesAno"
          />
        </div>
      </div>
    </Cartao>

    <!-- Lista de turmas -->
    <Cartao>
      <Carregando v-if="loading" texto="Carregando turmas..." />

      <TabelaDados v-else :colunas="colunas" :dados="classes">
        <template #celula-name="{ linha }">
          <NuxtLink
            :to="`/admin/classes/${linha.id}`"
            class="font-semibold text-primary-500 hover:text-primary-600 no-underline"
          >
            {{ linha.name }}
          </NuxtLink>
        </template>

        <template #celula-grade_level="{ valor }">
          {{ valor || '-' }}
        </template>

        <template #celula-shift="{ valor }">
          {{ rotuloTurno(valor) }}
        </template>

        <template #celula-professor="{ linha }">
          <span v-if="linha.profiles" class="text-sm text-gray-700">{{ linha.profiles.full_name }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #celula-academic_years="{ valor }">
          {{ valor?.name || '-' }}
        </template>

        <template #celula-acoes="{ linha }">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/admin/classes/${linha.id}`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
              title="Detalhes"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </Icone>
            </NuxtLink>
            <button
              @click="confirmarExcluir(linha)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
              title="Excluir"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </Icone>
            </button>
          </div>
        </template>

        <template #vazio>
          <div class="text-center py-8">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </Icone>
            <p class="text-body text-text-secondary">Nenhuma turma encontrada</p>
          </div>
        </template>
      </TabelaDados>
    </Cartao>

    <!-- Modal Criar Turma -->
    <Modal
      :esta-aberto="modalTurmaAberto"
      titulo="Nova Turma"
      @fechar="modalTurmaAberto = false"
    >
      <div class="space-y-4">
        <div>
          <label for="turma-nome" class="form-label">Nome *</label>
          <input id="turma-nome" type="text" v-model="formTurma.name" class="form-input" placeholder="Ex: 3º Ano A" />
          <p v-if="errosTurma.name" class="mt-1 text-xs text-critical-500">{{ errosTurma.name }}</p>
        </div>
        <div>
          <label for="turma-serie" class="form-label">Série / Nível</label>
          <input id="turma-serie" type="text" v-model="formTurma.grade_level" class="form-input" placeholder="Ex: 3º Ano" />
        </div>
        <div>
          <CampoSelecao
            rotulo="Turno"
            :modelValue="formTurma.shift"
            @update:modelValue="formTurma.shift = $event as string"
            texto-reservado="Selecione o turno"
            :opcoes="opcoesTurno"
          />
        </div>
        <div>
          <CampoSelecao
            rotulo="Ano Letivo"
            :modelValue="formTurma.academic_year_id"
            @update:modelValue="formTurma.academic_year_id = $event as string"
            texto-reservado="Selecione o ano letivo"
            :opcoes="opcoesAnoForm"
          />
        </div>
        <div>
          <CampoSelecao
            rotulo="Professor Responsável *"
            :modelValue="formTurma.teacher_id"
            @update:modelValue="formTurma.teacher_id = $event as string"
            texto-reservado="Selecione o professor"
            :opcoes="opcoesProfessor"
            :erro="errosTurma.teacher_id"
          />
        </div>
      </div>
      <template #rodape>
        <button @click="modalTurmaAberto = false" class="btn-outline">Cancelar</button>
        <button @click="criarTurma" :disabled="loading" class="btn-primary">
          {{ loading ? 'Criando...' : 'Criar Turma' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Anos Letivos -->
    <Modal
      :esta-aberto="modalAnoAberto"
      titulo="Anos Letivos"
      @fechar="modalAnoAberto = false"
    >
      <!-- Form criar ano -->
      <div class="flex gap-2 mb-4">
        <input
          type="text"
          v-model="novoAno.name"
          class="form-input flex-1"
          placeholder="Ex: 2025"
        />
        <input
          type="date"
          v-model="novoAno.start_date"
          class="form-input w-36"
        />
        <input
          type="date"
          v-model="novoAno.end_date"
          class="form-input w-36"
        />
        <button @click="criarAno" class="btn-primary px-3 flex-shrink-0">
          <Icone :tamanho="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </Icone>
        </button>
      </div>

      <!-- Lista de anos -->
      <div class="divide-y divide-gray-200">
        <div v-for="ano in academicYears" :key="ano.id" class="flex items-center justify-between py-3">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ ano.name }}</p>
            <p class="text-xs text-gray-500">
              {{ ano.start_date ? new Date(ano.start_date).toLocaleDateString('pt-BR') : '-' }}
              {{ ano.end_date ? ' até ' + new Date(ano.end_date).toLocaleDateString('pt-BR') : '' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="ano.is_current" class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Atual</span>
            <button
              v-if="!ano.is_current"
              @click="marcarAnoComo(ano.id)"
              class="text-xs text-primary-500 hover:underline"
            >
              Definir atual
            </button>
            <button
              @click="excluirAno(ano.id)"
              class="p-1 rounded text-gray-400 hover:text-critical-500 transition-colors"
            >
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </Icone>
            </button>
          </div>
        </div>
        <p v-if="academicYears.length === 0" class="py-4 text-center text-sm text-gray-500">
          Nenhum ano letivo cadastrado
        </p>
      </div>
    </Modal>

    <!-- Diálogo de exclusão -->
    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir"
      titulo="Excluir turma"
      :mensagem="`Tem certeza que deseja excluir a turma '${turmaParaExcluir?.name}'? Todos os vínculos de alunos e professores serão removidos.`"
      variante="perigo"
      texto-confirmar="Excluir"
      @confirmar="executarExclusao"
      @cancelar="dialogoExcluir = false"
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
import { ref, computed, watch, onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { classes, loading, fetchClasses, createClass, deleteClass } = useClasses()
const { academicYears, fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } = useAcademicYear()

// Buscar professores da escola
const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const professores = ref<{ id: string; full_name: string | null }[]>([])

const fetchProfessores = async () => {
  if (!usuario.value.schoolId) return
  const { data } = await supabase
    .from('perfis')
    .select('id, full_name')
    .eq('school_id', usuario.value.schoolId)
    .eq('role', 'teacher')
    .order('full_name')
  professores.value = data || []
}

const opcoesProfessor = computed(() =>
  professores.value.map(p => ({ rotulo: p.full_name || p.id, valor: p.id }))
)

// Filtros
const busca = ref('')
const filtroAno = ref('')

const colunas = [
  { chave: 'name', rotulo: 'Nome' },
  { chave: 'grade_level', rotulo: 'Série' },
  { chave: 'shift', rotulo: 'Turno' },
  { chave: 'professor', rotulo: 'Professor' },
  { chave: 'academic_years', rotulo: 'Ano Letivo' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const opcoesTurno = [
  { rotulo: 'Matutino', valor: 'morning' },
  { rotulo: 'Vespertino', valor: 'afternoon' },
  { rotulo: 'Noturno', valor: 'evening' }
]

const opcoesAno = computed(() => [
  { rotulo: 'Todos', valor: '' },
  ...academicYears.value.map(a => ({ rotulo: a.name, valor: a.id }))
])

const opcoesAnoForm = computed(() =>
  academicYears.value.map(a => ({ rotulo: a.name, valor: a.id }))
)

const rotuloTurno = (shift: string | null) => {
  const mapa: Record<string, string> = { morning: 'Matutino', afternoon: 'Vespertino', evening: 'Noturno' }
  return shift ? mapa[shift] || shift : '-'
}

// Carregar
const carregarTurmas = () => {
  fetchClasses({ academicYearId: filtroAno.value || undefined, search: busca.value || undefined })
}

let timeoutBusca: ReturnType<typeof setTimeout> | null = null
watch(busca, () => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(carregarTurmas, 300)
})

watch(filtroAno, carregarTurmas)

// Modal criar turma
const modalTurmaAberto = ref(false)
const formTurma = ref({ name: '', grade_level: '', shift: '', academic_year_id: '', teacher_id: '' })
const errosTurma = ref<Record<string, string>>({})

const abrirModalCriar = () => {
  formTurma.value = { name: '', grade_level: '', shift: '', academic_year_id: '', teacher_id: '' }
  errosTurma.value = {}
  modalTurmaAberto.value = true
}

const criarTurma = async () => {
  errosTurma.value = {}
  if (!formTurma.value.name.trim()) errosTurma.value.name = 'Nome é obrigatório'
  if (!formTurma.value.teacher_id) errosTurma.value.teacher_id = 'Selecione um professor'
  if (Object.keys(errosTurma.value).length > 0) return
  try {
    await createClass({
      name: formTurma.value.name,
      grade_level: formTurma.value.grade_level || undefined,
      shift: formTurma.value.shift || undefined,
      academic_year_id: formTurma.value.academic_year_id || undefined,
      teacher_id: formTurma.value.teacher_id
    })
    modalTurmaAberto.value = false
    mostrarNotificacao('sucesso', 'Turma criada com sucesso')
    carregarTurmas()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao criar turma', e?.message || '')
  }
}

// Modal anos letivos
const modalAnoAberto = ref(false)
const novoAno = ref({ name: '', start_date: '', end_date: '' })

const criarAno = async () => {
  if (!novoAno.value.name.trim()) return
  try {
    await createAcademicYear({
      name: novoAno.value.name,
      start_date: novoAno.value.start_date || undefined,
      end_date: novoAno.value.end_date || undefined,
      is_current: false
    })
    novoAno.value = { name: '', start_date: '', end_date: '' }
    await fetchAcademicYears()
    mostrarNotificacao('sucesso', 'Ano letivo criado')
  } catch {
    mostrarNotificacao('critico', 'Erro ao criar ano letivo')
  }
}

const marcarAnoComo = async (id: string) => {
  try {
    // Desmarcar todos primeiro
    for (const ano of academicYears.value) {
      if (ano.is_current) {
        await updateAcademicYear(ano.id, { is_current: false })
      }
    }
    await updateAcademicYear(id, { is_current: true })
    await fetchAcademicYears()
    mostrarNotificacao('sucesso', 'Ano letivo atual atualizado')
  } catch {
    mostrarNotificacao('critico', 'Erro ao atualizar ano letivo')
  }
}

const excluirAno = async (id: string) => {
  try {
    await deleteAcademicYear(id)
    await fetchAcademicYears()
    mostrarNotificacao('sucesso', 'Ano letivo excluído')
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir ano letivo')
  }
}

// Excluir turma
const dialogoExcluir = ref(false)
const turmaParaExcluir = ref<any>(null)

const confirmarExcluir = (turma: any) => {
  turmaParaExcluir.value = turma
  dialogoExcluir.value = true
}

const executarExclusao = async () => {
  if (!turmaParaExcluir.value) return
  dialogoExcluir.value = false
  try {
    await deleteClass(turmaParaExcluir.value.id)
    mostrarNotificacao('sucesso', 'Turma excluída com sucesso')
    carregarTurmas()
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir turma')
  }
}

// Notificação
const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

onMounted(async () => {
  await Promise.all([fetchAcademicYears(), fetchProfessores()])
  carregarTurmas()
})
</script>
