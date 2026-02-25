# Guia de Cores - EduScanAI

## Paleta de Cores

### Brand & Accents

#### Primary Blue (`primary-*`)
- **Cor Base**: `#1132d4` (primary-500)
- **Uso**: Botões primários, links, elementos de marca
- **Classes**: `bg-primary-500`, `text-primary-500`, `border-primary-500`
- **Variações**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

```html
<button class="btn-primary">Ação Primária</button>
<a href="#" class="text-primary-500 hover:text-primary-600">Link</a>
```

#### Data Teal (`data-teal-*`)
- **Cor Base**: `#20c997` (data-teal-500)
- **Uso**: Gráficos, indicadores de crescimento, visualizações de dados
- **Classes**: `bg-data-teal-500`, `text-data-teal-500`
- **Variações**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

```html
<div class="bg-data-teal-500 text-white p-4">Métrica Positiva</div>
```

#### Deep Purple (`purple-*`)
- **Cor Base**: `#6f42c1` (purple-500)
- **Uso**: Destaques de IA/insights, badges especiais
- **Classes**: `bg-purple-500`, `text-purple-500`
- **Variações**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

```html
<span class="badge-ai">IA Insight</span>
```

### Semantic Status

#### Success Green (`success-*`)
- **Cor Base**: `#28a745` (success-500)
- **Uso**: Status "concluído/mastered", confirmações
- **Classes**: `bg-success-500`, `text-success-500`

```html
<button class="btn-success">Confirmar</button>
<span class="badge-success">Concluído</span>
<div class="alert-success">Operação realizada com sucesso!</div>
```

#### Warning Amber (`warning-*`)
- **Cor Base**: `#ffc107` (warning-500)
- **Uso**: Status "em progresso", alertas moderados
- **Classes**: `bg-warning-500`, `text-warning-500`

```html
<button class="btn-warning">Atenção</button>
<span class="badge-warning">Em Progresso</span>
<div class="alert-warning">Atenção necessária!</div>
```

#### Critical Red (`critical-*`)
- **Cor Base**: `#dc3545` (critical-500)
- **Uso**: Status "em risco", erros, ações destrutivas
- **Classes**: `bg-critical-500`, `text-critical-500`

```html
<button class="btn-critical">Deletar</button>
<span class="badge-critical">Em Risco</span>
<div class="alert-critical">Erro crítico!</div>
```

## Cores de Texto e Fundo

### Texto
- **Texto Principal**: `#212529` → `text-primary` ou `text-text-primary`
- **Texto Secundário**: `#6c757d` → `text-secondary` ou `text-text-secondary`

```html
<h1 class="text-primary">Título Principal</h1>
<p class="text-secondary">Texto secundário</p>
```

### Fundo
- **Fundo da Página**: `#f8f9fa` → `bg-bg-page`
- **Fundo de Cards**: `#ffffff` → `bg-bg-card` ou `bg-white`

```html
<div class="bg-bg-page">Fundo da página</div>
<div class="card">Card com fundo branco</div>
```

## Regras de Uso

1. **Ações Primárias (CTA)** → `btn-primary` (Primary Blue)
2. **Ações Secundárias** → `btn-secondary` (outline com Primary Blue)
3. **Feedback Positivo** → `btn-success` ou `badge-success` (Success Green)
4. **Alertas/Pendências** → `btn-warning` ou `badge-warning` (Warning Amber)
5. **Erros/Riscos** → `btn-critical` ou `badge-critical` (Critical Red)
6. **Dados e Métricas** → `data-teal-*`
7. **Elementos de IA/Insights** → `purple-*` ou `badge-ai`
8. **Texto Principal** → `text-primary`
9. **Texto Secundário** → `text-secondary`
10. **Fundo da Página** → `bg-bg-page`
11. **Fundo de Cards** → `card` ou `bg-bg-card`

## Classes Customizadas

### Botões
```html
<!-- Primário -->
<button class="btn-primary">Salvar</button>

<!-- Secundário (outline) -->
<button class="btn-secondary">Cancelar</button>

<!-- Status -->
<button class="btn-success">Confirmar</button>
<button class="btn-warning">Atenção</button>
<button class="btn-critical">Deletar</button>
```

### Badges
```html
<span class="badge-success">Concluído</span>
<span class="badge-warning">Em Progresso</span>
<span class="badge-critical">Em Risco</span>
<span class="badge-ai">IA Insight</span>
```

### Alertas
```html
<div class="alert-success">Sucesso!</div>
<div class="alert-warning">Atenção!</div>
<div class="alert-critical">Erro!</div>
```

### Cards
```html
<div class="card">
  <h3>Título do Card</h3>
  <p class="text-secondary">Conteúdo</p>
</div>
```

### Gradientes
```html
<h1 class="text-gradient">Título com Gradiente</h1>
<h2 class="text-gradient-data">Métrica com Gradiente</h2>
```

## Exemplos de Composição

### Card de Status
```html
<div class="card">
  <div class="flex items-center justify-between">
    <h3 class="text-primary font-semibold">Tarefa Completa</h3>
    <span class="badge-success">Concluído</span>
  </div>
  <p class="text-secondary mt-2">Descrição da tarefa</p>
</div>
```

### Botões de Ação
```html
<div class="flex gap-3">
  <button class="btn-primary">Salvar Alterações</button>
  <button class="btn-secondary">Cancelar</button>
  <button class="btn-critical">Deletar</button>
</div>
```

### Dashboard com Métricas
```html
<div class="grid grid-cols-3 gap-4">
  <div class="card">
    <div class="text-4xl font-bold text-data-teal-500">85%</div>
    <p class="text-secondary">Taxa de Conclusão</p>
  </div>

  <div class="card">
    <div class="text-4xl font-bold text-purple-500">12</div>
    <p class="text-secondary">Insights de IA</p>
  </div>

  <div class="card">
    <div class="text-4xl font-bold text-primary-500">48</div>
    <p class="text-secondary">Atividades</p>
  </div>
</div>
```
