# Guia Tailwind CSS - EduScanAI

## Configuração

O Tailwind CSS está configurado e pronto para uso no projeto.

## Cores Personalizadas

O tema foi configurado com cores personalizadas:

### Primary (Verde)
```html
<div class="bg-primary-600 text-white">...</div>
<div class="text-primary-700">...</div>
```

Disponível nas variações: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Secondary (Cinza/Azulado)
```html
<div class="bg-secondary-600 text-white">...</div>
<div class="text-secondary-700">...</div>
```

Disponível nas variações: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

## Classes Customizadas

### Botões

#### `.btn-primary`
```html
<button class="btn-primary">Botão Primário</button>
```

#### `.btn-secondary`
```html
<button class="btn-secondary">Botão Secundário</button>
```

### Card
```html
<div class="card">
  <h3>Título do Card</h3>
  <p>Conteúdo do card</p>
</div>
```

### Input
```html
<input type="text" class="input" placeholder="Digite algo..." />
```

### Text Gradient
```html
<h1 class="text-gradient">Texto com Gradiente</h1>
```

## Exemplos de Uso

### Grid Responsivo
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Flexbox
```html
<div class="flex items-center justify-between">
  <span>Esquerda</span>
  <span>Direita</span>
</div>
```

### Espaçamento
```html
<!-- Padding -->
<div class="p-4">Padding em todos os lados</div>
<div class="px-4 py-2">Padding horizontal e vertical</div>

<!-- Margin -->
<div class="m-4">Margin em todos os lados</div>
<div class="mx-auto">Centralizar horizontalmente</div>
```

### Tipografia
```html
<h1 class="text-4xl font-bold">Título Grande</h1>
<p class="text-lg text-gray-600">Parágrafo com texto maior</p>
<small class="text-sm text-gray-500">Texto pequeno</small>
```

### Cores
```html
<div class="bg-white text-gray-900">Fundo branco, texto escuro</div>
<div class="bg-primary-600 text-white">Fundo primário, texto branco</div>
```

### Bordas e Sombras
```html
<div class="rounded-lg border border-gray-300 shadow-md">
  Card com borda e sombra
</div>
```

### Transições
```html
<button class="transition-all duration-200 hover:scale-105">
  Botão com animação
</button>
```

## Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Exemplo de uso responsivo:
```html
<div class="text-sm md:text-base lg:text-lg">
  Texto que muda de tamanho conforme a tela
</div>
```

## Recursos Úteis

- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind Play](https://play.tailwindcss.com/) - Editor online
- [Headless UI](https://headlessui.com/) - Componentes acessíveis
- [Heroicons](https://heroicons.com/) - Ícones oficiais

## Dicas

1. Use o VS Code com a extensão "Tailwind CSS IntelliSense" para autocompletar
2. Utilize `@apply` no CSS apenas quando realmente necessário
3. Prefira utility classes no template ao invés de CSS customizado
4. Use `class` no lugar de `:class` quando não houver lógica condicional
5. Combine classes com `cn()` utility (instalar `clsx` e `tailwind-merge` se necessário)
