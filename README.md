# EduScanAI - Projeto Nuxt.js

Projeto configurado com Nuxt 3 e estrutura organizada.

## Estrutura do Projeto

```
eduscanai/
├── assets/             # Estilos globais e imagens brutas
├── components/         # UI Components (Átomos, Moléculas, Organismos)
├── composables/        # Lógica de estado e hooks
├── layouts/            # Templates de estrutura de página
├── middleware/         # Guardas de rota (client-side)
├── pages/              # Views e roteamento
├── plugins/            # Configurações de bibliotecas externas
├── public/             # Arquivos estáticos puros
├── server/             # API interna e lógica server-side
│   ├── api/           # Endpoints da API
│   └── utils/         # Helpers exclusivos do servidor
├── stores/             # Pinia stores (estado global)
├── types/              # Definições de TypeScript (.d.ts)
└── utils/              # Helpers e funções puras
```

## Comandos

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build de produção
npm run preview
```

## Tecnologias

- **Nuxt 3** - Framework Vue.js
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **Pinia** - Gerenciamento de estado
- **Vue 3** - Framework reativo

## Próximos Passos

1. Execute `npm install` para instalar as dependências
2. Execute `npm run dev` para iniciar o servidor de desenvolvimento
3. Acesse http://localhost:3000 no navegador
4. Comece a desenvolver!

## Guias de Estilo

- [Guia de Cores](COLORS.md) - Paleta de cores, regras de uso e exemplos
- [Guia de Tipografia](TYPOGRAPHY.md) - Fonte Inter, escala tipográfica e uso
- [Guia de Componentes](COMPONENTS.md) - Botões, inputs, badges, toggles e ícones
- [Guia Tailwind CSS](TAILWIND.md) - Classes customizadas e exemplos de uso
- [Guia de Uso dos Componentes](COMPONENTS_USAGE.md) - Como usar os componentes Vue criados

## Estrutura de Pastas

### `/assets`
Estilos globais, imagens e fontes que precisam ser processadas pelo build.

### `/components`
Componentes Vue reutilizáveis organizados por padrão Atomic Design:

- **ui/** - Átomos (Button, Input, Badge, Toggle, Icon)
- **form/** - Moléculas de formulário (FormField, SearchBar, SelectField, CopyField)
- **data/** - Visualização de dados (StatCard, DataTable, Chart, ProgressBar)
- **feedback/** - Feedback ao usuário (Alert, Toast, Modal, ConfirmDialog, EmptyState)
- **layout/** - Estrutura de página (Sidebar, Header, PageContainer, Card)
- **composed/** - Organismos específicos (StudentCard, AssignmentRow, ScanResultPanel, AnalyticsDashboard)

Todos os componentes seguem TypeScript, Vue 3 Composition API e usam classes Tailwind configuradas.

### `/composables`
Hooks do Vue Composition API para lógica reutilizável.

### `/layouts`
Templates de layout para estruturar páginas.

### `/middleware`
Guardas de rota executados antes de renderizar páginas.

### `/pages`
Sistema de roteamento automático baseado em arquivos.

### `/plugins`
Plugins Vue e configurações de bibliotecas externas.

### `/public`
Arquivos estáticos servidos diretamente (imagens, fontes, etc).

### `/server`
API e lógica server-side com Nitro.

### `/stores`
Stores Pinia para gerenciamento de estado global.

### `/types`
Definições de tipos TypeScript compartilhados.

### `/utils`
Funções utilitárias puras e helpers.
