<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/announcements"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div>
        <h1 class="text-heading-1">Novo Aviso</h1>
        <p class="text-body text-text-secondary mt-1">Crie um comunicado para a escola</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulário -->
      <div class="lg:col-span-2 space-y-6">
        <Cartao>
          <div class="space-y-4">
            <div>
              <label for="titulo" class="form-label">Título *</label>
              <input id="titulo" type="text" v-model="form.title" class="form-input" placeholder="Ex: Reunião de pais - 15/03" />
              <p v-if="erros.title" class="mt-1 text-xs text-critical-500">{{ erros.title }}</p>
            </div>

            <EditorRico
              v-model="form.content"
              rotulo="Conteúdo"
              texto-reservado="Escreva o conteúdo do aviso..."
            />
          </div>
        </Cartao>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">Destinatários</h2>
          <div class="space-y-4">
            <CampoSelecao
              rotulo="Enviar para"
              :modelValue="form.target_type"
              @update:modelValue="form.target_type = $event as string"
              :opcoes="opcoesDestino"
            />

            <CampoSelecao
              v-if="form.target_type === 'class'"
              rotulo="Turma"
              :modelValue="form.target_id"
              @update:modelValue="form.target_id = $event as string"
              texto-reservado="Selecione a turma"
              :opcoes="opcoesTurma"
            />
            <p v-if="erros.target_id" class="mt-1 text-xs text-critical-500">{{ erros.target_id }}</p>

            <CampoSelecao
              v-if="form.target_type === 'role'"
              rotulo="Grupo"
              :modelValue="form.target_role"
              @update:modelValue="form.target_role = $event as string"
              texto-reservado="Selecione o grupo"
              :opcoes="opcoesRole"
            />

            <CampoSelecao
              rotulo="Prioridade"
              :modelValue="form.priority"
              @update:modelValue="form.priority = $event as string"
              :opcoes="opcoesPrioridade"
            />
          </div>
        </Cartao>

        <Cartao>
          <div class="space-y-3">
            <Botao variante="contorno" largura-completa :carregando="salvandoRascunho" @click="salvarRascunho">
              Salvar Rascunho
            </Botao>
            <Botao variante="primario" largura-completa :carregando="publicando" @click="publicar">
              Publicar Aviso
            </Botao>
          </div>
        </Cartao>
      </div>
    </div>

    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Botao from '~/components/ui/Botao/Botao.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import EditorRico from '~/components/form/EditorRico/EditorRico.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'collaborator']
})

const { createAnnouncement } = useAnnouncements()
const salvandoRascunho = ref(false)
const publicando = ref(false)
const { classes, fetchClasses } = useClasses()

const form = ref({
  title: '',
  content: '',
  target_type: 'school',
  target_id: '',
  target_role: '',
  priority: 'normal'
})

const erros = ref<Record<string, string>>({})

const opcoesDestino = [
  { rotulo: 'Toda a escola', valor: 'school' },
  { rotulo: 'Turma específica', valor: 'class' },
  { rotulo: 'Grupo (por cargo)', valor: 'role' }
]

const opcoesPrioridade = [
  { rotulo: 'Baixa', valor: 'low' },
  { rotulo: 'Normal', valor: 'normal' },
  { rotulo: 'Alta (Urgente)', valor: 'high' }
]

const opcoesRole = [
  { rotulo: 'Alunos', valor: 'student' },
  { rotulo: 'Professores', valor: 'teacher' },
  { rotulo: 'Pedagogos', valor: 'pedagogue' }
]

const opcoesTurma = computed(() =>
  classes.value.map(c => ({ rotulo: c.name, valor: c.id }))
)

const validar = () => {
  erros.value = {}
  if (!form.value.title.trim()) erros.value.title = 'Título é obrigatório'
  if (form.value.target_type === 'class' && !form.value.target_id) {
    erros.value.target_id = 'Selecione uma turma'
  }
  return Object.keys(erros.value).length === 0
}

const salvarRascunho = async () => {
  if (!validar()) return
  salvandoRascunho.value = true
  try {
    const result = await createAnnouncement({
      title: form.value.title,
      content: form.value.content || undefined,
      target_type: form.value.target_type as 'school' | 'class' | 'role',
      target_id: form.value.target_type === 'class' ? form.value.target_id : undefined,
      target_role: form.value.target_type === 'role' ? form.value.target_role : undefined,
      priority: form.value.priority as 'low' | 'normal' | 'high',
      publish: false
    })
    mostrarNotificacao('sucesso', 'Rascunho salvo!')
    setTimeout(() => navigateTo(`/announcements/${result?.id}`), 1000)
  } catch (e: any) {
    mostrarNotificacao('critico', e.message || 'Erro ao salvar rascunho')
  } finally {
    salvandoRascunho.value = false
  }
}

const publicar = async () => {
  if (!validar()) return
  publicando.value = true
  try {
    await createAnnouncement({
      title: form.value.title,
      content: form.value.content || undefined,
      target_type: form.value.target_type as 'school' | 'class' | 'role',
      target_id: form.value.target_type === 'class' ? form.value.target_id : undefined,
      target_role: form.value.target_type === 'role' ? form.value.target_role : undefined,
      priority: form.value.priority as 'low' | 'normal' | 'high',
      publish: true
    })
    mostrarNotificacao('sucesso', 'Aviso publicado!')
    setTimeout(() => navigateTo('/announcements'), 1500)
  } catch (e: any) {
    mostrarNotificacao('critico', e.message || 'Erro ao publicar aviso')
  } finally {
    publicando.value = false
  }
}

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}

onMounted(() => {
  fetchClasses()
})
</script>
