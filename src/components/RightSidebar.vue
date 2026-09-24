<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useAnimationStore } from '@/stores/animationStore'
import { useProjectStore } from '@/stores/projectStore'
import { AnimationRegistry } from '@/animation/AnimationRegistry'
import { layerManager } from '@/layer/LayerManager'
import { useUIStore } from '@/stores/uiStore'
import { getAssetList, deleteAsset, loadAssetAsUrl } from '@/utils/assetManager'
import type { AnyLayer } from '@/types'

const props = defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const canvasStore = useCanvasStore()
const animationStore = useAnimationStore()
const projectStore = useProjectStore()
const uiStore = useUIStore()

const activeTab = ref<'properties' | 'layers' | 'assets'>('layers')
const layers = ref(projectStore.getSortedLayers())
const assets = ref<{ id: string; meta: any }[]>([])
const editingLayerId = ref<string | null>(null)
const editName = ref('')
const dragOverId = ref<string | null>(null)

// Selection state
const selectedLayerId = computed(() => animationStore.selectedLayerId)
const selectedLayer = computed(() => {
  if (!selectedLayerId.value) return null
  return canvasStore.getLayers().find((l) => l.id === selectedLayerId.value)
})

// Keep layers in sync
projectStore.$subscribe(() => {
  layers.value = projectStore.getSortedLayers()
})

// Animation presets
const animationPresets = AnimationRegistry.getAllPresets()

// ================================================================
// LAYERS TAB
// ================================================================

function selectLayer(id: string) {
  animationStore.selectLayer(id)
}

function toggleVisibility(id: string) {
  layerManager.toggleVisibility(id)
  layers.value = projectStore.getSortedLayers()
}

function toggleLock(id: string) {
  layerManager.toggleLock(id)
  layers.value = projectStore.getSortedLayers()
}

function startRename(id: string, name: string) {
  editingLayerId.value = id
  editName.value = name
}

function commitRename(id: string) {
  if (editName.value.trim()) {
    projectStore.updateLayer(id, { name: editName.value.trim() } as any)
    layers.value = projectStore.getSortedLayers()
  }
  editingLayerId.value = null
}

function deleteLayerById(id: string) {
  layerManager.removeLayer(id)
  layers.value = projectStore.getSortedLayers()
}

// -- Drag sorting --
function onDragStart(e: DragEvent, id: string) {
  e.dataTransfer?.setData('text/plain', id)
}

function onDragOver(e: DragEvent, id: string) {
  e.preventDefault()
  dragOverId.value = id
}

function onDragLeave() {
  dragOverId.value = null
}

function onDrop(e: DragEvent, targetId: string) {
  e.preventDefault()
  dragOverId.value = null
  const sourceId = e.dataTransfer?.getData('text/plain')
  if (!sourceId || sourceId === targetId) return

  const sorted = projectStore.getSortedLayers()
  const sourceIdx = sorted.findIndex((l) => l.id === sourceId)
  const targetIdx = sorted.findIndex((l) => l.id === targetId)
  if (sourceIdx < 0 || targetIdx < 0) return

  // Swap zIndex values
  const sourceLayer = sorted[sourceIdx]
  const targetLayer = sorted[targetIdx]
  const tempZ = sourceLayer.zIndex
  projectStore.updateLayer(sourceLayer.id, { zIndex: targetLayer.zIndex } as any)
  projectStore.updateLayer(targetLayer.id, { zIndex: tempZ } as any)
  layers.value = projectStore.getSortedLayers()
}

// ================================================================
// PROPERTIES TAB
// ================================================================

const propSections = ref([
  { id: 'position', label: 'Position & Size', expanded: true },
  { id: 'appearance', label: 'Appearance', expanded: false },
  { id: 'animation', label: 'Animation', expanded: false },
])

function togglePropSection(id: string) {
  const s = propSections.value.find((x) => x.id === id)
  if (s) s.expanded = !s.expanded
}

function updateTransform(field: string, value: number) {
  if (!selectedLayer.value) return
  const t = { ...selectedLayer.value.transform, [field]: value }
  canvasStore.updateLayer(selectedLayer.value.id, { transform: t })
}

