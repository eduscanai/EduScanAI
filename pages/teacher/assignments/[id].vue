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
      <div class="flex-1">
        <h1 class="text-heading-1">{{ atividade?.titulo || 'Detalhes da Atividade' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ atividade?.turmas?.name }}{{ atividade?.disciplinas?.name ? ' · ' + atividade.disciplinas.name : '' }}
          <span v-if="atividade" :class="['ml-2 text-xs px-2 py-0.5 rounded-full font-medium', classeStatusAtividade]">
            {{ rotuloStatusAtividade }}
          </span>
        </p>
      </div>
      <div v-if="atividade" class="flex items-center gap-2">
        <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', classeStatus(atividade.status)]">
          {{ rotuloStatus(atividade.status) }}
        </span>
        <!-- Toggle visibilidade -->
        <button
          v-if="canCreateAssignments && atividade.status !== 'draft'"
          @click="alternarVisibilidade"
          :class="[
            'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5',
            atividade.visivel_aluno
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          <Icone :tamanho="14">
            <path v-if="atividade.visivel_aluno" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </Icone>
          {{ atividade.visivel_aluno ? 'Visivel' : 'Oculta' }}
        </button>
        <button
          v-if="canCreateAssignments && atividade.status === 'draft'"
          @click="publicar"
          :disabled="processando"
          class="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="processando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ processando ? 'Publicando...' : 'Publicar' }}
        </button>
        <button
          v-if="canCreateAssignments && atividade.status === 'published'"
          @click="encerrar"
          :disabled="processando"
          class="btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {{ processando ? 'Encerrando...' : 'Encerrar' }}
        </button>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="atividade" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteudo principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Atividade + Gabarito (mesmo cartao) -->
        <Cartao>
          <h2 class="text-heading-3 mb-4">Atividade e Gabarito</h2>

          <!-- Descricao -->
          <div v-if="atividade.descricao" class="mb-5">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Descricao</p>
            <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.descricao"></div>
          </div>

          <!-- Anexos da atividade -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase mb-2">Anexos da Atividade</p>
              <div v-if="(atividade.anexos || []).length" class="space-y-2">
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

            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-medium text-gray-500 uppercase">Gabarito</p>
                <button
                  v-if="!editandoGabarito && canCreateAssignments"
                  @click="editandoGabarito = true"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  {{ (atividade.gabarito || []).length ? 'Alterar' : '+ Adicionar' }}
                </button>
              </div>

              <div v-if="(atividade.gabarito || []).length && !editandoGabarito" class="space-y-2">
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
              <p v-else-if="!editandoGabarito" class="text-sm text-gray-400">Nenhum gabarito</p>

              <div v-if="editandoGabarito" class="space-y-3">
                <UploadArquivo
                  v-model="novoGabarito"
                  rotulo=""
                  bucket="assignments-files"
                  :pasta="`${atividade.turma_id}/gabaritos`"
                />
                <div class="flex gap-2">
                  <button
                    @click="salvarGabarito"
                    :disabled="salvandoGabarito || novoGabarito.length === 0"
                    class="btn-primary text-sm flex-1"
                  >
                    {{ salvandoGabarito ? 'Salvando...' : 'Salvar Gabarito' }}
                  </button>
                  <button
                    @click="editandoGabarito = false; novoGabarito = []"
                    class="btn-outline text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Cartao>

        <!-- Alunos -->
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Alunos</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>{{ totalEntregues }}/{{ alunosComStatus.length }} entregues</span>
              <span>{{ corrigidas }} corrigida{{ corrigidas !== 1 ? 's' : '' }}</span>
              <span v-if="corrigidasIA > 0" class="text-purple-600">
                {{ corrigidasIA }} via IA
              </span>
            </div>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="aluno in alunosComStatus"
              :key="aluno.id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <Avatar
                  :alt="aluno.nome"
                  :image="aluno.avatar"
                  :size="36"
                />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ aluno.nome }}</p>
                  <p v-if="aluno.submissao" class="text-xs text-gray-500">
                    Enviado em {{ formatarDataHora(aluno.submissao.enviado_em) }}
                    <span v-if="aluno.submissao.status_processamento === 'processando'" class="ml-1 text-amber-600">(processando IA...)</span>
                    <span v-if="aluno.submissao.status_processamento === 'erro'" class="ml-1 text-critical-500">(erro na correcao)</span>
                  </p>
                  <p v-else class="text-xs text-gray-400">Ainda nao entregou</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <!-- Corrigida pela IA -->
                <template v-if="aluno.submissao?.corrigido_em && aluno.submissao?.status_processamento === 'corrigido'">
                  <span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                    Corrigida pela IA
                  </span>
                  <span class="text-sm font-semibold text-green-600">
                    {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Ver
                  </NuxtLink>
                </template>
                <!-- Corrigida manualmente -->
                <template v-else-if="aluno.submissao?.corrigido_em">
                  <span class="text-sm font-semibold text-green-600">
                    {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Ver
                  </NuxtLink>
                </template>
                <!-- Processando IA -->
                <template v-else-if="aluno.submissao?.status_processamento === 'processando'">
                  <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Processando IA
                  </span>
                </template>
                <!-- Erro na IA -->
                <template v-else-if="aluno.submissao?.status_processamento === 'erro'">
                  <span class="text-xs text-critical-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                    Erro na IA
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Corrigir Manual
                  </NuxtLink>
                </template>
                <!-- Entregue, aguardando -->
                <template v-else-if="aluno.submissao">
                  <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Aguardando correcao
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Corrigir
                  </NuxtLink>
                </template>
                <!-- Nao entregou -->
                <template v-else>
                  <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    Pendente
                  </span>
                </template>
              </div>
            </div>
            <p v-if="alunosComStatus.length === 0" class="py-8 text-center text-sm text-gray-500">
              Nenhum aluno matriculado nesta turma
            </p>
          </div>
        </Cartao>

        <!-- Avaliacao por Habilidade -->
        <Cartao v-if="habilidadesAtividade.length > 0 && alunosComAvaliacao.length > 0">
          <h2 class="text-heading-3 mb-4">Avaliacao por Habilidade</h2>
          <p class="text-xs text-text-secondary mb-4">Resultado da correcao da IA por habilidade BNCC</p>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Aluno</th>
                  <th
                    v-for="hab in habilidadesAtividade"
                    :key="hab.id"
                    class="text-center py-2 px-2 text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap max-w-[100px]"
                    :title="hab.bncc_habilidades?.description"
                  >
                    {{ hab.bncc_habilidades?.code || 'Hab.' }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="aluno in alunosComAvaliacao" :key="aluno.id">
                  <td class="py-2 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">{{ aluno.nome }}</td>
                  <td
                    v-for="hab in habilidadesAtividade"
                    :key="hab.bncc_habilidades?.id"
                    class="text-center py-2 px-2"
                  >
                    <span
                      v-if="aluno.avaliacoes[hab.bncc_habilidades?.id]"
                      :class="['inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full', classeNivel(aluno.avaliacoes[hab.bncc_habilidades?.id])]"
                      :title="aluno.avaliacoes[hab.bncc_habilidades?.id + '_obs'] || ''"
                    >
                      {{ rotuloNivel(aluno.avaliacoes[hab.bncc_habilidades?.id]) }}
                    </span>
                    <span v-else class="text-gray-300 text-xs">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legenda -->
          <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <span class="text-[10px] text-gray-500 uppercase font-medium">Legenda:</span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-red-500"></span> Insatisfatorio
            </span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span> Regular
            </span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-green-500"></span> Satisfatorio
            </span>
          </div>
        </Cartao>
      </div>

      <!-- Info lateral -->
      <div class="space-y-6">
        <!-- Enviar Respostas -->
        <Cartao>
          <div class="flex items-center gap-2 mb-4">
            <Icone :tamanho="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </Icone>
            <h2 class="text-heading-3">Enviar Respostas</h2>
          </div>
          <p class="text-xs text-text-secondary mb-3">
            Faca upload das respostas dos alunos.
          </p>
          <UploadArquivo
            v-model="loteArquivos"
            rotulo=""
            bucket="submissions-files"
            :pasta="`${assignmentId}/lote`"
          />
          <button
            @click="enviarLote"
            :disabled="enviandoLote || loteArquivos.length === 0"
            class="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-3"
          >
            <svg v-if="enviandoLote" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ enviandoLote ? 'Enviando...' : 'Enviar Respostas' }}
          </button>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-3 mb-4">Detalhes</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Valor</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.nota_maxima }} pontos</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Peso</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.peso }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p class="text-sm text-gray-900 mt-0.5">
                {{ atividade.data_entrega ? formatarDataHora(atividade.data_entrega) : 'Sem prazo' }}
              </p>
            </div>
            <div v-if="atividade.periodos_avaliacao?.name">
              <p class="text-xs font-medium text-gray-500 uppercase">Periodo</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.periodos_avaliacao.name }}</p>
            </div>
            <div v-if="atividade.categorias_avaliacao?.name">
              <p class="text-xs font-medium text-gray-500 uppercase">Categoria</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.categorias_avaliacao.name }}</p>
            </div>
            <div v-if="atividade.publicado_em">
              <p class="text-xs font-medium text-gray-500 uppercase">Publicada em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarDataHora(atividade.publicado_em) }}</p>
            </div>
            <div v-if="mediaNotas !== null">
              <p class="text-xs font-medium text-gray-500 uppercase">Media da turma</p>
              <p class="text-sm text-gray-900 font-semibold mt-0.5">{{ mediaNotas.toFixed(1) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Modo de envio</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.modo_envio === 'lote' ? 'Professor envia respostas' : 'Individual (aluno)' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Visibilidade</p>
              <p :class="['text-sm mt-0.5 font-medium', atividade.visivel_aluno ? 'text-green-600' : 'text-gray-500']">
                {{ atividade.visivel_aluno ? 'Visivel para alunos' : 'Oculta dos alunos' }}
              </p>
            </div>
          </div>
        </Cartao>

        <!-- Habilidades BNCC -->
        <Cartao v-if="habilidadesAtividade.length > 0">
          <h2 class="text-heading-3 mb-3">Habilidades BNCC</h2>
          <div class="space-y-2">
            <div v-for="h in habilidadesAtividade" :key="h.id" class="text-sm">
              <span v-if="h.bncc_habilidades?.code" class="text-xs font-mono text-primary-600 mr-1">{{ h.bncc_habilidades.code }}</span>
              <span class="text-gray-700">{{ h.bncc_habilidades?.description }}</span>
              <p v-if="h.bncc_habilidades?.bncc_topicos?.name" class="text-[10px] text-gray-400 mt-0.5">
                {{ h.bncc_habilidades.bncc_topicos.name }}
              </p>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import UploadArquivo from '~/components/form/UploadArquivo/UploadArquivo.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher']
})

