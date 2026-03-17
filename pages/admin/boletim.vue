<template>
  <div>
    <div class="mb-8">
      <h1 class="text-heading-1">Configuração do Boletim</h1>
      <p class="text-body text-text-secondary mt-1">Gerencie trimestres e categorias de avaliação</p>
    </div>

    <Carregando v-if="loadingPage" texto="Carregando..." />

    <div v-else class="space-y-8">
      <!-- Seção 1: Trimestres -->
      <Cartao>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-heading-3">Trimestres</h2>
            <p class="text-xs text-gray-500 mt-1">Defina os períodos de avaliação do ano letivo</p>
          </div>
          <div class="flex items-center gap-3">
            <CampoSelecao
              :modelValue="anoSelecionado"
              @update:modelValue="anoSelecionado = $event as string"
              texto-reservado="Ano letivo"
              :opcoes="opcoesAno"
            />
            <button
              v-if="gradingPeriods.length === 0 && anoSelecionado"
              @click="gerarTrimestres"
              class="btn-primary text-sm flex items-center gap-1.5"
            >
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </Icone>
              Gerar Trimestres
            </button>
          </div>
        </div>

        <div v-if="!anoSelecionado" class="py-8 text-center">
          <p class="text-sm text-gray-500">Selecione um ano letivo para configurar os trimestres</p>
        </div>

        <div v-else-if="gradingPeriods.length === 0" class="py-8 text-center">
          <p class="text-sm text-gray-500">Nenhum trimestre configurado</p>
          <p class="text-xs text-gray-400 mt-1">Clique em "Gerar Trimestres" para criar automaticamente</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="periodo in gradingPeriods"
            :key="periodo.id"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="text-xs text-gray-500">Nome</label>
                <input
                  type="text"
                  :value="periodo.name"
                  @change="atualizarPeriodo(periodo.id, 'name', ($event.target as HTMLInputElement).value)"
                  class="form-input text-sm mt-1"
                />
              </div>
              <div>
                <label class="text-xs text-gray-500">Início</label>
                <input
                  type="date"
                  :value="periodo.start_date"
                  @change="atualizarPeriodo(periodo.id, 'start_date', ($event.target as HTMLInputElement).value)"
                  class="form-input text-sm mt-1"
                />
              </div>
              <div>
                <label class="text-xs text-gray-500">Fim</label>
                <input
                  type="date"
                  :value="periodo.end_date"
                  @change="atualizarPeriodo(periodo.id, 'end_date', ($event.target as HTMLInputElement).value)"
                  class="form-input text-sm mt-1"
                />
              </div>
            </div>
            <button
              @click="confirmarExcluirPeriodo(periodo)"
              class="p-2 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors flex-shrink-0"
              title="Excluir"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </Icone>
            </button>
          </div>
        </div>
      </Cartao>

      <!-- Seção 2: Categorias de Avaliação -->
      <Cartao>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-heading-3">Categorias de Avaliação</h2>
            <p class="text-xs text-gray-500 mt-1">
              Defina os tipos de atividade e seus pesos na média
              <span v-if="somaTotal > 0" :class="somaTotal === 100 ? 'text-green-600' : 'text-amber-600'">
                — Total: {{ somaTotal }}%
              </span>
            </p>
          </div>
          <button @click="modalNovaCategoria = true" :disabled="somaTotal >= 100" class="btn-primary text-sm flex items-center gap-1.5">
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </Icone>
            Nova Categoria
          </button>
        </div>

        <div v-if="categories.length === 0" class="py-8 text-center">
          <p class="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
          <p class="text-xs text-gray-400 mt-1">Categorias definem o peso de cada tipo de atividade na média</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-gray-500">Nome</label>
                <input
                  type="text"
                  :value="cat.name"
                  @change="atualizarCategoria(cat.id, 'name', ($event.target as HTMLInputElement).value)"
                  class="form-input text-sm mt-1"
                />
              </div>
              <div>
                <label class="text-xs text-gray-500">Peso (%)</label>
                <input
                  type="number"
                  :value="cat.weight"
                  @change="validarEAtualizarPeso(cat, Number(($event.target as HTMLInputElement).value), $event)"
                  class="form-input text-sm mt-1"
                  min="1"
                  :max="100 - somaTotal + Number(cat.weight)"
                />
              </div>
            </div>
            <button
              @click="confirmarExcluirCategoria(cat)"
              class="p-2 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors flex-shrink-0"
              title="Excluir"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </Icone>
            </button>
          </div>
        </div>
      </Cartao>
    </div>

    <!-- Modal Nova Categoria -->
    <Modal :esta-aberto="modalNovaCategoria" titulo="Nova Categoria" @fechar="modalNovaCategoria = false">
      <div class="space-y-4">
        <div>
          <label class="form-label">Nome *</label>
          <input
            type="text"
            v-model="novaCategoria.name"
            class="form-input"
            placeholder="Ex: Prova, Trabalho, Exercício"
          />
        </div>
        <div>
          <label class="form-label">Peso (%) *</label>
          <input
            type="number"
            v-model.number="novaCategoria.weight"
            class="form-input"
            :placeholder="`Máx: ${100 - somaTotal}%`"
            min="1"
            :max="100 - somaTotal"
          />
          <p v-if="somaTotal < 100" class="text-xs text-gray-400 mt-1">Disponível: {{ 100 - somaTotal }}%</p>
        </div>
        <p v-if="erroCategoria" class="text-xs text-critical-500">{{ erroCategoria }}</p>
      </div>
      <template #rodape>
        <button @click="modalNovaCategoria = false" class="btn-outline">Cancelar</button>
        <button @click="criarNovaCategoria" class="btn-primary" :disabled="criandoCategoria">
          {{ criandoCategoria ? 'Criando...' : 'Criar' }}
        </button>
      </template>
    </Modal>

    <!-- Diálogos de confirmação -->
    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir.visivel"
      :titulo="dialogoExcluir.titulo"
      :mensagem="dialogoExcluir.mensagem"
      variante="perigo"
      texto-confirmar="Excluir"
      @confirmar="executarExclusao"
      @cancelar="dialogoExcluir.visivel = false"
    />

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
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { academicYears, fetchAcademicYears } = useAcademicYear()
const {
  gradingPeriods, fetchGradingPeriods,
  createGradingPeriod, updateGradingPeriod, deleteGradingPeriod
} = useGradingPeriods()
const {
  categories, fetchCategories,
  createCategory, updateCategory, deleteCategory
} = useAssignmentCategories()

