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
      <div>
        <h1 class="text-heading-1">Novo Simulado</h1>
        <p class="text-body text-text-secondary mt-1">
          Gera a folha de respostas e o gabarito para correção automática por leitura óptica
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <Cartao>
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">1</span>
            <h2 class="text-heading-3">Informações do simulado</h2>
          </div>
          <div class="space-y-4">
            <div>
              <label for="titulo" class="form-label">Título *</label>
              <input id="titulo" type="text" v-model="form.titulo" class="form-input" placeholder="Ex: Simulado de Matemática - 1º Bimestre" />
              <p v-if="erros.titulo" class="mt-1 text-xs text-critical-500">{{ erros.titulo }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <CampoSelecao
                  rotulo="Turma *"
                  :modelValue="form.turma_id"
                  @update:modelValue="form.turma_id = $event as string"
                  texto-reservado="Selecione"
                  :opcoes="opcoesTurma"
                />
                <p v-if="erros.turma_id" class="mt-1 text-xs text-critical-500">{{ erros.turma_id }}</p>
              </div>
              <div>
                <label for="valor-maximo" class="form-label">Valor total</label>
                <input id="valor-maximo" type="number" v-model.number="form.valor_maximo" class="form-input" min="0.5" step="0.5" placeholder="10" />
              </div>
            </div>

            <div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-900">Matrícula em blocos</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  Folha inclui campo de matrícula manuscrita (10 blocos) — necessário para envio em lote com identificação automática do aluno.
                </p>
              </div>
              <Alternador v-model="form.matricula_em_blocos" />
            </div>
          </div>
        </Cartao>

        <Cartao>
          <ConstrutorQuestoesObjetivas ref="construtorQuestoes" v-model="form.questoes" :erro="erros.questoes">
            <template #titulo>
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">2</span>
                <h2 class="text-heading-3">Questões</h2>
              </div>
            </template>
          </ConstrutorQuestoesObjetivas>
        </Cartao>
      </div>

      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Resumo</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">Questões</dt>
              <dd class="font-medium">{{ form.questoes.length }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Valor total</dt>
              <dd class="font-medium">{{ form.valor_maximo }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Matrícula em blocos</dt>
              <dd class="font-medium">{{ form.matricula_em_blocos ? 'Sim' : 'Não' }}</dd>
            </div>
          </dl>
        </Cartao>

        <Cartao>
          <Botao variante="primario" largura-completa :carregando="salvando" @click="salvar">
            Criar simulado
          </Botao>
          <p class="text-xs text-gray-400 mt-3 text-center">
            A folha de respostas e a solução em PDF são geradas automaticamente.
          </p>
        </Cartao>
      </div>
    </div>

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
import Alternador from '~/components/ui/Alternador/Alternador.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'
import ConstrutorQuestoesObjetivas, { type LinhaQuestaoObjetiva } from '~/components/form/ConstrutorQuestoesObjetivas/ConstrutorQuestoesObjetivas.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'teacher']
})

const { createSimulado } = useSimulados()
const { classes, fetchClasses } = useClasses()

const salvando = ref(false)
const construtorQuestoes = ref<InstanceType<typeof ConstrutorQuestoesObjetivas> | null>(null)

const form = ref({
  titulo: '',
  turma_id: '',
  valor_maximo: 10,
  matricula_em_blocos: true,
  questoes: [] as LinhaQuestaoObjetiva[]
})

const erros = ref<Record<string, string>>({})

const opcoesTurma = computed(() => classes.value.map(c => ({ rotulo: c.name, valor: c.id })))

const validar = () => {
  erros.value = {}
  if (!form.value.titulo.trim()) erros.value.titulo = 'Título é obrigatório'
  if (!form.value.turma_id) erros.value.turma_id = 'Selecione uma turma'
  if (form.value.questoes.length === 0) erros.value.questoes = 'Gere ao menos uma questão'
  if (!(form.value.valor_maximo > 0)) erros.value.valor_maximo = 'Valor deve ser positivo'
  return Object.keys(erros.value).length === 0
}

const salvar = async () => {
  if (!validar()) return
  salvando.value = true
  try {
    const simulado = await createSimulado({
      titulo: form.value.titulo,
      turma_id: form.value.turma_id,
      valor_maximo: form.value.valor_maximo,
      matricula_em_blocos: form.value.matricula_em_blocos,
      questoes: form.value.questoes
    })
    mostrarNotificacao('sucesso', 'Simulado criado! Gerando folha de respostas...')
    setTimeout(() => navigateTo(`/simulados/${simulado.id}`), 1000)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao criar simulado', e?.data?.message || e.message || '')
  } finally {
    salvando.value = false
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as 'sucesso' | 'critico', titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await fetchClasses()
  construtorQuestoes.value?.gerarQuestoes()
})
</script>
