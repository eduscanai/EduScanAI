<template>
  <div>
    <label v-if="rotulo" class="form-label">{{ rotulo }}</label>
    <ClientOnly>
      <div class="border border-gray-300 rounded-lg overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
        <!-- Toolbar -->
        <div v-if="editor" class="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
          <button
            v-for="btn in botoesToolbar"
            :key="btn.acao"
            @click="btn.executar()"
            :class="[
              'p-1.5 rounded text-sm font-medium transition-colors',
              btn.ativo?.() ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            ]"
            type="button"
            :title="btn.titulo"
          >
            <span v-html="btn.icone"></span>
          </button>
        </div>

        <!-- Editor -->
        <EditorContent :editor="editor" class="editor-rico-content" />
      </div>
      <template #fallback>
        <div class="form-input min-h-[150px] bg-gray-50 animate-pulse rounded-lg"></div>
      </template>
    </ClientOnly>
    <p v-if="erro" class="mt-1 text-xs text-critical-500">{{ erro }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  modelValue?: string
  rotulo?: string
  textoReservado?: string
  erro?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  textoReservado: 'Escreva aqui...'
})

const emit = defineEmits<{
  'update:modelValue': [valor: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.textoReservado
    })
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none p-4 min-h-[150px] focus:outline-none'
    }
  },
  onUpdate: ({ editor: e }) => {
    emit('update:modelValue', e.getHTML())
  }
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const botoesToolbar = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    {
      acao: 'bold',
      titulo: 'Negrito',
      icone: '<strong>B</strong>',
      ativo: () => e.isActive('bold'),
      executar: () => e.chain().focus().toggleBold().run()
    },
    {
      acao: 'italic',
      titulo: 'Itálico',
      icone: '<em>I</em>',
      ativo: () => e.isActive('italic'),
      executar: () => e.chain().focus().toggleItalic().run()
    },
    {
      acao: 'strike',
      titulo: 'Tachado',
      icone: '<s>S</s>',
      ativo: () => e.isActive('strike'),
      executar: () => e.chain().focus().toggleStrike().run()
    },
    {
      acao: 'h2',
      titulo: 'Título',
      icone: 'H2',
      ativo: () => e.isActive('heading', { level: 2 }),
      executar: () => e.chain().focus().toggleHeading({ level: 2 }).run()
    },
    {
      acao: 'h3',
      titulo: 'Subtítulo',
      icone: 'H3',
      ativo: () => e.isActive('heading', { level: 3 }),
      executar: () => e.chain().focus().toggleHeading({ level: 3 }).run()
    },
    {
      acao: 'bulletList',
      titulo: 'Lista',
      icone: '• —',
      ativo: () => e.isActive('bulletList'),
      executar: () => e.chain().focus().toggleBulletList().run()
    },
    {
      acao: 'orderedList',
      titulo: 'Lista numerada',
      icone: '1.',
      ativo: () => e.isActive('orderedList'),
      executar: () => e.chain().focus().toggleOrderedList().run()
    },
    {
      acao: 'blockquote',
      titulo: 'Citação',
      icone: '❝',
      ativo: () => e.isActive('blockquote'),
      executar: () => e.chain().focus().toggleBlockquote().run()
    }
  ]
})
</script>

<style>
.editor-rico-content .ProseMirror {
  min-height: 150px;
  padding: 1rem;
  outline: none;
}

.editor-rico-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.editor-rico-content .ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.editor-rico-content .ProseMirror h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.editor-rico-content .ProseMirror ul {
  list-style: disc;
  padding-left: 1.5rem;
}

.editor-rico-content .ProseMirror ol {
  list-style: decimal;
  padding-left: 1.5rem;
}

.editor-rico-content .ProseMirror blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  color: #6b7280;
  margin: 0.5rem 0;
}

.editor-rico-content .ProseMirror p {
  margin: 0.25rem 0;
}
</style>
