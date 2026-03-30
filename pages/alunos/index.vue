<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-heading-1">Alunos</h1>
        <p class="text-body text-text-secondary mt-1">Acompanhe o desempenho individual de cada estudante</p>
      </div>
    </div>

    <!-- Cards de estatisticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <CartaoEstatistica
        rotulo="Total de Alunos"
        :valor="totalAlunos"
        fundo-icone="bg-primary-50"
      >
        <template #icone>
          <Icone :tamanho="24" class="text-primary-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </Icone>
        </template>
      </CartaoEstatistica>
      <CartaoEstatistica
        rotulo="Turmas"
        :valor="counts.turmas"
        fundo-icone="bg-green-50"
      >
        <template #icone>
          <Icone :tamanho="24" class="text-green-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </Icone>
        </template>
      </CartaoEstatistica>
      <CartaoEstatistica
        rotulo="Professores"
        :valor="counts.professores"
        fundo-icone="bg-amber-50"
      >
        <template #icone>
          <Icone :tamanho="24" class="text-amber-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </Icone>
        </template>
      </CartaoEstatistica>
    </div>

    <!-- Filtros -->
    <Cartao class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BarraBusca
            v-model="busca"
            texto-reservado="Buscar por nome, email ou matricula..."
          />
        </div>
        <div class="w-full sm:w-56">
          <CampoSelecao
            :modelValue="filtroTurma"
            @update:modelValue="filtroTurma = $event as string"
            texto-reservado="Todas as turmas"
            :opcoes="opcoesTurma"
          />
        </div>
        <div class="w-full sm:w-44">
          <CampoSelecao
            :modelValue="filtroStatus"
            @update:modelValue="filtroStatus = $event as string"
            texto-reservado="Todos"
            :opcoes="opcoesStatus"
          />
        </div>
      </div>
    </Cartao>

    <!-- Tabela -->
    <Cartao>
      <Carregando v-if="carregando" texto="Carregando alunos..." />

      <TabelaDados v-else :colunas="colunas" :dados="alunosFormatados">
        <template #celula-aluno="{ linha }">
          <NuxtLink :to="`/alunos/${linha.id}`" class="flex items-center gap-3 no-underline">
            <Avatar
              :image="linha.avatar"
              :alt="linha.nome"
              :size="40"
            />
            <div>
              <p class="font-semibold text-gray-900 hover:text-primary-500 transition-colors">{{ linha.nome }}</p>
              <p class="text-xs text-gray-500">{{ linha.email }}</p>
            </div>
          </NuxtLink>
        </template>

        <template #celula-matricula="{ linha }">
          <span class="text-sm font-mono text-gray-700">{{ linha.matricula || '—' }}</span>
        </template>

        <template #celula-turma="{ linha }">
          <span v-if="linha.turma" class="text-sm text-gray-700">{{ linha.turma }}</span>
          <span v-else class="text-sm text-gray-400">Sem turma</span>
        </template>

        <template #celula-sexo="{ linha }">
          <span class="text-sm text-gray-700">{{ linha.sexo === 'M' ? 'Masculino' : linha.sexo === 'F' ? 'Feminino' : '—' }}</span>
        </template>

        <template #celula-status="{ linha }">
          <Etiqueta :variante="linha.is_active ? 'dominado' : 'em-risco'" :mostrar-ponto="true">
            {{ linha.is_active ? 'Ativo' : 'Inativo' }}
          </Etiqueta>
        </template>

        <template #celula-acoes="{ linha }">
          <NuxtLink
            :to="`/alunos/${linha.id}`"
            class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors no-underline"
            title="Ver perfil"
          >
            <Icone :tamanho="18">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </Icone>
          </NuxtLink>
        </template>

        <template #vazio>
          <div class="text-center py-12">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </Icone>
            <p class="text-body text-text-secondary">Nenhum aluno encontrado</p>
          </div>
        </template>
      </TabelaDados>

      <!-- Paginacao -->
      <div v-if="!carregando && totalPaginas > 1" class="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
        <p class="text-sm text-text-secondary">
          Mostrando {{ inicioItem }}–{{ fimItem }} de {{ totalAlunos }}
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="irParaPagina(paginaAtual - 1)"
            :disabled="paginaAtual === 1"
            class="p-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </Icone>
          </button>
          <button
            v-for="pg in paginasVisiveis"
            :key="pg"
            @click="irParaPagina(pg)"
            :class="[
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              pg === paginaAtual ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 text-text-secondary'
            ]"
          >
            {{ pg }}
          </button>
          <button
            @click="irParaPagina(paginaAtual + 1)"
            :disabled="paginaAtual === totalPaginas"
            class="p-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </Icone>
          </button>
        </div>
      </div>
    </Cartao>
  </div>
