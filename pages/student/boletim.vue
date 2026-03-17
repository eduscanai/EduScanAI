<template>
  <div>
    <div class="mb-8">
      <h1 class="text-heading-1">Meu Boletim</h1>
      <p class="text-body text-text-secondary mt-1">Acompanhe suas notas por trimestre</p>
    </div>

    <Carregando v-if="loadingPage" texto="Carregando boletim..." />

    <div v-else-if="gradingPeriods.length === 0">
      <Cartao>
        <div class="py-12 text-center">
          <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </Icone>
          <p class="text-body font-medium text-gray-600">Boletim ainda não disponível</p>
          <p class="text-sm text-gray-400 mt-1">As notas serão exibidas após aprovação dos professores</p>
        </div>
      </Cartao>
    </div>

    <div v-else>
      <!-- Abas dos trimestres -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="p in gradingPeriods"
          :key="p.id"
          @click="selecionarPeriodo(p)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            periodoAtivo === p.id
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          ]"
        >
          {{ p.name }}
        </button>
      </div>

      <!-- Carregando detalhes -->
      <Carregando v-if="loadingDetalhes" texto="Carregando notas..." />

      <!-- Sem notas -->
      <div v-else-if="studentDetails.length === 0">
        <Cartao>
          <div class="py-8 text-center">
            <p class="text-sm text-gray-500">Nenhuma nota disponível para este trimestre</p>
            <p class="text-xs text-gray-400 mt-1">As notas aparecerão quando os professores lançarem atividades</p>
          </div>
        </Cartao>
      </div>

      <!-- Disciplinas com atividades -->
      <div v-else class="space-y-4">
        <Cartao v-for="disc in studentDetails" :key="disc.subjectId">
          <!-- Cabeçalho da disciplina (clicável) -->
          <button
            @click="toggleDisciplina(disc.subjectId)"
            class="w-full flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-semibold text-gray-900">{{ disc.subjectName }}</h3>
              <span
                v-if="disc.status === 'approved'"
                :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', classeSituacao(disc.finalGrade ?? disc.calculatedAverage)]"
              >
                {{ situacao(disc.finalGrade ?? disc.calculatedAverage) }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <span :class="['text-lg font-bold', corNota(disc.finalGrade ?? disc.calculatedAverage)]">
                {{ formatNota(disc.finalGrade ?? disc.calculatedAverage) }}
              </span>
              <Icone :tamanho="18" class="text-gray-400 transition-transform" :class="{ 'rotate-180': expandidas.has(disc.subjectId) }">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </Icone>
            </div>
          </button>

          <!-- Tabela de atividades (expandível) -->
          <div v-if="expandidas.has(disc.subjectId)" class="mt-4 border-t border-gray-100 pt-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-gray-500">
                  <th class="text-left pb-2 font-medium">Atividade</th>
                  <th class="text-center pb-2 font-medium">Categoria</th>
                  <th class="text-center pb-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="atv in disc.assignments" :key="atv.id" class="border-t border-gray-50">
                  <td class="py-2.5 text-gray-700">{{ atv.title }}</td>
                  <td class="py-2.5 text-center">
                    <span v-if="atv.categoryName" class="text-xs text-gray-400">{{ atv.categoryName }}</span>
                    <span v-else class="text-xs text-gray-300">-</span>
                  </td>
                  <td class="py-2.5 text-center">
                    <span v-if="atv.score !== null" :class="['font-semibold', corNota(normalizar(atv.score, atv.maxScore))]">
                      {{ atv.score }}<span class="text-gray-400 font-normal">/{{ atv.maxScore }}</span>
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Observações do professor -->
            <div v-if="disc.observations" class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs text-gray-500">
                <span class="font-medium">Observação:</span> {{ disc.observations }}
              </p>
            </div>
          </div>
        </Cartao>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'student']
})

const { usuario } = useUsuario()
const { studentDetails, fetchStudentGradeDetails } = useBoletim()
const { gradingPeriods, fetchGradingPeriods } = useGradingPeriods()
const { academicYears, fetchAcademicYears } = useAcademicYear()

const periodoAtivo = ref('')
const loadingPage = ref(true)
const loadingDetalhes = ref(false)
const expandidas = ref(new Set<string>())

const toggleDisciplina = (id: string) => {
  const novo = new Set(expandidas.value)
  if (novo.has(id)) {
    novo.delete(id)
  } else {
    novo.add(id)
  }
  expandidas.value = novo
}

const selecionarPeriodo = async (periodo: any) => {
  if (periodoAtivo.value === periodo.id) return
  periodoAtivo.value = periodo.id
  expandidas.value = new Set()
  if (usuario.value.id) {
    loadingDetalhes.value = true
    await fetchStudentGradeDetails(usuario.value.id, periodo.id)
    loadingDetalhes.value = false
  }
}

// Normalizar nota para escala 0-10
const normalizar = (score: number, maxScore: number) => {
  return maxScore > 0 ? (score / maxScore) * 10 : 0
}

// Formatação
const formatNota = (nota: number | null) => {
  if (nota === null) return '-'
  return nota.toFixed(1)
}

const corNota = (nota: number | null) => {
  if (nota === null) return 'text-gray-400'
  if (nota >= 7) return 'text-green-600'
  if (nota >= 5) return 'text-amber-600'
  return 'text-critical-500'
}

const situacao = (nota: number | null) => {
  if (nota === null) return '-'
  if (nota >= 7) return 'Aprovado'
  if (nota >= 5) return 'Recuperação'
  return 'Insuficiente'
}

const classeSituacao = (nota: number | null) => {
  if (nota === null) return 'bg-gray-100 text-gray-500'
  if (nota >= 7) return 'bg-green-50 text-green-700'
  if (nota >= 5) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-critical-700'
}

onMounted(async () => {
  await fetchAcademicYears()
  const anoCorrente = academicYears.value.find(a => a.is_current)
  if (anoCorrente) {
    await fetchGradingPeriods(anoCorrente.id)
  }
  // Selecionar primeiro período e carregar detalhes
  if (gradingPeriods.value.length > 0 && usuario.value.id) {
    const primeiro = gradingPeriods.value[0]
    periodoAtivo.value = primeiro.id
    loadingDetalhes.value = true
    await fetchStudentGradeDetails(usuario.value.id, primeiro.id)
    loadingDetalhes.value = false
  }
  loadingPage.value = false
})
</script>
