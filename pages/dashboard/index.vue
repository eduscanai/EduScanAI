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
          <div class="space-y-3">
            <div v-for="turma in turmasResumo" :key="turma.nome" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span class="text-sm font-medium text-gray-900">{{ turma.nome }}</span>
              <div class="flex items-center gap-3">
                <BarraProgresso :valor="turma.desempenho" :maximo="100" variante="primario" :mostrar-porcentagem="true" class="w-24" />
                <span class="text-xs text-gray-500">{{ turma.alunos }} alunos</span>
              </div>
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Atividades Recentes</h2>
          <p class="text-body text-text-secondary mb-4">Últimas atividades registradas na plataforma.</p>
          <div class="space-y-3">
            <div v-for="atividade in atividadesRecentes" :key="atividade.descricao" class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
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
          <div class="space-y-3">
            <NuxtLink
              v-for="turma in minhasTurmas"
              :key="turma.nome"
              :to="turma.to"
              class="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors no-underline"
            >
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ turma.nome }}</p>
                <p class="text-xs text-gray-500">{{ turma.alunos }} alunos</p>
              </div>
              <Etiqueta :variante="turma.saude >= 80 ? 'dominado' : turma.saude >= 60 ? 'em-progresso' : 'em-risco'">
                {{ turma.saude }}%
              </Etiqueta>
            </NuxtLink>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Pendentes de Correção</h2>
          <p class="text-body text-text-secondary mb-4">Provas e atividades aguardando revisão.</p>
          <div class="space-y-3">
            <div v-for="item in pendentesCorrecao" :key="item.titulo" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.titulo }}</p>
                <p class="text-xs text-gray-500">{{ item.turma }}</p>
              </div>
              <span class="text-xs font-semibold text-warning-600 bg-warning-50 px-2 py-1 rounded-full">{{ item.quantidade }} pendentes</span>
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
              <ClientOnly>
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

        <!-- Áreas de Dificuldade -->
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
          <div class="space-y-3">
            <div v-for="item in atividadesPendentes" :key="item.titulo" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.titulo }}</p>
                <p class="text-xs text-gray-500">{{ item.disciplina }} · Entrega: {{ item.prazo }}</p>
              </div>
              <Etiqueta variante="em-progresso">Pendente</Etiqueta>
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-2 mb-4">Notas Recentes</h2>
          <p class="text-body text-text-secondary mb-4">Suas últimas avaliações corrigidas.</p>
          <div class="space-y-3">
            <div v-for="nota in notasRecentes" :key="nota.avaliacao" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
import { ref, onMounted } from 'vue'
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
const { isAdmin, isPedagogue, isTeacher, isStudent } = usePermissions()
const { school, counts, fetchSchool, fetchCounts } = useSchool()

const loadingSchool = ref(true)
const anoLetivo = ref<string | null>(null)

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

onMounted(async () => {
  if (isAdmin.value || isPedagogue.value) {
    await Promise.all([fetchSchool(), fetchCounts(), fetchAnoLetivo()])
    loadingSchool.value = false
  }
  if (isStudent.value) {
    await fetchSubjects()
  }
})

// Stats diferenciados por role
const statsAdmin = [
  { rotulo: 'Total de Usuários', valor: 186, mudanca: 12, icone: '👥', fundoIcone: 'bg-primary-50' },
  { rotulo: 'Turmas Ativas', valor: 12, mudanca: 2, icone: '📚', fundoIcone: 'bg-purple-50' },
  { rotulo: 'Taxa de Conclusão', valor: 87, mudanca: -3, formato: 'porcentagem' as const, icone: '✅', fundoIcone: 'bg-green-50' },
  { rotulo: 'Média Geral', valor: 82, mudanca: 5.4, formato: 'porcentagem' as const, icone: '📊', fundoIcone: 'bg-blue-50' }
]

