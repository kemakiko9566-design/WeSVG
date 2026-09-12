<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { DeviceModeWidths } from '@/types'
import type { DeviceMode } from '@/types'

const emit = defineEmits<{
  close: []
}>()

const canvasStore = useCanvasStore()

const currentMode = ref<DeviceMode>('phone')

const modes: { key: DeviceMode; label: string }[] = [
  { key: 'phone', label: 'Phone' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'fold', label: 'Fold' },
  { key: 'desktop', label: 'Desktop' },
]

const previewWidth = computed(() => DeviceModeWidths[currentMode.value])
const scaleRatio = computed(() => {
  return Math.min(375 / previewWidth.value, 1)
})
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="preview-dialog">
      <div class="dialog-header">
        <h2>Device Preview</h2>
        <div class="mode-tabs">
          <button
            v-for="mode in modes"
            :key="mode.key"
            class="mode-tab"
            :class="{ active: currentMode === mode.key }"
            @click="currentMode = mode.key"
          >
            {{ mode.label }}
          </button>
        </div>
        <button class="btn-close" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="preview-body">
        <div class="phone-frame" :style="{ width: `${previewWidth}px`, transform: `scale(${scaleRatio})` }">
          <div class="frame-notch"></div>
          <iframe class="preview-iframe" srcdoc="" title="Preview"></iframe>
        </div>
      </div>

      <div class="preview-footer">
        <span class="info">{{ previewWidth }}px · {{ Math.round(scaleRatio * 100) }}%</span>
        <button class="btn-close-preview" @click="emit('close')">Close</button>
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

.preview-dialog {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  width: 800px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

.dialog-header h2 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.mode-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: var(--radius-md);
}

.mode-tab {
  padding: 5px 14px;
  border-radius: 5px;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.mode-tab.active {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
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

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  overflow: auto;
  background: var(--bg-primary);
}

.phone-frame {
  background: #0d0d0d;
  border-radius: 20px;
  overflow: hidden;
  transform-origin: top center;
  border: 1px solid var(--border-primary);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.frame-notch {
  height: 20px;
  background: #0d0d0d;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 600px;
  border: none;
  display: block;
  background: white;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--border-primary);
}

.info {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.btn-close-preview {
  padding: 5px 16px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition: background var(--transition-fast);
}

.btn-close-preview:hover {
  background: var(--accent-hover);
}
</style>
