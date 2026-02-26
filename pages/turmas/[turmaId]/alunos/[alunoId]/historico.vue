<template>
  <div>
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            @click="navigateTo('/turmas')"
            class="hover:text-gray-900 transition-colors"
          >
            Turmas
          </button>
          <span class="text-gray-400 text-base">›</span>
          <button
            @click="navigateTo(`/turmas/${turmaId}`)"
            class="hover:text-gray-900 transition-colors"
          >
            Matemática 9º Ano A
          </button>
          <span class="text-gray-400 text-base">›</span>
          <button
            @click="navigateTo(`/turmas/${turmaId}/alunos/${alunoId}`)"
            class="hover:text-gray-900 transition-colors"
          >
            {{ aluno.nome }}
          </button>
          <span class="text-gray-400 text-base">›</span>
          <span class="text-gray-900 font-semibold">Pasta Digital</span>
        </div>

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-black text-gray-900">Pasta Digital</h1>
            <p class="text-base text-gray-500 mt-1">
              Histórico completo de avaliações de <strong>{{ aluno.nome }}</strong> — {{ aluno.serie }} • {{ aluno.disciplina }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <Botao variante="contorno" @click="exportarTudo">
              <template #icone-esquerda>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </Icone>
              </template>
              <template #default>Exportar Tudo</template>
            </Botao>
            <Botao variante="primario" @click="abrirModalEscanear">
              <template #icone-esquerda>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </Icone>
              </template>
              <template #default>Escanear Nova Prova</template>
            </Botao>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <BarraBusca
            v-model="filtros.busca"
            texto-reservado="Buscar avaliação..."
            class="w-full md:w-72"
          />

          <CampoSelecao
            v-model="filtros.categoria"
            :opcoes="opcoesCategoria"
            texto-reservado="Todas as categorias"
          />

          <CampoSelecao
            v-model="filtros.periodo"
            :opcoes="opcoesPeriodo"
            texto-reservado="Todos os períodos"
          />

          <CampoSelecao
            v-model="filtros.ordenacao"
            :opcoes="opcoesOrdenacao"
          />
        </div>

        <!-- Resumo rápido -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            v-for="stat in resumo"
            :key="stat.rotulo"
            class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: stat.fundoIcone }"
            >
              <Icone :tamanho="18" :class="stat.corIcone">
                <path stroke-linecap="round" stroke-linejoin="round" :d="stat.caminhoIcone" />
              </Icone>
            </div>
            <div>
              <p class="text-xs text-gray-500">{{ stat.rotulo }}</p>
              <p class="text-lg font-bold text-gray-900">{{ stat.valor }}</p>
            </div>
          </div>
        </div>

        <!-- Grid de avaliações por período -->
        <div v-for="grupo in gruposProvasFiltrados" :key="grupo.periodo" class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <Icone :tamanho="16" class="text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </Icone>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {{ grupo.periodo }}
            </h3>
            <span class="text-xs text-gray-400">— {{ grupo.provas.length }} avaliações</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CartaoProva
              v-for="prova in grupo.provas"
              :key="prova.id"
              :titulo="prova.titulo"
              :data="prova.data"
              :categoria="prova.categoria"
              :nota="prova.nota"
              @click="navigateTo(`/turmas/${turmaId}/alunos/${alunoId}/provas/${prova.id}`)"
            />
          </div>
        </div>

        <!-- Estado vazio -->
        <div
          v-if="gruposProvasFiltrados.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl"
        >
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Icone :tamanho="40" class="text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </Icone>
          </div>
          <p class="text-gray-900 font-semibold text-lg mb-2">Nenhuma avaliação encontrada</p>
          <p class="text-sm text-gray-400">Tente ajustar os filtros ou escanear uma nova prova.</p>
        </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRoute, navigateTo } from '#app'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import BarraBusca from '~/components/form/BarraBusca/BarraBusca.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import CartaoProva from '~/components/composed/CartaoProva/CartaoProva.vue'

const route = useRoute()
const turmaId = route.params.turmaId as string
const alunoId = route.params.alunoId as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const filtros = reactive({
  categoria: '',
  periodo: '',
  ordenacao: 'recente',
  busca: ''
})

const opcoesCategoria = [
  { rotulo: 'Álgebra', valor: 'Álgebra' },
  { rotulo: 'Funções', valor: 'Funções' },
  { rotulo: 'Geometria', valor: 'Geometria' },
  { rotulo: 'Estatística', valor: 'Estatística' },
  { rotulo: 'Geral', valor: 'Geral' }
]

const opcoesPeriodo = [
  { rotulo: '3º Trimestre 2023', valor: '3tri2023' },
  { rotulo: '2º Trimestre 2023', valor: '2tri2023' },
  { rotulo: '1º Trimestre 2023', valor: '1tri2023' },
  { rotulo: '4º Trimestre 2022', valor: '4tri2022' }
]

