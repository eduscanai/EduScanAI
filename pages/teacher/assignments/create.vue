<template>
  <div>
    <!-- Cabecalho -->
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
      <!-- Formulario principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Etapa 1: Informacoes -->
        <Cartao>
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">1</span>
            <h2 class="text-heading-3">Cadastrar Atividade</h2>
          </div>
          <div class="space-y-4">
            <div>
              <label for="titulo" class="form-label">Titulo *</label>
              <input id="titulo" type="text" v-model="form.titulo" class="form-input" placeholder="Ex: Prova de Matematica - Fracoes" />
              <p v-if="erros.titulo" class="mt-1 text-xs text-critical-500">{{ erros.titulo }}</p>
            </div>

            <EditorRico
              v-model="form.descricao"
              rotulo="Descricao"
              texto-reservado="Descreva a atividade, instrucoes, criterios de avaliacao..."
            />
          </div>
        </Cartao>

        <!-- Etapa 2: Anexos + Gabarito -->
        <Cartao>
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">2</span>
            <h2 class="text-heading-3">Anexar Atividade + Gabarito</h2>
          </div>

          <div class="space-y-5">
            <UploadArquivo
              v-model="form.anexos"
              rotulo="PDF da Atividade"
              bucket="assignments-files"
              :pasta="form.turma_ids[0] || undefined"
            />

            <div class="border-t border-gray-100 pt-5">
              <UploadArquivo
                v-model="form.gabarito"
                rotulo="Gabarito (para correcao com IA)"
                bucket="assignments-files"
                :pasta="form.turma_ids[0] ? `${form.turma_ids[0]}/gabaritos` : undefined"
              />
              <p class="mt-2 text-xs text-text-secondary">
                Faca upload do gabarito para habilitar a correcao automatica com IA.
              </p>
            </div>
          </div>
        </Cartao>

        <!-- Etapa 3: Unidade Tematica + Habilidades -->
        <Cartao>
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">3</span>
            <h2 class="text-heading-3">Unidade Tematica + Habilidades</h2>
          </div>

          <p v-if="!form.disciplina_id" class="text-sm text-gray-400 text-center py-6">
            Selecione uma disciplina na sidebar para definir as habilidades
          </p>

          <div v-else class="space-y-4">
            <!-- Topicos (unidades tematicas) da disciplina -->
            <div v-if="carregandoBncc" class="text-center py-6">
              <p class="text-sm text-gray-400">Carregando unidades tematicas...</p>
            </div>
            <div v-else-if="bnccTopics.length === 0" class="text-center py-6">
              <p class="text-sm text-gray-400">Nenhuma unidade tematica cadastrada para esta disciplina</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="topico in bnccTopics"
                :key="topico.id"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  @click="toggleTopico(topico.id)"
                  class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      :checked="topicoSelecionado(topico.id)"
                      @click.stop="toggleTopicoCompleto(topico.id)"
                      class="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span class="text-sm font-semibold text-gray-900">{{ topico.name }}</span>
                    <span v-if="topico.bncc_code" class="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{{ topico.bncc_code }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">
                      {{ contarHabilidadesSelecionadas(topico.id) }}/{{ (skillsPorTopico[topico.id] || []).length }}
                    </span>
                    <Icone :tamanho="16" :class="['transition-transform', topicosAbertos.has(topico.id) ? 'rotate-180' : '']">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </Icone>
                  </div>
                </button>

                <div v-if="topicosAbertos.has(topico.id)" class="px-4 py-3 space-y-2 border-t border-gray-100">
                  <p v-if="topico.description" class="text-xs text-gray-500 mb-2">{{ topico.description }}</p>
                  <div v-if="(skillsPorTopico[topico.id] || []).length === 0" class="text-xs text-gray-400 py-2">
                    Nenhuma habilidade cadastrada nesta unidade
                  </div>
                  <label
                    v-for="skill in (skillsPorTopico[topico.id] || [])"
                    :key="skill.id"
                    class="flex items-start gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"
                  >
                    <input
                      type="checkbox"
                      :checked="form.habilidade_ids.includes(skill.id)"
                      @change="toggleHabilidade(skill.id)"
                      class="mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <div>
                      <span v-if="skill.code" class="text-xs font-mono text-primary-600 mr-1">{{ skill.code }}</span>
                      <span class="text-sm text-gray-700">{{ skill.description }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <p v-if="form.habilidade_ids.length > 0" class="text-xs text-primary-600 font-medium">
              {{ form.habilidade_ids.length }} habilidade{{ form.habilidade_ids.length > 1 ? 's' : '' }} selecionada{{ form.habilidade_ids.length > 1 ? 's' : '' }}
            </p>
          </div>
        </Cartao>

      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Etapa 4: Configuracoes -->
        <Cartao>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">4</span>
            <h2 class="text-heading-3">Configuracoes</h2>
          </div>
          <div class="space-y-4">
            <SeletorMultiplo
              v-model="form.turma_ids"
              rotulo="Turmas *"
              texto-reservado="Selecione uma ou mais turmas"
              :opcoes="opcoesTurma"
              :erro="erros.turma_ids"
            />

            <div>
              <CampoSelecao
                rotulo="Disciplina"
                :modelValue="form.disciplina_id"
                @update:modelValue="onSubjectChange($event as string)"
                texto-reservado="Selecione (opcional)"
                :opcoes="opcoesDisciplina"
              />
            </div>

            <div>
              <CampoSelecao
                rotulo="Categoria"
                :modelValue="form.categoria_id"
                @update:modelValue="form.categoria_id = $event as string"
                texto-reservado="Selecione (opcional)"
                :opcoes="opcoesCategoria"
              />
            </div>

            <div>
              <CampoSelecao
                rotulo="Periodo de Avaliacao"
                :modelValue="form.periodo_id"
                @update:modelValue="form.periodo_id = $event as string"
                texto-reservado="Selecione (opcional)"
                :opcoes="opcoesPeriodo"
              />
            </div>

            <div>
              <label for="prazo" class="form-label">Prazo de entrega</label>
              <input id="prazo" type="datetime-local" v-model="form.data_entrega" class="form-input" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="nota-max" class="form-label">Valor da Atividade</label>
                <input id="nota-max" type="number" v-model.number="form.nota_maxima" class="form-input" min="0" step="0.5" placeholder="10" />
                <p class="mt-1 text-xs text-text-secondary">Nota maxima (pontos)</p>
              </div>
              <div>
                <label for="peso" class="form-label">Peso</label>
                <input id="peso" type="number" v-model.number="form.peso" class="form-input" min="0.1" step="0.1" placeholder="1" />
                <p class="mt-1 text-xs text-text-secondary">Peso no calculo da media</p>
              </div>
            </div>

            <div>
              <CampoSelecao
                rotulo="Modo de envio"
                :modelValue="form.modo_envio"
                @update:modelValue="form.modo_envio = $event as string"
                texto-reservado="Selecione"
                :opcoes="opcoesModoEnvio"
              />
              <p class="mt-1 text-xs text-text-secondary">
                {{ form.modo_envio === 'lote' ? 'Professor envia as respostas dos alunos' : 'Cada aluno envia sua propria resposta' }}
              </p>
            </div>
          </div>
        </Cartao>

        <!-- Etapa 5: Acesso do Aluno -->
        <Cartao>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">5</span>
            <h2 class="text-heading-3">Acesso do Aluno</h2>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">Visivel para alunos</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ form.visivel_aluno
                    ? 'Alunos podem ver a atividade ao publicar'
                    : 'Atividade oculta — alunos nao verao o conteudo' }}
                </p>
              </div>
              <Alternador v-model="form.visivel_aluno" />
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p class="text-xs text-amber-700">
                <strong>Atencao:</strong> A atividade aparecera no calendario da turma (se houver prazo),
                mas o conteudo so sera acessivel ao aluno quando a visibilidade estiver ativada.
              </p>
            </div>
          </div>
        </Cartao>

        <!-- Acoes -->
        <Cartao>
          <div class="space-y-3">
            <Botao variante="contorno" largura-completa :carregando="salvandoRascunho" @click="salvarRascunho">
              Salvar Rascunho
            </Botao>
            <Botao variante="primario" largura-completa :carregando="publicando" @click="salvarEPublicar">
              Publicar Atividade
            </Botao>
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
import Botao from '~/components/ui/Botao/Botao.vue'
import Alternador from '~/components/ui/Alternador/Alternador.vue'
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

