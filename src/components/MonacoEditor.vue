<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  modelValue: string
  language?: string
  highlightLine?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'line-click': [line: number]
}>()

const containerRef = ref<HTMLDivElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let decorations: string[] = []

onMounted(() => {
  if (!containerRef.value) return

  // Register WeChat HTML language
  monaco.languages.register({ id: 'wechat-html' })

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language ?? 'html',
    theme: 'vs-dark',
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
    lineNumbers: 'on',
    minimap: { enabled: true, scale: 1 },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    folding: true,
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    padding: { top: 12 },
  })

  // Listen for code changes
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor!.getValue())
  })

  // Listen for click on gutter/line to get line number
  editor.onMouseDown((e) => {
    if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
        e.target.type === monaco.editor.MouseTargetType.CONTENT_LINE) {
      const line = e.target.position?.lineNumber
      if (line) {
        emit('line-click', line)
      }
    }
  })
})

// Sync external value changes into editor
watch(() => props.modelValue, (val) => {
  if (editor && editor.getValue() !== val) {
    editor.setValue(val)
  }
})

// Highlight a specific line
watch(() => props.highlightLine, (line) => {
  if (!editor) return
  // Clear old decorations
  decorations = editor.deltaDecorations(decorations, [])

  if (line !== null && line !== undefined) {
    decorations = editor.deltaDecorations(decorations, [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'code-highlight-line',
          linesDecorationsClassName: 'code-highlight-gutter',
        },
      },
    ])
    editor.revealLineInCenter(line)

    // Auto-clear after 1500ms
    setTimeout(() => {
      decorations = editor.deltaDecorations(decorations, [])
    }, 1500)
  }
})

onUnmounted(() => {
  editor?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="monaco-container"></div>
</template>

<style>
.monaco-container {
  width: 100%;
  height: 100%;
}

/* Highlight decoration */
.code-highlight-line {
  background: rgba(255, 106, 0, 0.15) !important;
  border-left: 3px solid #ff6a00;
}

.code-highlight-gutter {
  background: #ff6a00;
  width: 3px !important;
}
</style>
