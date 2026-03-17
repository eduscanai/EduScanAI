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
      <div class="flex-1">
        <h1 class="text-heading-1">{{ disciplina?.name || 'Disciplina' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ disciplina?.code ? `Código: ${disciplina.code}` : 'Unidades temáticas e habilidades BNCC' }}
        </p>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="disciplina" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteúdo principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tópicos BNCC -->
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Unidades Temáticas BNCC</h2>
            <button
              v-if="topics.length === 0 && temDefaults"
              @click="popularDefaults"
              :disabled="loading"
              class="btn-primary text-sm flex items-center gap-2"
            >
              <Icone :tamanho="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </Icone>
              {{ loading ? 'Carregando...' : 'Carregar tópicos e habilidades BNCC' }}
            </button>
            <button
              v-else
              @click="abrirModalCriar('topic')"
              class="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              + Adicionar tópico
            </button>
          </div>

          <div v-if="topics.length === 0 && !temDefaults" class="text-center py-8">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </Icone>
            <p class="text-sm text-gray-500 mb-2">Nenhum tópico cadastrado</p>
            <p class="text-xs text-gray-400 mb-3">Adicione manualmente ou importe de uma disciplina BNCC no painel lateral.</p>
            <button @click="abrirModalCriar('topic')" class="btn-outline text-sm">
              Adicionar manualmente
            </button>
          </div>

          <div v-else-if="topics.length === 0 && temDefaults" class="text-center py-8">
            <Icone :tamanho="48" class="text-primary-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </Icone>
            <p class="text-sm text-gray-500 mb-1">Tópicos e habilidades BNCC disponíveis para <strong>{{ disciplina.name }}</strong></p>
            <p class="text-xs text-gray-400">Clique em "Carregar tópicos e habilidades BNCC" para importar automaticamente</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="topic in topics"
              :key="topic.id"
              class="border border-gray-200 rounded-lg hover:border-primary-200 transition-colors overflow-hidden"
            >
              <!-- Header do tópico -->
              <div
                class="flex items-start justify-between p-4 cursor-pointer"
                @click="toggleTopic(topic.id)"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <Icone :tamanho="14" class="text-gray-400 transition-transform" :class="{ 'rotate-90': topicosAbertos.has(topic.id) }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </Icone>
                    <h3 class="text-sm font-semibold text-gray-900">{{ topic.name }}</h3>
                    <span v-if="topic.grade_level" class="text-[10px] font-medium bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
                      {{ topic.grade_level }}{{ topic.grade_level.includes('-') ? ' ano' : 'º ano' }}
                    </span>
                    <span v-if="topic.bncc_code" class="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {{ topic.bncc_code }}
                    </span>
                    <span class="text-[10px] text-gray-400">
                      {{ skillsPorTopic(topic.id).length }} habilidade{{ skillsPorTopic(topic.id).length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <p v-if="topic.description" class="text-xs text-gray-500 leading-relaxed ml-5">{{ topic.description }}</p>
                </div>
                <div v-if="!isBncc(topic.name)" class="flex items-center gap-1 ml-3" @click.stop>
                  <button
                    @click="abrirModalEditar(topic)"
                    class="p-1 rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Icone :tamanho="14">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </Icone>
                  </button>
                  <button
                    @click="confirmarExcluir(topic, 'topic')"
                    class="p-1 rounded text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
                  >
                    <Icone :tamanho="14">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </Icone>
                  </button>
                </div>
              </div>

              <!-- Habilidades (expandível) -->
              <div v-if="topicosAbertos.has(topic.id)" class="border-t border-gray-100 bg-gray-50/50">
                <div class="px-4 py-3">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Habilidades</p>
                    <button
                      @click="abrirModalCriar('skill', topic.id)"
                      class="text-[11px] text-primary-500 hover:text-primary-600 font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div v-if="skillsPorTopic(topic.id).length === 0" class="text-xs text-gray-400 py-2 text-center">
                    Nenhuma habilidade cadastrada
                  </div>

                  <div v-else class="space-y-2">
                    <div
                      v-for="skill in skillsPorTopic(topic.id)"
                      :key="skill.id"
                      class="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100"
                    >
                      <span v-if="skill.code" class="text-[10px] font-mono font-bold bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                        {{ skill.code }}
                      </span>
                      <p class="text-xs text-gray-700 leading-relaxed flex-1">{{ skill.description }}</p>
                      <span v-if="skill.grade_level" class="text-[10px] text-gray-400 shrink-0">{{ skill.grade_level }}º</span>
                      <div class="flex items-center gap-0.5 shrink-0" @click.stop>
                        <button
                          @click="abrirModalEditarSkill(skill)"
                          class="p-0.5 rounded text-gray-300 hover:text-primary-500 transition-colors"
                        >
                          <Icone :tamanho="12">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </Icone>
                        </button>
                        <button
                          @click="confirmarExcluir(skill, 'skill')"
                          class="p-0.5 rounded text-gray-300 hover:text-critical-500 transition-colors"
                        >
                          <Icone :tamanho="12">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </Icone>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Cartao>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Informações</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Disciplina</p>
              <p class="text-sm text-gray-900 mt-0.5 font-semibold">{{ disciplina.name }}</p>
            </div>
            <div v-if="disciplina.code">
              <p class="text-xs font-medium text-gray-500 uppercase">Código</p>
              <p class="text-sm text-gray-900 mt-0.5 font-mono">{{ disciplina.code }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Unidades Temáticas</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ topics.length }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Habilidades</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ skills.length }}</p>
            </div>
          </div>
        </Cartao>

        <Cartao v-if="temDefaults">
          <h2 class="text-heading-3 mb-3">BNCC - Referência</h2>
          <p class="text-xs text-text-secondary mb-3">
            Unidades temáticas previstas pela Base Nacional Comum Curricular para {{ disciplina.name }}.
          </p>
          <div class="space-y-2">
            <div
              v-for="(d, i) in defaults"
              :key="i"
              class="text-xs bg-gray-50 rounded-lg p-2"
            >
              <p class="font-medium text-gray-700">{{ d.name }}</p>
              <p class="text-gray-500 mt-0.5">{{ d.description }}</p>
            </div>
          </div>
        </Cartao>

        <!-- Importar de outra disciplina BNCC -->
        <Cartao>
          <h2 class="text-heading-3 mb-3">Importar da BNCC</h2>
          <p class="text-xs text-text-secondary mb-3">
            Copie tópicos e habilidades de uma disciplina BNCC para esta.
          </p>
          <select
            v-model="disciplinaBnccSelecionada"
            class="form-input text-sm mb-3"
          >
            <option value="">Selecione uma disciplina...</option>
            <option
              v-for="nome in bnccDisciplinas"
              :key="nome"
              :value="nome"
            >
              {{ nome }}
            </option>
          </select>

          <div v-if="previewImport.length > 0" class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-gray-500">Selecione os tópicos:</p>
              <button @click="toggleTodosImport" class="text-[11px] text-primary-500 hover:text-primary-600 font-medium">
                {{ topicosParaImportar.size === previewImport.length ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>
            <div class="space-y-1">
              <label
                v-for="(d, i) in previewImport"
                :key="i"
                class="flex items-start gap-2 text-xs bg-gray-50 rounded px-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
                @click.prevent="toggleTopicoImport(d.name)"
              >
                <input
                  type="checkbox"
                  :checked="topicosParaImportar.has(d.name)"
                  class="mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  @click.stop
                  @change="toggleTopicoImport(d.name)"
                />
                <div>
                  <span class="font-medium text-gray-700">{{ d.name }}</span>
                  <p class="text-gray-400 mt-0.5">{{ d.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <button
            v-if="disciplinaBnccSelecionada && topicosParaImportar.size > 0"
            @click="importarDeOutraDisciplina"
            :disabled="loading"
            class="btn-primary text-sm w-full"
          >
            {{ loading ? 'Importando...' : `Importar ${topicosParaImportar.size} tópico${topicosParaImportar.size > 1 ? 's' : ''}` }}
          </button>
        </Cartao>
      </div>
    </div>

    <!-- Modal Criar/Editar Tópico -->
    <Modal
      :esta-aberto="modalTopicAberto"
      :titulo="editandoTopic ? 'Editar Tópico' : 'Novo Tópico BNCC'"
      @fechar="modalTopicAberto = false"
    >
      <div class="space-y-4">
        <div>
          <label for="topic-nome" class="form-label">Nome *</label>
          <input id="topic-nome" type="text" v-model="formTopic.name" class="form-input" placeholder="Ex: Números" />
        </div>
        <div>
          <label for="topic-desc" class="form-label">Descrição</label>
          <textarea id="topic-desc" v-model="formTopic.description" class="form-input min-h-[80px] resize-y" placeholder="Descrição do tópico..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="topic-code" class="form-label">Código BNCC</label>
            <input id="topic-code" type="text" v-model="formTopic.bncc_code" class="form-input" placeholder="Ex: EF06MA01" />
          </div>
          <div>
            <label for="topic-grade" class="form-label">Anos</label>
            <input id="topic-grade" type="text" v-model="formTopic.grade_level" class="form-input" placeholder="Ex: 1-9" />
          </div>
        </div>
      </div>
      <template #rodape>
        <button @click="modalTopicAberto = false" class="btn-outline">Cancelar</button>
        <button @click="salvarTopic" :disabled="loading || !formTopic.name.trim()" class="btn-primary">
          {{ loading ? 'Salvando...' : (editandoTopic ? 'Salvar' : 'Criar') }}
        </button>
      </template>
    </Modal>

    <!-- Modal Criar/Editar Habilidade -->
    <Modal
      :esta-aberto="modalSkillAberto"
      :titulo="editandoSkill ? 'Editar Habilidade' : 'Nova Habilidade BNCC'"
      @fechar="modalSkillAberto = false"
    >
      <div class="space-y-4">
        <div>
          <label for="skill-desc" class="form-label">Descrição *</label>
          <textarea id="skill-desc" v-model="formSkill.description" class="form-input min-h-[80px] resize-y" placeholder="Descreva a habilidade..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="skill-code" class="form-label">Código BNCC</label>
            <input id="skill-code" type="text" v-model="formSkill.code" class="form-input" placeholder="Ex: EF06MA01" />
          </div>
          <div>
            <label for="skill-grade" class="form-label">Ano</label>
            <input id="skill-grade" type="text" v-model="formSkill.grade_level" class="form-input" placeholder="Ex: 6" />
          </div>
        </div>
      </div>
      <template #rodape>
        <button @click="modalSkillAberto = false" class="btn-outline">Cancelar</button>
        <button @click="salvarSkill" :disabled="loading || !formSkill.description.trim()" class="btn-primary">
          {{ loading ? 'Salvando...' : (editandoSkill ? 'Salvar' : 'Criar') }}
        </button>
      </template>
    </Modal>

    <!-- Diálogo de exclusão -->
    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir"
      :titulo="excluirTipo === 'topic' ? 'Excluir tópico' : 'Excluir habilidade'"
      :mensagem="excluirTipo === 'topic'
        ? `Tem certeza que deseja excluir '${itemParaExcluir?.name}'? Todas as habilidades vinculadas também serão excluídas.`
        : `Tem certeza que deseja excluir esta habilidade?`"
      variante="perigo"
      texto-confirmar="Excluir"
      @confirmar="executarExclusao"
      @cancelar="dialogoExcluir = false"
    />

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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const route = useRoute()
const subjectId = route.params.id as string

const { subjects, loading: loadingSubjects, fetchSubjects } = useSubjects()
const {
  topics, skills, loading,
  fetchTopicsBySubject, fetchAllSkillsBySubject,
  createTopic, updateTopic, deleteTopic,
  createSkill, updateSkill, deleteSkill,
  seedBnccDefaults, getDefaults, bnccDisciplinas
} = useBnccTopics()

const carregando = ref(true)
const disciplina = ref<any>(null)

const defaults = computed(() => disciplina.value ? getDefaults(disciplina.value.name) : [])
const temDefaults = computed(() => defaults.value.length > 0)
const nomesBncc = computed(() => new Set(defaults.value.map(d => d.name)))
const isBncc = (topicName: string) => nomesBncc.value.has(topicName)

// Importar tópicos de outra disciplina BNCC
const disciplinaBnccSelecionada = ref('')
const topicosParaImportar = reactive(new Set<string>())
const previewImport = computed(() => disciplinaBnccSelecionada.value ? getDefaults(disciplinaBnccSelecionada.value) : [])

watch(() => disciplinaBnccSelecionada.value, () => {
  topicosParaImportar.clear()
  previewImport.value.forEach(d => topicosParaImportar.add(d.name))
})

const toggleTopicoImport = (name: string) => {
  if (topicosParaImportar.has(name)) topicosParaImportar.delete(name)
  else topicosParaImportar.add(name)
}

const toggleTodosImport = () => {
  if (topicosParaImportar.size === previewImport.value.length) {
    topicosParaImportar.clear()
  } else {
    previewImport.value.forEach(d => topicosParaImportar.add(d.name))
  }
}

const importarDeOutraDisciplina = async () => {
  if (!disciplinaBnccSelecionada.value || topicosParaImportar.size === 0) return
  try {
    const count = await seedBnccDefaults(subjectId, disciplinaBnccSelecionada.value, [...topicosParaImportar])
    mostrarNotificacao('sucesso', `${count} tópicos importados de ${disciplinaBnccSelecionada.value}!`)
    await recarregar()
    topics.value.forEach(t => topicosAbertos.add(t.id))
    disciplinaBnccSelecionada.value = ''
  } catch {
    mostrarNotificacao('critico', 'Erro ao importar tópicos')
  }
}

// Controle de tópicos abertos/fechados
const topicosAbertos = reactive(new Set<string>())

const toggleTopic = (topicId: string) => {
  if (topicosAbertos.has(topicId)) {
    topicosAbertos.delete(topicId)
  } else {
    topicosAbertos.add(topicId)
  }
}

const skillsPorTopic = (topicId: string) => {
  return skills.value.filter(s => s.topic_id === topicId)
}

// Modal tópico
const modalTopicAberto = ref(false)
const editandoTopic = ref(false)
const editandoTopicId = ref('')
const formTopic = ref({ name: '', description: '', bncc_code: '', grade_level: '' })

// Modal habilidade
const modalSkillAberto = ref(false)
const editandoSkill = ref(false)
const editandoSkillId = ref('')
const skillTopicId = ref('')
const formSkill = ref({ code: '', description: '', grade_level: '' })

const abrirModalCriar = (tipo: 'topic' | 'skill', topicId?: string) => {
  if (tipo === 'topic') {
    editandoTopic.value = false
    editandoTopicId.value = ''
    formTopic.value = { name: '', description: '', bncc_code: '', grade_level: '' }
    modalTopicAberto.value = true
  } else {
    editandoSkill.value = false
    editandoSkillId.value = ''
    skillTopicId.value = topicId || ''
    formSkill.value = { code: '', description: '', grade_level: '' }
    modalSkillAberto.value = true
  }
}

const abrirModalEditar = (topic: any) => {
  editandoTopic.value = true
  editandoTopicId.value = topic.id
  formTopic.value = {
    name: topic.name,
    description: topic.description || '',
    bncc_code: topic.bncc_code || '',
    grade_level: topic.grade_level || ''
  }
  modalTopicAberto.value = true
}

const abrirModalEditarSkill = (skill: any) => {
  editandoSkill.value = true
  editandoSkillId.value = skill.id
  skillTopicId.value = skill.topic_id
  formSkill.value = {
    code: skill.code || '',
    description: skill.description,
    grade_level: skill.grade_level || ''
  }
  modalSkillAberto.value = true
}

const salvarTopic = async () => {
  if (!formTopic.value.name.trim()) return
  try {
    if (editandoTopic.value) {
      await updateTopic(editandoTopicId.value, {
        name: formTopic.value.name,
        description: formTopic.value.description || undefined,
        bncc_code: formTopic.value.bncc_code || undefined,
        grade_level: formTopic.value.grade_level || undefined
      })
      mostrarNotificacao('sucesso', 'Tópico atualizado')
    } else {
      await createTopic({
        subject_id: subjectId,
        name: formTopic.value.name,
        description: formTopic.value.description || undefined,
        bncc_code: formTopic.value.bncc_code || undefined,
        grade_level: formTopic.value.grade_level || undefined
      })
      mostrarNotificacao('sucesso', 'Tópico criado')
    }
    modalTopicAberto.value = false
    await recarregar()
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar tópico')
  }
}

const salvarSkill = async () => {
  if (!formSkill.value.description.trim()) return
  try {
    if (editandoSkill.value) {
      await updateSkill(editandoSkillId.value, {
        code: formSkill.value.code || undefined,
        description: formSkill.value.description,
        grade_level: formSkill.value.grade_level || undefined
      })
      mostrarNotificacao('sucesso', 'Habilidade atualizada')
    } else {
      await createSkill({
        topic_id: skillTopicId.value,
        code: formSkill.value.code || undefined,
        description: formSkill.value.description,
        grade_level: formSkill.value.grade_level || undefined
      })
      mostrarNotificacao('sucesso', 'Habilidade criada')
    }
    modalSkillAberto.value = false
    await fetchAllSkillsBySubject()
  } catch (e: any) {
    console.error('Erro ao salvar habilidade:', e)
    mostrarNotificacao('critico', 'Erro ao salvar habilidade: ' + (e?.message || e))
  }
}

// Excluir
const dialogoExcluir = ref(false)
const itemParaExcluir = ref<any>(null)
const excluirTipo = ref<'topic' | 'skill'>('topic')

const confirmarExcluir = (item: any, tipo: 'topic' | 'skill') => {
  itemParaExcluir.value = item
  excluirTipo.value = tipo
  dialogoExcluir.value = true
}

const executarExclusao = async () => {
  if (!itemParaExcluir.value) return
  dialogoExcluir.value = false
  try {
    if (excluirTipo.value === 'topic') {
      await deleteTopic(itemParaExcluir.value.id)
      mostrarNotificacao('sucesso', 'Tópico excluído')
      await recarregar()
    } else {
      await deleteSkill(itemParaExcluir.value.id)
      mostrarNotificacao('sucesso', 'Habilidade excluída')
      await fetchAllSkillsBySubject()
    }
  } catch {
    mostrarNotificacao('critico', `Erro ao excluir ${excluirTipo.value === 'topic' ? 'tópico' : 'habilidade'}`)
  }
}

// Popular defaults BNCC
const popularDefaults = async () => {
  if (!disciplina.value) return
  try {
    const count = await seedBnccDefaults(subjectId, disciplina.value.name)
    mostrarNotificacao('sucesso', `${count} tópicos BNCC importados com habilidades!`)
    // Abrir todos os tópicos para mostrar as habilidades
    topics.value.forEach(t => topicosAbertos.add(t.id))
  } catch {
    mostrarNotificacao('critico', 'Erro ao importar tópicos')
  }
}

const recarregar = async () => {
  await fetchTopicsBySubject(subjectId)
  await fetchAllSkillsBySubject()
}

// Notificação
const notificacao = ref({ visivel: false, variante: 'sucesso' as 'sucesso' | 'critico', titulo: '', mensagem: '' })
const mostrarNotificacao = (variante: 'sucesso' | 'critico', titulo: string, mensagem = '') => {
  notificacao.value = { visivel: true, variante, titulo, mensagem }
}

onMounted(async () => {
  await Promise.all([fetchSubjects(), fetchTopicsBySubject(subjectId)])
  disciplina.value = subjects.value.find(s => s.id === subjectId) || null
  await fetchAllSkillsBySubject()
  carregando.value = false
})
</script>
