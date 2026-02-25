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

        <!-- GRID DE TURMAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CartaoTurma
            v-for="turma in turmas"
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
        <CampoSelecao
          id="disciplina"
          v-model="formulario.disciplina"
          rotulo="Disciplina"
          texto-reservado="Selecione a disciplina"
          :opcoes="opcoesDisciplina"
          :erro="erros.disciplina"
        />

        <div class="grid grid-cols-2 gap-4">
          <CampoSelecao
            id="serie"
            v-model="formulario.serie"
            rotulo="Série"
            texto-reservado="Selecione a série"
            :opcoes="opcoesSerie"
            :erro="erros.serie"
          />

          <CampoFormulario
            id="turma"
            v-model="formulario.turma"
            rotulo="Turma"
            texto-reservado="Ex: A, B, C"
            :erro="erros.turma"
          />
        </div>

        <CampoSelecao
          id="anoLetivo"
          v-model="formulario.anoLetivo"
          rotulo="Ano Letivo"
          :opcoes="opcoesAnoLetivo"
          :erro="erros.anoLetivo"
        />
      </form>

      <template #rodape>
        <Botao variante="contorno" @click="fecharModal">
          Cancelar
        </Botao>
        <Botao variante="primario" @click="criarTurma">
          <template #icone-esquerda>
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </Icone>
          </template>
          Criar Turma
        </Botao>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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

const { canManageClasses } = usePermissions()

const stats = [
  {
    rotulo: 'Total de Alunos',
    valor: 168,
    icone: '👥',
    fundoIcone: 'bg-[#e8edff]'
  },
  {
    rotulo: 'Média Geral',
    valor: 78,
    formato: 'porcentagem' as const,
    icone: '📈',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Correções Pendentes',
    valor: 12,
    icone: '📋',
    fundoIcone: 'bg-[#fff3e0]'
  }
]

const turmas = [
  {
    subject: 'Matemática',
    grade: '9º Ano A',
    studentCount: 24,
    healthScore: 82,
    aiSummary: 'Excelente domínio dos tópicos recentes.',
    icon: 'sigma',
    iconBg: '#6f42c1',
    to: '/turmas/matematica-9a'
  },
  {
    subject: 'Física',
    grade: '1º Ano Ensino Médio',
    studentCount: 30,
    healthScore: 65,
    aiSummary: 'Atenção necessária em Dinâmica.',
    icon: 'rocket',
    iconBg: '#6f42c1',
    to: '/turmas/fisica-1em'
  },
  {
    subject: 'História',
    grade: '8º Ano B',
    studentCount: 28,
    healthScore: 92,
    aiSummary: 'Turma com desempenho excepcional.',
    icon: 'book-open',
    iconBg: '#f59e0b',
    to: '/turmas/historia-8b'
  },
  {
    subject: 'Geografia',
    grade: '9º Ano C',
    studentCount: 25,
    healthScore: 78,
    aiSummary: 'Bom desempenho geral.',
    icon: 'globe',
    iconBg: '#20c997',
    to: '/turmas/geografia-9c'
  },
  {
    subject: 'Química',
    grade: '2º Ano Ensino Médio',
    studentCount: 32,
    healthScore: 45,
    aiSummary: 'Alto índice de dificuldades em Estequiometria.',
    icon: 'flask-conical',
    iconBg: '#dc3545',
    to: '/turmas/quimica-2em'
  },
  {
    subject: 'Biologia',
    grade: '1º Ano Ensino Médio',
    studentCount: 29,
    healthScore: 88,
    aiSummary: 'Turma participativa e engajada.',
    icon: 'leaf',
    iconBg: '#28a745',
    to: '/turmas/biologia-1em'
  }
]

// Modal Criar Turma
const modalAberto = ref(false)

const formulario = reactive({
  disciplina: '' as string | number,
  serie: '' as string | number,
  turma: '' as string | number,
  anoLetivo: '2023' as string | number
})

const erros = reactive({
  disciplina: '',
  serie: '',
  turma: '',
  anoLetivo: ''
})

const opcoesDisciplina = [
  { rotulo: 'Matemática', valor: 'matematica' },
  { rotulo: 'Física', valor: 'fisica' },
  { rotulo: 'Química', valor: 'quimica' },
  { rotulo: 'Biologia', valor: 'biologia' },
  { rotulo: 'História', valor: 'historia' },
  { rotulo: 'Geografia', valor: 'geografia' },
  { rotulo: 'Português', valor: 'portugues' },
  { rotulo: 'Inglês', valor: 'ingles' }
]

const opcoesSerie = [
  { rotulo: '6º Ano', valor: '6-ano' },
  { rotulo: '7º Ano', valor: '7-ano' },
  { rotulo: '8º Ano', valor: '8-ano' },
  { rotulo: '9º Ano', valor: '9-ano' },
  { rotulo: '1º Ano EM', valor: '1-em' },
  { rotulo: '2º Ano EM', valor: '2-em' },
  { rotulo: '3º Ano EM', valor: '3-em' }
]

const opcoesAnoLetivo = [
  { rotulo: '2023', valor: '2023' },
  { rotulo: '2024', valor: '2024' },
  { rotulo: '2025', valor: '2025' }
]

const abrirModalCriarTurma = () => {
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  formulario.disciplina = ''
  formulario.serie = ''
  formulario.turma = ''
  formulario.anoLetivo = '2023'
  erros.disciplina = ''
  erros.serie = ''
  erros.turma = ''
  erros.anoLetivo = ''
}

const criarTurma = () => {
  erros.disciplina = ''
  erros.serie = ''
  erros.turma = ''
  erros.anoLetivo = ''

  let valido = true

  if (!formulario.disciplina) {
    erros.disciplina = 'Selecione uma disciplina'
    valido = false
  }
  if (!formulario.serie) {
    erros.serie = 'Selecione a série'
    valido = false
  }
  if (!formulario.turma) {
    erros.turma = 'Informe a turma'
    valido = false
  }
  if (!formulario.anoLetivo) {
    erros.anoLetivo = 'Selecione o ano letivo'
    valido = false
  }

  if (!valido) return

  // TODO: enviar dados para API
  console.log('Turma criada:', { ...formulario })
  fecharModal()
}
</script>
