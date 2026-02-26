<template>
  <div>
        <!-- HEADER DA PÁGINA -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <!-- Lado Esquerdo -->
          <div>
            <h1 class="text-3xl font-black text-gray-900">Minhas Turmas</h1>
            <p class="text-base text-gray-500 mt-1">
              Gerencie o progresso e atividades de suas classes ativas.
            </p>
          </div>

          <!-- Lado Direito -->
          <div v-if="canManageClasses" class="flex-shrink-0">
            <Botao
              variante="primario"
              icone="+"
              posicao-icone="esquerda"
              @click="abrirModalCriarTurma"
            >
              <template #icone-esquerda>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </Icone>
              </template>
              <template #default>Criar Nova Turma</template>
            </Botao>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CartaoEstatistica
            v-for="stat in stats"
            :key="stat.rotulo"
            :rotulo="stat.rotulo"
            :valor="stat.valor"
            :formato="stat.formato"
            :icone="stat.icone"
            :fundo-icone="stat.fundoIcone"
          />
        </div>

        <!-- Loading -->
        <div v-if="loadingTurmas" class="py-12 text-center">
          <p class="text-sm text-gray-500">Carregando turmas...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="turmasFormatadas.length === 0" class="py-12 text-center">
          <p class="text-lg font-semibold text-gray-500 mb-2">Nenhuma turma encontrada</p>
          <p class="text-sm text-gray-400">Crie uma nova turma para começar.</p>
        </div>

        <!-- GRID DE TURMAS -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CartaoTurma
            v-for="turma in turmasFormatadas"
            :key="turma.to"
            :subject="turma.subject"
            :grade="turma.grade"
            :student-count="turma.studentCount"
            :health-score="turma.healthScore"
            :ai-summary="turma.aiSummary"
            :icon="turma.icon"
            :icon-bg="turma.iconBg"
            :to="turma.to"
          />
        </div>

    <!-- Modal Criar Nova Turma -->
    <Modal
      :esta-aberto="modalAberto"
      titulo="Criar Nova Turma"
      @fechar="fecharModal"
    >
      <form @submit.prevent="criarTurma" class="space-y-5">
        <CampoFormulario
          id="nomeTurma"
          v-model="formulario.nome"
          rotulo="Nome da Turma"
          texto-reservado="Ex: Matemática 9º A"
          :erro="erros.nome"
        />

        <div class="grid grid-cols-2 gap-4">
          <CampoFormulario
            id="serie"
            v-model="formulario.serie"
            rotulo="Série"
            texto-reservado="Ex: 9º Ano"
            :erro="erros.serie"
          />

          <CampoSelecao
            id="turno"
            v-model="formulario.turno"
            rotulo="Turno"
            texto-reservado="Selecione o turno"
            :opcoes="opcoesTurno"
          />
        </div>

        <CampoSelecao
          id="anoLetivo"
          v-model="formulario.anoLetivo"
          rotulo="Ano Letivo"
          texto-reservado="Selecione o ano letivo"
          :opcoes="opcoesAnoLetivo"
          :erro="erros.anoLetivo"
        />
      </form>

      <template #rodape>
        <Botao variante="contorno" @click="fecharModal">
          Cancelar
        </Botao>
        <Botao variante="primario" @click="criarTurma" :desabilitado="criandoTurma">
          <template #icone-esquerda>
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </Icone>
          </template>
          {{ criandoTurma ? 'Criando...' : 'Criar Turma' }}
        </Botao>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import CampoFormulario from '~/components/form/CampoFormulario/CampoFormulario.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'
import CartaoTurma from '~/components/composed/CartaoTurma/CartaoTurma.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const { canManageClasses } = usePermissions()
const { classes, fetchClasses, createClass } = useClasses()
const { academicYears, fetchAcademicYears } = useAcademicYear()
const { countAssignments } = useAssignments()

const loadingTurmas = ref(true)
const studentCounts = ref<Record<string, number>>({})
const totalAssignments = ref(0)

// Fetch student counts for each class
const fetchStudentCounts = async () => {
  const result: Record<string, number> = {}
  for (const c of classes.value) {
    const { count } = await supabase
      .from('class_students')
      .select('student_id', { count: 'exact', head: true })
      .eq('class_id', c.id)
    result[c.id] = count || 0
  }
  studentCounts.value = result
}