const opcoesOrdenacao = [
  { rotulo: 'Mais recentes', valor: 'recente' },
  { rotulo: 'Mais antigas', valor: 'antigo' },
  { rotulo: 'Maior nota', valor: 'nota-alta' },
  { rotulo: 'Menor nota', valor: 'nota-baixa' }
]

const resumo = [
  {
    rotulo: 'Total de Provas',
    valor: '18',
    fundoIcone: '#e8edff',
    corIcone: 'text-blue-600',
    caminhoIcone: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
  },
  {
    rotulo: 'Média Geral',
    valor: '7.2',
    fundoIcone: '#e6f4ea',
    corIcone: 'text-green-600',
    caminhoIcone: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941'
  },
  {
    rotulo: 'Maior Nota',
    valor: '9.5',
    fundoIcone: '#fff3e0',
    corIcone: 'text-yellow-600',
    caminhoIcone: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0'
  },
  {
    rotulo: 'Menor Nota',
    valor: '4.5',
    fundoIcone: '#fdecea',
    corIcone: 'text-red-600',
    caminhoIcone: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
  }
]

// TODO: substituir por useFetch()
const aluno = {
  nome: 'Ana Silva',
  serie: '8º Ano B',
  disciplina: 'Matemática'
}

const gruposProvas = [
  {
    periodo: '3º Trimestre 2023',
    valorPeriodo: '3tri2023',
    provas: [
      { id: 'prova-3tri', titulo: 'Prova Mensal - 3º Tri', data: '12 Out 2023', categoria: 'Álgebra', nota: 4.5 },
      { id: 'lista-04', titulo: 'Lista de Exercícios 04', data: '28 Set 2023', categoria: 'Funções', nota: 6.8 },
      { id: 'trabalho-grupo', titulo: 'Trabalho em Grupo', data: '15 Set 2023', categoria: 'Geometria', nota: 9.5 },
      { id: 'simulado', titulo: 'Simulado Nacional', data: '01 Set 2023', categoria: 'Geral', nota: 8.0 }
    ]
  },
  {
    periodo: '2º Trimestre 2023',
    valorPeriodo: '2tri2023',
    provas: [
      { id: 'prova-2tri', titulo: 'Prova Mensal - 2º Tri', data: '15 Jul 2023', categoria: 'Geometria', nota: 7.2 },
      { id: 'lista-03', titulo: 'Lista de Exercícios 03', data: '02 Jul 2023', categoria: 'Álgebra', nota: 6.5 },
      { id: 'seminario', titulo: 'Seminário de Grupo', data: '20 Jun 2023', categoria: 'Estatística', nota: 8.8 },
      { id: 'quiz-02', titulo: 'Quiz Relâmpago 02', data: '10 Jun 2023', categoria: 'Funções', nota: 5.5 }
    ]
  },
  {
    periodo: '1º Trimestre 2023',
    valorPeriodo: '1tri2023',
    provas: [
      { id: 'prova-1tri', titulo: 'Prova Mensal - 1º Tri', data: '12 Abr 2023', categoria: 'Álgebra', nota: 3.8 },
      { id: 'lista-02', titulo: 'Lista de Exercícios 02', data: '28 Mar 2023', categoria: 'Álgebra', nota: 5.0 },
      { id: 'lista-01', titulo: 'Lista de Exercícios 01', data: '15 Mar 2023', categoria: 'Geral', nota: 4.2 },
      { id: 'diagnostica', titulo: 'Avaliação Diagnóstica', data: '01 Mar 2023', categoria: 'Geral', nota: 2.3 }
    ]
  }
]

const gruposProvasFiltrados = computed(() => {
  return gruposProvas
    .map(grupo => {
      let provas = [...grupo.provas]

      // Filtro por período
      if (filtros.periodo && grupo.valorPeriodo !== filtros.periodo) return null

      // Filtro por categoria
      if (filtros.categoria) {
        provas = provas.filter(p => p.categoria === filtros.categoria)
      }

      // Filtro por busca
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase()
        provas = provas.filter(p => p.titulo.toLowerCase().includes(busca))
      }

      // Ordenação
      if (filtros.ordenacao === 'nota-alta') provas.sort((a, b) => b.nota - a.nota)
      if (filtros.ordenacao === 'nota-baixa') provas.sort((a, b) => a.nota - b.nota)
      if (filtros.ordenacao === 'antigo') provas.reverse()

      if (provas.length === 0) return null

      return { ...grupo, provas }
    })
    .filter((grupo): grupo is NonNullable<typeof grupo> => grupo !== null)
})

const abrirModalEscanear = () => {
  navigateTo(`/turmas/${turmaId}/escanear`)
}

const exportarTudo = () => {
  // TODO: implementar exportação completa
}
</script>