const { createAssignment, publishAssignment, saveHabilidades } = useAssignments()
const salvandoRascunho = ref(false)
const publicando = ref(false)
const { classes, fetchClasses } = useClasses()
const { subjects, fetchSubjects } = useSubjects()
const { categories, fetchCategories } = useAssignmentCategories()
const { gradingPeriods, fetchGradingPeriods } = useGradingPeriods()
const { topics: bnccTopics, skills: bnccSkills, fetchTopicsBySubject, fetchAllSkillsBySubject } = useBnccTopics()

const carregandoBncc = ref(false)
const topicosAbertos = ref(new Set<string>())

const form = ref({
  titulo: '',
  descricao: '',
  turma_ids: [] as string[],
  disciplina_id: '',
  categoria_id: '',
  periodo_id: '',
  data_entrega: '',
  nota_maxima: 10,
  peso: 1,
  modo_envio: 'individual' as 'individual' | 'lote',
  visivel_aluno: false,
  anexos: [] as { name: string; url: string }[],
  gabarito: [] as { name: string; url: string }[],
  habilidade_ids: [] as string[]
})

const erros = ref<Record<string, string>>({})

const opcoesTurma = computed(() =>
  classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
)

const opcoesDisciplina = computed(() =>
  subjects.value.map(s => ({ rotulo: s.name, valor: s.id }))
)

