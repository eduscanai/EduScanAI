<template>
  <div class="min-h-screen bg-bg-page">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-[10px]">
          <div class="bg-primary-500 p-[6px] rounded-lg">
            <Icone :tamanho="20" class="text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </Icone>
          </div>
          <span class="text-[16px] font-extrabold text-gray-900">EduScan AI</span>
        </div>
        <button @click="pular" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Pular configuração
        </button>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-6 py-8">
      <!-- Stepper -->
      <div class="flex items-center justify-center mb-10">
        <div v-for="(step, i) in steps" :key="i" class="flex items-center">
          <!-- Círculo -->
          <div
            :class="[
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              i < etapaAtual ? 'bg-green-500 text-white' :
              i === etapaAtual ? 'bg-primary-500 text-white' :
              'bg-gray-200 text-gray-500'
            ]"
          >
            <Icone v-if="i < etapaAtual" :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </Icone>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <!-- Linha -->
          <div
            v-if="i < steps.length - 1"
            :class="['w-16 h-0.5 mx-2', i < etapaAtual ? 'bg-green-500' : 'bg-gray-200']"
          ></div>
        </div>
      </div>

      <!-- Título da etapa -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-gray-900">{{ steps[etapaAtual].titulo }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ steps[etapaAtual].descricao }}</p>
      </div>

      <!-- ============ STEP 1: Dados da escola ============ -->
      <div v-if="etapaAtual === 0" class="space-y-6">
        <Cartao>
          <div class="space-y-4">
            <div>
              <label class="form-label">Nome da escola</label>
              <input type="text" v-model="escola.name" class="form-input" />
            </div>

            <div>
              <label class="form-label">Logo da escola</label>
              <UploadArquivo
                v-model="logoTemp"
                bucket="school-assets"
                pasta="logo"
                :maximo="1"
                accept=".jpg,.jpeg,.png,.webp"
              />
            </div>
          </div>
        </Cartao>
      </div>

      <!-- ============ STEP 2: Disciplinas ============ -->
      <div v-if="etapaAtual === 1" class="space-y-6">
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500">Adicione as disciplinas da sua escola. Você pode editar depois.</p>
            <button @click="adicionarSugestoes" class="text-xs text-primary-500 hover:text-primary-600 font-medium">
              + Sugestões padrão
            </button>
          </div>

          <div class="space-y-2 mb-4">
            <div
              v-for="(disc, i) in disciplinas"
              :key="i"
              class="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-lg group"
            >
              <input
                type="text"
                v-model="disciplinas[i]"
                class="flex-1 text-sm bg-transparent border-0 focus:ring-0 p-0 text-gray-700"
                placeholder="Nome da disciplina"
              />
              <button
                @click="disciplinas.splice(i, 1)"
                class="text-gray-400 hover:text-critical-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icone :tamanho="14">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </Icone>
              </button>
            </div>
          </div>

          <button
            @click="disciplinas.push('')"
            class="btn-outline text-sm inline-flex items-center gap-2"
          >
            <Icone :tamanho="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </Icone>
            Adicionar disciplina
          </button>
        </Cartao>
      </div>

      <!-- ============ STEP 3: Primeira turma ============ -->
      <div v-if="etapaAtual === 2" class="space-y-6">
        <Cartao>
          <div class="space-y-4">
            <div>
              <label class="form-label">Nome da turma *</label>
              <input type="text" v-model="turma.name" class="form-input" placeholder="Ex: 5º Ano A" />
              <p v-if="erros.turmaName" class="mt-1 text-xs text-critical-500">{{ erros.turmaName }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Série/Ano</label>
                <input type="text" v-model="turma.grade_level" class="form-input" placeholder="5º Ano" />
              </div>
              <CampoSelecao
                rotulo="Turno"
                :modelValue="turma.shift"
                @update:modelValue="turma.shift = $event as string"
                texto-reservado="Selecione"
                :opcoes="[
                  { rotulo: 'Manhã', valor: 'morning' },
                  { rotulo: 'Tarde', valor: 'afternoon' },
                  { rotulo: 'Noite', valor: 'evening' }
                ]"
              />
            </div>
          </div>
        </Cartao>
      </div>

      <!-- ============ STEP 4: Convidar professor ============ -->
      <div v-if="etapaAtual === 3" class="space-y-6">
        <Cartao>
          <p class="text-sm text-gray-500 mb-4">Convide o primeiro professor. Você poderá adicionar mais depois.</p>

          <div class="space-y-4">
            <div>
              <label class="form-label">Nome do professor</label>
              <input type="text" v-model="professor.fullName" class="form-input" placeholder="Nome completo" />
            </div>
            <div>
              <label class="form-label">E-mail do professor</label>
              <input type="email" v-model="professor.email" class="form-input" placeholder="professor@email.com" />
            </div>
            <div>
              <label class="form-label">Senha temporária</label>
              <input type="text" v-model="professor.password" class="form-input" placeholder="Mínimo 6 caracteres" />
              <p class="mt-1 text-xs text-gray-400">O professor poderá alterar depois</p>
            </div>
          </div>
        </Cartao>

        <div class="text-center">
          <button @click="pularProfessor" class="text-sm text-gray-500 hover:text-gray-700">
            Pular esta etapa
          </button>
        </div>
      </div>

      <!-- Erro geral -->
      <div
        v-if="erroGeral"
        class="mt-4 p-3 rounded-lg border-l-4 border-critical-500 bg-critical-50 text-sm text-critical-700"
      >
        {{ erroGeral }}
      </div>

      <!-- Navegação -->
      <div class="flex items-center justify-between mt-8">
        <button
          v-if="etapaAtual > 0"
          @click="etapaAtual--"
          class="btn-outline"
        >
          Voltar
        </button>
        <div v-else></div>

        <button
          @click="avancar"
          :disabled="carregando"
          class="btn-primary"
        >
          <span v-if="carregando" class="flex items-center gap-2">
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </span>
          <span v-else>{{ etapaAtual < steps.length - 1 ? 'Próximo' : 'Concluir' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import UploadArquivo from '~/components/form/UploadArquivo/UploadArquivo.vue'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { usuario } = useUsuario()

const etapaAtual = ref(0)
const carregando = ref(false)
const erroGeral = ref('')
const erros = ref<Record<string, string>>({})

const steps = [
  { titulo: 'Dados da Escola', descricao: 'Confirme as informações e adicione um logo' },
  { titulo: 'Disciplinas', descricao: 'Cadastre as disciplinas da sua escola' },
  { titulo: 'Primeira Turma', descricao: 'Crie a primeira turma da escola' },
  { titulo: 'Convidar Professor', descricao: 'Convide o primeiro professor (opcional)' }
]

// State
const escola = ref({ name: '', logo_url: '' })
const logoTemp = ref<{ name: string; url: string; path?: string }[]>([])
const disciplinas = ref<string[]>([])
const turma = ref({ name: '', grade_level: '', shift: '' })
const professor = ref({ fullName: '', email: '', password: '' })

// Preencher nome da escola ao montar
onMounted(async () => {
  // Buscar dados da escola atual
  if (usuario.value.schoolId) {
    const { data } = await supabase
      .from('schools')
      .select('name, logo_url')
      .eq('id', usuario.value.schoolId)
      .single()

    if (data) {
      escola.value.name = data.name || ''
      escola.value.logo_url = data.logo_url || ''
    }
  }
})

const sugestoesDisciplinas = [
  'Português', 'Matemática', 'Ciências', 'História',
  'Geografia', 'Inglês', 'Educação Física', 'Artes',
  'Ensino Religioso'
]

const adicionarSugestoes = () => {
  const existentes = new Set(disciplinas.value.map(d => d.toLowerCase().trim()))
  for (const s of sugestoesDisciplinas) {
    if (!existentes.has(s.toLowerCase())) {
      disciplinas.value.push(s)
    }
  }
}

const pularProfessor = () => {
  professor.value = { fullName: '', email: '', password: '' }
  concluir()
}

const pular = () => {
  navigateTo('/dashboard', { replace: true })
}

const avancar = async () => {
  erroGeral.value = ''
  erros.value = {}

  if (etapaAtual.value === 0) {
    await salvarEscola()
  } else if (etapaAtual.value === 1) {
    await salvarDisciplinas()
  } else if (etapaAtual.value === 2) {
    if (!turma.value.name.trim()) {
      erros.value.turmaName = 'Nome da turma é obrigatório'
      return
    }
    await salvarTurma()
  } else if (etapaAtual.value === 3) {
    await concluir()
    return
  }

  if (!erroGeral.value && Object.keys(erros.value).length === 0) {
    etapaAtual.value++
  }
}

const salvarEscola = async () => {
  carregando.value = true
  try {
    const updates: Record<string, any> = { name: escola.value.name }
    if (logoTemp.value.length > 0) {
      updates.logo_url = logoTemp.value[0].url
    }

    const { error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', usuario.value.schoolId)

    if (error) throw error
  } catch (e: any) {
    erroGeral.value = 'Erro ao salvar dados da escola: ' + e.message
  } finally {
    carregando.value = false
  }
}

const salvarDisciplinas = async () => {
  const nomes = disciplinas.value.filter(d => d.trim())
  if (nomes.length === 0) return // Ok pular

  carregando.value = true
  try {
    const inserts = nomes.map(name => ({
      school_id: usuario.value.schoolId,
      name: name.trim()
    }))

    const { error } = await supabase.from('subjects').insert(inserts)
    if (error) throw error
  } catch (e: any) {
    erroGeral.value = 'Erro ao salvar disciplinas: ' + e.message
  } finally {
    carregando.value = false
  }
}

const salvarTurma = async () => {
  carregando.value = true
  try {
    // Buscar ano letivo atual
    const { data: ano } = await supabase
      .from('academic_years')
      .select('id')
      .eq('school_id', usuario.value.schoolId)
      .eq('is_current', true)
      .maybeSingle()

    const { error } = await supabase.from('classes').insert({
      school_id: usuario.value.schoolId,
      academic_year_id: ano?.id || null,
      name: turma.value.name,
      grade_level: turma.value.grade_level || null,
      shift: turma.value.shift || null
    })

    if (error) throw error
  } catch (e: any) {
    erroGeral.value = 'Erro ao criar turma: ' + e.message
  } finally {
    carregando.value = false
  }
}

const concluir = async () => {
  carregando.value = true
  erroGeral.value = ''

  try {
    // Convidar professor se preenchido
    if (professor.value.email && professor.value.fullName && professor.value.password) {
      if (professor.value.password.length < 6) {
        erros.value.profPassword = 'Senha deve ter pelo menos 6 caracteres'
        carregando.value = false
        return
      }

      await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
          email: professor.value.email,
          password: professor.value.password,
          full_name: professor.value.fullName,
          role: 'teacher',
          school_id: usuario.value.schoolId
        }
      })
    }

    navigateTo('/dashboard', { replace: true })
  } catch (e: any) {
    erroGeral.value = e.data?.message || e.message || 'Erro ao convidar professor'
  } finally {
    carregando.value = false
  }
}
</script>
