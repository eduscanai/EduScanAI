<template>
  <div>
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        :to="`/simulados/${idSimulado}`"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Escanear folhas</h1>
        <p class="text-body text-text-secondary mt-1">{{ simulado?.titulo }}</p>
      </div>
    </div>

    <Cartao class="mb-6">
      <h2 class="text-heading-3 mb-4">Enviar arquivo</h2>
      <p class="text-sm text-text-secondary mb-4">
        Envie um único PDF com todas as folhas escaneadas da turma (uma folha por página) ou
        uma imagem de uma única folha. O sistema separa as páginas, identifica cada aluno pela
        matrícula em blocos e corrige automaticamente.
      </p>

      <div
        :class="[
          'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          arrastando ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        ]"
        @dragover.prevent="arrastando = true"
        @dragleave.prevent="arrastando = false"
        @drop.prevent="handleDrop"
        @click="() => inputArquivo?.click()"
      >
        <div class="flex flex-col items-center justify-center py-8 px-4">
          <Icone :tamanho="28" :class="arrastando ? 'text-primary-500' : 'text-gray-400'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </Icone>
          <p class="text-sm text-gray-600 mt-2">
            <span class="font-medium text-primary-500">Clique para selecionar</span> ou arraste o arquivo aqui
          </p>
          <p class="text-xs text-gray-400 mt-1">PDF, PNG, JPG ou JPEG</p>
        </div>
      </div>

      <input ref="inputArquivo" type="file" class="hidden" accept=".pdf,.png,.jpg,.jpeg" @change="handleFileInput" />

      <div v-if="processando" class="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Processando folhas — isso pode levar alguns minutos para lotes grandes...
      </div>

      <p v-if="erro" class="mt-3 text-xs text-critical-500">{{ erro }}</p>
    </Cartao>

    <Cartao class="mb-6">
      <h2 class="text-heading-3 mb-4">Enviar individualmente</h2>
      <p class="text-sm text-text-secondary mb-4">
        Envie a folha de um aluno específico — útil pra reenvio de um caso pontual ou quando o
        simulado não usa matrícula em blocos.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="flex-1">
          <label class="form-label">Aluno</label>
          <select v-model="alunoIndividual" class="form-input">
            <option value="">Selecione o aluno...</option>
            <option v-for="aluno in roster" :key="aluno.student_id" :value="aluno.student_id">
              {{ aluno.full_name }}{{ aluno.matricula ? ` (${aluno.matricula})` : '' }}
            </option>
          </select>
        </div>
        <div class="flex-1">
          <label class="form-label">Folha escaneada</label>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" class="form-input" @change="handleFileIndividual" />
        </div>
        <Botao
          variante="contorno"
          :desabilitado="!alunoIndividual || !arquivoIndividual"
          :carregando="enviandoIndividual"
          @click="enviarIndividualmente"
        >
          Enviar e corrigir
        </Botao>
      </div>

      <div v-if="resultadoIndividual" class="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        Nota: <span class="font-semibold">{{ resultadoIndividual.nota ?? '—' }}</span>
        <span v-if="resultadoIndividual.percentual !== null"> ({{ resultadoIndividual.percentual }}%)</span>
      </div>
      <p v-if="erroIndividual" class="mt-3 text-xs text-critical-500">{{ erroIndividual }}</p>
    </Cartao>

    <Cartao v-if="resultado" class="mb-6">
      <h2 class="text-heading-3 mb-4">Resultado do processamento</h2>
      <div class="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p class="text-2xl font-bold">{{ resultado.total_paginas }}</p>
          <p class="text-xs text-gray-500">Páginas</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-amber-600">{{ resultado.aguardando_confirmacao }}</p>
          <p class="text-xs text-gray-500">Aguardando confirmação</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-critical-500">{{ naoIdentificados.length }}</p>
          <p class="text-xs text-gray-500">Não identificadas</p>
        </div>
      </div>

      <NuxtLink :to="`/simulados/${idSimulado}`" class="text-sm text-primary-500 hover:text-primary-600 font-medium">
        Revisar e confirmar →
      </NuxtLink>
    </Cartao>

    <Cartao v-if="naoIdentificados.length > 0">
      <h2 class="text-heading-3 mb-2">Folhas não identificadas</h2>
      <p class="text-sm text-text-secondary mb-4">
        Não foi possível ler o QR e casar essa folha com um aluno da turma. Selecione manualmente a
        quem pertence cada folha abaixo.
      </p>

      <div class="space-y-4">
        <div
          v-for="(pagina, indice) in naoIdentificados"
          :key="pagina.pagina"
          class="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4"
        >
          <img
            v-if="pagina.pagina_base64"
            :src="`data:image/png;base64,${pagina.pagina_base64}`"
            :alt="pagina.pagina"
            class="w-32 h-auto rounded border border-gray-200 flex-shrink-0"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ pagina.pagina }}</p>
            <p class="text-xs text-gray-500 mb-3">{{ pagina.motivo }}</p>

            <div class="flex items-center gap-2">
              <select v-model="atribuicoes[indice]" class="form-input py-1.5 text-sm flex-1">
                <option value="">Selecione o aluno...</option>
                <option v-for="aluno in roster" :key="aluno.student_id" :value="aluno.student_id">
                  {{ aluno.full_name }}{{ aluno.matricula ? ` (${aluno.matricula})` : '' }}
                </option>
              </select>
              <Botao
                variante="contorno"
                :desabilitado="!atribuicoes[indice] || !pagina.pagina_base64"
                :carregando="atribuindo === indice"
                @click="atribuir(indice)"
              >
                Atribuir
              </Botao>
            </div>
          </div>
        </div>
      </div>
    </Cartao>

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
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'
import type { Simulado } from '~/composables/useSimulados'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'teacher']
})

