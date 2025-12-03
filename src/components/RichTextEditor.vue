<template>
  <div class="rich-text-editor">
    <div v-if="editable && editor" class="editor-toolbar border-b p-2 flex flex-wrap gap-1" style="border-color: var(--color-border);">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('bold') ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('bold') ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        <strong>B</strong>
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('italic') ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('italic') ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        <em>I</em>
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('heading', { level: 2 }) ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('heading', { level: 2 }) ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        H2
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('heading', { level: 3 }) ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('heading', { level: 3 }) ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        H3
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('bulletList') ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('bulletList') ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        •
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('orderedList') ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('orderedList') ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        1.
      </button>
      <button
        @click="setLink"
        class="px-3 py-1 text-sm border rounded transition-colors"
        :style="{
          backgroundColor: editor.isActive('link') ? 'var(--color-bg-tertiary)' : 'transparent',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }"
        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
        @mouseleave="$event.target.style.backgroundColor = editor.isActive('link') ? 'var(--color-bg-tertiary)' : 'transparent'"
        type="button"
      >
        🔗
      </button>
    </div>
    <EditorContent :editor="editor" :class="{ 'border rounded-b': editable }" :style="editable ? { borderColor: 'var(--color-border)' } : {}" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'Start writing...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 hover:underline'
      }
    })
  ],
  content: props.modelValue,
  editable: props.editable,
  placeholder: props.placeholder,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

const setLink = () => {
  if (!editor.value) return
  const url = window.prompt('Enter URL:')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  } else {
    editor.value.chain().focus().unsetLink().run()
  }
}

// Watch for external changes to modelValue
import { watch } from 'vue'
watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value)
  }
})
</script>

<style>
.rich-text-editor .ProseMirror {
  outline: none;
  min-height: 200px;
  padding: 1rem;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.rich-text-editor .ProseMirror p {
  margin-bottom: 1rem;
}

.rich-text-editor .ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.rich-text-editor .ProseMirror h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}

.rich-text-editor .ProseMirror ul,
.rich-text-editor .ProseMirror ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.rich-text-editor .ProseMirror ul {
  list-style-type: disc;
}

.rich-text-editor .ProseMirror ol {
  list-style-type: decimal;
}

.rich-text-editor .ProseMirror li {
  margin-bottom: 0.5rem;
}

.rich-text-editor .ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
}

.rich-text-editor .ProseMirror a:hover {
  color: #1d4ed8;
}

.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-tertiary);
  pointer-events: none;
  height: 0;
}
</style>

