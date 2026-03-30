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
        <h1 class="text-heading-1">Novo Usuário</h1>
        <p class="text-body text-text-secondary mt-1">Cadastre um novo usuário na sua escola</p>
      </div>
    </div>

    <!-- Formulário -->
    <div class="max-w-2xl">
      <Cartao>
        <h2 class="text-heading-3 mb-6">Informações do Usuário</h2>

        <!-- Foto do usuario -->
        <div class="flex flex-col items-center gap-3 mb-6">
          <div v-if="fotoPreview" class="w-28 h-28 rounded-full overflow-hidden border-2 border-primary-200">
            <img :src="fotoPreview" alt="Foto" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Icone :tamanho="36" class="text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </Icone>
          </div>
          <input
            ref="inputFoto"
            type="file"
            accept="image/*"
            capture="user"
            class="hidden"
            @change="onFotoSelecionada"
          />
          <button
            type="button"
            @click="($refs.inputFoto as HTMLInputElement)?.click()"
            class="btn-outline text-sm flex items-center gap-2"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </Icone>
            {{ fotoPreview ? 'Trocar foto' : 'Carregar foto' }}
          </button>
          <span v-if="uploadandoFoto" class="text-xs text-amber-600">Enviando foto...</span>
          <span v-if="form.foto_url && !uploadandoFoto" class="text-xs text-green-600">Foto carregada</span>
        </div>

        <div class="space-y-4">
          <div>
            <label for="full_name" class="form-label">Nome completo *</label>
            <input
              id="full_name"
              type="text"
              v-model="form.full_name"
              class="form-input"
              placeholder="Ex: Maria da Silva"
            />
            <p v-if="erros.full_name" class="mt-1 text-xs text-critical-500">{{ erros.full_name }}</p>
          </div>

          <div>
            <label for="email" class="form-label">Email *</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              class="form-input"
              placeholder="email@escola.com"
            />
            <p v-if="erros.email" class="mt-1 text-xs text-critical-500">{{ erros.email }}</p>
          </div>

          <div>
            <label for="password" class="form-label">Senha *</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              class="form-input"
              placeholder="Mínimo 6 caracteres"
            />
            <p v-if="erros.password" class="mt-1 text-xs text-critical-500">{{ erros.password }}</p>
          </div>

          <div>
            <label for="role" class="form-label">Perfil *</label>
            <CampoSelecao
              id="role"
              :modelValue="form.role"
              @update:modelValue="form.role = $event as string"
              texto-reservado="Selecione um perfil"
              :opcoes="opcoesRole"
            />
            <p v-if="erros.role" class="mt-1 text-xs text-critical-500">{{ erros.role }}</p>
          </div>
        </div>

        <!-- Campos extras para Estudante -->
        <div v-if="form.role === 'student'" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-4">Dados do Aluno</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="cpf" class="form-label">CPF</label>
              <input
                id="cpf"
                type="text"
                :value="cpfFormatado"
                @input="onCpfInput"
                class="form-input"
                placeholder="000.000.000-00"
                maxlength="14"
              />
            </div>
            <div>
              <label for="matricula" class="form-label">Matricula</label>
              <input id="matricula" type="text" v-model="form.matricula" class="form-input bg-gray-50" placeholder="Gerada automaticamente" readonly />
              <p class="mt-1 text-xs text-text-secondary">Formato: {{ new Date().getFullYear() }} + codigo sequencial</p>
            </div>
            <div>
              <label for="sexo" class="form-label">Sexo</label>
              <CampoSelecao
                id="sexo"
                :modelValue="form.sexo"
                @update:modelValue="form.sexo = $event as string"
                texto-reservado="Selecione"
                :opcoes="opcoesSexo"
              />
            </div>
            <div>
              <label for="data_nascimento" class="form-label">Data de Nascimento</label>
              <input id="data_nascimento" type="date" v-model="form.data_nascimento" class="form-input" />
            </div>
          </div>

          <!-- Responsaveis -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-heading-3">Responsaveis</h3>
              <button
                type="button"
                @click="adicionarResponsavel"
                class="btn-outline text-xs px-3 py-1.5"
              >
                + Adicionar
              </button>
            </div>

            <div v-if="form.responsaveis.length === 0" class="text-center py-6 text-sm text-gray-400">
              Nenhum responsavel adicionado
            </div>

            <div v-else class="space-y-6">
              <div
                v-for="(resp, i) in form.responsaveis"
                :key="i"
                class="bg-gray-50 rounded-lg p-4 relative"
              >
                <button
                  type="button"
                  @click="form.responsaveis.splice(i, 1)"
                  class="absolute top-3 right-3 p-1 text-gray-400 hover:text-critical-500 transition-colors"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </Icone>
                </button>

                <p class="text-xs font-semibold text-gray-500 uppercase mb-3">Responsavel {{ i + 1 }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="md:col-span-2">
                    <label class="form-label">Nome completo *</label>
                    <input v-model="resp.nome" class="form-input" placeholder="Nome do responsavel" />
                  </div>

                  <div>
                    <label class="form-label">Parentesco *</label>
                    <CampoSelecao
                      :modelValue="resp.parentesco"
                      @update:modelValue="resp.parentesco = $event as string"
                      texto-reservado="Selecione"
                      :opcoes="opcoesParentesco"
                    />
                  </div>

                  <div>
                    <label class="form-label">CPF</label>
                    <input v-model="resp.cpf" class="form-input" placeholder="000.000.000-00" maxlength="14" />
                  </div>

                  <div>
                    <label class="form-label">RG</label>
                    <input v-model="resp.rg" class="form-input" placeholder="0000000" />
                  </div>

                  <div>
                    <label class="form-label">Telefone *</label>
                    <input v-model="resp.telefone" class="form-input" placeholder="(00) 00000-0000" />
                  </div>

                  <div>
                    <label class="form-label">Telefone 2</label>
                    <input v-model="resp.telefone2" class="form-input" placeholder="(00) 00000-0000" />
                  </div>

                  <div>
                    <label class="form-label">Email</label>
                    <input v-model="resp.email" type="email" class="form-input" placeholder="email@exemplo.com" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="form-label">Endereco</label>
                    <input v-model="resp.endereco" class="form-input" placeholder="Rua, numero, bairro" />
                  </div>

                  <div>
                    <label class="form-label">Cidade</label>
                    <input v-model="resp.cidade" class="form-input" placeholder="Cidade" />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="form-label">UF</label>
                      <input v-model="resp.uf" class="form-input" placeholder="SP" maxlength="2" />
                    </div>
                    <div>
                      <label class="form-label">CEP</label>
                      <input v-model="resp.cep" class="form-input" placeholder="00000-000" />
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Profissao</label>
                    <input v-model="resp.profissao" class="form-input" placeholder="Profissao" />
                  </div>

                  <div>
                    <label class="form-label">Local de trabalho</label>
                    <input v-model="resp.local_trabalho" class="form-input" placeholder="Empresa / local" />
                  </div>

                  <div class="md:col-span-2 flex items-center gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="resp.responsavel_financeiro" class="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <span class="text-sm text-gray-700">Responsavel financeiro</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="resp.responsavel_pedagogico" class="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <span class="text-sm text-gray-700">Responsavel pedagogico</span>
                    </label>
                  </div>

                  <div class="md:col-span-2">
                    <label class="form-label">Observacoes</label>
                    <textarea v-model="resp.observacoes" class="form-input resize-y min-h-[60px]" placeholder="Observacoes sobre o responsavel"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campos extras para Colaborador -->
        <div v-if="form.role === 'collaborator'" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-heading-3 mb-4">Dados do Colaborador</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">CPF</label>
              <input
                type="text"
                :value="cpfFormatado"
                @input="onCpfInput"
                class="form-input"
                placeholder="000.000.000-00"
                maxlength="14"
              />
            </div>
            <div>
              <label class="form-label">Telefone</label>
              <input v-model="form.telefone" class="form-input" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label class="form-label">Sexo</label>
              <CampoSelecao
                :modelValue="form.sexo"
                @update:modelValue="form.sexo = $event as string"
                texto-reservado="Selecione"
                :opcoes="opcoesSexo"
              />
            </div>
            <div>
              <label class="form-label">Data de Nascimento</label>
              <input type="date" v-model="form.data_nascimento" class="form-input" />
            </div>
            <div class="md:col-span-2">
              <label class="form-label">Endereco</label>
              <input v-model="form.endereco" class="form-input" placeholder="Rua, numero, bairro, cidade - UF" />
            </div>
            <div>
              <label class="form-label">Cargo / Funcao</label>
              <input v-model="form.cargo" class="form-input" placeholder="Ex: Secretaria, Porteiro, Bibliotecario" />
            </div>
            <div>
              <label class="form-label">RG</label>
              <input v-model="form.rg" class="form-input" placeholder="0000000" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <NuxtLink to="/admin/users" class="btn-outline no-underline">
            Cancelar
          </NuxtLink>
          <button @click="criar" :disabled="criando" class="btn-primary flex items-center gap-2 disabled:opacity-50">
            <svg v-if="criando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ criando ? 'Criando...' : 'Criar Usuário' }}
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

const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const { createUser } = useUsers()
const criando = ref(false)

const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: '',
  matricula: '',
  cpf: '',
  sexo: '',
  data_nascimento: '',
  telefone: '',
  endereco: '',
  cargo: '',
  rg: '',
  foto_url: '',
  responsaveis: [] as {
    nome: string; parentesco: string; cpf: string; rg: string;
    telefone: string; telefone2: string; email: string;
    endereco: string; cidade: string; uf: string; cep: string;
    profissao: string; local_trabalho: string;
    responsavel_financeiro: boolean; responsavel_pedagogico: boolean;
    observacoes: string;
  }[]
})

