<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-heading-1">Calendário</h1>
      <button v-if="canManageEvents" @click="abrirModalCriar()" class="btn-primary text-sm flex items-center gap-1.5">
        <Icone :tamanho="16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </Icone>
        Novo Evento
      </button>
    </div>

    <Cartao>
      <div class="flex items-center justify-between pb-4 mb-4">
        <div class="flex items-center gap-3">
          <select
            :value="mesSelecionado"
            @change="mesSelecionado = +($event.target as HTMLSelectElement).value; navegarParaData()"
            class="text-lg font-semibold text-gray-900 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0 pr-3 appearance-none"
            style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%239ca3af%27 viewBox=%270 0 20 20%27%3E%3Cpath d=%27M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0 center;"
          >
            <option v-for="(nome, i) in nomesMeses" :key="i" :value="i">{{ nome }}</option>
          </select>
          <span class="text-lg font-semibold text-gray-900">{{ anoSelecionado }}</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="navegarHoje"
            class="px-3 py-1.5 text-sm font-medium rounded-md mr-2"
            :class="ehHoje ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            :disabled="ehHoje"
          >
            Hoje
          </button>
          <div class="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              v-for="v in viewOptions"
              :key="v.key"
              @click="trocarView(v.key)"
              class="px-3 py-1.5 text-sm font-medium transition-colors"
              :class="viewAtual === v.key ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ v.label }}
            </button>
          </div>
        </div>
      </div>

      <ClientOnly>
        <FullCalendar ref="calendarRef" :options="calendarOptions" />
        <template #fallback>
          <Carregando texto="Carregando calendário..." />
        </template>
      </ClientOnly>
    </Cartao>

    <!-- Modal Criar/Editar Evento -->
    <Modal
      :esta-aberto="modalAberto"
      :titulo="eventoEditando ? 'Editar Evento' : 'Novo Evento'"
      @fechar="modalAberto = false"
    >
      <div class="space-y-4">
        <div>
          <label class="form-label">Título *</label>
          <input type="text" v-model="form.title" class="form-input" placeholder="Nome do evento" />
          <p v-if="erros.title" class="mt-1 text-xs text-critical-500">{{ erros.title }}</p>
        </div>

        <div>
          <label class="form-label">Descrição</label>
          <textarea v-model="form.description" class="form-input" rows="2" placeholder="Descrição opcional"></textarea>
        </div>

        <div class="flex items-center gap-4">
          <Alternador v-model="form.all_day" rotulo="Dia inteiro" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Início *</label>
            <input :type="form.all_day ? 'date' : 'datetime-local'" v-model="form.start_at" class="form-input" />
          </div>
          <div>
            <label class="form-label">Fim</label>
            <input :type="form.all_day ? 'date' : 'datetime-local'" v-model="form.end_at" class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <CampoSelecao
            rotulo="Tipo"
            :modelValue="form.type"
            @update:modelValue="form.type = $event as string"
            :opcoes="opcoesTipo"
          />
          <div>
            <label class="form-label">Cor</label>
            <div class="flex items-center gap-2 mt-1">
              <button
                v-for="cor in coresDisponiveis"
                :key="cor"
                @click="form.color = cor"
                :class="['w-7 h-7 rounded-full border-2 transition-all', form.color === cor ? 'border-gray-800 scale-110' : 'border-transparent']"
                :style="{ backgroundColor: cor }"
              ></button>
            </div>
          </div>
        </div>
      </div>
      <template #rodape>
        <button v-if="eventoEditando" @click="excluirEvento" class="btn-destructive mr-auto">Excluir</button>
        <button @click="modalAberto = false" class="btn-outline">Cancelar</button>
        <button @click="salvarEvento" :disabled="salvando" class="btn-primary">
          {{ salvando ? 'Salvando...' : (eventoEditando ? 'Salvar' : 'Criar') }}
        </button>
      </template>
    </Modal>

    <!-- Modal Detalhe Atividade -->
    <Modal
      :esta-aberto="modalAtividadeAberto"
      titulo="Detalhes da Atividade"
      @fechar="modalAtividadeAberto = false"
    >
      <div v-if="atividadeSelecionada" class="space-y-3">
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">Atividade</p>
          <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ atividadeSelecionada.title }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">Turma</p>
          <p class="text-sm text-gray-900 mt-0.5">{{ atividadeSelecionada.classes?.name || '-' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">Disciplina</p>
          <p class="text-sm text-gray-900 mt-0.5">{{ atividadeSelecionada.subjects?.name || '-' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
          <p class="text-sm text-gray-900 mt-0.5">{{ formatarDataHora(atividadeSelecionada.due_date) }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5', classeStatus(atividadeSelecionada.status)]">
            {{ rotuloStatus(atividadeSelecionada.status) }}
          </span>
        </div>
      </div>
      <template #rodape>
        <button @click="modalAtividadeAberto = false" class="btn-outline">Fechar</button>
        <NuxtLink
          :to="`/teacher/assignments/${atividadeSelecionada?.id}`"
          class="btn-primary no-underline"
          @click="modalAtividadeAberto = false"
        >
          Ver Atividade
        </NuxtLink>
      </template>
    </Modal>

    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import type { CalendarOptions, EventClickArg, DateClickArg, DatesSetArg } from '@fullcalendar/core'
import Icone from '~/components/ui/Icone/Icone.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import CampoSelecao from '~/components/form/CampoSelecao/CampoSelecao.vue'
import Alternador from '~/components/ui/Alternador/Alternador.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'student', 'collaborator']
})

const { isAdmin } = usePermissions()
const canManageEvents = computed(() => isAdmin.value)

const { fetchEvents, fetchAssignmentsDueDates, fetchAnnouncementsDates, createEvent, updateEvent, deleteEvent } = useCalendarEvents()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const eventosCalendario = ref<any[]>([])
const currentRange = ref({ start: '', end: '' })

// --- Navegação ---
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const mesSelecionado = ref(new Date().getMonth())
const anoSelecionado = ref(new Date().getFullYear())

const getCalendarApi = () => calendarRef.value?.getApi()

const navegarParaData = () => {
  const api = getCalendarApi()
  if (api) api.gotoDate(new Date(anoSelecionado.value, mesSelecionado.value, 1))
}

const navegarHoje = () => {
  const agora = new Date()
  mesSelecionado.value = agora.getMonth()
  anoSelecionado.value = agora.getFullYear()
  const api = getCalendarApi()
  if (api) api.today()
}

const viewOptions = [
  { key: 'multiMonthYear', label: 'Ano' },
  { key: 'dayGridMonth', label: 'Mês' },
  { key: 'timeGridWeek', label: 'Semana' },
  { key: 'timeGridDay', label: 'Dia' }
]

const viewAtual = ref('dayGridMonth')

const ehHoje = computed(() => {
  const hoje = new Date()
  return mesSelecionado.value === hoje.getMonth() && anoSelecionado.value === hoje.getFullYear()
})

const trocarView = (viewName: string) => {
  viewAtual.value = viewName
  const api = getCalendarApi()
  if (api) api.changeView(viewName)
}

// --- Carregar eventos ---
const carregarEventos = async (start: string, end: string) => {
  currentRange.value = { start, end }
  const [customEvents, assignments, announcements] = await Promise.all([
    fetchEvents(start, end),
    fetchAssignmentsDueDates(start, end),
    fetchAnnouncementsDates(start, end)
  ])

  const eventosCustom = customEvents.map(e => ({
    id: `event-${e.id}`,
    title: e.title,
    start: e.start_at,
    end: e.end_at || undefined,
    allDay: e.all_day,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: { tipo: 'evento', dados: e }
  }))

  const eventosAtividades = assignments.map((a: any) => ({
    id: `assignment-${a.id}`,
    title: `📝 ${a.title}`,
    start: a.due_date,
    allDay: true,
    backgroundColor: a.status === 'published' ? '#059669' : '#6b7280',
    borderColor: a.status === 'published' ? '#059669' : '#6b7280',
    extendedProps: { tipo: 'atividade', dados: a }
  }))

  const eventosAvisos = announcements.map((a: any) => ({
    id: `announcement-${a.id}`,
    title: `📢 ${a.title}`,
    start: a.published_at,
    allDay: true,
    backgroundColor: a.priority === 'high' ? '#dc2626' : '#d97706',
    borderColor: a.priority === 'high' ? '#dc2626' : '#d97706',
    extendedProps: { tipo: 'aviso', dados: a }
  }))

  eventosCalendario.value = [...eventosCustom, ...eventosAtividades, ...eventosAvisos]
}

// --- Calendar Options ---
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: ptBrLocale,
  headerToolbar: false,
  height: 'auto',
  nowIndicator: true,
  editable: false,
  selectable: canManageEvents.value,
  events: eventosCalendario.value,
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  datesSet: handleDatesSet,
  dayMaxEvents: 3,
  eventDisplay: 'block'
}))

