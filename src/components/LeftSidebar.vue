<script setup lang="ts">
import { ref } from 'vue'
import { layerManager } from '@/layer/LayerManager'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore } from '@/stores/uiStore'
import { useBackgroundStore } from '@/stores/backgroundStore'
import type { GridMode } from '@/stores/uiStore'

const props = defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const bgStore = useBackgroundStore()

const sections = ref([
  { id: 'assets', label: 'Assets', expanded: true },
  { id: 'grid', label: 'Grid & Snap', expanded: true },
  { id: 'background', label: 'Background', expanded: false },
  { id: 'components', label: 'Components', expanded: false },
  { id: 'ai', label: 'AI Assistant', expanded: false },
])

function toggleSection(id: string) {
  const s = sections.value.find((x) => x.id === id)
  if (s) s.expanded = !s.expanded
}

async function addImageLayer() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,.gif,.svg'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Use original file URL directly (skip compression for reliability)
    const originalUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const layerType = file.type.includes('gif')
        ? ('gif' as const)
        : file.type.includes('svg')
          ? ('svg' as const)
          : ('image' as const)
      const layer = layerManager.createAssetLayer(
        layerType,
        {
          id: `asset_${Date.now()}`,
          url: originalUrl,
          mimeType: file.type,
          size: file.size,
          width: img.width,
          height: img.height,
        },
        { name: file.name },
      )
      layerManager.addLayer(layer)
    }
    img.src = originalUrl
  }
  input.click()
}

function addTextLayer() {
  const layer = layerManager.createTextLayer('Double-click to edit', {
    transform: {
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    },
  })
  layerManager.addLayer(layer)
}

function addShapeLayer() {
  const layer = layerManager.createShapeLayer('rect', {
    transform: {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    },
    style: { fill: '#ff6a00', borderRadius: 8 },
  })
  layerManager.addLayer(layer)
}

function setGrid(mode: GridMode) {
  uiStore.setGridMode(mode)
}

function pickBgImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    bgStore.setImage(URL.createObjectURL(file))
  }
  input.click()
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <button
      class="toggle-btn"
      @click="emit('toggle')"
      :title="collapsed ? 'Expand panel' : 'Collapse panel'"
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
        <polyline v-if="!collapsed" points="15 18 9 12 15 6" />
        <polyline v-else points="9 18 15 12 9 6" />
      </svg>
    </button>

    <div class="sidebar-inner">
      <!-- Assets -->
      <div class="sidebar-section">
        <button class="section-header" @click="toggleSection('assets')">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ rotated: sections.find((s) => s.id === 'assets')?.expanded }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Assets</span>
        </button>
        <div v-if="sections.find((s) => s.id === 'assets')?.expanded" class="section-content">
          <button class="tool-btn" @click="addImageLayer">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>Image</span>
          </button>
          <button class="tool-btn" @click="addTextLayer">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            <span>Text</span>
          </button>
          <button class="tool-btn" @click="addShapeLayer">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span>Shape</span>
          </button>
        </div>
      </div>

      <!-- Grid & Snap -->
      <div class="sidebar-section">
        <button class="section-header" @click="toggleSection('grid')">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ rotated: sections.find((s) => s.id === 'grid')?.expanded }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Grid & Snap</span>
        </button>
        <div v-if="sections.find((s) => s.id === 'grid')?.expanded" class="section-content">
          <div class="grid-options">
            <button
              class="grid-btn"
              :class="{ active: uiStore.gridMode === 'none' }"
              @click="setGrid('none')"
            >
              None
            </button>
            <button
              class="grid-btn"
              :class="{ active: uiStore.gridMode === 'dot' }"
              @click="setGrid('dot')"
            >
              Dots
            </button>
            <button
              class="grid-btn"
              :class="{ active: uiStore.gridMode === 'grid' }"
              @click="setGrid('grid')"
            >
              Grid
            </button>
          </div>
          <label class="snap-toggle">
            <input type="checkbox" :checked="uiStore.snapEnabled" @change="uiStore.toggleSnap()" />
            <span>Snap to grid</span>
          </label>
        </div>
      </div>

      <!-- Background -->
      <div class="sidebar-section">
        <button class="section-header" @click="toggleSection('background')">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ rotated: sections.find((s) => s.id === 'background')?.expanded }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Background</span>
        </button>
        <div v-if="sections.find((s) => s.id === 'background')?.expanded" class="section-content">
          <div class="grid-options">
            <button
              class="grid-btn"
              :class="{ active: bgStore.type === 'color' }"
              @click="bgStore.setColor('#171717')"
            >
              Color
            </button>
            <button
              class="grid-btn"
              :class="{ active: bgStore.type === 'image' }"
              @click="pickBgImage"
            >
              Image
            </button>
          </div>
          <div class="prop-row" style="margin-top: 8px">
            <label class="prop-label">Color</label>
            <div class="color-input">
              <input
                type="color"
                :value="bgStore.color"
                @input="bgStore.setColor(($event.target as HTMLInputElement).value)"
              />
              <span>{{ bgStore.color }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Components -->
      <div class="sidebar-section">
        <button class="section-header" @click="toggleSection('components')">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ rotated: sections.find((s) => s.id === 'components')?.expanded }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Components</span>
        </button>
        <div v-if="sections.find((s) => s.id === 'components')?.expanded" class="section-content">
          <div class="empty-hint">No saved components yet</div>
        </div>
      </div>

      <div class="sidebar-section">
        <button class="section-header" @click="toggleSection('ai')">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ rotated: sections.find((s) => s.id === 'ai')?.expanded }"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>AI Assistant</span>
        </button>
        <div v-if="sections.find((s) => s.id === 'ai')?.expanded" class="section-content">
          <div class="ai-card">
            <svg
              width="20"
              height="20"
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
            <span>Ask AI to create content</span>
            <span class="ai-sub">Describe what you want to build</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: relative;
  width: var(--sidebar-width);
  background: var(--bg-panel);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-shrink: 0;
  transition: width var(--transition-base);
  overflow: hidden;
}
.sidebar.collapsed {
  width: 28px;
}
.toggle-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 20px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: var(--bg-panel);
  border: 1px solid var(--border-primary);
  border-right: none;
  border-radius: 4px 0 0 4px;
  transition: color var(--transition-fast);
}
.toggle-btn:hover {
  color: var(--text-primary);
}
.sidebar-inner {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-section {
  border-bottom: 1px solid var(--border-subtle);
}
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  transition: color var(--transition-fast);
}
.section-header:hover {
  color: var(--text-secondary);
}
.section-header svg {
  transition: transform var(--transition-fast);
  opacity: 0.5;
}
.section-header svg.rotated {
  transform: rotate(90deg);
}
.section-content {
  padding: 0 var(--space-3) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
  width: 100%;
  text-align: left;
}
.tool-btn:hover {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
}

/* ---- Grid & Snap ---- */
.grid-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  margin-bottom: var(--space-2);
}
.grid-btn {
  padding: 5px 0;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-fast);
}
.grid-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-muted);
}
.grid-btn:hover {
  color: var(--text-primary);
}

.snap-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}
.snap-toggle input {
  accent-color: var(--accent);
}

.empty-hint {
  padding: var(--space-4) var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-style: italic;
}

.ai-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4);
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ai-card:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}
.ai-sub {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--weight-regular);
}
</style>