function updateStyle(field: string, value: string) {
  if (!selectedLayer.value) return
  const style = { ...selectedLayer.value.style, [field]: value }
  canvasStore.updateLayer(selectedLayer.value.id, { style })
}

function addAnimation(presetId: string) {
  if (!selectedLayer.value) return
  const preset = AnimationRegistry.getPreset(presetId as any)
  if (preset) {
    animationStore.addAnimation(selectedLayer.value.id, preset.preset, preset.defaultTrigger, {
      ...preset.defaultConfig,
    })
  }
}

// ================================================================
// ASSETS TAB
// ================================================================

async function loadAssets() {
  const list = await getAssetList()
  assets.value = list as any
}

function switchTab(tab: typeof activeTab.value) {
  activeTab.value = tab
  if (tab === 'assets') loadAssets()
}

async function reuseAsset(assetId: string) {
  const url = await loadAssetAsUrl(assetId)
  if (!url) return
  const img = new window.Image()
  img.onload = () => {
    const layer = layerManager.createAssetLayer(
      'image',
      {
        id: `asset_${assetId}`,
        url,
        mimeType: 'image/png',
        size: 0,
        width: img.width,
        height: img.height,
      },
      { name: `asset-${assetId.slice(-6)}` },
    )
    layer.assetId = assetId
    layerManager.addLayer(layer)
    layers.value = projectStore.getSortedLayers()
  }
  img.src = url
}

async function deleteAssetById(id: string) {
  await deleteAsset(id)
  loadAssets()
}

// Layer type icon
function layerIcon(type: string) {
  switch (type) {
    case 'image':
    case 'gif':
    case 'svg':
      return '🖼'
    case 'text':
      return '📝'
    case 'shape':
      return '⬡'
    default:
      return '📄'
  }
}
</script>

