# Guia de Tipografia - EduScanAI

## Fonte

**Inter** - Única fonte do projeto (Google Fonts)

```html
<!-- Já configurada no projeto -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
```

## Escala Tipográfica

### Display XL
- **Tamanho**: 48px
- **Peso**: 900 (Black)
- **Uso**: Títulos de página, hero sections
- **Regra**: Apenas 1 por página (título principal)

```html
<h1 class="display-xl">Título Principal</h1>
<!-- ou -->
<h1 class="text-display-xl">Título Principal</h1>
```

### Heading 1
- **Tamanho**: 32px
- **Peso**: 700 (Bold)
- **Line-height**: 1.3
- **Uso**: Títulos de seção principal, seções principais do dashboard

```html
<h1 class="heading-1">Seção Principal</h1>
<!-- ou -->
<h1 class="text-heading-1">Seção Principal</h1>
```

### Heading 2
- **Tamanho**: 24px
- **Peso**: 700 (Bold)
- **Line-height**: 1.4
- **Uso**: Subtítulos, títulos de cards e painéis

```html
<h2 class="heading-2">Título do Card</h2>
<!-- ou -->
<h2 class="text-heading-2">Título do Card</h2>
```

### Heading 3
- **Tamanho**: 20px
- **Peso**: 600 (Semi-bold)
- **Line-height**: 1.5
- **Uso**: Títulos de subsecção, labels de gráficos, agrupamentos internos

```html
<h3 class="heading-3">Subsecção</h3>
<!-- ou -->
<h3 class="text-heading-3">Subsecção</h3>
```

### Body Regular
- **Tamanho**: 16px
- **Peso**: 400 (Regular)
- **Line-height**: 1.6
- **Uso**: Todo texto descritivo, parágrafos, descrições

```html
<p class="body-text">Texto descritivo corrido...</p>
<!-- ou -->
<p class="text-body">Texto descritivo corrido...</p>
<!-- ou simplesmente -->
<p>Texto descritivo corrido...</p>
```

### Caption / Small
- **Tamanho**: 12px
- **Peso**: 500 (Medium)
- **Line-height**: 1.4
- **Letter-spacing**: 0.05em
- **Transform**: Uppercase
- **Cor**: #6c757d (text-secondary)
- **Uso**: Metadados, timestamps, rodapés

```html
<span class="caption">Metadados</span>
<!-- ou -->
<span class="text-caption">Timestamp</span>
```

## Regras de Uso

### 1. Display XL
- ✅ Apenas 1 por página
- ✅ Título principal / Hero section
- ❌ Não usar em cards ou componentes internos

### 2. Heading 1
- ✅ Seções principais do dashboard
- ✅ Títulos de páginas
- ❌ Não usar mais de 2-3 por página

### 3. Heading 2
- ✅ Títulos de cards
- ✅ Títulos de painéis
- ✅ Seções secundárias

### 4. Heading 3
- ✅ Agrupamentos internos dentro de cards
- ✅ Labels de gráficos
- ✅ Subsecções

### 5. Body Regular
- ✅ Todo texto corrido
- ✅ Descrições
- ✅ Parágrafos
- ✅ Line-height: 1.6 (padrão)

### 6. Caption/Small
- ✅ Sempre uppercase
- ✅ Letter-spacing: 0.05em
- ✅ Cor: #6c757d
- ✅ Metadados, timestamps, rodapés

## Cores de Texto

### Padrão
```css
color: #1a1a2e; /* Escuro, quase preto */
```

### Secundário
```css
color: #6c757d; /* Cinza médio */
```

## Pesos de Fonte

| Peso | Nome | Uso |
|------|------|-----|
| 900 | Black | Display XL |
| 700 | Bold | Heading 1, Heading 2 |
| 600 | Semi-bold | Heading 3 |
| 500 | Medium | Caption, Badges |
| 400 | Regular | Body, texto corrido |

**Importante**: Nunca usar font-weight abaixo de 400!

## Exemplos de Uso

### Hero Section
```html
<section class="hero">
  <h1 class="display-xl">Bem-vindo ao EduScanAI</h1>
  <p class="text-body text-secondary">
    Plataforma de análise educacional com IA
  </p>
</section>
```

### Card de Dashboard
```html
<div class="card">
  <div class="flex items-center justify-between mb-4">
    <h2 class="heading-2">Desempenho Geral</h2>
    <span class="caption">Últimos 30 dias</span>
  </div>
  <p class="body-text text-secondary">
    Análise detalhada do desempenho dos estudantes.
  </p>
</div>
```

### Seção com Subsecções
```html
<section>
  <h1 class="heading-1">Dashboard Principal</h1>

  <div class="mt-6">
    <h2 class="heading-2">Métricas de Engajamento</h2>

    <div class="mt-4">
      <h3 class="heading-3">Por Turma</h3>
      <p class="body-text">Dados detalhados...</p>
    </div>
  </div>
</section>
```

### Timestamp e Metadados
```html
<div class="card">
  <h3 class="heading-3">Última Atividade</h3>
  <p class="body-text">Revisão de conteúdo concluída</p>
  <span class="caption">Há 2 horas atrás</span>
</div>
```

## Classes Tailwind Disponíveis

### Tamanhos
- `text-display-xl` - 48px, 900
- `text-heading-1` - 32px, 700
- `text-heading-2` - 24px, 700
- `text-heading-3` - 20px, 600
- `text-body` - 16px, 400
- `text-caption` - 12px, 500, uppercase

### Pesos
- `font-black` - 900
- `font-bold` - 700
- `font-semibold` - 600
- `font-medium` - 500
- `font-normal` - 400

### Classes Customizadas
- `.display-xl` - Display XL completo
- `.heading-1` - Heading 1 completo
- `.heading-2` - Heading 2 completo
- `.heading-3` - Heading 3 completo
- `.body-text` - Body completo
- `.caption` - Caption completo (com uppercase e letter-spacing)

## Hierarquia Visual

```
Display XL (48px, 900)
  ↓
Heading 1 (32px, 700)
  ↓
Heading 2 (24px, 700)
  ↓
Heading 3 (20px, 600)
  ↓
Body Regular (16px, 400)
  ↓
Caption (12px, 500, uppercase)
```

## Acessibilidade

- ✅ Contraste mínimo de 4.5:1 para texto normal
- ✅ Contraste mínimo de 3:1 para texto grande (>= 24px)
- ✅ Line-height adequado para leitura (mínimo 1.5)
- ✅ Hierarquia clara de headings (h1, h2, h3)
