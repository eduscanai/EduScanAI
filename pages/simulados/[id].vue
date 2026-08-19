<template>
  <div>
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/simulados"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-heading-1">{{ simulado?.titulo || 'Simulado' }}</h1>
        <p class="text-body text-text-secondary mt-1">{{ simulado?.turmas?.name }}</p>
      </div>
      <NuxtLink v-if="canScanExams" :to="`/simulados/${idSimulado}/escanear`" class="btn-primary flex items-center gap-2 no-underline">
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-1.5m-12 0h12m-12 0l1.5-3h9l1.5 3m-13.5 0h13.5" />
        </Icone>
        Escanear folhas
      </NuxtLink>
    </div>

    <Carregando v-if="loading" texto="Carregando simulado..." />

    <template v-else-if="simulado">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Cartao>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Questões</p>
          <p class="text-2xl font-bold mt-1">{{ simulado.questoes?.length || 0 }}</p>
        </Cartao>
        <Cartao>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Valor total</p>
          <p class="text-2xl font-bold mt-1">{{ simulado.valor_maximo }}</p>
        </Cartao>
        <Cartao>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Corrigidos</p>
          <p class="text-2xl font-bold mt-1">{{ corrigidos.length }} / {{ roster.length }}</p>
        </Cartao>
      </div>

      <Cartao class="mb-6">
        <h2 class="text-heading-3 mb-4">Materiais</h2>
        <div class="flex flex-wrap gap-3">
          <Botao variante="contorno" :carregando="carregandoUrl === 'folha'" @click="baixar('folha')">
            Baixar folha de respostas
          </Botao>
          <Botao variante="contorno" :carregando="carregandoUrl === 'solucao'" @click="baixar('solucao')">
            Baixar solução (gabarito marcado)
          </Botao>
          <Botao variante="contorno" :carregando="carregandoUrl === 'todas'" @click="baixarTodasAsFolhas">
            Baixar todas as folhas (turma inteira)
          </Botao>
        </div>
        <p class="text-xs text-gray-400 mt-3">
          Um PDF só, com uma folha personalizada (com QR) por aluno matriculado — pronto pra imprimir de uma vez.
        </p>
      </Cartao>

      <Cartao v-if="pendentes.length > 0" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-heading-3">Aguardando confirmação ({{ pendentes.length }})</h2>
          <Botao variante="contorno" :carregando="confirmandoTodos" @click="confirmarTodosPendentes">
            Confirmar todos
          </Botao>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Resultado do lote ainda não é oficial pro aluno — confira a nota e a folha antes de confirmar.
        </p>

        <div class="space-y-3">
          <div
            v-for="linha in pendentes"
            :key="linha.student_id"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ linha.full_name }}</p>
                <p class="text-xs text-gray-500">
                  Nota detectada:
                  <span class="font-semibold">{{ linha.envio?.nota ?? '—' }}</span>
                  <span v-if="linha.envio?.percentual !== null && linha.envio?.percentual !== undefined">
                    ({{ linha.envio.percentual }}%)
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="linha.envio?.imagem_processada_url"
                  @click="verImagem(linha.envio.imagem_processada_url)"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  Ver folha
                </button>
                <button
                  @click="alternarEdicao(linha)"
                  class="text-xs text-gray-500 hover:text-primary-600 font-medium"
                >
                  {{ editandoEnvioId === linha.envio?.id ? 'Fechar edição' : 'Editar respostas' }}
                </button>
                <Botao
                  variante="destrutivo"
                  :carregando="processandoEnvioId === linha.envio?.id + '-rejeitar'"
                  @click="rejeitar(linha)"
                >
                  Rejeitar
                </Botao>
                <Botao
                  variante="primario"
                  :carregando="processandoEnvioId === linha.envio?.id + '-confirmar'"
                  @click="confirmar(linha)"
                >
                  Confirmar
                </Botao>
              </div>
            </div>

            <div
              v-if="editandoEnvioId === linha.envio?.id"
              class="mt-3 pt-3 border-t border-gray-100"
            >
              <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                <div v-for="questao in simulado?.questoes || []" :key="questao.numero">
                  <label class="block text-[10px] text-gray-500 mb-0.5">Questão {{ questao.numero }}</label>
                  <select
                    v-model="respostasEditadas[`q${questao.numero}`]"
                    class="form-input py-1 text-xs"
                  >
                    <option value="">em branco</option>
                    <option
                      v-for="letra in alternativasDe(questao.option_count)"
                      :key="letra"
                      :value="letra"
                    >
                      {{ letra }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Botao variante="contorno" @click="editandoEnvioId = null">Cancelar</Botao>
                <Botao variante="primario" :carregando="salvandoRespostas" @click="salvarRespostas(linha)">
                  Salvar e recalcular nota
                </Botao>
              </div>
            </div>
          </div>
        </div>
      </Cartao>

      <Cartao>
        <h2 class="text-heading-3 mb-4">Resultado por aluno</h2>

        <TabelaDados :colunas="colunas" :dados="roster">
          <template #celula-nome="{ linha }">
            {{ linha.full_name }}
            <p class="text-xs text-gray-500">{{ linha.matricula || 'sem matrícula cadastrada' }}</p>
          </template>

          <template #celula-status="{ linha }">
            <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', classeStatus(linha.envio?.status_processamento)]">
              {{ rotuloStatus(linha.envio?.status_processamento) }}
            </span>
          </template>

          <template #celula-nota="{ linha }">
            <span v-if="linha.envio?.nota !== null && linha.envio?.nota !== undefined" class="font-semibold">
              {{ linha.envio.nota }} ({{ linha.envio.percentual }}%)
            </span>
            <span v-else class="text-gray-400">—</span>
          </template>

          <template #celula-acoes="{ linha }">
            <div class="flex items-center justify-end gap-3">
              <button
                @click="baixarFolhaAluno(linha.student_id)"
                :disabled="carregandoUrl === `folha-${linha.student_id}`"
                class="text-xs text-gray-500 hover:text-primary-600 font-medium disabled:opacity-50"
              >
                {{ carregandoUrl === `folha-${linha.student_id}` ? 'Gerando...' : 'Baixar folha' }}
              </button>

              <button
                v-if="linha.envio?.imagem_processada_url"
                @click="verImagem(linha.envio.imagem_processada_url)"
                class="text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                Ver folha
              </button>

              <label
                v-if="canScanExams"
                :class="[
                  'text-xs font-medium cursor-pointer',
                  enviandoAluno === linha.student_id
                    ? 'text-gray-400 pointer-events-none'
                    : 'text-gray-500 hover:text-primary-600'
                ]"
              >
                {{ enviandoAluno === linha.student_id ? 'Enviando...' : 'Enviar folha' }}
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  class="hidden"
                  @change="enviarFolhaDoAluno(linha.student_id, $event)"
                />
              </label>
            </div>
          </template>
        </TabelaDados>
      </Cartao>
    </template>

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
import Icone from '~/components/ui/Icone/Icone.vue'
import Botao from '~/components/ui/Botao/Botao.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'
import type { Simulado, SimuladoEnvio } from '~/composables/useSimulados'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student', 'collaborator']
})

