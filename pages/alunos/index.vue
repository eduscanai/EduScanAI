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

          <!-- Lado Direito -->
          <div class="flex gap-3">
            <Botao
              variante="contorno"
              icone="↓"
              posicao-icone="esquerda"
              @click="exportarLista"
            >
              <template #icone-esquerda>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </Icone>
              </template>
              <template #default>Exportar</template>
            </Botao>
            <Botao
              variante="primario"
              icone="+"
              posicao-icone="esquerda"
              @click="abrirModalNovoAluno"
            >
              <template #icone-esquerda>
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </Icone>
              </template>
              <template #default>Novo Aluno</template>
            </Botao>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <!-- FILTROS E BUSCA -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <BarraBusca
                v-model="buscaAlunos"
                texto-reservado="Buscar por nome, turma ou status..."
                class="w-full"
              />
            </div>
            <select
              v-model="filtroTurma"
              class="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas as Turmas</option>
              <option v-for="turma in turmas" :key="turma.valor" :value="turma.valor">
                {{ turma.rotulo }}
              </option>
            </select>
            <select
              v-model="filtroStatus"
              class="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos os Status</option>
              <option value="excelente">Excelente</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="atencao">Necessita Atenção</option>
            </select>
          </div>
        </div>

        <!-- TABELA DE ALUNOS -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <TabelaDados :colunas="colunasAlunos" :dados="alunosFiltrados">
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

            <template #celula-turma="{ linha }">
              <span class="text-sm text-gray-700">{{ linha.turma }}</span>
            </template>

            <template #celula-media="{ linha }">
              <span
                class="px-3 py-1 rounded-lg text-sm font-bold text-white"
                :class="classeCorMedia(linha.media)"
              >
                {{ linha.media }}
              </span>
            </template>

            <template #celula-status="{ linha }">
              <Etiqueta :variante="varianteStatus(linha.status)" :mostrar-ponto="true">
                {{ linha.statusTexto }}
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
            Mostrando {{ alunosFiltrados.length }} de {{ alunos.length }} alunos
          </p>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Anterior
            </button>
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Próxima
            </button>
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Botao from '~/components/ui/Botao/Botao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
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

const stats = [
  {
    rotulo: 'Total de Alunos',
    valor: 156,
    icone: '👥',
    fundoIcone: 'bg-[#e8edff]'
  },
  {
    rotulo: 'Média Geral',
    valor: 7.6,
    icone: '📊',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Taxa de Aprovação',
    valor: 89,
    formato: 'porcentagem' as const,
    icone: '✓',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Necessitam Atenção',
    valor: 12,
    icone: '⚠️',
    fundoIcone: 'bg-[#fff3e0]'
  }
]

const turmas = [
  { valor: 'matematica-9a', rotulo: 'Matemática 9º A' },
  { valor: 'fisica-1em', rotulo: 'Física 1º EM' },
  { valor: 'historia-8b', rotulo: 'História 8º B' }
]

const buscaAlunos = ref('')
const filtroTurma = ref('')
const filtroStatus = ref('')

const colunasAlunos = [
  { chave: 'aluno', rotulo: 'Aluno' },
  { chave: 'turma', rotulo: 'Turma' },
  { chave: 'media', rotulo: 'Média' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'acoes', rotulo: 'Ações' }
]

const alunos = [
  {
    id: 'ana-silva',
    nome: 'Ana Silva',
    email: 'ana.silva@escola.com',
    avatar: '',
    turma: 'Matemática 9º A',
    media: 8.5,
    status: 'excelente',
    statusTexto: 'Excelente'
  },
  {
    id: 'bruno-santos',
    nome: 'Bruno Santos',
    email: 'bruno.santos@escola.com',
    avatar: '',
    turma: 'Matemática 9º A',
    media: 7.2,
    status: 'bom',
    statusTexto: 'Bom'
  },
  {
    id: 'carla-oliveira',
    nome: 'Carla Oliveira',
    email: 'carla.oliveira@escola.com',
    avatar: '',
    turma: 'Física 1º EM',
    media: 6.5,
    status: 'regular',
    statusTexto: 'Regular'
  },
  {
    id: 'daniel-costa',
    nome: 'Daniel Costa',
    email: 'daniel.costa@escola.com',
    avatar: '',
    turma: 'História 8º B',
    media: 5.2,
    status: 'atencao',
    statusTexto: 'Atenção'
  },
  {
    id: 'eduarda-lima',
    nome: 'Eduarda Lima',
    email: 'eduarda.lima@escola.com',
    avatar: '',
    turma: 'Matemática 9º A',
    media: 9.0,
    status: 'excelente',
    statusTexto: 'Excelente'
  },
  {
    id: 'felipe-martins',
    nome: 'Felipe Martins',
    email: 'felipe.martins@escola.com',
    avatar: '',
    turma: 'Física 1º EM',
    media: 7.8,
    status: 'bom',
    statusTexto: 'Bom'
  }
]

const alunosFiltrados = computed(() => {
  return alunos.filter(aluno => {
    const matchBusca = aluno.nome.toLowerCase().includes(buscaAlunos.value.toLowerCase()) ||
                       aluno.email.toLowerCase().includes(buscaAlunos.value.toLowerCase()) ||
                       aluno.turma.toLowerCase().includes(buscaAlunos.value.toLowerCase())

    const matchTurma = !filtroTurma.value || aluno.turma.includes(filtroTurma.value)
    const matchStatus = !filtroStatus.value || aluno.status === filtroStatus.value

    return matchBusca && matchTurma && matchStatus
  })
})

const classeCorMedia = (media: number) => {
  if (media >= 8) return 'bg-green-500'
  if (media >= 7) return 'bg-blue-500'
  if (media >= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const varianteStatus = (status: string) => {
  const map: Record<string, 'dominado' | 'em-progresso' | 'em-risco'> = {
    'excelente': 'dominado',
    'bom': 'dominado',
    'regular': 'em-progresso',
    'atencao': 'em-risco'
  }
  return map[status] || 'em-progresso'
}

const exportarLista = () => {
  console.log('Exportar lista de alunos')
}

const abrirModalNovoAluno = () => {
  console.log('Abrir modal de novo aluno')
}

const navegarParaAluno = (id: string) => {
  router.push(`/alunos/${id}`)
}
</script>