const fotoPreview = ref('')
const uploadandoFoto = ref(false)
const inputFoto = ref<HTMLInputElement | null>(null)

const onFotoSelecionada = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Preview local
  fotoPreview.value = URL.createObjectURL(file)

  // Upload para Supabase Storage
  uploadandoFoto.value = true
  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `alunos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('school-assets')
      .upload(path, file, { upsert: true })
    if (uploadErr) throw uploadErr

    const { data: urlData } = supabase.storage
      .from('school-assets')
      .getPublicUrl(path)
    form.value.foto_url = urlData.publicUrl
  } catch (err: any) {
    mostrarNotificacao('critico', 'Erro ao enviar foto', err.message)
    fotoPreview.value = ''
    form.value.foto_url = ''
  } finally {
    uploadandoFoto.value = false
  }
}

// Máscara de CPF
const cpfFormatado = ref('')

const formatarCpf = (valor: string) => {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`
}

const onCpfInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const nums = input.value.replace(/\D/g, '').slice(0, 11)
  form.value.cpf = nums
  cpfFormatado.value = formatarCpf(nums)
  input.value = cpfFormatado.value
}

// Gerar matrícula automática (ANO + código sequencial)
const gerarMatricula = async () => {
  if (!usuario.value.schoolId) return
  const ano = new Date().getFullYear()
  const { count } = await supabase
    .from('perfis')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', usuario.value.schoolId)
    .eq('role', 'student')
  const seq = String((count || 0) + 1).padStart(4, '0')
  form.value.matricula = `${ano}${seq}`
}