const route = useRoute()
const idSimulado = route.params.id as string

const { canScanExams } = usePermissions()
const {
  getSimulado,
  listEnvios,
  urlAssinada,
  enviarIndividual,
  confirmarEnvio,
  rejeitarEnvio,
  confirmarPendentes,
  editarRespostas
} = useSimulados()
const { fetchClassStudents } = useClasses()

const simulado = ref<Simulado | null>(null)
const loading = ref(true)
const carregandoUrl = ref<string | null>(null)

interface LinhaRoster {
  student_id: string
  full_name: string
  matricula: string | null
  envio?: SimuladoEnvio
}

const roster = ref<LinhaRoster[]>([])

const corrigidos = computed(() => roster.value.filter(r => r.envio?.status_processamento === 'corrigido'))
const pendentes = computed(() => roster.value.filter(r => r.envio?.status_processamento === 'aguardando_confirmacao'))

const colunas = [
  { chave: 'nome', rotulo: 'Aluno' },
  { chave: 'status', rotulo: 'Status' },
  { chave: 'nota', rotulo: 'Nota' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

const rotuloStatus = (s?: string) => {
  const m: Record<string, string> = {
    pendente: 'Pendente',
    processando: 'Processando',
    aguardando_confirmacao: 'Aguardando confirmação',
    corrigido: 'Corrigido',
    erro: 'Erro'
  }
  return s ? (m[s] || s) : 'Não enviado'
}

const classeStatus = (s?: string) => {
  const m: Record<string, string> = {
    pendente: 'bg-gray-100 text-gray-600',
    processando: 'bg-amber-50 text-amber-700',
    aguardando_confirmacao: 'bg-amber-50 text-amber-700',
    corrigido: 'bg-green-50 text-green-700',
    erro: 'bg-critical-50 text-critical-600'
  }
  return s ? (m[s] || '') : 'bg-gray-100 text-gray-400'
}

const carregar = async () => {
  loading.value = true
  try {
    const simuladoData = await getSimulado(idSimulado)
    simulado.value = simuladoData
    if (!simuladoData) return

    const [matriculados, envios] = await Promise.all([
      fetchClassStudents(simuladoData.turma_id),
      listEnvios(idSimulado)
    ])

    const enviosPorAluno = new Map(envios.map(e => [e.aluno_id, e]))

    roster.value = matriculados
      .map((m: any) => ({
        student_id: m.student_id,
        full_name: m.perfis?.full_name || 'Aluno',
        matricula: m.perfis?.matricula || null,
        envio: enviosPorAluno.get(m.student_id)
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name))
  } finally {
    loading.value = false
  }
}

const baixar = async (tipo: 'folha' | 'solucao') => {
  if (!simulado.value) return
  carregandoUrl.value = tipo
  try {
    const caminho = tipo === 'folha' ? simulado.value.folha_respostas_url : simulado.value.folha_solucao_url
    const url = await urlAssinada(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Não foi possível gerar o link de download')
  } finally {
    carregandoUrl.value = null
  }
}

const baixarTodasAsFolhas = async () => {
  if (!simulado.value) return
  carregandoUrl.value = 'todas'
  try {
    const caminho = `${simulado.value.escola_id}/simulados/${idSimulado}/gabarito/todas_as_folhas.pdf`
    const url = await urlAssinada(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Arquivo combinado não encontrado (simulado criado antes desse recurso?)')
  } finally {
    carregandoUrl.value = null
  }
}

const baixarFolhaAluno = async (alunoId: string) => {
  if (!simulado.value) return
  const chave = `folha-${alunoId}`
  carregandoUrl.value = chave
  try {
    const caminho = `${simulado.value.escola_id}/simulados/${idSimulado}/gabarito/alunos/${alunoId}.pdf`
    const url = await urlAssinada(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Folha personalizada não encontrada (simulado criado antes desse recurso?)')
  } finally {
    carregandoUrl.value = null
  }
}

const verImagem = async (caminho: string) => {
  const url = await urlAssinada(caminho)
  if (url) window.open(url, '_blank')
}

const enviandoAluno = ref<string | null>(null)

const enviarFolhaDoAluno = async (alunoId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  const arquivo = input.files?.[0]
  if (!arquivo) return

  enviandoAluno.value = alunoId
  try {
    await enviarIndividual(idSimulado, alunoId, arquivo)
    mostrarNotificacao('sucesso', 'Folha enviada e corrigida!')
    await carregar()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao enviar a folha', e?.data?.message || e.message || '')
  } finally {
    enviandoAluno.value = null
    input.value = ''
  }
}

const processandoEnvioId = ref<string | null>(null)
const confirmandoTodos = ref(false)

const confirmar = async (linha: LinhaRoster) => {
  if (!linha.envio) return
  processandoEnvioId.value = `${linha.envio.id}-confirmar`
  try {
    await confirmarEnvio(idSimulado, linha.envio.id)
    mostrarNotificacao('sucesso', 'Resultado confirmado!')
    await carregar()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao confirmar', e?.data?.message || e.message || '')
  } finally {
    processandoEnvioId.value = null
  }
}

const rejeitar = async (linha: LinhaRoster) => {
  if (!linha.envio) return
  processandoEnvioId.value = `${linha.envio.id}-rejeitar`
  try {
    await rejeitarEnvio(idSimulado, linha.envio.id)
    mostrarNotificacao('sucesso', 'Envio rejeitado — o aluno pode ser reenviado.')
    await carregar()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao rejeitar', e?.data?.message || e.message || '')
  } finally {
    processandoEnvioId.value = null
  }
}

const confirmarTodosPendentes = async () => {
  confirmandoTodos.value = true
  try {
    const resultado = await confirmarPendentes(idSimulado)
    mostrarNotificacao('sucesso', `${resultado.confirmados} envio(s) confirmado(s)!`)
    await carregar()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao confirmar todos', e?.data?.message || e.message || '')
  } finally {
    confirmandoTodos.value = false
  }
}

const alternativasDe = (optionCount: number) =>
  Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i))

const editandoEnvioId = ref<string | null>(null)
const respostasEditadas = ref<Record<string, string>>({})
const salvandoRespostas = ref(false)

const alternarEdicao = (linha: LinhaRoster) => {
  if (!linha.envio) return

  if (editandoEnvioId.value === linha.envio.id) {
    editandoEnvioId.value = null
    return
  }

  respostasEditadas.value = { ...(linha.envio.respostas_detectadas || {}) }
  editandoEnvioId.value = linha.envio.id
}

const salvarRespostas = async (linha: LinhaRoster) => {
  if (!linha.envio) return
  salvandoRespostas.value = true
  try {
    await editarRespostas(idSimulado, linha.envio.id, respostasEditadas.value)
    mostrarNotificacao('sucesso', 'Respostas atualizadas e nota recalculada!')
    editandoEnvioId.value = null
    await carregar()
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao salvar respostas', e?.data?.message || e.message || '')
  } finally {
    salvandoRespostas.value = false
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as 'sucesso' | 'critico', titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(carregar)
</script>