// Stats
const totalAlunos = computed(() =>
  Object.values(studentCounts.value).reduce((a, b) => a + b, 0)
)

const stats = computed(() => [
  {
    rotulo: 'Total de Alunos',
    valor: totalAlunos.value,
    icone: '👥',
    fundoIcone: 'bg-[#e8edff]'
  },
  {
    rotulo: 'Turmas Ativas',
    valor: classes.value.length,
    icone: '📚',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Avaliações',
    valor: totalAssignments.value,
    icone: '📋',
    fundoIcone: 'bg-[#fff3e0]'
  }
])

// Subject icon mapping
const iconMap: Record<string, { icon: string; bg: string }> = {
  'matemática': { icon: 'sigma', bg: '#6f42c1' },
  'física': { icon: 'rocket', bg: '#6f42c1' },
  'história': { icon: 'book-open', bg: '#f59e0b' },
  'geografia': { icon: 'globe', bg: '#20c997' },
  'química': { icon: 'flask-conical', bg: '#dc3545' },
  'biologia': { icon: 'leaf', bg: '#28a745' },
  'português': { icon: 'book-open', bg: '#1132d4' },
  'língua portuguesa': { icon: 'book-open', bg: '#1132d4' },
  'inglês': { icon: 'globe', bg: '#0dcaf0' }
}

const getIconForClass = (className: string) => {
  const lower = className.toLowerCase()
  for (const [key, val] of Object.entries(iconMap)) {
    if (lower.includes(key)) return val
  }
  return { icon: 'book-open', bg: '#6f42c1' }
}

// Format classes for CartaoTurma
const turmasFormatadas = computed(() =>
  classes.value.map(c => {
    const { icon, bg } = getIconForClass(c.name)
    return {
      subject: c.name,
      grade: c.grade_level || '',
      studentCount: studentCounts.value[c.id] || 0,
      healthScore: 0,
      aiSummary: c.academic_years?.name || '',
      icon,
      iconBg: bg,
      to: `/turmas/${c.id}`
    }
  })
)

// Modal Criar Turma
const modalAberto = ref(false)
const criandoTurma = ref(false)

const formulario = reactive({
  nome: '' as string | number,
  serie: '' as string | number,
  turno: '' as string | number,
  anoLetivo: '' as string | number
})

const erros = reactive({
  nome: '',
  serie: '',
  anoLetivo: ''
})

const opcoesTurno = [
  { rotulo: 'Matutino', valor: 'matutino' },
  { rotulo: 'Vespertino', valor: 'vespertino' },
  { rotulo: 'Noturno', valor: 'noturno' },
  { rotulo: 'Integral', valor: 'integral' }
]

const opcoesAnoLetivo = computed(() =>
  academicYears.value.map(ay => ({ rotulo: ay.name, valor: ay.id }))
)

const abrirModalCriarTurma = () => {
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  formulario.nome = ''
  formulario.serie = ''
  formulario.turno = ''
  formulario.anoLetivo = ''
  erros.nome = ''
  erros.serie = ''
  erros.anoLetivo = ''
}

const criarTurma = async () => {
  erros.nome = ''
  erros.serie = ''
  erros.anoLetivo = ''

  let valido = true

  if (!formulario.nome) {
    erros.nome = 'Informe o nome da turma'
    valido = false
  }

  if (!valido) return

  criandoTurma.value = true
  try {
    await createClass({
      name: String(formulario.nome),
      grade_level: formulario.serie ? String(formulario.serie) : undefined,
      shift: formulario.turno ? String(formulario.turno) : undefined,
      academic_year_id: formulario.anoLetivo ? String(formulario.anoLetivo) : undefined
    })
    fecharModal()
    await fetchClasses()
    await fetchStudentCounts()
  } catch {
    // error is handled by useClasses
  } finally {
    criandoTurma.value = false
  }
}

// Init
onMounted(async () => {
  await Promise.all([fetchClasses(), fetchAcademicYears()])
  await fetchStudentCounts()
  totalAssignments.value = await countAssignments()
  loadingTurmas.value = false
})
</script>