<template>
  <aside class="inspector" :class="{ collapsed }">
    <button class="toggle-btn" @click="emit('toggle')">
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
        <polyline v-if="!collapsed" points="9 18 15 12 9 6" />
        <polyline v-else points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="inspector-inner">
      <!-- Tab bar -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'layers' }"
          @click="switchTab('layers')"
        >
          Layers
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'properties' }"
          @click="switchTab('properties')"
        >
          Properties
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'assets' }"
          @click="switchTab('assets')"
        >
          Assets
        </button>
      </div>

      <!-- ================================ -->
      <!-- LAYERS TAB -->
      <!-- ================================ -->
      <div v-if="activeTab === 'layers'" class="tab-content">
        <div class="layer-count">{{ layers.length }} layers</div>
        <div class="layer-list">
          <div
            v-for="layer in [...layers].reverse()"
            :key="layer.id"
            class="layer-item"
            :class="{
              selected: selectedLayerId === layer.id,
              hidden: !layer.visible,
              locked: layer.locked,
              'drag-over': dragOverId === layer.id,
            }"
            :draggable="true"
            @dragstart="onDragStart($event, layer.id)"
            @dragover="onDragOver($event, layer.id)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, layer.id)"
            @click="selectLayer(layer.id)"
          >
            <div class="layer-drag-handle">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
            </div>
            <span class="layer-icon">{{ layerIcon(layer.type) }}</span>
            <div class="layer-name-wrap">
              <input
                v-if="editingLayerId === layer.id"
                v-model="editName"
                class="layer-rename-input"
                @blur="commitRename(layer.id)"
                @keydown.enter="commitRename(layer.id)"
                @keydown.escape="editingLayerId = null"
                @click.stop
              />
              <span v-else class="layer-name" @dblclick="startRename(layer.id, layer.name)">{{
                layer.name
              }}</span>
            </div>
            <button
              class="layer-act"
              @click.stop="toggleVisibility(layer.id)"
              :title="layer.visible ? 'Hide' : 'Show'"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="layer.visible ? 'currentColor' : 'var(--text-tertiary)'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              class="layer-act"
              @click.stop="toggleLock(layer.id)"
              :title="layer.locked ? 'Unlock' : 'Lock'"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="layer.locked ? 'var(--accent)' : 'currentColor'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </button>
          </div>
          <div v-if="layers.length === 0" class="empty-hint">Add elements from the left panel</div>
        </div>
      </div>

      <!-- ================================ -->
      <!-- PROPERTIES TAB -->
      <!-- ================================ -->
      <div v-if="activeTab === 'properties'" class="tab-content">
        <template v-if="selectedLayer">
          <!-- Position & Size -->
          <div class="prop-section">
            <button class="prop-header" @click="togglePropSection('position')">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="{ rotated: propSections.find((s) => s.id === 'position')?.expanded }"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>POSITION & SIZE</span>
            </button>
            <div v-if="propSections.find((s) => s.id === 'position')?.expanded" class="prop-body">
              <div class="prop-row">
                <div class="prop-field">
                  <label>X</label
                  ><input
                    type="number"
                    :value="selectedLayer.transform.x"
                    @input="updateTransform('x', Number(($event.target as HTMLInputElement).value))"
                  />
                </div>
                <div class="prop-field">
                  <label>Y</label
                  ><input
                    type="number"
                    :value="selectedLayer.transform.y"
                    @input="updateTransform('y', Number(($event.target as HTMLInputElement).value))"
                  />
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-field">
                  <label>W</label
                  ><input
                    type="number"
                    :value="selectedLayer.transform.width"
                    @input="
                      updateTransform('width', Number(($event.target as HTMLInputElement).value))
                    "
                  />
                </div>
                <div class="prop-field">
                  <label>H</label
                  ><input
                    type="number"
                    :value="selectedLayer.transform.height"
                    @input="
                      updateTransform('height', Number(($event.target as HTMLInputElement).value))
                    "
                  />
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-field">
                  <label>R</label
                  ><input
                    type="number"
                    :value="selectedLayer.transform.rotation"
                    @input="
                      updateTransform('rotation', Number(($event.target as HTMLInputElement).value))
                    "
                  />
                </div>
                <div class="prop-field">
                  <label>O</label
                  ><input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    :value="selectedLayer.transform.opacity"
                    @input="
                      updateTransform('opacity', Number(($event.target as HTMLInputElement).value))
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Appearance -->
          <div class="prop-section">
            <button class="prop-header" @click="togglePropSection('appearance')">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="{ rotated: propSections.find((s) => s.id === 'appearance')?.expanded }"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>APPEARANCE</span>
            </button>
            <div v-if="propSections.find((s) => s.id === 'appearance')?.expanded" class="prop-body">
              <div class="prop-row">
                <div class="prop-field">
                  <label>Fill</label>
                  <div class="color-input">
                    <input
                      type="color"
                      :value="selectedLayer.style.fill ?? '#000000'"
                      @input="updateStyle('fill', ($event.target as HTMLInputElement).value)"
                    />
                    <span>{{ selectedLayer.style.fill ?? 'none' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Animation -->
          <div class="prop-section">
            <button class="prop-header" @click="togglePropSection('animation')">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="{ rotated: propSections.find((s) => s.id === 'animation')?.expanded }"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>ANIMATION</span>
            </button>
            <div v-if="propSections.find((s) => s.id === 'animation')?.expanded" class="prop-body">
              <div
                v-for="anim in animationStore.getAnimations(selectedLayer.id)"
                :key="anim.id"
                class="anim-row"
              >
                <span>{{ anim.type }}</span>
                <span class="anim-trigger">{{ anim.trigger }}</span>
              </div>
              <div
                v-if="animationStore.getAnimations(selectedLayer.id).length === 0"
                class="anim-empty"
              >
                No animations
              </div>
              <select
                class="anim-select"
                @change="addAnimation(($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled selected>+ Add animation</option>
                <option
                  v-for="preset in animationPresets"
                  :key="preset.preset"
                  :value="preset.preset"
                >
                  {{ preset.label }}
                </option>
              </select>
            </div>
          </div>
        </template>
        <div v-else class="empty-hint" style="padding: 40px 16px; text-align: center">
          Select a layer to edit properties
        </div>
      </div>

      <!-- ================================ -->
      <!-- ASSETS TAB -->
      <!-- ================================ -->
      <div v-if="activeTab === 'assets'" class="tab-content">
        <div class="asset-grid">
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="asset-item"
            @click="reuseAsset(asset.id)"
            :title="asset.meta?.name"
          >
            <div class="asset-thumb">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <span class="asset-name">{{ asset.meta?.name || asset.id.slice(-8) }}</span>
            <button class="asset-delete" @click.stop="deleteAssetById(asset.id)" title="Delete">
              ×
            </button>
          </div>
          <div
            v-if="assets.length === 0"
            class="empty-hint"
            style="grid-column: 1/-1; text-align: center; padding: 40px 0"
          >
            No uploaded assets
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.inspector {
  position: relative;
  width: var(--inspector-width);
  background: var(--bg-panel);
  border-left: 1px solid var(--border-primary);
  display: flex;
  flex-shrink: 0;
  transition: width var(--transition-base);
  overflow: hidden;
}
.inspector.collapsed {
  width: 28px;
}

.toggle-btn {
  position: absolute;
  left: 0;
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
  border-left: none;
  border-radius: 0 4px 4px 0;
  transition: color var(--transition-fast);
}
.toggle-btn:hover {
  color: var(--text-primary);
}

.inspector-inner {
  width: var(--inspector-width);
  min-width: var(--inspector-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

/* ---- Tab Bar ---- */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  padding: 10px 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  letter-spacing: 0.3px;
  transition: all var(--transition-fast);
  border-bottom: 2px solid transparent;
}
.tab-btn.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}
.tab-btn:hover:not(.active) {
  color: var(--text-secondary);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

/* ---- Layer Tab ---- */
.layer-count {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-subtle);
}
.layer-list {
  display: flex;
  flex-direction: column;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px var(--space-3);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--border-subtle);
  user-select: none;
}
.layer-item:hover {
  background: var(--bg-panel-hover);
}
.layer-item.selected {
  background: var(--accent-muted);
}
.layer-item.hidden {
  opacity: 0.4;
}
.layer-item.locked {
  opacity: 0.85;
}
.layer-item.drag-over {
  border-top: 2px solid var(--accent);
}

.layer-drag-handle {
  cursor: grab;
  color: var(--text-tertiary);
  opacity: 0;
  display: flex;
  align-items: center;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}
.layer-item:hover .layer-drag-handle {
  opacity: 1;
}

.layer-icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}

