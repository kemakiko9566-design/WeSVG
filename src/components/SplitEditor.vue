<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore } from '@/stores/uiStore'
import { canvasToHtml, htmlToCanvas } from '@/editor/htmlParser'
import { nodeMapper } from '@/editor/nodeMapper'
import CanvasViewport from '@/components/CanvasViewport.vue'
import MonacoEditor from '@/components/MonacoEditor.vue'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const htmlCode = ref('')
const highlightLine = ref<number | null>(null)

// Generate HTML from canvas
function syncCanvasToCode() {
  if (!canvasStore.canvas) return
  htmlCode.value = canvasToHtml(canvasStore.canvas)
}

// When layers change, regenerate HTML
watch(() => canvasStore.canvas?.layers, () => {
  syncCanvasToCode()
}, { deep: true, immediate: true })

// When user clicks on canvas, highlight the corresponding line
function onCanvasLayerSelect(layerId: string) {
  const mapping = nodeMapper.getByLayerId(layerId)
  if (!mapping) return
  // Find line by searching for data-layer-id
  const lines = htmlCode.value.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`data-layer-id="${layerId}"`)) {
      highlightLine.value = i + 1
      return
    }
  }
}

// When user clicks a code line, highlight canvas layer
function onCodeLineClick(line: number) {
  const lines = htmlCode.value.split('\n')
  const code = lines[line - 1] ?? ''
  const match = code.match(/data-layer-id="([^"]+)"/)
  if (match) {
    const layerId = match[1]
    // Will be handled by CanvasViewport via store
    uiStore.setHighlightLayer(layerId)
    setTimeout(() => uiStore.setHighlightLayer(null), 1500)
  }
}

// When code changes, re-import to canvas
let codeDirty = false
function onCodeChange(val: string) {
  htmlCode.value = val
  codeDirty = true
}

// Debounced re-import: when user stops editing for 500ms
watch(htmlCode, (val) => {
  if (!codeDirty) return
  const timer = setTimeout(() => {
    codeDirty = false
    const result = htmlToCanvas(val)
    if (result.layers.length > 0 && canvasStore.canvas) {
      canvasStore.canvas.layers = result.layers
    }
  }, 500)
  return () => clearTimeout(timer)
})
</script>

<template>
  <div class="split-editor" :class="uiStore.editorMode">
    <!-- Canvas side -->
    <div v-if="uiStore.editorMode === 'design' || uiStore.editorMode === 'split'" class="split-canvas">
      <CanvasViewport @layer-select="onCanvasLayerSelect" />
    </div>

    <!-- Code side -->
    <div v-if="uiStore.editorMode === 'split' || uiStore.editorMode === 'code'" class="split-code">
      <div class="code-header">
        <span class="code-tab">HTML</span>
      </div>
      <MonacoEditor
        :modelValue="htmlCode"
        language="html"
        :highlightLine="highlightLine"
        @update:modelValue="onCodeChange"
        @line-click="onCodeLineClick"
      />
    </div>

    <!-- Code mode full width -->
    <div v-if="uiStore.editorMode === 'code'" class="split-code-full">
      <MonacoEditor
        :modelValue="htmlCode"
        language="html"
        :highlightLine="highlightLine"
        @update:modelValue="onCodeChange"
        @line-click="onCodeLineClick"
      />
    </div>

    <!-- AI mode -->
    <div v-if="uiStore.editorMode === 'ai'" class="ai-panel">
      <div class="ai-chat">
        <div class="ai-header">AI Assistant</div>
        <div class="ai-messages">
          <div class="ai-placeholder">Describe what you want to build...</div>
        </div>
        <div class="ai-input-bar">
          <input type="text" placeholder="Type your prompt..." class="ai-input" />
          <button class="ai-send">Generate</button>
        </div>
      </div>
      <div class="ai-preview">
        <CanvasViewport />
      </div>
    </div>
  </div>
</template>

<style scoped>
.split-editor {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}

.split-editor.design .split-canvas {
  flex: 1;
}

.split-editor.split .split-canvas {
  flex: 1;
  border-right: 1px solid var(--border-primary);
}

.split-editor.split .split-code {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.split-editor.code .split-code-full {
  flex: 1;
}

.code-header {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  background: #252526;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.code-tab {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  padding: 4px 12px;
  background: #1e1e1e;
  border-radius: 4px 4px 0 0;
}

/* AI Mode */
.ai-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.ai-chat {
  height: 40%;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
}

.ai-header {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.ai-placeholder {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  text-align: center;
  padding-top: var(--space-8);
}

.ai-input-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.ai-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.ai-send {
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.ai-preview {
  flex: 1;
  overflow: hidden;
}
</style>