const handleDatesSet = (info: DatesSetArg) => {
  const start = info.start.toISOString()
  const end = info.end.toISOString()
  carregarEventos(start, end)
  // Sincronizar seletores com a data visível
  const mid = new Date((info.start.getTime() + info.end.getTime()) / 2)
  mesSelecionado.value = mid.getMonth()
  anoSelecionado.value = mid.getFullYear()
  // Sincronizar view ativa
  viewAtual.value = info.view.type
}

const handleDateClick = (info: DateClickArg) => {
  if (!canManageEvents.value) return
  abrirModalCriar(info.dateStr)
}

const handleEventClick = (info: EventClickArg) => {
  const { tipo, dados } = info.event.extendedProps
  if (tipo === 'atividade') {
    atividadeSelecionada.value = dados
    modalAtividadeAberto.value = true
  } else if (tipo === 'aviso') {
    navigateTo(`/announcements/${dados.id}`)
  } else if (canManageEvents.value) {
    abrirModalEditar(dados)
  }
}

// --- Modal Evento ---
const modalAberto = ref(false)
const eventoEditando = ref<any>(null)
const salvando = ref(false)
const form = ref({
  title: '',
  description: '',
  start_at: '',
  end_at: '',
  all_day: true,
  type: 'custom',
  color: '#1132d4'
})
const erros = ref<Record<string, string>>({})

