# Guia de Componentes de Interface - EduScanAI

## Button Variants

### Primary Button
- **Uso**: Ação principal (salvar, enviar, criar)
- **Regra**: Nunca mais de 1 botão Primary por seção
- **Estilo**: Fundo #1132d4, texto branco, borda-radius 8px, padding 10px 20px

```html
<button class="btn-primary">
  Salvar Alterações
</button>

<!-- Com ícone "+" à esquerda -->
<button class="btn-primary flex items-center gap-2">
  <span>+</span>
  Criar Novo
</button>
```

### Secondary Button
- **Uso**: Ação secundária (cancelar, voltar)
- **Estilo**: Fundo transparente, texto #1132d4, borda 1px #1132d4

```html
<button class="btn-secondary">
  Cancelar
</button>
```

### Outline Button
- **Uso**: Ações neutras (filtrar, exportar)
- **Estilo**: Fundo transparente, texto #212529, borda 1px #dee2e6

```html
<button class="btn-outline">
  Filtrar
</button>

<button class="btn-outline">
  Exportar Dados
</button>
```

### Destructive Button
- **Uso**: Ações destrutivas (deletar, remover)
- **Estilo**: Texto #dc3545, sem fundo, sem borda

```html
<button class="btn-destructive">
  Deletar
</button>

<button class="btn-destructive">
  Remover Item
</button>
```

## Form Inputs

### Input Básico

```html
<div>
  <label for="name" class="form-label">Nome Completo</label>
  <input
    type="text"
    id="name"
    class="form-input"
    placeholder="Digite seu nome..."
  />
</div>
```

### Input com Ícone à Esquerda

```html
<div class="relative">
  <label for="email" class="form-label">E-mail</label>
  <div class="relative">
    <!-- Ícone (usar Lucide Icons) -->
    <svg class="form-input-icon" />
    <input
      type="email"
      id="email"
      class="form-input form-input-with-icon"
      placeholder="seu@email.com"
    />
  </div>
</div>
```

### Input Read-only (com botão de copiar)

```html
<div>
  <label for="assignment-id" class="form-label">Assignment ID</label>
  <div class="flex gap-2">
    <input
      type="text"
      id="assignment-id"
      class="form-input-readonly"
      value="ASG-2024-001"
      readonly
    />
    <button class="btn-outline px-3">
      Copiar
    </button>
  </div>
</div>
```

### Especificações de Input

- **Label**: Acima do campo, font-weight 600, 14px
- **Campo**: Fundo #ffffff, borda 1px #dee2e6, border-radius 8px, padding 12px 16px
- **Placeholder**: Cor #9ca3af, font-weight 400
- **Ícone**: Cor #9ca3af, 20px (tamanho)
- **Focus**: Borda #1132d4, box-shadow 0 0 0 3px rgba(17,50,212,0.1)

## Status Badges

### Mastered (Concluído)
```html
<span class="badge-mastered">
  <span class="badge-dot badge-dot-success"></span>
  Mastered
</span>
```

### In Progress (Em Progresso)
```html
<span class="badge-in-progress">
  <span class="badge-dot badge-dot-warning"></span>
  In Progress
</span>
```

### At Risk (Em Risco)
```html
<span class="badge-at-risk">
  <span class="badge-dot badge-dot-critical"></span>
  At Risk
</span>
```

### Processing (Processando)
```html
<span class="badge-processing">
  Processing
</span>
```

### Especificações de Badges

