# Guia de Uso dos Componentes - EduScanAI

## Estrutura de Componentes

```
components/
├── ui/                  ← Átomos (primitivos reutilizáveis)
├── form/                ← Moléculas (composições de átomos)
├── data/                ← Visualização de dados
├── feedback/            ← Feedback ao usuário
├── layout/              ← Estrutura de página
└── composed/            ← Organismos (específicos do domínio)
```

## UI Components (Átomos)

### Button

```vue
<template>
  <!-- Primary Button -->
  <Button variant="primary" @click="handleClick">
    Salvar Alterações
  </Button>

  <!-- Button com ícone -->
  <Button variant="primary" icon="+" icon-position="left">
    Criar Novo
  </Button>

  <!-- Secondary Button -->
  <Button variant="secondary">
    Cancelar
  </Button>

  <!-- Outline Button -->
  <Button variant="outline">
    Filtrar
  </Button>

  <!-- Destructive Button -->
  <Button variant="destructive">
    Deletar
  </Button>
</template>

<script setup lang="ts">
import Button from '~/components/ui/Button/Button.vue'

const handleClick = () => {
  console.log('Botão clicado!')
}
</script>
```

### Input

```vue
<template>
  <!-- Input simples -->
  <Input
    v-model="name"
    label="Nome Completo"
    placeholder="Digite seu nome..."
  />

  <!-- Input com ícone -->
  <Input
    v-model="email"
    type="email"
    label="E-mail"
    icon="📧"
    placeholder="seu@email.com"
  />

  <!-- Input read-only -->
  <Input
    v-model="id"
    label="ID"
    :readonly="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Input from '~/components/ui/Input/Input.vue'

const name = ref('')
const email = ref('')
const id = ref('ASG-2024-001')
</script>
```

### Badge

```vue
<template>
  <Badge variant="mastered" label="Mastered" />
  <Badge variant="in-progress" label="In Progress" />
  <Badge variant="at-risk" label="At Risk" />
  <Badge variant="processing" label="Processing" :show-dot="false" />
</template>

<script setup lang="ts">
import Badge from '~/components/ui/Badge/Badge.vue'
</script>
```

### Toggle

```vue
<template>
  <Toggle
    v-model="isEnabled"
    label="Ativar notificações"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toggle from '~/components/ui/Toggle/Toggle.vue'

const isEnabled = ref(false)
</script>
```

## Form Components (Moléculas)

### FormField

```vue
<template>
  <FormField
    v-model="email"
    type="email"
    label="E-mail"
    icon="📧"
    placeholder="seu@email.com"
    :error="emailError"
    hint="Digite um e-mail válido"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from '~/components/form/FormField/FormField.vue'

const email = ref('')
const emailError = ref('')
</script>
```

### SearchBar

```vue
<template>
  <SearchBar
    v-model="searchQuery"
    placeholder="Buscar estudantes..."
    @search="handleSearch"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBar from '~/components/form/SearchBar/SearchBar.vue'

const searchQuery = ref('')

const handleSearch = (query: string) => {
  console.log('Buscando:', query)
}

const handleClear = () => {
  console.log('Busca limpa')
}
</script>
```

### SelectField

```vue
<template>
  <SelectField
    v-model="selectedOption"
    label="Escolha uma opção"
    placeholder="Selecione..."
    :options="options"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectField from '~/components/form/SelectField/SelectField.vue'

const selectedOption = ref('')
const options = [
  { label: 'Opção 1', value: '1' },
  { label: 'Opção 2', value: '2' },
  { label: 'Opção 3', value: '3' }
]
</script>
```

### CopyField

```vue
<template>
  <CopyField
    label="Assignment ID"
    value="ASG-2024-001"
    @copy="handleCopy"
  />
</template>

<script setup lang="ts">
import CopyField from '~/components/form/CopyField/CopyField.vue'

const handleCopy = (value: string) => {
  console.log('Copiado:', value)
}
</script>
```

