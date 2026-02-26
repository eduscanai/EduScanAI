<template>
  <div>
        <!-- Loading -->
        <div v-if="loadingPage" class="py-12 text-center">
          <p class="text-sm text-gray-500">Carregando aluno...</p>
        </div>

        <!-- Not found -->
        <div v-else-if="!aluno" class="py-12 text-center">
          <p class="text-lg font-semibold text-gray-500">Aluno não encontrado</p>
        </div>

        <template v-else>
        <!-- HEADER DO ALUNO -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Avatar e Info Principal -->
            <div class="flex items-start gap-4">
              <Avatar
                :image="aluno.avatar_url || ''"
                :alt="aluno.full_name || ''"
                :size="80"
                border-color="#4f46e5"
                :border-width="3"
              />
              <div>
                <h1 class="text-3xl font-black text-gray-900">{{ aluno.full_name || 'Sem nome' }}</h1>
                <p class="text-base text-gray-500 mt-1">{{ aluno.email || '' }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span v-if="aluno.matricula" class="text-sm text-gray-600">Matrícula: {{ aluno.matricula }}</span>
                  <span v-if="aluno.sexo" class="text-gray-300">•</span>
                  <span v-if="aluno.sexo" class="text-sm text-gray-600">{{ aluno.sexo === 'M' ? 'Masculino' : 'Feminino' }}</span>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="flex-1 flex justify-end items-start gap-3">
              <Etiqueta :variante="aluno.is_active ? 'dominado' : 'em-risco'" :mostrar-ponto="true">
                {{ aluno.is_active ? 'Ativo' : 'Inativo' }}
              </Etiqueta>
            </div>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <CartaoEstatistica
            v-for="stat in statsAluno"
            :key="stat.rotulo"
            :rotulo="stat.rotulo"
            :valor="stat.valor"
            :icone="stat.icone"
            :fundo-icone="stat.fundoIcone"
          />
        </div>

        <!-- Layout 2 colunas -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- COLUNA PRINCIPAL (2/3) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Histórico de Atividades -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">Histórico de Atividades</h2>
              </div>
              <div v-if="historicoAtividades.length === 0" class="py-6 text-center">
                <p class="text-sm text-gray-500">Nenhuma avaliação corrigida.</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="atividade in historicoAtividades"
                  :key="atividade.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">{{ atividade.titulo }}</p>
                    <p class="text-sm text-gray-500">{{ atividade.disciplina }} · {{ atividade.data }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <span
                      class="px-3 py-1 rounded-lg text-sm font-bold text-white"
                      :class="classeCorNota(atividade.nota)"
                    >
                      {{ atividade.nota.toFixed(1) }}
                    </span>
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
                    <span class="text-sm font-bold text-gray-900">{{ mediaGlobal }}</span>
                  </div>
                  <BarraProgresso
                    :valor="mediaPct"
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
                    <span>Entregues: {{ totalEntregues }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informações Adicionais -->
            <div class="bg-white border border-gray-200 rounded-xl p-5">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informações</p>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Data Nascimento:</span>
                  <span class="font-semibold text-gray-900">{{ aluno.data_nascimento ? formatarData(aluno.data_nascimento) : '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">CPF:</span>
                  <span class="font-semibold text-gray-900">{{ aluno.cpf || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Cadastro:</span>
                  <span class="font-semibold text-gray-900">{{ formatarData(aluno.created_at) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
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

const { usuario } = useUsuario()
const { fetchUser } = useUsers()
const { fetchGradedForStudent } = useSubmissions()

const loadingPage = ref(true)
const aluno = ref<any>(null)
const rawNotas = ref<any[]>([])

const formatarData = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const classeCorNota = (nota: number) => {
  if (nota >= 9) return 'bg-green-500'
  if (nota >= 7) return 'bg-blue-500'
  if (nota >= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Computed data from submissions
const historicoAtividades = computed(() =>
  rawNotas.value.map(s => {
    const maxScore = s.assignments?.max_score || 10
    return {
      id: s.id,
      titulo: s.assignments?.title || 'Avaliação',
      disciplina: s.assignments?.subjects?.name || '',
      data: s.graded_at ? formatarData(s.graded_at) : '',
      nota: (s.score / maxScore) * 10
    }
  })
)

const mediaGlobal = computed(() => {
  if (historicoAtividades.value.length === 0) return '—'
  const avg = historicoAtividades.value.reduce((a, b) => a + b.nota, 0) / historicoAtividades.value.length
  return avg.toFixed(1)
})

const mediaPct = computed(() => {
  if (historicoAtividades.value.length === 0) return 0
  const avg = historicoAtividades.value.reduce((a, b) => a + b.nota, 0) / historicoAtividades.value.length
  return Math.round(avg * 10)
})

const totalEntregues = computed(() => rawNotas.value.length)

const statsAluno = computed(() => [
  {
    rotulo: 'Média Geral',
    valor: mediaGlobal.value === '—' ? 0 : parseFloat(mediaGlobal.value),
    icone: '📊',
    fundoIcone: 'bg-[#e8edff]'
  },
  {
    rotulo: 'Atividades Entregues',
    valor: totalEntregues.value,
    icone: '📝',
    fundoIcone: 'bg-[#e6f4ea]'
  },
  {
    rotulo: 'Disciplinas',
    valor: new Set(rawNotas.value.map(s => s.assignments?.subject_id).filter(Boolean)).size,
    icone: '📚',
    fundoIcone: 'bg-[#fff3e0]'
  }
])

// Init — fetch student data using a different Supabase client call
// since fetchGradedForStudent uses the current user's ID by default
onMounted(async () => {
  const supabase = useSupabaseClient()

  const userData = await fetchUser(alunoId)

  // Verificar que o aluno pertence à mesma escola
  if (!userData || userData.school_id !== usuario.value.schoolId) {
    aluno.value = null
    loadingPage.value = false
    return
  }

  aluno.value = userData

  // Fetch submissions for this specific student (not the logged-in user)
  const { data } = await supabase
    .from('submissions')
    .select('*, assignments(id, title, class_id, subject_id, max_score, due_date, subjects(id, name), classes(name))')
    .eq('student_id', alunoId)
    .not('score', 'is', null)
    .order('graded_at', { ascending: false })
    .limit(20)

  rawNotas.value = (data || []) as any[]
  loadingPage.value = false
})
</script>