const opcoesTipo = [
  { rotulo: 'Evento', valor: 'custom' },
  { rotulo: 'Feriado', valor: 'holiday' },
  { rotulo: 'Reunião', valor: 'meeting' }
]

const coresDisponiveis = ['#1132d4', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0891b2']

const abrirModalCriar = (dateStr?: string) => {
  eventoEditando.value = null
  erros.value = {}
  form.value = {
    title: '',
    description: '',
    start_at: dateStr || new Date().toISOString().split('T')[0],
    end_at: '',
    all_day: true,
    type: 'custom',
    color: '#1132d4'
  }
  modalAberto.value = true
}

const abrirModalEditar = (evento: any) => {
  eventoEditando.value = evento
  erros.value = {}
  const startLocal = evento.all_day
    ? evento.start_at.split('T')[0]
    : evento.start_at.slice(0, 16)
  const endLocal = evento.end_at
    ? (evento.all_day ? evento.end_at.split('T')[0] : evento.end_at.slice(0, 16))
    : ''
  form.value = {
    title: evento.title,
    description: evento.description || '',
    start_at: startLocal,
    end_at: endLocal,
    all_day: evento.all_day,
    type: evento.type,
    color: evento.color
  }
  modalAberto.value = true
}

const salvarEvento = async () => {
  erros.value = {}
  if (!form.value.title.trim()) {
    erros.value.title = 'Título é obrigatório'
    return
  }
  if (!form.value.start_at) {
    erros.value.title = 'Data de início é obrigatória'
    return
  }

  salvando.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || null,
      start_at: form.value.all_day
        ? new Date(form.value.start_at + 'T00:00:00').toISOString()
        : new Date(form.value.start_at).toISOString(),
      end_at: form.value.end_at
        ? (form.value.all_day
            ? new Date(form.value.end_at + 'T23:59:59').toISOString()
            : new Date(form.value.end_at).toISOString())
        : null,
      all_day: form.value.all_day,
      type: form.value.type as 'custom' | 'holiday' | 'meeting',
      color: form.value.color
    }

    if (eventoEditando.value) {
      await updateEvent(eventoEditando.value.id, payload)
      mostrarNotificacao('sucesso', 'Evento atualizado')
    } else {
      await createEvent(payload)
      mostrarNotificacao('sucesso', 'Evento criado')
    }

    modalAberto.value = false
    await carregarEventos(currentRange.value.start, currentRange.value.end)
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar evento')
  } finally {
    salvando.value = false
  }
}

const excluirEvento = async () => {
  if (!eventoEditando.value) return
  try {
    await deleteEvent(eventoEditando.value.id)
    modalAberto.value = false
    mostrarNotificacao('sucesso', 'Evento excluído')
    await carregarEventos(currentRange.value.start, currentRange.value.end)
  } catch {
    mostrarNotificacao('critico', 'Erro ao excluir evento')
  }
}

// --- Modal Atividade ---
const modalAtividadeAberto = ref(false)
const atividadeSelecionada = ref<any>(null)

const rotuloStatus = (s: string) => ({ draft: 'Rascunho', published: 'Ativa', closed: 'Encerrada' }[s] || s)
const classeStatus = (s: string) => ({
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-50 text-green-700',
  closed: 'bg-amber-50 text-amber-700'
}[s] || '')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

// --- Notificação ---
const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string) => {
  notificacao.value = { visivel: true, variante: v, titulo: t }
}
</script>

<style scoped>
:deep(.fc) {
  font-family: 'Lexend', sans-serif;
}

:deep(.fc-header-toolbar) {
  display: none !important;
}

:deep(.fc-daygrid-day.fc-day-today) {
  background-color: rgba(17, 50, 212, 0.04) !important;
}

:deep(.fc-timegrid-slot) {
  height: 3rem;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.75rem;
  padding: 1px 4px;
}

:deep(.fc-daygrid-event) {
  margin-top: 1px;
}

:deep(.fc-col-header-cell-cushion),
:deep(.fc-daygrid-day-number) {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
}

:deep(.fc-daygrid-day-number) {
  padding: 4px 8px;
}

:deep(.fc th),
:deep(.fc td) {
  border-color: #e5e7eb;
}

:deep(.fc-scrollgrid) {
  border-color: #e5e7eb;
}

:deep(.fc-more-link) {
  color: #1132d4;
  font-size: 0.75rem;
  font-weight: 500;
}

:deep(.fc-timegrid-now-indicator-line) {
  border-color: #dc2626;
}
</style>