const { canCreateAssignments } = usePermissions()
const route = useRoute()
const assignmentId = route.params.id as string

const { getAssignment, updateAssignment, publishAssignment, closeAssignment, toggleVisibilidade, fetchHabilidades, fetchAvaliacoesAtividade } = useAssignments()
const { submissions: submissoes, getSubmissionsForAssignment, submitLote } = useSubmissions()
const { fetchClassStudents } = useClasses()

const carregando = ref(true)
const atividade = ref<any>(null)
const alunosTurma = ref<any[]>([])
const habilidadesAtividade = ref<any[]>([])
const avaliacoesRaw = ref<any[]>([])
const enviandoLote = ref(false)
const loteArquivos = ref<{ name: string; url: string }[]>([])
const editandoGabarito = ref(false)
const novoGabarito = ref<{ name: string; url: string }[]>([])
const salvandoGabarito = ref(false)

const alunosComStatus = computed(() => {
  const subMap = new Map(submissoes.value.map(s => [s.aluno_id, s]))
  return alunosTurma.value
    .map(cs => ({
      id: cs.profiles?.id || cs.perfis?.id || cs.student_id,
      nome: cs.profiles?.full_name || cs.perfis?.full_name || 'Sem nome',
      avatar: cs.profiles?.avatar_url || cs.perfis?.avatar_url || '',
      submissao: subMap.get(cs.profiles?.id || cs.perfis?.id || cs.student_id) || null
    }))
    .sort((a, b) => {
      const pesoA = a.submissao?.corrigido_em ? 0 : a.submissao ? 1 : 2
      const pesoB = b.submissao?.corrigido_em ? 0 : b.submissao ? 1 : 2
      if (pesoA !== pesoB) return pesoA - pesoB
      return a.nome.localeCompare(b.nome)
    })
})

