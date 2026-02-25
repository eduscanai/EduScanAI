<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/users"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Importar Usuários</h1>
        <p class="text-body text-text-secondary mt-1">Importe usuários em lote a partir de um arquivo JSON</p>
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
          <pre v-if="perfilSelecionado === 'student'">[
  {
    "full_name": "Nome Completo",
    "email": "email@escola.com",
    "matricula": "20250001",
    "cpf": "000.000.000-00",
    "sexo": "M ou F",
    "data_nascimento": "2010-01-15"
  }
]</pre>
          <pre v-else>[
  {
    "full_name": "Nome Completo",
    "email": "email@escola.com"
  }
]</pre>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          Campos obrigatórios: <strong>full_name</strong> e <strong>email</strong>.
          <template v-if="perfilSelecionado === 'student'"> Os campos matrícula, cpf, sexo e data_nascimento são opcionais.</template>
        </p>
      </Cartao>

      <!-- Upload e Config -->
      <Cartao>
        <h2 class="text-heading-3 mb-6">Importar</h2>

        <div class="space-y-4">
          <!-- Perfil -->
          <div>
            <label class="form-label">Perfil *</label>
            <CampoSelecao
              :modelValue="perfilSelecionado"
              @update:modelValue="perfilSelecionado = $event as string"
              texto-reservado="Selecione o perfil"
              :opcoes="opcoesPerfil"
            />
          </div>

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
                <p class="text-xs text-gray-500 mt-1">{{ usuariosParsed.length }} {{ rotuloPerfil(perfilSelecionado, true) }} encontrado{{ usuariosParsed.length !== 1 ? 's' : '' }}</p>
              </template>
            </div>
            <p v-if="erroArquivo" class="mt-1 text-xs text-critical-500">{{ erroArquivo }}</p>
          </div>

          <!-- Senha padrão -->
          <div>
            <label for="senha" class="form-label">Senha padrão para todos os usuários *</label>
            <input
              id="senha"
              type="text"
              v-model="senha"
              class="form-input"
              placeholder="Ex: Edu@2025"
            />
            <p class="text-xs text-gray-500 mt-1">Todos os usuários serão criados com esta senha. Eles poderão alterá-la depois.</p>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="usuariosParsed.length > 0" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-3">Preview (primeiros 5)</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 text-gray-500 font-medium">Nome</th>
                  <th class="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                  <th v-if="perfilSelecionado === 'student'" class="text-left py-2 px-3 text-gray-500 font-medium">Matrícula</th>
                  <th v-if="perfilSelecionado === 'student'" class="text-left py-2 px-3 text-gray-500 font-medium">Sexo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, i) in usuariosParsed.slice(0, 5)" :key="i" class="border-b border-gray-100">
                  <td class="py-2 px-3">{{ u.full_name }}</td>
                  <td class="py-2 px-3 text-gray-500">{{ u.email }}</td>
                  <td v-if="perfilSelecionado === 'student'" class="py-2 px-3">{{ u.matricula || '-' }}</td>
                  <td v-if="perfilSelecionado === 'student'" class="py-2 px-3">{{ u.sexo || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="usuariosParsed.length > 5" class="text-xs text-gray-500 mt-2">
            ... e mais {{ usuariosParsed.length - 5 }} {{ rotuloPerfil(perfilSelecionado, true) }}{{ usuariosParsed.length - 5 !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Progresso -->
        <div v-if="importando" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-3">Importando...</h3>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-primary-500 h-3 rounded-full transition-all" style="width: 100%; animation: pulse 1.5s infinite"></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">Criando {{ usuariosParsed.length }} {{ rotuloPerfil(perfilSelecionado, true) }}{{ usuariosParsed.length !== 1 ? 's' : '' }}. Isso pode levar alguns minutos...</p>
        </div>

        <!-- Resultado -->
        <div v-if="resultado" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-3">Resultado</h3>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-gray-900">{{ resultado.total }}</p>
              <p class="text-xs text-gray-500">Total</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-green-700">{{ resultado.created }}</p>
              <p class="text-xs text-green-600">Criados</p>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-red-700">{{ resultado.errors.length }}</p>
              <p class="text-xs text-red-600">Erros</p>
            </div>
          </div>
          <div v-if="resultado.errors.length > 0" class="bg-red-50 rounded-lg p-4">
            <p class="text-sm font-medium text-red-700 mb-2">Erros:</p>
            <ul class="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
              <li v-for="(err, i) in resultado.errors" :key="i">
                {{ err.email }}: {{ err.error }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <NuxtLink to="/admin/users" class="btn-outline no-underline">
            Voltar
          </NuxtLink>
          <button
            @click="importar"
            :disabled="!arquivo || !senha || !perfilSelecionado || importando"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ importando ? 'Importando...' : `Importar ${usuariosParsed.length} ${rotuloPerfil(perfilSelecionado, true)}${usuariosParsed.length !== 1 ? 's' : ''}` }}
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
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { bulkCreateUsers } = useUsers()

interface UsuarioImport {
  full_name: string
  email: string
  matricula?: string
  cpf?: string
  sexo?: string
  data_nascimento?: string
}

const perfilSelecionado = ref('student')
const arquivo = ref<File | null>(null)
const usuariosParsed = ref<UsuarioImport[]>([])
const erroArquivo = ref('')
const senha = ref('Edu@2025')
const importando = ref(false)
const resultado = ref<{ total: number; created: number; errors: { email: string; error: string }[] } | null>(null)

const opcoesPerfil = [
  { rotulo: 'Estudante', valor: 'student' },
  { rotulo: 'Professor', valor: 'teacher' },
  { rotulo: 'Pedagogo', valor: 'pedagogue' }
]

const rotuloPerfil = (role: string, minusculo = false) => {
  const mapa: Record<string, string> = {
    student: 'Aluno',
    teacher: 'Professor',
    pedagogue: 'Pedagogo'
  }
  const r = mapa[role] || 'Usuário'
  return minusculo ? r.toLowerCase() : r
}

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
  usuariosParsed.value = []
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

    // Validar que todos têm full_name e email
    const invalidos = data.filter((d: any) => !d.full_name || !d.email)
    if (invalidos.length > 0) {
      erroArquivo.value = `${invalidos.length} registro(s) sem full_name ou email`
      return
    }

    arquivo.value = file
    usuariosParsed.value = data
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
  if (!usuariosParsed.value.length || !senha.value || !perfilSelecionado.value) return

  importando.value = true
  resultado.value = null

  try {
    const res = await bulkCreateUsers(usuariosParsed.value, senha.value, perfilSelecionado.value)
    resultado.value = res as any
    const label = rotuloPerfil(perfilSelecionado.value, true)
    if (res && (res as any).created > 0) {
      mostrarNotificacao('sucesso', `${(res as any).created} ${label}${(res as any).created !== 1 ? 's' : ''} importado${(res as any).created !== 1 ? 's' : ''} com sucesso!`)
    }
    if (res && (res as any).errors?.length > 0) {
      mostrarNotificacao('aviso', `${(res as any).errors.length} erro${(res as any).errors.length !== 1 ? 's' : ''} durante importação`)
    }
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao importar', e.data?.message || e.message)
  } finally {
    importando.value = false
  }
}
</script>
