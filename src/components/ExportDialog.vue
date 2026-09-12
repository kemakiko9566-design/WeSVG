<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useProjectStore } from '@/stores/projectStore'
import { WechatRenderer } from '@/renderer/WechatRenderer'
import { SvgGenerator } from '@/renderer/SvgGenerator'
import { ClipboardPublisher } from '@/publisher/ClipboardPublisher'
import { FileExporter } from '@/publisher/FileExporter'
import { OutputValidator } from '@/ai/OutputValidator'

const emit = defineEmits<{
  close: []
}>()

const canvasStore = useCanvasStore()
const projectStore = useProjectStore()
const renderer = new WechatRenderer()
const svgGenerator = new SvgGenerator()
const clipboard = new ClipboardPublisher()
const fileExporter = new FileExporter()
const validator = new OutputValidator()

const outputHtml = ref('')
const outputSvg = ref('')
const copyStatus = ref<'idle' | 'copied' | 'error'>('idle')
const showPreview = ref(false)
const validationScore = ref(0)

function generateHtml() {
  if (!canvasStore.canvas) return
  const result = renderer.render(canvasStore.canvas)
  outputHtml.value = result.html
  const v = validator.validate(result.html)
  validationScore.value = v.score
  showPreview.value = true
}

function generateSvg() {
  if (!canvasStore.canvas) return
  outputSvg.value = svgGenerator.generate(canvasStore.canvas)
  showPreview.value = true
}

async function copyHtml() {
  generateHtml()
  if (!outputHtml.value) return
  const result = await clipboard.copy(outputHtml.value)
  copyStatus.value = result.success ? 'copied' : 'error'
  setTimeout(() => {
    copyStatus.value = 'idle'
  }, 2000)
}

function downloadHtml() {
  generateHtml()
  if (!outputHtml.value) return
  const result = fileExporter.exportHtml(outputHtml.value)
  fileExporter.download(result)
}

function downloadSvg() {
  generateSvg()
  if (!outputSvg.value) return
  const result = fileExporter.exportSvg(outputSvg.value)
  fileExporter.download(result)
}

function downloadProject() {
  if (!projectStore.currentProject) return
  const result = fileExporter.exportJson(
    JSON.stringify(projectStore.currentProject, null, 2),
    `${projectStore.currentProject.name}.json`,
  )
  fileExporter.download(result)
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h2>Export</h2>
        <button class="btn-close" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="dialog-body">
        <div class="export-actions">
          <button class="export-btn" @click="copyHtml">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
            <span class="export-label">Copy HTML</span>
            <span class="export-desc">Copy to clipboard</span>
          </button>

          <button class="export-btn" @click="downloadHtml">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="export-label">Download HTML</span>
            <span class="export-desc">Export .html file</span>
          </button>

          <button class="export-btn" @click="downloadSvg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="8 12 12 16 16 12"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
            </svg>
            <span class="export-label">Download SVG</span>
            <span class="export-desc">Export .svg file</span>
          </button>

          <button class="export-btn" @click="downloadProject">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="export-label">Export Project</span>
            <span class="export-desc">Export .json file</span>
          </button>
        </div>

        <div v-if="copyStatus === 'copied'" class="status-badge success">
          Copied to clipboard!
        </div>
        <div v-if="copyStatus === 'error'" class="status-badge error">
          Copy failed, please try again
        </div>

        <div v-if="showPreview && outputHtml" class="preview-section">
          <div class="preview-header">
            <h3>Code Preview</h3>
            <span class="score-badge">{{ validationScore }}/100</span>
          </div>
          <pre class="code-preview"><code>{{ outputHtml }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  width: 720px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

.dialog-header h2 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
}

.dialog-body {
  padding: var(--space-6);
}

.export-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.export-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.export-btn:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
  color: var(--text-primary);
}

.export-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.export-desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.status-badge {
  text-align: center;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-4);
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.preview-section {
  border-top: 1px solid var(--border-primary);
  padding-top: var(--space-4);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.preview-header h3 {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
}

.score-badge {
  font-size: var(--text-xs);
  padding: 2px 8px;
  background: var(--accent-muted);
  color: var(--accent);
  border-radius: 10px;
  font-weight: var(--weight-semibold);
}

.code-preview {
  background: #111;
  color: #d4d4d4;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  border: 1px solid var(--border-primary);
}
</style>
