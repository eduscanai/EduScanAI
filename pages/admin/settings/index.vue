<template>
  <div>
    <!-- Cabeçalho -->
    <div class="mb-8">
      <h1 class="text-heading-1">Configurações da Escola</h1>
      <p class="text-body text-text-secondary mt-1">Gerencie as informações e configurações da sua escola</p>
    </div>

    <!-- Loading -->
    <div v-if="loadingPage" class="py-12 text-center">
      <p class="text-body text-text-secondary">Carregando configurações...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulário principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informações Gerais -->
        <Cartao>
          <h2 class="text-heading-3 mb-6">Informações Gerais</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label for="name" class="form-label">Nome da escola *</label>
              <input id="name" type="text" v-model="form.name" class="form-input" placeholder="Nome da escola" />
              <p v-if="erros.name" class="mt-1 text-xs text-critical-500">{{ erros.name }}</p>
            </div>

            <div>
              <label for="cnpj" class="form-label">CNPJ</label>
              <input id="cnpj" type="text" v-model="form.cnpj" class="form-input" placeholder="00.000.000/0000-00" />
            </div>

            <div>
              <label for="telefone" class="form-label">Telefone</label>
              <input id="telefone" type="text" v-model="form.telefone" class="form-input" placeholder="(00) 00000-0000" />
            </div>

            <div>
              <label for="email" class="form-label">E-mail</label>
              <input id="email" type="email" v-model="form.email" class="form-input" placeholder="contato@escola.com" />
            </div>

            <div>
              <label for="cep" class="form-label">CEP</label>
              <input id="cep" type="text" v-model="form.cep" class="form-input" placeholder="00000-000" />
            </div>

            <div class="md:col-span-2">
              <label for="endereco" class="form-label">Endereço</label>
              <input id="endereco" type="text" v-model="form.endereco" class="form-input" placeholder="Rua, número, bairro, cidade - UF" />
            </div>
          </div>
        </Cartao>

        <!-- Equipe Diretiva -->
        <Cartao>
          <h2 class="text-heading-3 mb-6">Equipe Diretiva</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="diretor" class="form-label">Diretor(a)</label>
              <input id="diretor" type="text" v-model="form.diretor" class="form-input" placeholder="Nome do(a) diretor(a)" />
            </div>

            <div>
              <label for="vice_diretor" class="form-label">Vice-Diretor(a)</label>
              <input id="vice_diretor" type="text" v-model="form.vice_diretor" class="form-input" placeholder="Nome do(a) vice-diretor(a)" />
            </div>

            <div class="md:col-span-2">
              <label for="coord_pedagogica" class="form-label">Coordenador(a) Pedagógico(a)</label>
              <input id="coord_pedagogica" type="text" v-model="form.coord_pedagogica" class="form-input" placeholder="Nome do(a) coordenador(a)" />
            </div>
          </div>
        </Cartao>

        <!-- Identidade Visual -->
        <Cartao>
          <h2 class="text-heading-3 mb-6">Identidade Visual</h2>
          <div class="space-y-4">
            <div>
              <label for="slug" class="form-label">Slug (identificador)</label>
              <input id="slug" type="text" v-model="form.slug" class="form-input" placeholder="minha-escola" />
              <p class="mt-1 text-xs text-text-secondary">Identificador único da escola (usado em URLs)</p>
              <p v-if="erros.slug" class="mt-1 text-xs text-critical-500">{{ erros.slug }}</p>
            </div>

            <div>
              <label for="logo_url" class="form-label">URL do logotipo</label>
              <input id="logo_url" type="url" v-model="form.logo_url" class="form-input" placeholder="https://exemplo.com/logo.png" />
            </div>
          </div>
        </Cartao>

        <!-- Botão Salvar -->
        <div class="flex items-center justify-end">
          <button @click="salvar" :disabled="loading" class="btn-primary">
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Números da Escola (dinâmicos) -->
        <Cartao>
          <h2 class="text-heading-3 mb-4">Números da Escola</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Turmas</span>
              <span class="text-lg font-semibold text-gray-900">{{ counts.turmas }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Alunos</span>
              <span class="text-lg font-semibold text-gray-900">{{ counts.alunos }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Professores</span>
              <span class="text-lg font-semibold text-gray-900">{{ counts.professores }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-600">Pedagogos</span>
              <span class="text-lg font-semibold text-gray-900">{{ counts.pedagogos }}</span>
            </div>
          </div>
        </Cartao>

        <!-- Ano Letivo -->
        <Cartao>
          <h2 class="text-heading-3 mb-4">Ano Letivo</h2>
          <div v-if="anoLetivo">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-50 text-primary-500">
              {{ anoLetivo }}
            </span>
          </div>
          <p v-else class="text-sm text-gray-500">Nenhum ano letivo ativo</p>
        </Cartao>

        <!-- Plano Atual -->
        <Cartao>
          <h2 class="text-heading-3 mb-4">Plano Atual</h2>
          <div class="space-y-3">
            <div>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
                  school?.plan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-primary-50 text-primary-500'
                ]"
              >
                {{ school?.plan === 'free' ? 'Gratuito' : school?.plan || '-' }}
              </span>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Criada em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarData(school?.created_at) }}</p>
            </div>
          </div>
        </Cartao>
      </div>
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
import { ref, onMounted } from 'vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const supabase = useSupabaseClient()
const { usuario } = useUsuario()
const { school, counts, loading, fetchSchool, fetchCounts, updateSchool } = useSchool()
const loadingPage = ref(true)
const anoLetivo = ref<string | null>(null)

