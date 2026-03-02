<template>
  <div>
    <div class="mb-8">
      <h1 class="text-heading-1">Grade Curricular</h1>
      <p class="text-body text-text-secondary mt-1">Defina quais disciplinas cada série deve ter</p>
    </div>

    <div v-if="loadingPage" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Lista de séries -->
      <div>
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Séries</h2>
            <button @click="modalNovaSerie = true" class="btn-primary text-sm flex items-center gap-1.5">
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </Icone>
              Nova
            </button>
          </div>

          <div v-if="gradeLevels.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma série cadastrada</p>
            <p class="text-xs text-gray-400 mt-1">Crie séries ou cadastre turmas com série definida</p>
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="gl in gradeLevels"
              :key="gl"
              @click="selecionarSerie(gl)"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors',
                serieSelecionada === gl
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="text-sm">{{ gl }}</span>
              <span class="text-xs text-gray-400">
                {{ contadorDisciplinas[gl] || 0 }} disc.
              </span>
            </button>
          </div>
        </Cartao>
      </div>

      <!-- Disciplinas da série selecionada -->
      <div class="lg:col-span-2">
        <Cartao v-if="!serieSelecionada">
          <div class="py-12 text-center">
            <span class="text-3xl mb-2 block">📋</span>
            <p class="text-sm font-medium text-gray-500">Selecione uma série</p>
            <p class="text-xs text-gray-400 mt-1">para configurar as disciplinas</p>
          </div>
        </Cartao>

        <Cartao v-else>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-heading-3">{{ serieSelecionada }}</h2>
              <p class="text-xs text-gray-500 mt-1">
                {{ disciplinasSelecionadas.size }} de {{ todasDisciplinas.length }} disciplinas selecionadas
              </p>
            </div>
            <button
              v-if="temAlteracoes"
              @click="salvarCurriculo"
              :disabled="salvando"
              class="btn-primary text-sm"
            >
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>

          <div v-if="todasDisciplinas.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-500">Nenhuma disciplina cadastrada na escola</p>
            <p class="text-xs text-gray-400 mt-1">Cadastre disciplinas em Gestão de Turmas → Vincular Professor</p>
          </div>

          <div v-else class="space-y-1">
            <label
              v-for="disc in todasDisciplinas"
              :key="disc.id"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors',
                disciplinasSelecionadas.has(disc.id) ? 'bg-primary-50' : 'hover:bg-gray-50'
              ]"
            >
              <input
                type="checkbox"
                :checked="disciplinasSelecionadas.has(disc.id)"
                @change="toggleDisciplina(disc.id)"
                class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span
                :class="[
                  'text-sm',
                  disciplinasSelecionadas.has(disc.id) ? 'font-semibold text-primary-700' : 'text-gray-700'
                ]"
              >
                {{ disc.name }}
              </span>
              <span v-if="disc.code" class="text-xs text-gray-400 ml-auto">{{ disc.code }}</span>
            </label>
          </div>
        </Cartao>
      </div>
    </div>

    <!-- Modal Nova Série -->
    <Modal
      :esta-aberto="modalNovaSerie"
      titulo="Nova Série"
      @fechar="modalNovaSerie = false"
    >
      <div class="space-y-4">
        <div>
          <label class="form-label">Nome da Série *</label>
          <input
            type="text"
            v-model="novaSerie"
            class="form-input"
            placeholder="Ex: 1º Ano, 2ª Série..."
            @keyup.enter="criarSerie"
          />
          <p v-if="erroNovaSerie" class="mt-1 text-xs text-critical-500">{{ erroNovaSerie }}</p>
        </div>
      </div>
      <template #rodape>
        <button @click="modalNovaSerie = false" class="btn-outline">Cancelar</button>
        <button @click="criarSerie" class="btn-primary" :disabled="!novaSerie.trim()">Criar</button>
      </template>
    </Modal>

    <!-- Notificação -->
    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      :mensagem="notificacao.mensagem"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { subjects, fetchSubjects } = useSubjects()
const { fetchAllGradeLevels, fetchCurriculum, bulkSetCurriculum } = useGradeCurricula()

const loadingPage = ref(true)
const gradeLevels = ref<string[]>([])
const serieSelecionada = ref('')
const disciplinasSelecionadas = ref(new Set<string>())
const disciplinasOriginais = ref(new Set<string>())
const salvando = ref(false)

// Contador de disciplinas por série
const contadorDisciplinas = ref<Record<string, number>>({})

// Modal nova série
const modalNovaSerie = ref(false)
const novaSerie = ref('')
const erroNovaSerie = ref('')

// Notificação
const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

const todasDisciplinas = computed(() =>
  subjects.value.map(s => ({ id: s.id, name: s.name, code: s.code }))
)

const temAlteracoes = computed(() => {
  if (disciplinasSelecionadas.value.size !== disciplinasOriginais.value.size) return true
  for (const id of disciplinasSelecionadas.value) {
    if (!disciplinasOriginais.value.has(id)) return true
  }
  return false
})

const selecionarSerie = async (gl: string) => {
  serieSelecionada.value = gl
  const curriculum = await fetchCurriculum(gl)
  const ids = new Set(curriculum.map(c => c.subject_id))
  disciplinasSelecionadas.value = ids
  disciplinasOriginais.value = new Set(ids)
}

const toggleDisciplina = (id: string) => {
  const novo = new Set(disciplinasSelecionadas.value)
  if (novo.has(id)) {
    novo.delete(id)
  } else {
    novo.add(id)
  }
  disciplinasSelecionadas.value = novo
}

const salvarCurriculo = async () => {
  if (!serieSelecionada.value) return
  salvando.value = true
  try {
    await bulkSetCurriculum(serieSelecionada.value, [...disciplinasSelecionadas.value])
    disciplinasOriginais.value = new Set(disciplinasSelecionadas.value)
    contadorDisciplinas.value[serieSelecionada.value] = disciplinasSelecionadas.value.size
    mostrarNotificacao('sucesso', 'Grade salva com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar grade')
  } finally {
    salvando.value = false
  }
}

const criarSerie = () => {
  erroNovaSerie.value = ''
  const nome = novaSerie.value.trim()
  if (!nome) {
    erroNovaSerie.value = 'Nome é obrigatório'
    return
  }
  if (gradeLevels.value.includes(nome)) {
    erroNovaSerie.value = 'Esta série já existe'
    return
  }
  gradeLevels.value.push(nome)
  gradeLevels.value.sort()
  contadorDisciplinas.value[nome] = 0
  modalNovaSerie.value = false
  novaSerie.value = ''
  selecionarSerie(nome)
}

// Carregar contadores para cada série
const carregarContadores = async () => {
  for (const gl of gradeLevels.value) {
    const curriculum = await fetchCurriculum(gl)
    contadorDisciplinas.value[gl] = curriculum.length
  }
}

onMounted(async () => {
  await Promise.all([fetchSubjects(), fetchAllGradeLevels().then(levels => {
    gradeLevels.value = levels
  })])
  await carregarContadores()
  loadingPage.value = false
})
</script>