// Gerar matrícula quando selecionar role 'student'
watch(() => form.value.role, (novoRole) => {
  if (novoRole === 'student') {
    gerarMatricula()
  } else {
    form.value.matricula = ''
    form.value.cpf = ''
    cpfFormatado.value = ''
  }
})

const erros = ref<Record<string, string>>({})

const opcoesRole = [
  { rotulo: 'Pedagogo', valor: 'pedagogue' },
  { rotulo: 'Professor', valor: 'teacher' },
  { rotulo: 'Estudante', valor: 'student' },
  { rotulo: 'Colaborador', valor: 'collaborator' }
]

const opcoesSexo = [
  { rotulo: 'Masculino', valor: 'M' },
  { rotulo: 'Feminino', valor: 'F' }
]

const opcoesParentesco = [
  { rotulo: 'Pai', valor: 'pai' },
  { rotulo: 'Mae', valor: 'mae' },
  { rotulo: 'Avo (paterno)', valor: 'avo' },
  { rotulo: 'Avo (materno)', valor: 'avo_m' },
  { rotulo: 'Tio', valor: 'tio' },
  { rotulo: 'Tia', valor: 'tia' },
  { rotulo: 'Irmao', valor: 'irmao' },
  { rotulo: 'Irma', valor: 'irma' },
  { rotulo: 'Padrasto', valor: 'padrasto' },
  { rotulo: 'Madrasta', valor: 'madrasta' },
  { rotulo: 'Tutor legal', valor: 'tutor' },
  { rotulo: 'Outro', valor: 'outro' }
]