const statsTeacher = [
  { rotulo: 'Meus Alunos', valor: 72, mudanca: 4, icone: '👥', fundoIcone: 'bg-primary-50' },
  { rotulo: 'Minhas Turmas', valor: 3, mudanca: 0, icone: '📚', fundoIcone: 'bg-purple-50' },
  { rotulo: 'Pendentes de Correção', valor: 8, mudanca: -2, icone: '📝', fundoIcone: 'bg-warning-50' },
  { rotulo: 'Média das Turmas', valor: 78, mudanca: 3.1, formato: 'porcentagem' as const, icone: '📊', fundoIcone: 'bg-blue-50' }
]

// Filtros do aluno
const filtroDisciplina = ref('')
const filtroPeriodo = ref('')

const opcoesPeriodo = [
  { rotulo: '1º Trimestre', valor: '1tri' },
  { rotulo: '2º Trimestre', valor: '2tri' },
  { rotulo: '3º Trimestre', valor: '3tri' }
]

const { subjects, fetchSubjects } = useSubjects()

const opcoesDisciplina = computed(() =>
  subjects.value.map(s => ({ rotulo: s.name, valor: s.id }))
)

// Mock data — Admin/Pedagogue
const turmasResumo = [
  { nome: 'Matemática 9º A', desempenho: 82, alunos: 24 },
  { nome: 'Física 1º EM', desempenho: 65, alunos: 30 },
  { nome: 'História 8º B', desempenho: 92, alunos: 28 }
]

const atividadesRecentes = [
  { icone: '📝', descricao: 'Prova de Matemática corrigida — 9º A', tempo: 'Há 2 horas' },
  { icone: '👤', descricao: 'Novo aluno matriculado — Pedro Lima', tempo: 'Há 4 horas' },
  { icone: '📊', descricao: 'Relatório mensal gerado — Fevereiro', tempo: 'Ontem' }
]

// Mock data — Teacher
const minhasTurmas = [
  { nome: 'Matemática 9º A', alunos: 24, saude: 82, to: '/turmas/mat-9a' },
  { nome: 'Matemática 8º B', alunos: 28, saude: 75, to: '/turmas/mat-8b' },
  { nome: 'Matemática 1º EM', alunos: 30, saude: 58, to: '/turmas/mat-1em' }
]

const pendentesCorrecao = [
  { titulo: 'Prova Bimestral', turma: 'Matemática 9º A', quantidade: 3 },
  { titulo: 'Lista de Exercícios', turma: 'Matemática 8º B', quantidade: 5 }
]

// Mock data — Student (com disciplinaId e periodo para filtros)
const todasAtividadesPendentes = [
  { titulo: 'Lista de Exercícios 4', disciplina: 'Matemática', disciplinaId: 'mat', periodo: '1tri', prazo: '25/02' },
  { titulo: 'Trabalho sobre Revolução Francesa', disciplina: 'História', disciplinaId: 'his', periodo: '1tri', prazo: '28/02' },
  { titulo: 'Redação Argumentativa', disciplina: 'Língua Portuguesa', disciplinaId: 'por', periodo: '2tri', prazo: '05/03' },
  { titulo: 'Exercícios de Cinemática', disciplina: 'Física', disciplinaId: 'fis', periodo: '1tri', prazo: '01/03' }
]

const todasNotasRecentes = [
  { avaliacao: 'Prova Bimestral', disciplina: 'Matemática', disciplinaId: 'mat', periodo: '1tri', valor: 8.5 },
  { avaliacao: 'Trabalho em Grupo', disciplina: 'Física', disciplinaId: 'fis', periodo: '1tri', valor: 9.0 },
  { avaliacao: 'Prova Mensal', disciplina: 'História', disciplinaId: 'his', periodo: '2tri', valor: 6.5 },
  { avaliacao: 'Simulado', disciplina: 'Matemática', disciplinaId: 'mat', periodo: '2tri', valor: 7.0 },
  { avaliacao: 'Trabalho Individual', disciplina: 'Língua Portuguesa', disciplinaId: 'por', periodo: '1tri', valor: 8.0 }
]