const loadingPage = ref(true)
const anoSelecionado = ref('')

const opcoesAno = computed(() =>
  academicYears.value.map(a => ({ rotulo: a.name, valor: a.id }))
)

const somaTotal = computed(() =>
  categories.value.reduce((sum, c) => sum + Number(c.weight), 0)
)

// Modal nova categoria
const modalNovaCategoria = ref(false)
const criandoCategoria = ref(false)
const erroCategoria = ref('')
const novaCategoria = ref({ name: '', weight: 0 })

// Diálogo de exclusão genérico
const dialogoExcluir = ref({
  visivel: false,
  titulo: '',
  mensagem: '',
  tipo: '' as 'periodo' | 'categoria',
  id: ''
})

// Notificação
const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

// Gerar 3 trimestres automaticamente
const gerarTrimestres = async () => {
  const ano = academicYears.value.find(a => a.id === anoSelecionado.value)
  if (!ano) return

  // Derivar ano a partir do start_date ou do nome (ex: "2025", "Ano Letivo 2025")
  let year: number
  if (ano.start_date) {
    year = new Date(ano.start_date).getFullYear()
  } else {
    const match = ano.name.match(/\d{4}/)
    year = match ? parseInt(match[0]) : new Date().getFullYear()
  }

  const trimestres = [
    { name: '1º Trimestre', number: 1, start_date: `${year}-02-01`, end_date: `${year}-04-30` },
    { name: '2º Trimestre', number: 2, start_date: `${year}-05-01`, end_date: `${year}-08-31` },
    { name: '3º Trimestre', number: 3, start_date: `${year}-09-01`, end_date: `${year}-12-15` }
  ]

  try {
    for (const t of trimestres) {
      await createGradingPeriod({ ...t, academic_year_id: anoSelecionado.value })
    }
    await fetchGradingPeriods(anoSelecionado.value)
    mostrarNotificacao('sucesso', 'Trimestres criados com sucesso')
  } catch (e: any) {
    console.error('Erro ao criar trimestres:', e)
    mostrarNotificacao('critico', 'Erro ao criar trimestres', e?.message || '')
  }
}