const adicionarResponsavel = () => {
  form.value.responsaveis.push({
    nome: '', parentesco: '', cpf: '', rg: '',
    telefone: '', telefone2: '', email: '',
    endereco: '', cidade: '', uf: '', cep: '',
    profissao: '', local_trabalho: '',
    responsavel_financeiro: false, responsavel_pedagogico: false,
    observacoes: ''
  })
}

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

// Validação
const validar = () => {
  erros.value = {}

  if (!form.value.full_name.trim()) {
    erros.value.full_name = 'Nome é obrigatório'
  }

  if (!form.value.email.trim()) {
    erros.value.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    erros.value.email = 'Email inválido'
  }

  if (!form.value.password) {
    erros.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 6) {
    erros.value.password = 'Senha deve ter no mínimo 6 caracteres'
  }

  if (!form.value.role) {
    erros.value.role = 'Perfil é obrigatório'
  }

  return Object.keys(erros.value).length === 0
}

// Criar usuário
const criar = async () => {
  if (!validar()) return
  criando.value = true
  try {
    const payload: any = {
      email: form.value.email,
      password: form.value.password,
      full_name: form.value.full_name,
      role: form.value.role
    }
    if (form.value.foto_url) payload.foto_url = form.value.foto_url
    if (form.value.cpf) payload.cpf = form.value.cpf
    if (form.value.sexo) payload.sexo = form.value.sexo
    if (form.value.data_nascimento) payload.data_nascimento = form.value.data_nascimento
    if (form.value.telefone) payload.telefone = form.value.telefone
    if (form.value.endereco) payload.endereco = form.value.endereco
    if (form.value.rg) payload.rg = form.value.rg
    if (form.value.role === 'student') {
      if (form.value.matricula) payload.matricula = form.value.matricula
    }
    if (form.value.role === 'collaborator') {
      if (form.value.cargo) payload.cargo = form.value.cargo
    }
    const result = await createUser(payload)

    // Salvar responsaveis se for aluno
    if (form.value.role === 'student' && form.value.responsaveis.length > 0 && result?.user?.id) {
      const responsaveisValidos = form.value.responsaveis.filter(r => r.nome.trim() && r.parentesco)
      if (responsaveisValidos.length > 0) {
        const inserts = responsaveisValidos.map(r => ({
          escola_id: usuario.value.schoolId,
          aluno_id: result.user.id,
          nome: r.nome,
          parentesco: r.parentesco,
          cpf: r.cpf || null,
          rg: r.rg || null,
          telefone: r.telefone || null,
          telefone2: r.telefone2 || null,
          email: r.email || null,
          endereco: r.endereco || null,
          cidade: r.cidade || null,
          uf: r.uf || null,
          cep: r.cep || null,
          profissao: r.profissao || null,
          local_trabalho: r.local_trabalho || null,
          responsavel_financeiro: r.responsavel_financeiro,
          responsavel_pedagogico: r.responsavel_pedagogico,
          observacoes: r.observacoes || null
        }))
        await supabase.from('responsaveis').insert(inserts)
      }
    }

    mostrarNotificacao('sucesso', 'Usuario criado com sucesso')

    // Limpar formulario
    form.value = { full_name: '', email: '', password: '', role: '', matricula: '', cpf: '', sexo: '', data_nascimento: '', telefone: '', endereco: '', cargo: '', rg: '', foto_url: '', responsaveis: [] }
    cpfFormatado.value = ''
    fotoPreview.value = ''

    // Redirecionar apos 1.5s
    setTimeout(() => {
      navigateTo('/admin/users')
    }, 1500)
  } catch (e: any) {
    const msg = e.data?.message || e.message || 'Erro desconhecido'
    mostrarNotificacao('critico', 'Erro ao criar usuário', msg)
  } finally {
    criando.value = false
  }
}
</script>
