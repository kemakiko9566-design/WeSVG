<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useAnimationStore } from '@/stores/animationStore'
import { layerManager } from '@/layer/LayerManager'

const emit = defineEmits<{
  'remove-bg': [layerId: string]
  crop: [layerId: string]
}>()

const canvasStore = useCanvasStore()
const animationStore = useAnimationStore()

const selectedLayer = computed(() => {
  if (!animationStore.selectedLayerId) return null
  return canvasStore.getLayers().find((l) => l.id === animationStore.selectedLayerId) ?? null
})

const isImage = computed(() => {
  const t = selectedLayer.value?.type
  return t === 'image' || t === 'gif'
})

function toggleLock() {
  if (!selectedLayer.value) return
  layerManager.toggleLock(selectedLayer.value.id)
}

function deleteLayer() {
  if (!selectedLayer.value) return
  layerManager.removeLayer(selectedLayer.value.id)
}

function duplicateLayer() {
  if (!selectedLayer.value) return
  const l = selectedLayer.value
  const copy = layerManager.createLayer(l.type, {
    ...l,
    name: l.name + ' Copy',
    zIndex: undefined, // auto-assign next
  })
  // Copy transform
  copy.transform = { ...l.transform }
  copy.style = { ...l.style }
  if (l.asset) copy.asset = { ...l.asset }
  layerManager.addLayer(copy)
}

function rotateLayer() {
  if (!selectedLayer.value) return
  const t = selectedLayer.value.transform
  canvasStore.updateLayer(selectedLayer.value.id, {
    transform: { ...t, rotation: (t.rotation + 90) % 360 },
  })
}
</script>

<template>
  <div v-if="selectedLayer" class="floating-toolbar" @mousedown.stop>
    <button class="tool-item" @click="toggleLock" :title="selectedLayer.locked ? 'Unlock' : 'Lock'">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    </button>

    <div class="tool-divider"></div>

    <button class="tool-item" @click="duplicateLayer" title="Duplicate">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    </button>

    <button class="tool-item" @click="deleteLayer" title="Delete">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    </button>

    <div class="tool-divider"></div>

    <button class="tool-item" @click="rotateLayer" title="Rotate 90°">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    </button>

    <template v-if="isImage">
      <div class="tool-divider"></div>
      <button
        class="tool-item accent"
        @click="emit('remove-bg', selectedLayer.id)"
        title="Remove Background"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2a4 4 0 014 4c0 2-2 3-4 5-2-2-4-3-4-5a4 4 0 014-4z" />
          <path d="M12 10v4" />
          <path d="M12 18v.01" />
        </svg>
        <span>Remove BG</span>
      </button>
      <button class="tool-item" @click="emit('crop', selectedLayer.id)" title="Crop">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6.13 1L6 16a2 2 0 002 2h15" />
          <path d="M1 6.13L16 6a2 2 0 012 2v15" />
        </svg>
      </button>
    </template>
  </div>
</template>

<style scoped>
.floating-toolbar {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tool-item:hover {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
}

.tool-item.accent {
  color: var(--accent);
}

.tool-item.accent:hover {
  background: var(--accent-muted);
}

.tool-divider {
  width: 1px;
  height: 18px;
  background: var(--border-primary);
  margin: 0 2px;
}
</style>