const opcoesCategoria = computed(() =>
  categories.value.map(c => ({ rotulo: `${c.name} (${c.weight}%)`, valor: c.id }))
)

const opcoesPeriodo = computed(() =>
  gradingPeriods.value.map(p => ({ rotulo: p.name, valor: p.id }))
)

const opcoesModoEnvio = [
  { rotulo: 'Individual (aluno envia)', valor: 'individual' },
  { rotulo: 'Enviar respostas (professor envia)', valor: 'lote' }
]

// Organizar skills por topico
const skillsPorTopico = computed(() => {
  const map: Record<string, any[]> = {}
  for (const skill of bnccSkills.value) {
    if (!map[skill.topic_id]) map[skill.topic_id] = []
    map[skill.topic_id].push(skill)
  }
  return map
})

const topicoSelecionado = (topicoId: string) => {
  const skills = skillsPorTopico.value[topicoId] || []
  return skills.length > 0 && skills.every(s => form.value.habilidade_ids.includes(s.id))
}

const contarHabilidadesSelecionadas = (topicoId: string) => {
  const skills = skillsPorTopico.value[topicoId] || []
  return skills.filter(s => form.value.habilidade_ids.includes(s.id)).length
}

const toggleTopico = (topicoId: string) => {
  const abertos = new Set(topicosAbertos.value)
  if (abertos.has(topicoId)) abertos.delete(topicoId)
  else abertos.add(topicoId)
  topicosAbertos.value = abertos
}

const toggleTopicoCompleto = (topicoId: string) => {
  const skills = skillsPorTopico.value[topicoId] || []
  const skillIds = skills.map(s => s.id)
  const todosJaSelecionados = skillIds.every(id => form.value.habilidade_ids.includes(id))

  if (todosJaSelecionados) {
    form.value.habilidade_ids = form.value.habilidade_ids.filter(id => !skillIds.includes(id))
  } else {
    const novos = skillIds.filter(id => !form.value.habilidade_ids.includes(id))
    form.value.habilidade_ids = [...form.value.habilidade_ids, ...novos]
  }
}

const toggleHabilidade = (skillId: string) => {
  const idx = form.value.habilidade_ids.indexOf(skillId)
  if (idx >= 0) form.value.habilidade_ids.splice(idx, 1)
  else form.value.habilidade_ids.push(skillId)
}

const onSubjectChange = async (subjectId: string) => {
  form.value.disciplina_id = subjectId
  form.value.habilidade_ids = []
  topicosAbertos.value = new Set()

  if (!subjectId) return

  carregandoBncc.value = true
  try {
    await fetchTopicsBySubject(subjectId)
    await fetchAllSkillsBySubject()
  } finally {
    carregandoBncc.value = false
  }
}

const validar = () => {
  erros.value = {}
  if (!form.value.titulo.trim()) erros.value.titulo = 'Titulo e obrigatorio'
  if (!form.value.turma_ids.length) erros.value.turma_ids = 'Selecione ao menos uma turma'
  return Object.keys(erros.value).length === 0
}

const dadosAtividade = () => ({
  titulo: form.value.titulo,
  descricao: form.value.descricao || undefined,
  turma_ids: form.value.turma_ids,
  disciplina_id: form.value.disciplina_id || undefined,
  categoria_id: form.value.categoria_id || undefined,
  periodo_id: form.value.periodo_id || undefined,
  data_entrega: form.value.data_entrega || undefined,
  nota_maxima: form.value.nota_maxima,
  peso: form.value.peso,
  modo_envio: form.value.modo_envio,
  visivel_aluno: form.value.visivel_aluno,
  anexos: form.value.anexos,
  gabarito: form.value.gabarito
})

const salvarExtras = async (assignmentIds: string[]) => {
  if (form.value.habilidade_ids.length > 0) {
    await Promise.all(assignmentIds.map(id => saveHabilidades(id, form.value.habilidade_ids)))
  }
}

const salvarRascunho = async () => {
  if (!validar()) return
  salvandoRascunho.value = true
  try {
    const results = await createAssignment(dadosAtividade())
    await salvarExtras(results.map(r => r.id))
    mostrarNotificacao('sucesso', 'Rascunho salvo!')
    setTimeout(() => navigateTo(`/teacher/assignments/${results[0]?.id}`), 1000)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao salvar rascunho', e?.message || '')
  } finally {
    salvandoRascunho.value = false
  }
}

const salvarEPublicar = async () => {
  if (!validar()) return
  publicando.value = true
  try {
    const results = await createAssignment(dadosAtividade())
    await salvarExtras(results.map(r => r.id))
    await Promise.all(results.map(r => publishAssignment(r.id)))
    mostrarNotificacao('sucesso', 'Atividade publicada! Alunos foram notificados.')
    setTimeout(() => navigateTo('/teacher/assignments'), 1500)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao publicar atividade', e?.message || '')
  } finally {
    publicando.value = false
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  await Promise.all([fetchClasses(), fetchSubjects(), fetchCategories(), fetchGradingPeriods()])
})
</script>
