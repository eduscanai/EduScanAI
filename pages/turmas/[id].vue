<template>
  <div>
        <!-- Header da página -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-black text-gray-900">{{ turma.grade }} - {{ turma.subject }}</h1>
            <p class="text-base text-gray-500 mt-1">
              Visão geral do desempenho coletivo da turma e métricas de aprendizado.
            </p>
          </div>
          <select
            v-model="periodoSelecionado"
            class="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="p in periodos" :key="p.valor" :value="p.valor">{{ p.rotulo }}</option>
          </select>
        </div>

        <!-- Layout 2 colunas: conteúdo principal + sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- COLUNA PRINCIPAL (2/3) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Alerta de Defasagem -->
            <Alerta
              v-if="turma.alerta"
              variante="aviso"
            >
              <div>
                <h3 class="font-bold text-sm mb-1">{{ turma.alerta.titulo }}</h3>
                <p class="text-sm">{{ turma.alerta.mensagem }}</p>
                <button
                  class="text-sm font-semibold text-yellow-700 mt-2 hover:underline"
                  @click="navigateTo(turma.alerta.rotaDetalhes)"
                >
                  Ver Detalhes →
                </button>
              </div>
            </Alerta>

            <!-- Termômetro de Conteúdo -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                  <Icone :tamanho="20">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </Icone>
                  <h2 class="text-xl font-bold text-gray-900">Termômetro de Conteúdo</h2>
                </div>
                <button
                  class="text-sm font-semibold text-primary-500 hover:text-primary-600"
                  @click="navigateTo(`/turmas/${turmaId}/topicos`)"
                >
                  Ver todos os tópicos
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CartaoTopico
                  v-for="topico in turma.topicos"
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
                <div class="flex items-center gap-3">
                  <button @click="alternarFiltro">
                    <Icone :tamanho="18" class="text-gray-500 hover:text-gray-700">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </Icone>
                  </button>
                  <button @click="exportarTabela">
                    <Icone :tamanho="18" class="text-gray-500 hover:text-gray-700">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </Icone>
                  </button>
                </div>
              </div>

              <TabelaDados :colunas="colunasAlunos" :dados="turma.alunos">
                <template #celula-nome="{ linha }">
                  <div
                    class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                    @click="navigateTo(`/turmas/${turmaId}/alunos/${linha.id}`)"
                  >
                    <Avatar
                      :image="''"
                      :alt="linha.nome"
                      :size="32"
                      :border-color="linha.corAvatar"
                    />
                    <span class="font-semibold text-primary-500 hover:text-primary-600">{{ linha.nome }}</span>
                  </div>
                </template>

                <template #celula-nota="{ linha }">
                  <span
                    class="px-3 py-1 rounded-lg text-sm font-bold text-white"
                    :class="classeCorNota(linha.nota)"
                  >
                    {{ linha.nota }}
                  </span>
                </template>

                <template #celula-tendencia="{ linha }">
                  <Icone
                    :tamanho="18"
                    :class="classeCorTendencia(linha.tendencia)"
                  >
                    <path
                      v-if="linha.tendencia === 'up'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                    <path
                      v-else-if="linha.tendencia === 'down'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
                    />
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 12h14"
                    />
                  </Icone>
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

              <div class="flex justify-center mt-4">
                <button class="text-sm font-semibold text-gray-500 flex items-center gap-1 hover:text-gray-700">
                  Ver lista completa
                  <Icone :tamanho="14">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </Icone>
                </button>
              </div>
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
                <!-- Ação primária -->
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

                <!-- Ação secundária -->
                <div
                  class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-sm transition"
                  @click="gerarPlano"
                >
                  <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Icone :tamanho="20" class="text-green-600">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </Icone>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">Gerar Plano de Atividades</p>
                    <p class="text-xs text-gray-500">Plano de recuperação coletivo</p>
                  </div>
                </div>

                <!-- Ações simples -->
                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition"
                  @click="exportarPDF"
                >
                  <span class="text-sm text-gray-700">Exportar Relatório PDF</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </Icone>
                </button>

                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition"
                  @click="notificarPais"
                >
                  <span class="text-sm text-gray-700">Notificar Pais (Resumo)</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                  </Icone>
                </button>
              </div>
            </div>

            <!-- Resumo da Turma -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumo da Turma</p>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-700">Média Geral</span>
                <span class="text-sm font-bold text-gray-900">{{ turma.resumo.media }}</span>
              </div>
              <BarraProgresso
                :valor="turma.resumo.mediaPorcentagem"
                :maximo="100"
                :altura="6"
                variante="primario"
                :mostrar-porcentagem="false"
              />

              <div class="flex justify-between items-center mb-2 mt-4">
                <span class="text-sm text-gray-700">Aprovação Prevista</span>
                <span class="text-sm font-bold text-green-600">{{ turma.resumo.taxaAprovacao }}%</span>
              </div>
              <BarraProgresso
                :valor="turma.resumo.taxaAprovacao"
                :maximo="100"
                :altura="6"
                variante="sucesso"
                :mostrar-porcentagem="false"
              />

              <div class="flex items-start gap-2 mt-4 pt-4 border-t border-gray-200">
                <div class="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <p class="text-xs text-gray-500">
                  Próxima avaliação agendada para <strong>{{ turma.resumo.proximaProva }}</strong>.
                </p>
              </div>
            </div>

          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, navigateTo } from '#app'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'
