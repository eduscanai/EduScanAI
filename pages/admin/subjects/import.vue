<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/subjects"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Importar Disciplinas</h1>
        <p class="text-body text-text-secondary mt-1">Importe disciplinas em lote a partir de um arquivo JSON</p>
      </div>
    </div>

    <div class="max-w-3xl">
      <!-- Instruções -->
      <Cartao class="mb-6">
        <h2 class="text-heading-3 mb-4">Formato do arquivo</h2>
        <p class="text-sm text-gray-600 mb-3">
          O arquivo JSON deve conter um array de objetos com os seguintes campos:
        </p>
        <div class="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 overflow-x-auto">
          <pre>[
  { "name": "Matemática", "code": "MAT" },
  { "name": "Língua Portuguesa", "code": "POR" }
]</pre>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          Campo obrigatório: <strong>name</strong>. O campo <strong>code</strong> é opcional.
        </p>
      </Cartao>

      <!-- Upload -->
      <Cartao>
        <h2 class="text-heading-3 mb-6">Importar</h2>

        <div class="space-y-4">
          <!-- Arquivo -->
          <div>
            <label class="form-label">Arquivo JSON *</label>
            <div
              class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
              :class="arquivo ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
              @click="($refs.fileInput as HTMLInputElement).click()"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="onFileSelect"
              />
              <template v-if="!arquivo">
                <Icone :tamanho="40" class="text-gray-400 mx-auto mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </Icone>
                <p class="text-sm text-gray-600">Clique ou arraste o arquivo JSON aqui</p>
              </template>
              <template v-else>
                <Icone :tamanho="40" class="text-primary-500 mx-auto mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Icone>
                <p class="text-sm font-medium text-gray-900">{{ arquivo.name }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ disciplinasParsed.length }} disciplina{{ disciplinasParsed.length !== 1 ? 's' : '' }} encontrada{{ disciplinasParsed.length !== 1 ? 's' : '' }}</p>
              </template>
            </div>
            <p v-if="erroArquivo" class="mt-1 text-xs text-critical-500">{{ erroArquivo }}</p>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="disciplinasParsed.length > 0" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-3">Preview</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 text-gray-500 font-medium">Nome</th>
                  <th class="text-left py-2 px-3 text-gray-500 font-medium">Código</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in disciplinasParsed" :key="i" class="border-b border-gray-100">
                  <td class="py-2 px-3">{{ d.name }}</td>
                  <td class="py-2 px-3">
                    <span v-if="d.code" class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ d.code }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Progresso -->
        <div v-if="importando" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-3">Importando...</h3>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-primary-500 h-3 rounded-full transition-all" style="width: 100%; animation: pulse 1.5s infinite"></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">Criando {{ disciplinasParsed.length }} disciplina{{ disciplinasParsed.length !== 1 ? 's' : '' }}...</p>
        </div>

        <!-- Resultado -->
        <div v-if="resultado" class="mt-6 pt-6 border-t border-gray-200">
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-700">{{ resultado.created }}</p>
            <p class="text-sm text-green-600">disciplina{{ resultado.created !== 1 ? 's' : '' }} importada{{ resultado.created !== 1 ? 's' : '' }} com sucesso</p>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <NuxtLink to="/admin/subjects" class="btn-outline no-underline">
            Voltar
          </NuxtLink>
          <button
            @click="importar"
            :disabled="!arquivo || importando"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ importando ? 'Importando...' : `Importar ${disciplinasParsed.length} Disciplina${disciplinasParsed.length !== 1 ? 's' : ''}` }}
          </button>
        </div>
      </Cartao>
    </div>

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
import { ref } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { bulkCreateSubjects } = useSubjects()

interface DisciplinaImport {
  name: string
  code?: string
}

const arquivo = ref<File | null>(null)
const disciplinasParsed = ref<DisciplinaImport[]>([])
const erroArquivo = ref('')
const importando = ref(false)
const resultado = ref<{ created: number } | null>(null)

const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

const processarArquivo = async (file: File) => {
  erroArquivo.value = ''
  disciplinasParsed.value = []
  resultado.value = null

  if (!file.name.endsWith('.json')) {
    erroArquivo.value = 'Apenas arquivos .json são aceitos'
    return
  }

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!Array.isArray(data)) {
      erroArquivo.value = 'O arquivo deve conter um array de objetos'
      return
    }

    const invalidos = data.filter((d: any) => !d.name)
    if (invalidos.length > 0) {
      erroArquivo.value = `${invalidos.length} registro(s) sem o campo "name"`
      return
    }

    arquivo.value = file
    disciplinasParsed.value = data
  } catch {
    erroArquivo.value = 'Arquivo JSON inválido'
  }
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    processarArquivo(input.files[0])
  }
}

const onDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files?.[0]) {
    processarArquivo(e.dataTransfer.files[0])
  }
}

const importar = async () => {
  if (!disciplinasParsed.value.length) return

  importando.value = true
  resultado.value = null

  try {
    const res = await bulkCreateSubjects(disciplinasParsed.value)
    resultado.value = res as any
    if (res && res.created > 0) {
      mostrarNotificacao('sucesso', `${res.created} disciplina${res.created !== 1 ? 's' : ''} importada${res.created !== 1 ? 's' : ''} com sucesso!`)
    }
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg.includes('duplicate') || msg.includes('unique')) {
      mostrarNotificacao('critico', 'Erro: disciplinas duplicadas', 'Algumas disciplinas já existem na escola.')
    } else {
      mostrarNotificacao('critico', 'Erro ao importar', msg)
    }
  } finally {
    importando.value = false
  }
}
</script>
