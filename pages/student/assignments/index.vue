<template>
  <div>
    <div class="mb-8">
      <h1 class="text-heading-1">Minhas Atividades</h1>
      <p class="text-body text-text-secondary mt-1">Veja suas atividades pendentes e concluídas</p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        v-for="tab in abas"
        :key="tab.id"
        @click="abaAtiva = tab.id"
        :class="[
          'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
          abaAtiva === tab.id
            ? 'border-primary-500 text-primary-500'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        {{ tab.label }}
        <span class="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <Carregando v-if="loading" texto="Carregando atividades..." />

    <!-- Lista de atividades -->
    <div v-else class="space-y-4">
      <div v-for="a in atividadesFiltradas" :key="a.id">
        <NuxtLink :to="`/student/assignments/${a.id}`" class="no-underline block">
          <Cartao class="hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-gray-900">{{ a.titulo }}</h3>
                  <span v-if="a._status === 'corrigida'" class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {{ a._score }}/{{ a.nota_maxima }}
                  </span>
                  <span v-else-if="a._status === 'entregue'" class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Entregue
                  </span>
                </div>
                <p class="text-xs text-gray-500">
                  {{ a.turmas?.name }}{{ a.disciplinas?.name ? ' · ' + a.disciplinas.name : '' }}
                </p>
              </div>
              <div class="text-right">
                <p v-if="a.data_entrega" :class="['text-xs font-medium', estaVencida(a.data_entrega) && a._status === 'pendente' ? 'text-critical-500' : 'text-gray-500']">
                  {{ estaVencida(a.data_entrega) && a._status === 'pendente' ? 'Atrasada' : 'Prazo' }}: {{ formatarData(a.data_entrega) }}
                </p>
                <p v-else class="text-xs text-gray-400">Sem prazo</p>
              </div>
            </div>
          </Cartao>
        </NuxtLink>
      </div>

      <div v-if="atividadesFiltradas.length === 0" class="text-center py-12">
        <Icone :tamanho="48" class="text-gray-300 mx-auto mb-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Icone>
        <p class="text-body text-text-secondary">
          {{ abaAtiva === 'pendentes' ? 'Nenhuma atividade pendente!' : 'Nenhuma atividade concluída' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'student']
})

const { assignments, loading, listAssignments } = useAssignments()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const abaAtiva = ref('pendentes')
const minhasSubmissoes = ref<Record<string, any>>({})

// Enriquecer atividades com status de submissão
const atividadesEnriquecidas = computed(() =>
  assignments.value.map(a => {
    const sub = minhasSubmissoes.value[a.id]
    let _status = 'pendente'
    let _score = null
    if (sub?.corrigido_em) {
      _status = 'corrigida'
      _score = sub.nota
    } else if (sub) {
      _status = 'entregue'
    }
    return { ...a, _status, _score }
  })
)

const pendentes = computed(() => atividadesEnriquecidas.value.filter(a => a._status === 'pendente'))
const concluidas = computed(() => atividadesEnriquecidas.value.filter(a => a._status !== 'pendente'))

const atividadesFiltradas = computed(() =>
  abaAtiva.value === 'pendentes' ? pendentes.value : concluidas.value
)

const abas = computed(() => [
  { id: 'pendentes', label: 'Pendentes', count: pendentes.value.length },
  { id: 'concluidas', label: 'Concluídas', count: concluidas.value.length }
])

const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const estaVencida = (d: string) => new Date(d) < new Date()

onMounted(async () => {
  await listAssignments()

  // Buscar minhas submissões
  if (user.value) {
    const { data } = await supabase
      .from('envios')
      .select('atividade_id, nota, corrigido_em, enviado_em')
      .eq('aluno_id', user.value.id)

    if (data) {
      for (const sub of data) {
        minhasSubmissoes.value[sub.atividade_id] = sub
      }
    }
  }
})
</script>
