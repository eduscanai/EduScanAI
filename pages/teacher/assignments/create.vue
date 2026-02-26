<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/teacher/assignments"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Nova Atividade</h1>
        <p class="text-body text-text-secondary mt-1">Crie uma nova atividade para suas turmas</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulário principal -->
      <div class="lg:col-span-2 space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-6">Informações</h2>
          <div class="space-y-4">
            <div>
              <label for="titulo" class="form-label">Título *</label>
              <input id="titulo" type="text" v-model="form.title" class="form-input" placeholder="Ex: Prova de Matemática - Frações" />
              <p v-if="erros.title" class="mt-1 text-xs text-critical-500">{{ erros.title }}</p>
            </div>

            <EditorRico
              v-model="form.description"
              rotulo="Descrição"
              texto-reservado="Descreva a atividade, instruções, critérios de avaliação..."
            />
          </div>
        </Cartao>

        <!-- Anexos -->
        <Cartao>
          <UploadArquivo
            v-model="form.attachments"
            rotulo="Anexos"
            bucket="assignments-files"
            :pasta="form.class_ids[0] || undefined"
          />
        </Cartao>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Configurações</h2>
          <div class="space-y-4">
            <SeletorMultiplo
              v-model="form.class_ids"
              rotulo="Turmas *"
              texto-reservado="Selecione uma ou mais turmas"
              :opcoes="opcoesTurma"
              :erro="erros.class_ids"
            />

            <div>
              <CampoSelecao
                rotulo="Disciplina"
                :modelValue="form.subject_id"
                @update:modelValue="form.subject_id = $event as string"
                texto-reservado="Selecione (opcional)"
                :opcoes="opcoesDisciplina"
              />
            </div>

            <div>
              <label for="prazo" class="form-label">Prazo de entrega</label>
              <input id="prazo" type="datetime-local" v-model="form.due_date" class="form-input" />
            </div>

            <div>
              <label for="nota-max" class="form-label">Nota máxima</label>
              <input id="nota-max" type="number" v-model.number="form.max_score" class="form-input" min="0" step="0.5" />
            </div>
          </div>
        </Cartao>

        <Cartao>
          <div class="space-y-3">
            <button @click="salvarRascunho" :disabled="loading" class="btn-outline w-full">
              {{ loading ? 'Salvando...' : 'Salvar Rascunho' }}
            </button>
            <button @click="salvarEPublicar" :disabled="loading" class="btn-primary w-full">
              {{ loading ? 'Publicando...' : 'Publicar Atividade' }}
            </button>
          </div>
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
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import SeletorMultiplo from '~/components/form/SeletorMultiplo/SeletorMultiplo.vue'
import EditorRico from '~/components/form/EditorRico/EditorRico.vue'
import UploadArquivo from '~/components/form/UploadArquivo/UploadArquivo.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'teacher']
})

const { loading, createAssignment, publishAssignment } = useAssignments()
const { classes, fetchClasses } = useClasses()
const { subjects, fetchSubjects } = useSubjects()

const form = ref({
  title: '',
  description: '',
  class_ids: [] as string[],
  subject_id: '',
  due_date: '',
  max_score: 10,
  attachments: [] as { name: string; url: string }[]
})

const erros = ref<Record<string, string>>({})

const opcoesTurma = computed(() =>
  classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
)

const opcoesDisciplina = computed(() =>
  subjects.value.map(s => ({ rotulo: s.name, valor: s.id }))
)

const validar = () => {
  erros.value = {}
  if (!form.value.title.trim()) erros.value.title = 'Título é obrigatório'
  if (!form.value.class_ids.length) erros.value.class_ids = 'Selecione ao menos uma turma'
  return Object.keys(erros.value).length === 0
}

const dadosAtividade = () => ({
  title: form.value.title,
  description: form.value.description || undefined,
  class_ids: form.value.class_ids,
  subject_id: form.value.subject_id || undefined,
  due_date: form.value.due_date || undefined,
  max_score: form.value.max_score,
  attachments: form.value.attachments
})

const salvarRascunho = async () => {
  if (!validar()) return
  try {
    const results = await createAssignment(dadosAtividade())
    mostrarNotificacao('sucesso', 'Rascunho salvo!')
    setTimeout(() => navigateTo(`/teacher/assignments/${results[0]?.id}`), 1000)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao salvar rascunho', e?.message || '')
  }
}

const salvarEPublicar = async () => {
  if (!validar()) return
  try {
    const results = await createAssignment(dadosAtividade())
    await Promise.all(results.map(r => publishAssignment(r.id)))
    mostrarNotificacao('sucesso', 'Atividade publicada! Alunos foram notificados.')
    setTimeout(() => navigateTo('/teacher/assignments'), 1500)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao publicar atividade', e?.message || '')
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await Promise.all([fetchClasses(), fetchSubjects()])
})
</script>