const atividadesPendentes = computed(() =>
  todasAtividadesPendentes.filter(a => {
    const matchDisciplina = !filtroDisciplina.value || a.disciplinaId === filtroDisciplina.value
    const matchPeriodo = !filtroPeriodo.value || a.periodo === filtroPeriodo.value
    return matchDisciplina && matchPeriodo
  })
)

const notasRecentes = computed(() =>
  todasNotasRecentes.filter(n => {
    const matchDisciplina = !filtroDisciplina.value || n.disciplinaId === filtroDisciplina.value
    const matchPeriodo = !filtroPeriodo.value || n.periodo === filtroPeriodo.value
    return matchDisciplina && matchPeriodo
  })
)

const mediaCalculada = computed(() => {
  const notas = notasRecentes.value
  if (notas.length === 0) return 0
  return Math.round(notas.reduce((acc: number, n) => acc + n.valor, 0) / notas.length * 10)
})

const statsStudent = computed(() => [
  { rotulo: 'Atividades Pendentes', valor: atividadesPendentes.value.length, mudanca: -1, icone: '📝', fundoIcone: 'bg-warning-50' },
  { rotulo: 'Nota Média', valor: mediaCalculada.value, mudanca: 2.3, formato: 'porcentagem' as const, icone: '📊', fundoIcone: 'bg-blue-50' },
  { rotulo: 'Avaliações Concluídas', valor: notasRecentes.value.length, mudanca: 3, icone: '✅', fundoIcone: 'bg-green-50' },
  { rotulo: 'Posição na Turma', valor: 5, mudanca: 2, icone: '🏆', fundoIcone: 'bg-purple-50' }
])

const statsVisiveis = computed(() => {
  if (isAdmin.value || isPedagogue.value) return statsAdmin
  if (isTeacher.value) return statsTeacher
  return statsStudent.value
})

// Performance chart data por período
const dadosPerformancePorPeriodo: Record<string, { rotulos: string[]; valores: number[] }> = {
  '': { rotulos: ['MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT'], valores: [6.5, 7.0, 6.8, 7.5, 7.2, 8.0, 7.8, 8.5] },
  '1tri': { rotulos: ['MAR', 'ABR'], valores: [6.5, 7.0] },
  '2tri': { rotulos: ['MAI', 'JUN', 'JUL'], valores: [6.8, 7.5, 7.2] },
  '3tri': { rotulos: ['AGO', 'SET', 'OUT'], valores: [8.0, 7.8, 8.5] }
}

const dadosPerformance = computed(() =>
  dadosPerformancePorPeriodo[filtroPeriodo.value] || dadosPerformancePorPeriodo['']
)

// Resumo lateral
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

// Dificuldades por disciplina
const todasDificuldades = [
  { nome: 'Equações de 1º Grau', disciplinaId: 'mat', disciplina: 'Matemática', pontuacao: 35, nivel: 'critico' },
  { nome: 'Funções', disciplinaId: 'mat', disciplina: 'Matemática', pontuacao: 42, nivel: 'critico' },
  { nome: 'Regra de Três', disciplinaId: 'mat', disciplina: 'Matemática', pontuacao: 58, nivel: 'desenvolvimento' },
  { nome: 'Interpretação de Texto', disciplinaId: 'por', disciplina: 'Língua Portuguesa', pontuacao: 45, nivel: 'critico' },
  { nome: 'Concordância Verbal', disciplinaId: 'por', disciplina: 'Língua Portuguesa', pontuacao: 62, nivel: 'desenvolvimento' },
  { nome: 'Revolução Francesa', disciplinaId: 'his', disciplina: 'História', pontuacao: 50, nivel: 'desenvolvimento' },
  { nome: 'Cinemática', disciplinaId: 'fis', disciplina: 'Física', pontuacao: 38, nivel: 'critico' }
]

const dificuldadesFiltradas = computed(() =>
  todasDificuldades
    .filter(d => !filtroDisciplina.value || d.disciplinaId === filtroDisciplina.value)
    .sort((a, b) => a.pontuacao - b.pontuacao)
)
</script>