const form = ref({
  name: '',
  slug: '',
  logo_url: '',
  cnpj: '',
  endereco: '',
  cep: '',
  telefone: '',
  email: '',
  diretor: '',
  vice_diretor: '',
  coord_pedagogica: ''
})

const erros = ref<Record<string, string>>({})

const notificacao = ref({
  visivel: false,
  variante: 'sucesso' as 'sucesso' | 'aviso' | 'critico',
  titulo: '',
  mensagem: ''
})

const mostrarNotificacao = (variante: 'sucesso' | 'aviso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

const validar = () => {
  erros.value = {}
  if (!form.value.name.trim()) {
    erros.value.name = 'Nome da escola é obrigatório'
  }
  if (form.value.slug && !/^[a-z0-9-]+$/.test(form.value.slug)) {
    erros.value.slug = 'Slug deve conter apenas letras minúsculas, números e hífens'
  }
  return Object.keys(erros.value).length === 0
}

const salvar = async () => {
  if (!validar()) return
  try {
    await updateSchool({
      name: form.value.name,
      slug: form.value.slug,
      logo_url: form.value.logo_url || null,
      cnpj: form.value.cnpj || null,
      endereco: form.value.endereco || null,
      cep: form.value.cep || null,
      telefone: form.value.telefone || null,
      email: form.value.email || null,
      diretor: form.value.diretor || null,
      vice_diretor: form.value.vice_diretor || null,
      coord_pedagogica: form.value.coord_pedagogica || null
    })
    mostrarNotificacao('sucesso', 'Configurações salvas com sucesso')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar', 'Não foi possível atualizar as configurações')
  }
}

const formatarData = (data: string | undefined) => {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fetchAnoLetivo = async () => {
  if (!usuario.value.schoolId) return
  const { data } = await supabase
    .from('academic_years')
    .select('name')
    .eq('school_id', usuario.value.schoolId)
    .eq('is_active', true)
    .single()
  anoLetivo.value = data?.name || null
}

onMounted(async () => {
  await Promise.all([fetchSchool(), fetchCounts(), fetchAnoLetivo()])
  if (school.value) {
    form.value = {
      name: school.value.name || '',
      slug: school.value.slug || '',
      logo_url: school.value.logo_url || '',
      cnpj: school.value.cnpj || '',
      endereco: school.value.endereco || '',
      cep: school.value.cep || '',
      telefone: school.value.telefone || '',
      email: school.value.email || '',
      diretor: school.value.diretor || '',
      vice_diretor: school.value.vice_diretor || '',
      coord_pedagogica: school.value.coord_pedagogica || ''
    }
  }
  loadingPage.value = false
})
</script>