const totalEntregues = computed(() => alunosComStatus.value.filter(a => a.submissao).length)
const corrigidas = computed(() => submissoes.value.filter(s => s.corrigido_em).length)
const corrigidasIA = computed(() => submissoes.value.filter(s => s.corrigido_em && s.status_processamento === 'corrigido').length)
const mediaNotas = computed(() => {
  const notas = submissoes.value.filter(s => s.nota !== null).map(s => s.nota as number)
  if (notas.length === 0) return null
  return notas.reduce((a, b) => a + b, 0) / notas.length
})

// Avaliacao por habilidade: montar tabela aluno x habilidade
const alunosComAvaliacao = computed(() => {
  if (avaliacoesRaw.value.length === 0) return []
  // Agrupar avaliacoes por aluno_id
  const porAluno = new Map<string, Record<string, string>>()
  for (const av of avaliacoesRaw.value) {
    const alunoId = av.envios?.aluno_id
    if (!alunoId) continue
    if (!porAluno.has(alunoId)) porAluno.set(alunoId, {})
    const map = porAluno.get(alunoId)!
    map[av.habilidade_id] = av.nivel
    if (av.observacao) map[av.habilidade_id + '_obs'] = av.observacao
  }
  // Combinar com nomes dos alunos
  return alunosComStatus.value
    .filter(a => porAluno.has(a.id))
    .map(a => ({
      id: a.id,
      nome: a.nome,
      avaliacoes: porAluno.get(a.id) || {}
    }))
})

