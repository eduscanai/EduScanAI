<template>
  <div>
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-heading-1">Disciplinas</h1>
        <p class="text-body text-text-secondary mt-1">Gerencie as disciplinas da escola</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/subjects/import" class="btn-outline flex items-center gap-2 no-underline">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </Icone>
          Importar
        </NuxtLink>
        <button @click="abrirModalCriar" class="btn-primary flex items-center gap-2">
          <Icone :tamanho="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </Icone>
          Nova Disciplina
        </button>
      </div>
    </div>

    <!-- Tabela -->
    <Cartao>
      <Carregando v-if="loading" texto="Carregando disciplinas..." />

      <TabelaDados v-else :colunas="colunas" :dados="subjects">
        <template #celula-name="{ linha }">
          <NuxtLink :to="`/admin/subjects/${linha.id}`" class="font-semibold text-gray-900 hover:text-primary-500 no-underline transition-colors">
            {{ linha.name }}
          </NuxtLink>
        </template>

        <template #celula-code="{ valor }">
          <span v-if="valor" class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ valor }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #celula-acoes="{ linha }">
          <div class="flex items-center gap-2">
            <button
              @click="abrirModalEditar(linha)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
              title="Editar"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </Icone>
            </button>
            <button
              @click="confirmarExcluir(linha)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-critical-500 hover:bg-critical-50 transition-colors"
              title="Excluir"
            >
              <Icone :tamanho="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </Icone>
            </button>
          </div>
        </template>

        <template #vazio>
          <div class="text-center py-8">
            <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </Icone>
            <p class="text-body text-text-secondary">Nenhuma disciplina cadastrada</p>
          </div>
        </template>
      </TabelaDados>
    </Cartao>

    <!-- Modal Criar/Editar -->
    <Modal
      :esta-aberto="modalAberto"
      :titulo="editando ? 'Editar Disciplina' : 'Nova Disciplina'"
      @fechar="modalAberto = false"
    >
      <div class="space-y-4">
        <div>
          <label for="disc-nome" class="form-label">Nome da disciplina *</label>
          <input
            id="disc-nome"
            type="text"
            v-model="form.name"
            class="form-input"
            placeholder="Ex: Matemática"
          />
          <p v-if="erros.name" class="mt-1 text-xs text-critical-500">{{ erros.name }}</p>
        </div>

        <div>
          <label for="disc-codigo" class="form-label">Código (opcional)</label>
          <input
            id="disc-codigo"
            type="text"
            v-model="form.code"
            class="form-input"
            placeholder="Ex: MAT"
          />
        </div>
      </div>
      <template #rodape>
        <button @click="modalAberto = false" class="btn-outline">Cancelar</button>
        <button @click="salvar" :disabled="loading" class="btn-primary">
          {{ loading ? 'Salvando...' : (editando ? 'Salvar' : 'Criar') }}
        </button>
      </template>
    </Modal>

    <!-- Diálogo de exclusão -->
    <DialogoConfirmacao
      :esta-aberto="dialogoExcluir"
      titulo="Excluir disciplina"
      :mensagem="`Tem certeza que deseja excluir '${disciplinaParaExcluir?.name}'?`"
      variante="perigo"
      texto-confirmar="Excluir"
      @confirmar="executarExclusao"
      @cancelar="dialogoExcluir = false"
    />

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
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import TabelaDados from '~/components/data/TabelaDados/TabelaDados.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import DialogoConfirmacao from '~/components/feedback/DialogoConfirmacao/DialogoConfirmacao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

const { subjects, loading, fetchSubjects, createSubject, updateSubject, deleteSubject } = useSubjects()

// Colunas da tabela
const colunas = [
  { chave: 'name', rotulo: 'Disciplina' },
  { chave: 'code', rotulo: 'Código' },
  { chave: 'acoes', rotulo: '', alinhamento: 'direita' as const }
]

// Modal criar/editar
const modalAberto = ref(false)
const editando = ref(false)
const editandoId = ref('')
const form = ref({ name: '', code: '' })
const erros = ref<Record<string, string>>({})

const abrirModalCriar = () => {
  editando.value = false
  editandoId.value = ''
  form.value = { name: '', code: '' }
  erros.value = {}
  modalAberto.value = true
}

const abrirModalEditar = (disciplina: any) => {
  editando.value = true
  editandoId.value = disciplina.id
  form.value = {
    name: disciplina.name,
    code: disciplina.code || ''
  }
  erros.value = {}
  modalAberto.value = true
}

const salvar = async () => {
  erros.value = {}
  if (!form.value.name.trim()) {
    erros.value.name = 'Nome é obrigatório'
    return
  }

  try {
    if (editando.value) {
      await updateSubject(editandoId.value, {
        name: form.value.name,
        code: form.value.code || undefined
      })
      mostrarNotificacao('sucesso', 'Disciplina atualizada')
    } else {
      await createSubject({
        name: form.value.name,
        code: form.value.code || undefined
      })
      mostrarNotificacao('sucesso', 'Disciplina criada')
    }
    modalAberto.value = false
    await fetchSubjects()
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg.includes('subjects_unique_name') || msg.includes('duplicate')) {
      erros.value.name = 'Esta disciplina já existe'
    } else {
      mostrarNotificacao('critico', 'Erro ao salvar disciplina', msg)
    }
  }
}

// Excluir
const dialogoExcluir = ref(false)
const disciplinaParaExcluir = ref<any>(null)

const confirmarExcluir = (disciplina: any) => {
  disciplinaParaExcluir.value = disciplina
  dialogoExcluir.value = true
}

const executarExclusao = async () => {
  if (!disciplinaParaExcluir.value) return
  dialogoExcluir.value = false
  try {
    await deleteSubject(disciplinaParaExcluir.value.id)
    mostrarNotificacao('sucesso', 'Disciplina excluída')
    await fetchSubjects()
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir disciplina')
  }
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

onMounted(() => {
  fetchSubjects()
})
</script>
