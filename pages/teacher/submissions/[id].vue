<template>
  <div>
    <!-- Cabecalho -->
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="voltar"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </button>
      <div class="flex-1">
        <h1 class="text-heading-1">{{ atividade?.titulo || 'Correcao' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ submissao?.perfis?.full_name || 'Aluno' }}
          <span v-if="atividade?.turmas?.name"> · {{ atividade.turmas.name }}</span>
          <span v-if="atividade?.disciplinas?.name"> · {{ atividade.disciplinas.name }}</span>
        </p>
      </div>
      <div v-if="submissao" class="flex items-center gap-2">
        <span v-if="submissao.status_processamento === 'corrigido'" class="text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full font-medium">
          Corrigida pela IA
        </span>
        <span v-if="submissao.corrigido_em" class="text-lg font-bold text-green-600">
          {{ submissao.nota }}/{{ atividade?.nota_maxima || 10 }}
        </span>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="submissao" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Coluna principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Atividade + Gabarito -->
        <Cartao>
          <h2 class="text-heading-3 mb-4">Atividade e Gabarito</h2>

          <div v-if="atividade?.descricao" class="mb-4">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Descricao da atividade</p>
            <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.descricao"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Anexos da atividade -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase mb-2">Atividade (PDF)</p>
              <div v-if="(atividade?.anexos || []).length" class="space-y-2">
                <a
                  v-for="(anexo, i) in atividade.anexos"
                  :key="'att-'+i"
                  :href="anexo.url"
                  target="_blank"
                  class="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 no-underline bg-primary-50 px-3 py-2 rounded-lg"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </Icone>
                  {{ anexo.name }}
                </a>
              </div>
              <p v-else class="text-sm text-gray-400">Nenhum anexo</p>
            </div>

            <!-- Gabarito -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase mb-2">Gabarito</p>
              <div v-if="(atividade?.gabarito || []).length" class="space-y-2">
                <a
                  v-for="(anexo, i) in atividade.gabarito"
                  :key="'gab-'+i"
                  :href="anexo.url"
                  target="_blank"
                  class="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 no-underline bg-green-50 px-3 py-2 rounded-lg"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </Icone>
                  {{ anexo.name }}
                </a>
              </div>
              <p v-else class="text-sm text-gray-400">Nenhum gabarito</p>
            </div>
          </div>
        </Cartao>

        <!-- Resposta do aluno -->
        <Cartao>
          <div class="flex items-center gap-3 mb-4">
            <Avatar
              :alt="submissao.perfis?.full_name || 'Aluno'"
              :image="submissao.perfis?.avatar_url"
              :size="40"
            />
            <div>
              <p class="font-semibold text-gray-900">{{ submissao.perfis?.full_name }}</p>
              <p class="text-xs text-gray-500">{{ submissao.perfis?.email }}</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">
              Enviado em {{ formatarDataHora(submissao.enviado_em) }}
            </span>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Resposta do aluno</h3>
            <div v-if="submissao.conteudo" class="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg" v-html="submissao.conteudo"></div>
            <p v-else class="text-sm text-gray-500 italic">Nenhum conteudo de texto enviado</p>
          </div>

          <!-- Anexos do aluno -->
          <div v-if="submissao.anexos?.length" class="border-t border-gray-200 pt-4 mt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Anexos do aluno</h3>
            <div class="space-y-2">
              <a
                v-for="(anexo, i) in submissao.anexos"
                :key="i"
                :href="anexo.url"
                target="_blank"
                class="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 no-underline bg-gray-50 px-3 py-2 rounded-lg"
              >
                <Icone :tamanho="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </Icone>
                {{ anexo.name }}
              </a>
            </div>
          </div>
        </Cartao>

        <!-- Avaliacao por Habilidade -->
        <Cartao v-if="avaliacoes.length > 0">
          <h2 class="text-heading-3 mb-4">Avaliacao por Habilidade</h2>
          <div class="space-y-2">
            <div
              v-for="av in avaliacoes"
              :key="av.id"
              class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span v-if="av.bncc_habilidades?.code" class="text-xs font-mono text-primary-600">{{ av.bncc_habilidades.code }}</span>
                  <span v-if="av.bncc_habilidades?.bncc_topicos?.name" class="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                    {{ av.bncc_habilidades.bncc_topicos.name }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 mt-0.5">{{ av.bncc_habilidades?.description }}</p>
                <p v-if="av.observacao" class="text-xs text-gray-500 mt-1 italic">{{ av.observacao }}</p>
              </div>
              <span :class="['ml-4 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap', classeNivel(av.nivel)]">
                {{ rotuloNivel(av.nivel) }}
              </span>
            </div>
          </div>

          <!-- Resumo -->
          <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              {{ avaliacoes.filter(a => a.nivel === 'satisfatorio').length }} satisfatorio
            </span>
            <span class="text-xs text-gray-500">
              {{ avaliacoes.filter(a => a.nivel === 'regular').length }} regular
            </span>
            <span class="text-xs text-gray-500">
              {{ avaliacoes.filter(a => a.nivel === 'insatisfatorio').length }} insatisfatorio
            </span>
          </div>
        </Cartao>
      </div>

      <!-- Sidebar: Correcao -->
      <div class="space-y-6">
        <Cartao>
          <h2 class="text-heading-3 mb-4">{{ submissao.corrigido_em ? 'Avaliacao' : 'Avaliar' }}</h2>

          <!-- Formulario de correcao -->
          <div v-if="canGradeAssignments" class="space-y-4">
            <div>
              <label for="nota" class="form-label">Nota (max: {{ atividade?.nota_maxima || 10 }})</label>
              <input
                id="nota"
                type="number"
                v-model.number="formNota.nota"
                class="form-input"
                :max="atividade?.nota_maxima || 10"
                min="0"
                step="0.5"
              />
              <p v-if="erros.nota" class="mt-1 text-xs text-critical-500">{{ erros.nota }}</p>
            </div>

            <div>
              <label for="comentario" class="form-label">Comentario</label>
              <textarea
                id="comentario"
                v-model="formNota.comentario"
                class="form-input min-h-[120px] resize-y"
                placeholder="Comentarios sobre a entrega do aluno..."
              ></textarea>
            </div>

            <button
              @click="salvarCorrecao"
              :disabled="salvando"
              class="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg v-if="salvando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ salvando ? 'Salvando...' : (submissao.corrigido_em ? 'Atualizar Nota' : 'Salvar Correcao') }}
            </button>
          </div>

          <!-- Visualizacao somente-leitura -->
          <div v-else-if="submissao.corrigido_em" class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Nota</p>
              <p class="text-2xl font-bold text-gray-900">{{ submissao.nota }}<span class="text-sm font-normal text-gray-400"> / {{ atividade?.nota_maxima || 10 }}</span></p>
            </div>
            <div v-if="submissao.comentario">
              <p class="text-sm text-gray-500">Comentario</p>
              <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{{ submissao.comentario }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 italic">
            Ainda nao corrigido
          </div>

          <!-- Status de validacao -->
          <div v-if="submissao.corrigido_em" class="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <p class="text-xs text-gray-500">
              Corrigido em {{ formatarDataHora(submissao.corrigido_em) }}
              <span v-if="submissao.status_processamento === 'corrigido'" class="ml-1 text-purple-600">(via IA)</span>
            </p>

            <!-- Validacao -->
            <div v-if="submissao.validado_professor" class="flex items-center gap-2">
              <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Validada</span>
              <span v-if="submissao.validado_em" class="text-xs text-gray-400">
                em {{ formatarDataHora(submissao.validado_em) }}
              </span>
            </div>

            <!-- Botao validar (quando IA corrigiu envio de aluno e ainda nao validou) -->
            <div v-else-if="submissao.origem === 'aluno' && submissao.status_processamento === 'corrigido' && canGradeAssignments">
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                <p class="text-xs text-purple-700">
                  <strong>Correcao da IA pendente de validacao.</strong>
                  Revise a nota e o comentario. Voce pode ajustar antes de validar.
                </p>
              </div>
              <button
                @click="validar"
                :disabled="validando"
                class="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg v-if="validando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ validando ? 'Validando...' : 'Validar Correcao' }}
              </button>
            </div>
          </div>
        </Cartao>

        <!-- Detalhes da atividade -->
        <Cartao v-if="atividade">
          <h2 class="text-heading-3 mb-3">Detalhes da Atividade</h2>
          <div class="space-y-2">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Valor</p>
              <p class="text-sm text-gray-900">{{ atividade.nota_maxima }} pontos</p>
            </div>
            <div v-if="atividade.data_entrega">
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p class="text-sm text-gray-900">{{ formatarDataHora(atividade.data_entrega) }}</p>
            </div>
            <div v-if="atividade.peso">
              <p class="text-xs font-medium text-gray-500 uppercase">Peso</p>
              <p class="text-sm text-gray-900">{{ atividade.peso }}</p>
            </div>
            <div v-if="atividade.categorias_avaliacao?.name">
              <p class="text-xs font-medium text-gray-500 uppercase">Categoria</p>
              <p class="text-sm text-gray-900">{{ atividade.categorias_avaliacao.name }}</p>
            </div>
          </div>
        </Cartao>

        <!-- Habilidades da atividade -->
        <Cartao v-if="habilidadesAtividade.length > 0">
          <h2 class="text-heading-3 mb-3">Habilidades BNCC</h2>
          <div class="space-y-1.5">
            <div v-for="h in habilidadesAtividade" :key="h.id" class="text-sm">
              <span v-if="h.bncc_habilidades?.code" class="text-xs font-mono text-primary-600 mr-1">{{ h.bncc_habilidades.code }}</span>
              <span class="text-gray-700">{{ h.bncc_habilidades?.description }}</span>
            </div>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'collaborator']
})