import Alerta from '~/components/feedback/Alerta/Alerta.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import CartaoTopico from '~/components/composed/CartaoTopico/CartaoTopico.vue'

const route = useRoute()
const turmaId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const periodoSelecionado = ref('1tri2024')
const periodos = [
  { rotulo: '1º Trimestre 2024', valor: '1tri2024' },
  { rotulo: '2º Trimestre 2024', valor: '2tri2024' },
  { rotulo: '3º Trimestre 2024', valor: '3tri2024' },
  { rotulo: '4º Trimestre 2024', valor: '4tri2024' }
]

const colunasAlunos = [
  { chave: 'nome', rotulo: 'Nome do Aluno' },
  { chave: 'nota', rotulo: 'Última Nota' },
  { chave: 'tendencia', rotulo: 'Tendência' },
  { chave: 'acoes', rotulo: 'Ações' }
]

const classeCorNota = (nota: number) => {
  if (nota >= 7) return 'bg-green-500'
  if (nota >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}

const classeCorTendencia = (tendencia: string) => {
  if (tendencia === 'up') return 'text-green-500'
  if (tendencia === 'down') return 'text-red-500'
  return 'text-yellow-500'
}

// TODO: substituir por useFetch() quando conectar ao backend
const turma = {
  subject: 'Matemática',
  grade: '9º Ano A',
  alerta: {
    titulo: 'Alerta de Defasagem',
    mensagem: 'Atenção: 65% da turma não compreendeu Equações de 1º grau. Recomendamos revisão urgente deste tópico.',
    rotaDetalhes: `/turmas/${turmaId}/alertas`
  },
  topicos: [
    { categoria: 'ÁLGEBRA', nome: 'Frações', pontuacao: 82, tendencia: 'up' as const, rotuloTendencia: '+5% vs semana passada' },
    { categoria: 'GEOMETRIA', nome: 'Geometria Plana', pontuacao: 45, tendencia: 'stable' as const, rotuloTendencia: '— Estável' },
    { categoria: 'ÁLGEBRA', nome: 'Eq. de 1º Grau', pontuacao: 35, tendencia: 'down' as const, rotuloTendencia: 'Crítico' }
  ],
  alunos: [
    { id: 'ana-silva', nome: 'Ana Silva', iniciais: 'AS', corAvatar: '#20c997', nota: 8.5, tendencia: 'up' },
    { id: 'bruno-oliveira', nome: 'Bruno Oliveira', iniciais: 'BO', corAvatar: '#ffc107', nota: 6.2, tendencia: 'stable' },
    { id: 'carla-santos', nome: 'Carla Santos', iniciais: 'CS', corAvatar: '#6f42c1', nota: 4.5, tendencia: 'down' },
    { id: 'daniel-martins', nome: 'Daniel Martins', iniciais: 'DM', corAvatar: '#1132d4', nota: 9.0, tendencia: 'up' }
  ],
  resumo: {
    media: '7.4',
    mediaPorcentagem: 74,
    taxaAprovacao: 88,
    proximaProva: '15 de Junho'
  }
}

const abrirModalScan = () => {
  navigateTo(`/turmas/${turmaId}/escanear`)
}

const gerarPlano = () => {
  console.log('Gerar plano de atividades')
}

const exportarPDF = () => {
  console.log('Exportar PDF')
}

const notificarPais = () => {
  console.log('Notificar pais')
}

const alternarFiltro = () => {
  console.log('Alternar filtro')
}

const exportarTabela = () => {
  console.log('Exportar tabela')
}
</script>