.layer-name-wrap {
  flex: 1;
  min-width: 0;
}
.layer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-size: var(--text-sm);
}
.layer-name:hover {
  color: var(--text-primary);
}

.layer-rename-input {
  width: 100%;
  padding: 2px 4px;
  font-size: var(--text-sm);
  border: 1px solid var(--accent);
  border-radius: 2px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.layer-act {
  display: flex;
  padding: 3px;
  border-radius: 3px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}
.layer-item:hover .layer-act {
  opacity: 1;
}
.layer-act:hover {
  background: var(--border-primary);
}

/* ---- Properties Tab ---- */
.prop-section {
  border-bottom: 1px solid var(--border-subtle);
}
.prop-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  letter-spacing: 0.3px;
}
.prop-header:hover {
  color: var(--text-secondary);
}
.prop-header svg {
  transition: transform var(--transition-fast);
}
.prop-header svg.rotated {
  transform: rotate(90deg);
}
.prop-body {
  padding: 0 var(--space-4) var(--space-3);
}

.prop-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.prop-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prop-field label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: var(--weight-medium);
}
.prop-field input {
  padding: 4px 6px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.prop-field input:focus {
  border-color: var(--accent);
  color: var(--text-primary);
}

.color-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 3px 6px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
}
.color-input input[type='color'] {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}
.color-input span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.anim-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: var(--text-sm);
}
.anim-trigger {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: var(--bg-primary);
  padding: 1px 5px;
  border-radius: 3px;
}
.anim-empty {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-style: italic;
}
.anim-select {
  width: 100%;
  padding: 5px 6px;
  margin-top: var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

/* ---- Assets Tab ---- */
.asset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: var(--space-3);
}
.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}
.asset-item:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}
.asset-thumb {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}
.asset-name {
  font-size: 10px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
}
.asset-delete {
  position: absolute;
  top: 2px;
  right: 4px;
  color: var(--text-tertiary);
  font-size: 14px;
  padding: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.asset-item:hover .asset-delete {
  opacity: 1;
}
.asset-delete:hover {
  color: var(--danger);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-style: italic;
}
</style>