const { canGradeAssignments } = usePermissions()
const route = useRoute()
const router = useRouter()
const submissionId = route.params.id as string

const { getSubmission, gradeSubmission, validarCorrecao } = useSubmissions()
const { getAssignment, fetchHabilidades, fetchAvaliacaoHabilidades } = useAssignments()

const carregando = ref(true)
const salvando = ref(false)
const validando = ref(false)
const submissao = ref<any>(null)
const atividade = ref<any>(null)
const habilidadesAtividade = ref<any[]>([])
const avaliacoes = ref<any[]>([])

const formNota = ref({ nota: 0 as number, comentario: '' })
const erros = ref<Record<string, string>>({})

const voltar = () => {
  if (atividade.value) {
    router.push(`/teacher/assignments/${atividade.value.id}`)
  } else {
    router.push('/teacher/assignments')
  }
}

const salvarCorrecao = async () => {
  erros.value = {}
  if (formNota.value.nota < 0) {
    erros.value.nota = 'Nota nao pode ser negativa'
    return
  }
  if (atividade.value && formNota.value.nota > atividade.value.nota_maxima) {
    erros.value.nota = `Nota maxima e ${atividade.value.nota_maxima}`
    return
  }

  salvando.value = true
  try {
    submissao.value = await gradeSubmission(submissionId, formNota.value.nota, formNota.value.comentario)
    mostrarNotificacao('sucesso', 'Correcao salva com sucesso!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar correcao')
  } finally {
    salvando.value = false
  }
}