## Layout Components

### Card

```vue
<template>
  <Card title="Título do Card">
    <template #actions>
      <Button variant="outline">Editar</Button>
    </template>

    <p>Conteúdo do card...</p>

    <template #footer>
      <Button variant="primary">Salvar</Button>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from '~/components/layout/Card/Card.vue'
import Button from '~/components/ui/Button/Button.vue'
</script>
```

### PageContainer

```vue
<template>
  <PageContainer title="Dashboard">
    <p>Conteúdo da página...</p>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '~/components/layout/PageContainer/PageContainer.vue'
</script>
```

## Data Components

### StatCard

```vue
<template>
  <StatCard
    label="Total de Estudantes"
    :value="150"
    :change="12.5"
    icon="👥"
    icon-bg="bg-primary-50"
  />

  <StatCard
    label="Taxa de Conclusão"
    :value="85"
    :change="-5"
    format="percentage"
    icon="📊"
    icon-bg="bg-green-50"
  />
</template>

<script setup lang="ts">
import StatCard from '~/components/data/StatCard/StatCard.vue'
</script>
```

### ProgressBar

```vue
<template>
  <ProgressBar
    label="Progresso"
    :value="75"
    :max="100"
    variant="success"
  />
</template>

<script setup lang="ts">
import ProgressBar from '~/components/data/ProgressBar/ProgressBar.vue'
</script>
```

### DataTable

```vue
<template>
  <DataTable :columns="columns" :data="data">
    <template #cell-status="{ value }">
      <Badge :variant="value" />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from '~/components/data/DataTable/DataTable.vue'
import Badge from '~/components/ui/Badge/Badge.vue'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'status', label: 'Status' }
]

const data = [
  { name: 'João Silva', email: 'joao@email.com', status: 'mastered' },
  { name: 'Maria Santos', email: 'maria@email.com', status: 'in-progress' }
]
</script>
```

## Feedback Components

### Alert

```vue
<template>
  <Alert variant="success" :dismissible="true" @dismiss="handleDismiss">
    Operação realizada com sucesso!
  </Alert>

  <Alert variant="warning">
    Atenção: Verifique os dados antes de continuar.
  </Alert>

  <Alert variant="critical">
    Erro: Não foi possível completar a operação.
  </Alert>
</template>

<script setup lang="ts">
import Alert from '~/components/feedback/Alert/Alert.vue'

const handleDismiss = () => {
  console.log('Alert fechado')
}
</script>
```

### Modal

```vue
<template>
  <Button @click="isOpen = true">Abrir Modal</Button>

  <Modal
    :is-open="isOpen"
    title="Título do Modal"
    @close="isOpen = false"
  >
    <p>Conteúdo do modal...</p>

    <template #footer>
      <Button variant="secondary" @click="isOpen = false">Cancelar</Button>
      <Button variant="primary" @click="handleSave">Salvar</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/feedback/Modal/Modal.vue'
import Button from '~/components/ui/Button/Button.vue'

const isOpen = ref(false)

const handleSave = () => {
  console.log('Salvando...')
  isOpen.value = false
}
</script>
```

### ConfirmDialog

```vue
<template>
  <ConfirmDialog
    :is-open="isOpen"
    title="Confirmar exclusão"
    message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
    variant="danger"
    @confirm="handleConfirm"
    @cancel="isOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from '~/components/feedback/ConfirmDialog/ConfirmDialog.vue'

const isOpen = ref(false)

const handleConfirm = () => {
  console.log('Confirmado!')
  isOpen.value = false
}
</script>
```

### Toast

```vue
<template>
  <Toast
    :is-visible="showToast"
    variant="success"
    title="Sucesso!"
    message="Operação completada com sucesso"
    :duration="3000"
    @close="showToast = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toast from '~/components/feedback/Toast/Toast.vue'

const showToast = ref(true)
</script>
```

### EmptyState