| Status | Dot | Texto | Fundo | Borda |
|--------|-----|-------|-------|-------|
| Mastered | 🟢 (#28a745) | #28a745 | #e6f4ea | 1px #28a745 |
| In Progress | 🟡 (#ffc107) | #212529 | #fff8e1 | 1px #ffc107 |
| At Risk | 🔴 (#dc3545) | #dc3545 | #fdecea | 1px #dc3545 |
| Processing | - | #6f42c1 | #f3e8ff | 1px #6f42c1 |

- **Border-radius**: 9999px (pill)
- **Padding**: 4px 12px
- **Font-size**: 12px
- **Font-weight**: 600
- **Dot**: 8px colorido à esquerda (exceto Processing)

## Toggle Switches

### Toggle Básico

```html
<div class="flex items-center">
  <button class="toggle toggle-active" role="switch" aria-checked="true">
    <span class="toggle-thumb toggle-thumb-active"></span>
  </button>
  <span class="toggle-label">Ativar notificações</span>
</div>
```

### Toggle Inativo

```html
<div class="flex items-center">
  <button class="toggle toggle-inactive" role="switch" aria-checked="false">
    <span class="toggle-thumb toggle-thumb-inactive"></span>
  </button>
  <span class="toggle-label">Ativar notificações</span>
</div>
```

### Especificações

- **Ativo**: Track #1132d4, thumb #ffffff
- **Inativo**: Track #dee2e6, thumb #ffffff
- **Tamanho**: 44px × 24px
- **Label**: À direita do toggle, font-weight 500, 14px
- **Transição**: 200ms ease

## Iconografia

### Biblioteca
**Lucide Icons** (ou similar line-icon set)

### Ícones Core
- `grid` - Dashboard
- `layers` - Scan
- `bar-chart` - Analytics
- `clipboard` - Assignments
- `users` - Students
- `gear`/`settings` - Settings

### Especificações

- **Tamanho padrão**: 24px
- **Cor padrão**: #6c757d
- **Cor ativo/hover**: #1132d4
- **Stroke-width**: 1.5px

### Uso

```html
<!-- Ícone padrão -->
<svg class="icon">...</svg>

<!-- Ícone ativo/hover -->
<svg class="icon icon-active">...</svg>
```

## Componentes Compostos

### Formulário Completo

```html
<form class="space-y-4">
  <!-- Nome -->
  <div>
    <label for="name" class="form-label">Nome do Estudante</label>
    <input type="text" id="name" class="form-input" placeholder="Digite o nome..."/>
  </div>

  <!-- E-mail com ícone -->
  <div class="relative">
    <label for="email" class="form-label">E-mail</label>
    <div class="relative">
      <svg class="form-input-icon"><!-- ícone email --></svg>
      <input type="email" id="email" class="form-input form-input-with-icon" placeholder="email@exemplo.com"/>
    </div>
  </div>

  <!-- Botões -->
  <div class="flex gap-3 justify-end">
    <button type="button" class="btn-secondary">Cancelar</button>
    <button type="submit" class="btn-primary">Salvar</button>
  </div>
</form>
```

### Card com Badge de Status

```html
<div class="card">
  <div class="flex items-start justify-between mb-4">
    <h3 class="text-heading-3">Matemática Avançada</h3>
    <span class="badge-mastered">
      <span class="badge-dot badge-dot-success"></span>
      Mastered
    </span>
  </div>
  <p class="text-body text-text-secondary">
    Completado com 95% de aproveitamento
  </p>
</div>
```

### Lista de Ações com Botões

```html
<div class="flex gap-3">
  <button class="btn-primary flex items-center gap-2">
    <span>+</span>
    Novo Assignment
  </button>
  <button class="btn-outline">Filtrar</button>
  <button class="btn-outline">Exportar</button>
</div>
```

## Regras de Uso

### Botões
1. ✅ Apenas 1 botão Primary por seção
2. ✅ Primary pode ter ícone "+" à esquerda
3. ✅ Destructive é sempre texto puro, sem fundo
4. ✅ Usar btn-outline para ações neutras
5. ❌ Nunca usar mais de 1 Primary na mesma área visual

### Inputs
1. ✅ Label sempre acima do campo
2. ✅ Placeholder com instruções curtas
3. ✅ Ícones à esquerda quando relevante
4. ✅ Read-only com fundo #f8f9fa
5. ✅ Focus com ring azul de 3px

### Badges
1. ✅ Sempre com borda pill (rounded-full)
2. ✅ Dot colorido à esquerda (exceto Processing)
3. ✅ Texto em uppercase
4. ✅ Usar cores semânticas corretas

### Toggle
1. ✅ Label sempre à direita
2. ✅ Animação suave (200ms)
3. ✅ Cores consistentes (azul ativo, cinza inativo)

## Acessibilidade

- ✅ Usar `role="switch"` em toggles
- ✅ Usar `aria-checked` em toggles
- ✅ Labels com `for` vinculados aos inputs
- ✅ Botões com texto descritivo
- ✅ Contraste adequado em todos os elementos
