<template>
  <div>
    <label v-if="rotulo" class="form-label">{{ rotulo }}</label>

    <!-- Lista de arquivos já enviados -->
    <div v-if="modelValue.length" class="space-y-2 mb-3">
      <div
        v-for="(arquivo, i) in modelValue"
        :key="i"
        class="flex items-center gap-3 bg-gray-50 px-3 py-2.5 rounded-lg group"
      >
        <!-- Preview de imagem -->
        <img
          v-if="ehImagem(arquivo.name)"
          :src="arquivo.url"
          :alt="arquivo.name"
          class="w-10 h-10 rounded object-cover flex-shrink-0"
        />
        <div v-else class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Icone :tamanho="18" class="text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </Icone>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-700 truncate">{{ arquivo.name }}</p>
          <p v-if="arquivo.size" class="text-xs text-gray-400">{{ formatarTamanho(arquivo.size) }}</p>
        </div>

        <button
          v-if="!desabilitado"
          @click="removerArquivo(i)"
          class="text-gray-400 hover:text-critical-500 transition-colors opacity-0 group-hover:opacity-100"
          type="button"
        >
          <Icone :tamanho="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </Icone>
        </button>
      </div>
    </div>

    <!-- Barra de progresso -->
    <div v-if="enviando" class="mb-3">
      <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Enviando...</span>
        <span>{{ progresso }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1.5">
        <div
          class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
          :style="{ width: progresso + '%' }"
        ></div>
      </div>
    </div>

    <!-- Zona de drop / botão de upload -->
    <div
      v-if="!desabilitado && (!maximo || modelValue.length < maximo)"
      :class="[
        'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
        arrastando
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'
      ]"
      @dragover.prevent="arrastando = true"
      @dragleave.prevent="arrastando = false"
      @drop.prevent="handleDrop"
      @click="abrirSeletor"
    >
      <div class="flex flex-col items-center justify-center py-6 px-4">
        <Icone :tamanho="24" :class="arrastando ? 'text-primary-500' : 'text-gray-400'">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </Icone>
        <p class="text-sm text-gray-600 mt-2">
          <span class="font-medium text-primary-500">Clique para selecionar</span>
          ou arraste aqui
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Máx. 50MB por arquivo
        </p>
      </div>
    </div>

    <input
      ref="inputArquivo"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiplo"
      @change="handleFileInput"
    />

    <!-- Erro -->
    <p v-if="erro" class="mt-1 text-xs text-critical-500">{{ erro }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'

interface Arquivo {
  name: string
  url: string
  path?: string
  size?: number
  type?: string
}

const props = withDefaults(defineProps<{
  modelValue: Arquivo[]
  rotulo?: string
  bucket: string
  pasta?: string
  multiplo?: boolean
  maximo?: number
  accept?: string
  desabilitado?: boolean
}>(), {
  multiplo: true,
  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mp3,.zip,.txt,.csv'
})

const emit = defineEmits<{
  'update:modelValue': [arquivos: Arquivo[]]
  'erro': [mensagem: string]
}>()

const { uploadFile, deleteFile, validarArquivo } = useStorage()

const inputArquivo = ref<HTMLInputElement | null>(null)
const arrastando = ref(false)
const enviando = ref(false)
const progresso = ref(0)
const erro = ref<string | null>(null)

const abrirSeletor = () => {
  inputArquivo.value?.click()
}

const handleFileInput = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  await processarArquivos(Array.from(files))
  // Limpar input para permitir re-upload do mesmo arquivo
  if (inputArquivo.value) inputArquivo.value.value = ''
}

const handleDrop = async (e: DragEvent) => {
  arrastando.value = false
  const files = e.dataTransfer?.files
  if (!files?.length) return
  await processarArquivos(Array.from(files))
}

const processarArquivos = async (files: File[]) => {
  erro.value = null

  // Verificar limite
  if (props.maximo) {
    const restante = props.maximo - props.modelValue.length
    if (files.length > restante) {
      erro.value = `Máximo de ${props.maximo} arquivo${props.maximo > 1 ? 's' : ''}`
      files = files.slice(0, restante)
    }
  }

  for (const file of files) {
    const validacao = validarArquivo(file)
    if (validacao) {
      erro.value = validacao
      emit('erro', validacao)
      continue
    }

    enviando.value = true
    progresso.value = 0

    try {
      const resultado = await uploadFile(file, {
        bucket: props.bucket,
        folder: props.pasta,
        onProgress: (p) => { progresso.value = p }
      })

      emit('update:modelValue', [
        ...props.modelValue,
        {
          name: resultado.name,
          url: resultado.url,
          path: resultado.path,
          size: resultado.size,
          type: resultado.type
        }
      ])
    } catch (e: any) {
      erro.value = e.message || 'Erro ao enviar arquivo'
      emit('erro', erro.value!)
    } finally {
      enviando.value = false
      progresso.value = 0
    }
  }
}

const removerArquivo = async (index: number) => {
  const arquivo = props.modelValue[index]

  // Tentar deletar do storage se tiver path
  if (arquivo.path) {
    try {
      await deleteFile(props.bucket, arquivo.path)
    } catch {
      // Se falhar a deleção do storage, ainda remove da lista
    }
  }

  const novos = [...props.modelValue]
  novos.splice(index, 1)
  emit('update:modelValue', novos)
}

const ehImagem = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
}

const formatarTamanho = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
