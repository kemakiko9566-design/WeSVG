<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'

const canvasStore = useCanvasStore()

const layerCount = computed(() => canvasStore.canvas?.layers.length ?? 0)
const canvasSize = computed(() => {
  if (!canvasStore.canvas) return '—'
  return `${canvasStore.canvas.width} × ${canvasStore.canvas.height}`
})
const deviceMode = computed(() => {
  if (!canvasStore.canvas) return '—'
  const mode = canvasStore.canvas.viewMode
  return mode.charAt(0).toUpperCase() + mode.slice(1)
})
const zoomLevel = '100%'
const renderStatus = 'Ready'
</script>

<template>
  <footer class="statusbar">
    <div class="statusbar-left">
      <span class="status-item">Zoom: {{ zoomLevel }}</span>
      <span class="separator"></span>
      <span class="status-item">{{ canvasSize }}</span>
      <span class="separator"></span>
      <span class="status-item">{{ deviceMode }}</span>
    </div>
    <div class="statusbar-right">
      <span class="status-item">{{ layerCount }} layers</span>
      <span class="separator"></span>
      <span class="status-item status-dot">{{ renderStatus }}</span>
    </div>
  </footer>
</template>

<style scoped>
.statusbar {
  height: var(--statusbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  background: var(--bg-panel);
  border-top: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-item {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--weight-medium);
}

.separator {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--border-primary);
}

.status-dot {
  position: relative;
  padding-left: 10px;
}

.status-dot::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--success);
}
</style>