const validar = async () => {
  validando.value = true
  try {
    // Validar com a nota/comentario atuais do formulario (professor pode ter ajustado)
    submissao.value = await validarCorrecao(submissionId, formNota.value.nota, formNota.value.comentario)
    mostrarNotificacao('sucesso', 'Correcao validada com sucesso!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao validar correcao')
  } finally {
    validando.value = false
  }
}

// Helpers
const rotuloNivel = (nivel: string) => ({
  insatisfatorio: 'Insatisfatorio',
  regular: 'Regular',
  satisfatorio: 'Satisfatorio',
  pendente: 'Pendente'
}[nivel] || nivel)

const classeNivel = (nivel: string) => ({
  insatisfatorio: 'bg-red-100 text-red-700',
  regular: 'bg-amber-100 text-amber-700',
  satisfatorio: 'bg-green-100 text-green-700',
  pendente: 'bg-gray-100 text-gray-500'
}[nivel] || 'bg-gray-100 text-gray-500')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}

onMounted(async () => {
  submissao.value = await getSubmission(submissionId)
  if (submissao.value) {
    formNota.value = {
      nota: submissao.value.nota ?? 0,
      comentario: submissao.value.comentario || ''
    }

    // Carregar atividade com todas as infos
    atividade.value = await getAssignment(submissao.value.atividade_id)

    // Carregar habilidades da atividade e avaliacoes deste envio
    try {
      const [habs, avs] = await Promise.all([
        fetchHabilidades(submissao.value.atividade_id),
        fetchAvaliacaoHabilidades(submissionId)
      ])
      habilidadesAtividade.value = habs
      avaliacoes.value = avs
    } catch { /* silenciar */ }
  }
  carregando.value = false
})
</script>
