<template>
  <div>
        <!-- HEADER DA PÁGINA -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <!-- Lado Esquerdo -->
          <div>
            <h1 class="text-3xl font-black text-gray-900">Meus Alunos</h1>
            <p class="text-base text-gray-500 mt-1">
              Acompanhe o desempenho individual de cada estudante.
            </p>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CartaoEstatistica
            v-for="stat in stats"
            :key="stat.rotulo"
            :rotulo="stat.rotulo"
            :valor="stat.valor"
            :icone="stat.icone"
            :fundo-icone="stat.fundoIcone"
          />
        </div>

        <!-- FILTROS E BUSCA -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <BarraBusca
                v-model="buscaAlunos"
                texto-reservado="Buscar por nome, email ou matrícula..."
                class="w-full"
              />
            </div>
            <select
              v-model="filtroTurma"
              class="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas as Turmas</option>
              <option v-for="turma in turmasOptions" :key="turma.valor" :value="turma.valor">
                {{ turma.rotulo }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingAlunos" class="py-12 text-center">
          <p class="text-sm text-gray-500">Carregando alunos...</p>
        </div>

        <!-- TABELA DE ALUNOS -->
        <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div v-if="alunosFormatados.length === 0" class="py-12 text-center">
            <p class="text-sm text-gray-500">Nenhum aluno encontrado.</p>
          </div>
          <TabelaDados v-else :colunas="colunasAlunos" :dados="alunosFormatados">
            <template #celula-aluno="{ linha }">
              <div class="flex items-center gap-3">
                <Avatar
                  :image="linha.avatar"
                  :alt="linha.nome"
                  :size="40"
                />
                <div>
                  <p class="font-semibold text-gray-900">{{ linha.nome }}</p>
                  <p class="text-sm text-gray-500">{{ linha.email }}</p>
                </div>
              </div>
            </template>

            <template #celula-matricula="{ linha }">
              <span class="text-sm text-gray-700">{{ linha.matricula || '—' }}</span>
            </template>

            <template #celula-status="{ linha }">
              <Etiqueta :variante="linha.is_active ? 'dominado' : 'em-risco'" :mostrar-ponto="true">
                {{ linha.is_active ? 'Ativo' : 'Inativo' }}
              </Etiqueta>
            </template>

            <template #celula-acoes="{ linha }">
              <button
                class="text-sm font-semibold text-primary-500 hover:text-primary-600"
                @click="navegarParaAluno(linha.id)"
              >
                Ver Perfil
              </button>
            </template>
          </TabelaDados>
        </div>

        <!-- PAGINAÇÃO -->
        <div class="flex justify-between items-center mt-6">
          <p class="text-sm text-gray-500">
            Mostrando {{ alunosFormatados.length }} de {{ totalAlunos }} alunos
          </p>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="paginaAtual <= 1"
              @click="paginaAtual--; buscarAlunos()"
            >
              Anterior
            </button>
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="paginaAtual * porPagina >= totalAlunos"
              @click="paginaAtual++; buscarAlunos()"
            >
              Próxima
            </button>
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'

const router = useRouter()

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue']
})

const { fetchStudentsList } = useUsers()
const { classes, fetchClasses } = useClasses()
const { counts, fetchCounts } = useSchool()

const loadingAlunos = ref(true)
const alunosData = ref<any[]>([])
const totalAlunos = ref(0)
const paginaAtual = ref(1)
const porPagina = 20

const buscaAlunos = ref('')
const filtroTurma = ref('')

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(buscaAlunos, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    paginaAtual.value = 1
    buscarAlunos()
  }, 300)
})

watch(filtroTurma, () => {
  paginaAtual.value = 1
  buscarAlunos()
})

const turmasOptions = computed(() =>
  classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
)

const colunasAlunos = [
  { chave: 'aluno', rotulo: 'Aluno' },
  { chave: 'matricula', rotulo: 'Matrícula' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'acoes', rotulo: 'Ações' }
]

const alunosFormatados = computed(() =>
  alunosData.value.map(a => ({
    id: a.id,
    nome: a.full_name || 'Sem nome',
    email: a.email || '',
    avatar: a.avatar_url || '',
    matricula: a.matricula,
    is_active: a.is_active
  }))
)

const stats = computed(() => [
  {
    rotulo: 'Total de Alunos',
    valor: counts.value.alunos,
    icone: '👥',
    fundoIcone: 'bg-[#e8edff]'
  },
  {
    rotulo: 'Turmas',
    valor: counts.value.turmas,
    icone: '📚',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Professores',
    valor: counts.value.professores,
    icone: '👨‍🏫',
    fundoIcone: 'bg-[#fff3e0]'
  }
])

const buscarAlunos = async () => {
  loadingAlunos.value = true
  const result = await fetchStudentsList({
    search: buscaAlunos.value,
    classId: filtroTurma.value,
    page: paginaAtual.value,
    perPage: porPagina
  })
  alunosData.value = result.students
  totalAlunos.value = result.total
  loadingAlunos.value = false
}

const navegarParaAluno = (id: string) => {
  router.push(`/alunos/${id}`)
}

// Init
onMounted(async () => {
  await Promise.all([fetchClasses(), fetchCounts()])
  await buscarAlunos()
})
</script>