// Atualizar período inline
const atualizarPeriodo = async (id: string, campo: string, valor: string) => {
  try {
    await updateGradingPeriod(id, { [campo]: valor } as any)
    await fetchGradingPeriods(anoSelecionado.value)
  } catch (e: any) {
    console.error('Erro ao atualizar período:', e)
    mostrarNotificacao('critico', 'Erro ao atualizar período', e?.message || '')
  }
}

// Criar categoria
const criarNovaCategoria = async () => {
  erroCategoria.value = ''
  if (!novaCategoria.value.name.trim()) {
    erroCategoria.value = 'Nome é obrigatório'
    return
  }
  if (novaCategoria.value.weight <= 0) {
    erroCategoria.value = 'Peso deve ser maior que 0'
    return
  }
  if (somaTotal.value + novaCategoria.value.weight > 100) {
    erroCategoria.value = `Peso máximo disponível: ${100 - somaTotal.value}% (total não pode ultrapassar 100%)`
    return
  }

  criandoCategoria.value = true
  try {
    await createCategory(novaCategoria.value)
    await fetchCategories()
    modalNovaCategoria.value = false
    novaCategoria.value = { name: '', weight: 0 }
    mostrarNotificacao('sucesso', 'Categoria criada')
  } catch (e: any) {
    console.error('Erro ao criar categoria:', e)
    erroCategoria.value = e?.message || 'Erro ao criar categoria. Verifique se o nome já existe.'
  } finally {
    criandoCategoria.value = false
  }
}

// Validar peso antes de atualizar (não pode ultrapassar 100%)
const validarEAtualizarPeso = (cat: any, novoPeso: number, event: Event) => {
  const somaOutras = somaTotal.value - Number(cat.weight)
  const maximo = 100 - somaOutras
  if (novoPeso > maximo) {
    mostrarNotificacao('critico', 'Peso excede o limite', `Máximo permitido: ${maximo}%`)
    ;(event.target as HTMLInputElement).value = String(cat.weight)
    return
  }
  if (novoPeso <= 0) {
    ;(event.target as HTMLInputElement).value = String(cat.weight)
    return
  }
  atualizarCategoria(cat.id, 'weight', novoPeso)
}

// Atualizar categoria inline
const atualizarCategoria = async (id: string, campo: string, valor: string | number) => {
  try {
    await updateCategory(id, { [campo]: valor } as any)
    await fetchCategories()
  } catch (e: any) {
    console.error('Erro ao atualizar categoria:', e)
    mostrarNotificacao('critico', 'Erro ao atualizar categoria', e?.message || '')
  }
}

// Confirmar exclusão
const confirmarExcluirPeriodo = (periodo: any) => {
  dialogoExcluir.value = {
    visivel: true,
    titulo: 'Excluir período',
    mensagem: `Excluir "${periodo.name}"? Isso pode afetar notas vinculadas.`,
    tipo: 'periodo',
    id: periodo.id
  }
}

const confirmarExcluirCategoria = (cat: any) => {
  dialogoExcluir.value = {
    visivel: true,
    titulo: 'Excluir categoria',
    mensagem: `Excluir "${cat.name}"? Atividades desta categoria ficarão sem peso definido.`,
    tipo: 'categoria',
    id: cat.id
  }
}

const executarExclusao = async () => {
  const { tipo, id } = dialogoExcluir.value
  dialogoExcluir.value.visivel = false
  try {
    if (tipo === 'periodo') {
      await deleteGradingPeriod(id)
      await fetchGradingPeriods(anoSelecionado.value)
    } else {
      await deleteCategory(id)
      await fetchCategories()
    }
    mostrarNotificacao('sucesso', 'Excluído com sucesso')
  } catch (e: any) {
    console.error('Erro ao excluir:', e)
    mostrarNotificacao('critico', 'Erro ao excluir', e?.message || '')
  }
}

// Watch ano selecionado
watch(anoSelecionado, async (val) => {
  if (val) await fetchGradingPeriods(val)
})

onMounted(async () => {
  await Promise.all([fetchAcademicYears(), fetchCategories()])
  // Selecionar ano corrente
  const anoCorrente = academicYears.value.find(a => a.is_current)
  if (anoCorrente) anoSelecionado.value = anoCorrente.id
  loadingPage.value = false
})
</script>