</template>

<script setup lang="ts">
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'collaborator']
})

const supabase = useSupabaseClient()
const { fetchStudentsList } = useUsers()
const { classes, fetchClasses } = useClasses()
const { counts, fetchCounts } = useSchool()

const carregando = ref(true)
const alunosData = ref<any[]>([])
const totalAlunos = ref(0)
const paginaAtual = ref(1)
const porPagina = 15

const busca = ref('')
const filtroTurma = ref('')
const filtroStatus = ref('')

// Mapa turma por aluno
const turmasPorAluno = ref<Record<string, string>>({})

// Debounce busca
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(busca, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    paginaAtual.value = 1
    buscarAlunos()
  }, 300)
})

watch([filtroTurma, filtroStatus], () => {
  paginaAtual.value = 1
  buscarAlunos()
})

const opcoesTurma = computed(() => [
  { rotulo: 'Todas as turmas', valor: '' },
  ...classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
])

const opcoesStatus = [
  { rotulo: 'Todos', valor: '' },
  { rotulo: 'Ativos', valor: 'true' },
  { rotulo: 'Inativos', valor: 'false' }
]

const colunas = [
  { chave: 'aluno', rotulo: 'Aluno' },
  { chave: 'matricula', rotulo: 'Matricula' },
  { chave: 'turma', rotulo: 'Turma' },
  { chave: 'sexo', rotulo: 'Sexo' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const alunosFormatados = computed(() =>
  alunosData.value
    .filter(a => {
      if (filtroStatus.value === 'true') return a.is_active === true
      if (filtroStatus.value === 'false') return a.is_active === false
      return true
    })
    .map(a => ({
      id: a.id,
      nome: a.full_name || 'Sem nome',
      email: a.email || '',
      avatar: a.avatar_url || '',
      matricula: a.matricula,
      sexo: a.sexo,
      turma: turmasPorAluno.value[a.id] || '',
      is_active: a.is_active
    }))
)

// Paginacao
const totalPaginas = computed(() => Math.ceil(totalAlunos.value / porPagina))
const inicioItem = computed(() => Math.min((paginaAtual.value - 1) * porPagina + 1, totalAlunos.value))
const fimItem = computed(() => Math.min(paginaAtual.value * porPagina, totalAlunos.value))

const paginasVisiveis = computed(() => {
  const total = totalPaginas.value
  const atual = paginaAtual.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (atual <= 3) return [1, 2, 3, 4, 5]
  if (atual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total]
  return [atual - 2, atual - 1, atual, atual + 1, atual + 2]
})

const irParaPagina = (pg: number) => {
  if (pg < 1 || pg > totalPaginas.value) return
  paginaAtual.value = pg
  buscarAlunos()
}

const buscarAlunos = async () => {
  carregando.value = true
  const result = await fetchStudentsList({
    search: busca.value,
    classId: filtroTurma.value,
    page: paginaAtual.value,
    perPage: porPagina
  })
  alunosData.value = result.students
  totalAlunos.value = result.total
  carregando.value = false
}

// Buscar turma de cada aluno
const carregarTurmas = async () => {
  const { data } = await supabase
    .from('turma_alunos')
    .select('student_id, turmas(name)')
  if (data) {
    const mapa: Record<string, string> = {}
    for (const row of data as any[]) {
      const nome = row.turmas?.name
      if (nome && row.student_id) {
        // Se ja tem, concatena
        mapa[row.student_id] = mapa[row.student_id]
          ? `${mapa[row.student_id]}, ${nome}`
          : nome
      }
    }
    turmasPorAluno.value = mapa
  }
}

onMounted(async () => {
  await Promise.all([fetchClasses(), fetchCounts(), carregarTurmas()])
  await buscarAlunos()
})
</script>