const rotuloNivel = (nivel: string) => ({
  insatisfatorio: 'I',
  regular: 'R',
  satisfatorio: 'S',
  pendente: '...'
}[nivel] || '-')

const classeNivel = (nivel: string) => ({
  insatisfatorio: 'bg-red-100 text-red-700',
  regular: 'bg-amber-100 text-amber-700',
  satisfatorio: 'bg-green-100 text-green-700',
  pendente: 'bg-gray-100 text-gray-500'
}[nivel] || 'bg-gray-100 text-gray-500')

// Status da atividade: Atrasada / Em andamento / Finalizada
const rotuloStatusAtividade = computed(() => {
  if (!atividade.value) return ''
  if (atividade.value.status === 'closed') return 'Finalizada'
  if (atividade.value.status === 'draft') return 'Rascunho'
  if (atividade.value.data_entrega && new Date(atividade.value.data_entrega) < new Date()) return 'Atrasada'
  return 'Em andamento'
})

const classeStatusAtividade = computed(() => {
  if (!atividade.value) return ''
  if (atividade.value.status === 'closed') return 'bg-green-50 text-green-700'
  if (atividade.value.status === 'draft') return 'bg-gray-100 text-gray-600'
  if (atividade.value.data_entrega && new Date(atividade.value.data_entrega) < new Date()) return 'bg-red-50 text-red-700'
  return 'bg-blue-50 text-blue-700'
})

const processando = ref(false)

const publicar = async () => {
  processando.value = true
  try {
    atividade.value = await publishAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade publicada!')
  } catch { mostrarNotificacao('critico', 'Erro ao publicar') }
  finally { processando.value = false }
}

const encerrar = async () => {
  processando.value = true
  try {
    atividade.value = await closeAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade encerrada')
  } catch { mostrarNotificacao('critico', 'Erro ao encerrar') }
  finally { processando.value = false }
}

const alternarVisibilidade = async () => {
  try {
    atividade.value = await toggleVisibilidade(assignmentId, !atividade.value.visivel_aluno)
    mostrarNotificacao('sucesso', atividade.value.visivel_aluno ? 'Atividade visivel para alunos' : 'Atividade oculta dos alunos')
  } catch {
    mostrarNotificacao('critico', 'Erro ao alterar visibilidade')
  }
}

// Salvar gabarito
const salvarGabarito = async () => {
  if (novoGabarito.value.length === 0) return
  salvandoGabarito.value = true
  try {
    atividade.value = await updateAssignment(assignmentId, { gabarito: novoGabarito.value } as any)
    editandoGabarito.value = false
    novoGabarito.value = []
    mostrarNotificacao('sucesso', 'Gabarito salvo!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar gabarito')
  } finally {
    salvandoGabarito.value = false
  }
}

// Enviar respostas
const enviarLote = async () => {
  if (loteArquivos.value.length === 0) {
    mostrarNotificacao('critico', 'Faca upload de pelo menos um arquivo')
    return
  }

  enviandoLote.value = true
  try {
    await submitLote(assignmentId, loteArquivos.value)
    loteArquivos.value = []
    mostrarNotificacao('sucesso', 'Respostas enviadas com sucesso!')
    setTimeout(async () => {
      await getSubmissionsForAssignment(assignmentId)
    }, 2000)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao enviar respostas', e.message)
  } finally {
    enviandoLote.value = false
  }
}

// Helpers
const rotuloStatus = (s: string) => ({ draft: 'Rascunho', published: 'Publicada', closed: 'Encerrada' }[s] || s)
const classeStatus = (s: string) => ({
  draft: 'bg-gray-100 text-gray-600', published: 'bg-green-50 text-green-700', closed: 'bg-amber-50 text-amber-700'
}[s] || '')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  const [atividadeData] = await Promise.all([
    getAssignment(assignmentId),
    getSubmissionsForAssignment(assignmentId)
  ])
  atividade.value = atividadeData

  if (atividadeData?.turma_id) {
    alunosTurma.value = await fetchClassStudents(atividadeData.turma_id)
  }

  try {
    habilidadesAtividade.value = await fetchHabilidades(assignmentId)
    if (habilidadesAtividade.value.length > 0) {
      avaliacoesRaw.value = await fetchAvaliacoesAtividade(assignmentId)
    }
  } catch { /* silenciar */ }

  carregando.value = false
})
</script>