const route = useRoute()
const idSimulado = route.params.simuladoId as string

const { getSimulado, enviarLote, enviarIndividual, atribuirEnvioManual } = useSimulados()
const { fetchClassStudents } = useClasses()

const simulado = ref<Simulado | null>(null)
const roster = ref<Array<{ student_id: string; full_name: string; matricula: string | null }>>([])

const inputArquivo = ref<HTMLInputElement | null>(null)
const arrastando = ref(false)
const processando = ref(false)
const erro = ref<string | null>(null)

interface PaginaNaoIdentificada {
  pagina: string
  motivo: string
  pagina_base64?: string
}

const resultado = ref<{ total_paginas: number; aguardando_confirmacao: number } | null>(null)
const naoIdentificados = ref<PaginaNaoIdentificada[]>([])
const atribuicoes = ref<Record<number, string>>({})
const atribuindo = ref<number | null>(null)

const handleFileInput = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) await processarArquivo(files[0])
  if (inputArquivo.value) inputArquivo.value.value = ''
}

const handleDrop = async (e: DragEvent) => {
  arrastando.value = false
  const files = e.dataTransfer?.files
  if (files?.length) await processarArquivo(files[0])
}

const processarArquivo = async (arquivo: File) => {
  erro.value = null
  resultado.value = null
  naoIdentificados.value = []
  processando.value = true

  try {
    const resposta = await enviarLote(idSimulado, arquivo)
    resultado.value = {
      total_paginas: resposta.total_paginas,
      aguardando_confirmacao: resposta.aguardando_confirmacao
    }
    naoIdentificados.value = resposta.nao_identificados
  } catch (e: any) {
    erro.value = e?.data?.message || e.message || 'Erro ao processar o arquivo'
  } finally {
    processando.value = false
  }
}

const atribuir = async (indice: number) => {
  const alunoId = atribuicoes.value[indice]
  const pagina = naoIdentificados.value[indice]
  if (!alunoId || !pagina?.pagina_base64) return

  atribuindo.value = indice
  try {
    await atribuirEnvioManual(idSimulado, alunoId, pagina.pagina_base64, pagina.pagina)
    naoIdentificados.value.splice(indice, 1)
    delete atribuicoes.value[indice]
    mostrarNotificacao('sucesso', 'Folha atribuída e corrigida!')
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao atribuir folha', e?.data?.message || e.message || '')
  } finally {
    atribuindo.value = null
  }
}

const alunoIndividual = ref('')
const arquivoIndividual = ref<File | null>(null)
const enviandoIndividual = ref(false)
const erroIndividual = ref<string | null>(null)
const resultadoIndividual = ref<{ nota: number | null; percentual: number | null } | null>(null)

const handleFileIndividual = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  arquivoIndividual.value = files?.[0] || null
}

const enviarIndividualmente = async () => {
  if (!alunoIndividual.value || !arquivoIndividual.value) return

  erroIndividual.value = null
  resultadoIndividual.value = null
  enviandoIndividual.value = true

  try {
    const envio = await enviarIndividual(idSimulado, alunoIndividual.value, arquivoIndividual.value)
    resultadoIndividual.value = { nota: envio.nota, percentual: envio.percentual }
    mostrarNotificacao('sucesso', 'Folha enviada e corrigida!')
  } catch (e: any) {
    erroIndividual.value = e?.data?.message || e.message || 'Erro ao enviar a folha'
  } finally {
    enviandoIndividual.value = false
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as 'sucesso' | 'critico', titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  // Já abre o seletor de arquivo do lote ao entrar na página, poupando um clique.
  inputArquivo.value?.click()

  simulado.value = await getSimulado(idSimulado)
  if (simulado.value) {
    const matriculados = await fetchClassStudents(simulado.value.turma_id)
    roster.value = matriculados.map((m: any) => ({
      student_id: m.student_id,
      full_name: m.perfis?.full_name || 'Aluno',
      matricula: m.perfis?.matricula || null
    }))
  }
})
</script>