```vue
<template>
  <EmptyState
    title="Nenhum estudante encontrado"
    description="Não há estudantes cadastrados ainda. Comece adicionando o primeiro!"
  >
    <template #action>
      <Button variant="primary" icon="+" icon-position="left">
        Adicionar Estudante
      </Button>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import EmptyState from '~/components/feedback/EmptyState/EmptyState.vue'
import Button from '~/components/ui/Button/Button.vue'
</script>
```

## Composed Components (Organismos)

### StudentCard

```vue
<template>
  <StudentCard :student="student">
    <template #actions>
      <Button variant="outline">Ver Detalhes</Button>
    </template>
  </StudentCard>
</template>

<script setup lang="ts">
import StudentCard from '~/components/composed/StudentCard/StudentCard.vue'
import Button from '~/components/ui/Button/Button.vue'

const student = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  status: 'mastered',
  assignmentsCompleted: 15,
  averageScore: 92,
  progress: 85
}
</script>
```

### AssignmentRow

```vue
<template>
  <AssignmentRow :assignment="assignment">
    <template #actions>
      <Button variant="outline">Editar</Button>
      <Button variant="destructive">Deletar</Button>
    </template>
  </AssignmentRow>
</template>

<script setup lang="ts">
import AssignmentRow from '~/components/composed/AssignmentRow/AssignmentRow.vue'
import Button from '~/components/ui/Button/Button.vue'

const assignment = {
  id: '1',
  title: 'Matemática Avançada',
  description: 'Exercícios de cálculo diferencial',
  status: 'in-progress',
  dueDate: new Date('2024-12-31'),
  assignmentId: 'ASG-2024-001',
  submissions: 25
}
</script>
```

### ScanResultPanel

```vue
<template>
  <ScanResultPanel :scan-result="scanResult">
    <template #actions>
      <Button variant="outline">Exportar PDF</Button>
      <Button variant="primary">Compartilhar</Button>
    </template>
  </ScanResultPanel>
</template>

<script setup lang="ts">
import ScanResultPanel from '~/components/composed/ScanResultPanel/ScanResultPanel.vue'
import Button from '~/components/ui/Button/Button.vue'

const scanResult = {
  id: '1',
  studentName: 'João Silva',
  totalScore: 85,
  correctAnswers: 17,
  totalQuestions: 20,
  timeSpent: 45,
  topicScores: [
    { name: 'Álgebra', score: 90 },
    { name: 'Geometria', score: 75 },
    { name: 'Trigonometria', score: 85 }
  ],
  feedback: 'Excelente desempenho! Continue assim.'
}
</script>
```

### AnalyticsDashboard

```vue
<template>
  <AnalyticsDashboard :analytics="analytics">
    <template #performance-chart>
      <!-- Integrar Chart.js aqui -->
    </template>
    <template #status-chart>
      <!-- Integrar Chart.js aqui -->
    </template>
  </AnalyticsDashboard>
</template>

<script setup lang="ts">
import AnalyticsDashboard from '~/components/composed/AnalyticsDashboard/AnalyticsDashboard.vue'

const analytics = {
  totalStudents: 150,
  studentsChange: 12.5,
  activeAssignments: 24,
  assignmentsChange: 8,
  completionRate: 85,
  completionChange: -5,
  averageScore: 78,
  scoreChange: 3.2,
  topPerformers: [
    { id: '1', name: 'Ana Costa', score: 95 },
    { id: '2', name: 'Pedro Lima', score: 93 },
    { id: '3', name: 'Maria Silva', score: 91 }
  ],
  recentActivity: [
    { icon: '📝', description: 'João completou Assignment de Matemática', timestamp: 'Há 5 minutos' },
    { icon: '🎯', description: 'Maria atingiu 100% em Física', timestamp: 'Há 15 minutos' }
  ]
}
</script>
```

### ScannerPreview

