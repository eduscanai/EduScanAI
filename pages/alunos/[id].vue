<template>
  <div>
        <!-- HEADER DO ALUNO -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Avatar e Info Principal -->
            <div class="flex items-start gap-4">
              <Avatar
                :image="aluno.avatar"
                :alt="aluno.nome"
                :size="80"
                border-color="#4f46e5"
                :border-width="3"
              />
              <div>
                <h1 class="text-3xl font-black text-gray-900">{{ aluno.nome }}</h1>
                <p class="text-base text-gray-500 mt-1">{{ aluno.email }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-sm text-gray-600">{{ aluno.turma }}</span>
                  <span class="text-gray-300">•</span>
                  <span class="text-sm text-gray-600">Matrícula: {{ aluno.matricula }}</span>
                </div>
              </div>
            </div>

            <!-- Status e Ações -->
            <div class="flex-1 flex justify-end items-start gap-3">
              <Etiqueta :variante="varianteStatus(aluno.status)" :mostrar-ponto="true">
                {{ aluno.statusTexto }}
              </Etiqueta>
              <Botao
                variante="contorno"
                icone="..."
                @click="abrirMenuAcoes"
              >
                <template #default>Ações</template>
              </Botao>
            </div>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CartaoEstatistica
            v-for="stat in statsAluno"
            :key="stat.rotulo"
            :rotulo="stat.rotulo"
            :valor="stat.valor"
            :formato="stat.formato"
            :icone="stat.icone"
            :fundo-icone="stat.fundoIcone"
            :mudanca="stat.mudanca"
          />
        </div>

        <!-- Layout 2 colunas -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- COLUNA PRINCIPAL (2/3) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Insights da IA -->
            <div class="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-200 p-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">🤖</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Análise da IA</h3>
                  <p class="text-base text-gray-700">{{ aluno.analiseIA }}</p>
                </div>
              </div>
            </div>

            <!-- Áreas de Domínio -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icone :tamanho="20" class="text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Icone>
                <h2 class="text-xl font-bold text-gray-900">Áreas de Domínio</h2>
              </div>
              <div class="space-y-3">
                <div
                  v-for="area in aluno.areasDominio"
                  :key="area.nome"
                  class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">{{ area.nome }}</p>
                    <p class="text-sm text-gray-600">{{ area.categoria }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-bold text-green-600">{{ area.pontuacao }}%</span>
                    <div class="w-24">
                      <BarraProgresso
                        :valor="area.pontuacao"
                        :maximo="100"
                        :altura="6"
                        variante="sucesso"
                        :mostrar-porcentagem="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Áreas de Dificuldade -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icone :tamanho="20" class="text-red-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </Icone>
                <h2 class="text-xl font-bold text-gray-900">Áreas de Dificuldade</h2>
              </div>
              <div class="space-y-3">
                <div
                  v-for="area in aluno.areasDificuldade"
                  :key="area.nome"
                  class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">{{ area.nome }}</p>
                    <p class="text-sm text-gray-600">{{ area.categoria }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-bold text-red-600">{{ area.pontuacao }}%</span>
                    <div class="w-24">
                      <BarraProgresso
                        :valor="area.pontuacao"
                        :maximo="100"
                        :altura="6"
                        variante="critico"
                        :mostrar-porcentagem="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <button
                  class="text-sm font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                  @click="gerarPlanoRecuperacao"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </Icone>
                  Gerar Plano de Recuperação com IA
                </button>
              </div>
            </div>

            <!-- Histórico de Atividades -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">Histórico de Atividades</h2>
                <button class="text-sm font-semibold text-primary-500 hover:text-primary-600">
                  Ver todas
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="atividade in aluno.historicoAtividades"
                  :key="atividade.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">{{ atividade.titulo }}</p>
                    <p class="text-sm text-gray-500">{{ atividade.data }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <span
                      class="px-3 py-1 rounded-lg text-sm font-bold text-white"
                      :class="classeCorNota(atividade.nota)"
                    >
                      {{ atividade.nota }}
                    </span>
                    <Etiqueta :variante="varianteStatusAtividade(atividade.status)">
                      {{ atividade.statusTexto }}
                    </Etiqueta>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- SIDEBAR DIREITA (1/3) -->
          <div class="flex flex-col gap-6">

            <!-- Resumo de Desempenho -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumo de Desempenho</p>

              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-700">Média Global</span>
                    <span class="text-sm font-bold text-gray-900">{{ aluno.mediaGlobal }}</span>
                  </div>
                  <BarraProgresso
                    :valor="(aluno.mediaGlobal / 10) * 100"
                    :maximo="100"
                    :altura="6"
                    variante="primario"
                    :mostrar-porcentagem="false"
                  />
                </div>

                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-700">Atividades</span>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600">
                    <span>Entregues: {{ aluno.atividadesEntregues }}</span>
                    <span>Pendentes: {{ aluno.atividadesPendentes }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-4">
                <Icone :tamanho="20">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </Icone>
                <h2 class="text-lg font-bold text-gray-900">Ações Rápidas</h2>
              </div>

              <div class="flex flex-col gap-3">
                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition text-left"
                  @click="agendarReuniao"
                >
                  <span class="text-sm text-gray-700">Agendar Reunião</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </Icone>
                </button>

                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition text-left"
                  @click="enviarMensagem"
                >
                  <span class="text-sm text-gray-700">Enviar Mensagem</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </Icone>
                </button>

                <button
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition text-left"
                  @click="exportarRelatorio"
                >
                  <span class="text-sm text-gray-700">Exportar Relatório</span>
                  <Icone :tamanho="18" class="text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </Icone>
                </button>
              </div>
            </div>

            <!-- Informações Adicionais -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informações</p>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Responsável:</span>
                  <span class="font-semibold text-gray-900">{{ aluno.responsavel }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Telefone:</span>
                  <span class="font-semibold text-gray-900">{{ aluno.telefone }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Data Matrícula:</span>
                  <span class="font-semibold text-gray-900">{{ aluno.dataMatricula }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Etiqueta from '~/components/ui/Etiqueta/Etiqueta.vue'
import BarraProgresso from '~/components/data/BarraProgresso/BarraProgresso.vue'
import CartaoEstatistica from '~/components/data/CartaoEstatistica/CartaoEstatistica.vue'

const route = useRoute()
const alunoId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue']
})

const statsAluno = [
  {
    rotulo: 'Média Geral',
    valor: 8.5,
    icone: '📊',
    fundoIcone: 'bg-[#e8edff]',
    mudanca: 5
  },
  {
    rotulo: 'Atividades Entregues',
    valor: 28,
    icone: '📝',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Posição na Turma',
    valor: '3º',
    icone: '🏆',
    fundoIcone: 'bg-[#fff3e0]'
  }
]

// TODO: Buscar dados do aluno via API
const aluno = {
  nome: 'Ana Silva',
  email: 'ana.silva@escola.com',
  avatar: '',
  turma: 'Matemática 9º Ano A',
  matricula: '2024001',
  status: 'excelente',
  statusTexto: 'Desempenho Excelente',
  mediaGlobal: 8.5,
  atividadesEntregues: 28,
  atividadesPendentes: 2,
  responsavel: 'Maria Silva',
  telefone: '(11) 98765-4321',
  dataMatricula: '01/02/2024',
  analiseIA: 'Ana demonstra excelente compreensão dos conceitos matemáticos. Destaca-se em álgebra e geometria, com raciocínio lógico muito desenvolvido. Recomenda-se desafios adicionais para manter o engajamento.',
  areasDominio: [
    { nome: 'Frações e Operações', categoria: 'Álgebra', pontuacao: 95 },
    { nome: 'Geometria Plana', categoria: 'Geometria', pontuacao: 92 },
    { nome: 'Regra de Três', categoria: 'Aritmética', pontuacao: 88 }
  ],
  areasDificuldade: [
    { nome: 'Equações de 2º Grau', categoria: 'Álgebra', pontuacao: 62 },
    { nome: 'Trigonometria Básica', categoria: 'Geometria', pontuacao: 58 }
  ],
  historicoAtividades: [
    {
      id: 1,
      titulo: 'Prova Trimestral - Funções',
      data: '15/05/2024',
      nota: 9.5,
      status: 'entregue',
      statusTexto: 'Entregue'
    },
    {
      id: 2,
      titulo: 'Trabalho em Grupo - Geometria',
      data: '10/05/2024',
      nota: 8.0,
      status: 'entregue',
      statusTexto: 'Entregue'
    },
    {
      id: 3,
      titulo: 'Lista de Exercícios - Álgebra',
      data: '05/05/2024',
      nota: 9.0,
      status: 'entregue',
      statusTexto: 'Entregue'
    }
  ]
}

const varianteStatus = (status: string) => {
  const map: Record<string, 'dominado' | 'em-progresso' | 'em-risco'> = {
    'excelente': 'dominado',
    'bom': 'em-progresso',
    'regular': 'em-progresso',
    'atencao': 'em-risco'
  }
  return map[status] || 'em-progresso'
}

const varianteStatusAtividade = (status: string) => {
  const map: Record<string, 'dominado' | 'em-progresso' | 'processando'> = {
    'entregue': 'dominado',
    'pendente': 'em-progresso',
    'atrasada': 'processando'
  }
  return map[status] || 'em-progresso'
}

const classeCorNota = (nota: number) => {
  if (nota >= 9) return 'bg-green-500'
  if (nota >= 7) return 'bg-blue-500'
  if (nota >= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const abrirMenuAcoes = () => {
  console.log('Abrir menu de ações')
}

const gerarPlanoRecuperacao = () => {
  console.log('Gerar plano de recuperação')
}

const agendarReuniao = () => {
  console.log('Agendar reunião')
}

const enviarMensagem = () => {
  console.log('Enviar mensagem')
}

const exportarRelatorio = () => {
  console.log('Exportar relatório')
}
</script>