```vue
<template>
  <ScannerPreview
    :document-image="documentUrl"
    :regions="textRegions"
    :progress="scanProgress"
    :confidence-score="98.5"
    status="completed"
    @menu-click="handleMenu"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ScannerPreview from '~/components/composed/ScannerPreview/ScannerPreview.vue'

const documentUrl = ref('/path/to/document.jpg')
const scanProgress = ref(100)

const textRegions = [
  { x: 10, y: 15, width: 80, height: 10, label: 'Text Region 1' },
  { x: 10, y: 30, width: 80, height: 10, label: 'Text Region 2' }
]

const handleMenu = () => {
  console.log('Menu clicked')
}
</script>
```

### ClassMasteryCard

```vue
<template>
  <ClassMasteryCard
    :value="84"
    :trend="4.2"
    :distribution="distribution"
  />
</template>

<script setup lang="ts">
import ClassMasteryCard from '~/components/composed/ClassMasteryCard/ClassMasteryCard.vue'

const distribution = {
  mastered: 60,
  learning: 30,
  struggling: 10
}
</script>
```

### StudentProfileCard

```vue
<template>
  <StudentProfileCard
    :student="student"
    current-grade="A-"
    :attendance="92"
    :areas-of-focus="areasOfFocus"
    @edit="handleEdit"
    @view-report="handleViewReport"
  />
</template>

<script setup lang="ts">
import StudentProfileCard from '~/components/composed/StudentProfileCard/StudentProfileCard.vue'

const student = {
  name: 'Jane Doe',
  initials: 'JD',
  grade: 'Grade 11',
  course: 'AP Physics'
}

const areasOfFocus = [
  { topic: 'Algebra', status: 'mastered', progress: 100 },
  { topic: 'Geometry', status: 'in_progress', progress: 60 },
  { topic: 'Trigonometry', status: 'needs_help', progress: 40 }
]

const handleEdit = () => {
  console.log('Edit student')
}

const handleViewReport = () => {
  console.log('View full report')
}
</script>
```

### LiveQueueCard

```vue
<template>
  <LiveQueueCard
    :items="queueItems"
    @retry="handleRetry"
    @item-click="handleItemClick"
  />
</template>

<script setup lang="ts">
import LiveQueueCard from '~/components/composed/LiveQueueCard/LiveQueueCard.vue'

const queueItems = [
  { fileName: 'Math_Final_v2.pdf', status: 'processing', timeAgo: '12s ago' },
  { fileName: 'Physics_Quiz.pdf', status: 'completed', timeAgo: '2m ago' },
  { fileName: 'Chemistry_Test.pdf', status: 'failed', timeAgo: '5m ago' }
]

const handleRetry = (item: any) => {
  console.log('Retry:', item.fileName)
}

const handleItemClick = (item: any) => {
  console.log('Click:', item.fileName)
}
</script>
```

## Boas Práticas

1. **Componentização**: Use os componentes primitivos (ui/) para construir componentes mais complexos
2. **TypeScript**: Sempre defina interfaces para as props dos componentes
3. **Slots**: Use slots para flexibilidade quando necessário
4. **Emits**: Documente os eventos emitidos por cada componente
5. **Acessibilidade**: Todos os componentes seguem as diretrizes de acessibilidade
6. **Tailwind**: Todos os estilos usam classes Tailwind configuradas em `main.css`
7. **Reutilização**: NUNCA duplique componentes - sempre reutilize os componentes base com props diferentes

## Auto-import

O Nuxt 3 auto-importa componentes de `~/components/`. Você pode usar os componentes diretamente sem imports explícitos:

```vue
<template>
  <!-- Funciona sem import! -->
  <Button variant="primary">Clique aqui</Button>
</template>
```

Para componentes em pastas aninhadas, use o nome completo:

```vue
<template>
  <UiButton variant="primary">Clique aqui</UiButton>
  <FormSearchBar v-model="search" />
  <LayoutCard title="Meu Card">...</LayoutCard>
</template>
```
