﻿
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import Konva from 'konva'
import { CanvasManager } from '@/canvas/CanvasManager'
import { CanvasEventManager } from '@/canvas/CanvasEventManager'
import { CanvasObjectFactory } from '@/canvas/CanvasObjectFactory'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore, type GridMode } from '@/stores/uiStore'
import { useBackgroundStore } from '@/stores/backgroundStore'
import { removeBackground } from '@/utils/removeBg'
import SelectionToolbar from './SelectionToolbar.vue'
import { generateId } from '@/utils/id'

const emit = defineEmits<{
  'layer-select': [layerId: string]
}>()

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const bgStore = useBackgroundStore()
const containerId = `canvas-${generateId()}`
const viewportRef = ref<HTMLDivElement>()
const wrapperRef = ref<HTMLDivElement>()

const manager = new CanvasManager()
const eventManager = new CanvasEventManager(manager)

const zoom = ref(0.35)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const spaceHeld = ref(false)
const panStart = ref({ x: 0, y: 0 })
const panStartOffset = ref({ x: 0, y: 0 })
const MIN_ZOOM = 0.1
const MAX_ZOOM = 8

const cropMode = ref(false)
const cropLayerId = ref<string | null>(null)

const canvasWidth = computed(() => canvasStore.canvas?.width ?? 1080)
const canvasHeight = computed(() => canvasStore.canvas?.height ?? 3000)

const wrapperTransform = computed(
  () => `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
)

// ---- Grid ----
const gridStyle = computed(() => {
  const mode: GridMode = uiStore.gridMode
  if (mode === 'none') return {}
  const base = {
    position: 'absolute' as const,
    inset: '0' as const,
    pointerEvents: 'none' as const,
    zIndex: 1,
  }
  if (mode === 'dot') {
    return {
      ...base,
      backgroundImage: 'radial-gradient(circle, #303030 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      opacity: 0.5,
    }
  }
  return {
    ...base,
    backgroundImage:
      'linear-gradient(rgba(48,48,48,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(48,48,48,0.3) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  }
})

// ---- Workspace background ----
const workspaceStyle = computed(() => {
  if (bgStore.type === 'color') {
    return { background: bgStore.color }
  }
  if (bgStore.url) {
    return {
      backgroundImage: `url(${bgStore.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: bgStore.opacity,
      filter: bgStore.blur ? `blur(${bgStore.blur}px)` : undefined,
    }
  }
  return {}
})

const SNAP_RANGE = 5
function snapValue(val: number, gridSize = 24): number {
  if (!uiStore.snapEnabled) return val
  const r = val % gridSize
  if (r < SNAP_RANGE) return val - r
  if (r > gridSize - SNAP_RANGE) return val + (gridSize - r)
  return val
}

// Track layer count to detect structural changes (add/remove)
let prevLayerCount = 0

// ---- Full re-render (structural changes only) ----
function renderAllLayers() {
  const layer = manager.getLayer()
  if (!layer) return
  // Save transformer selection
  const stage = manager.getStage()
  let selectedId: string | null = null
  if (stage) {
    const tr = layer.children.find((c) => c instanceof Konva.Transformer) as
      Konva.Transformer | undefined
    if (tr && tr.nodes().length > 0) {
      selectedId = tr.nodes()[0].id()
    }
  }

  const nodesToRemove = layer.children.filter((c) => !(c instanceof Konva.Transformer))
  nodesToRemove.forEach((n) => n.destroy())

  const c = canvasStore.canvas
  if (!c) {
    layer.draw()
    return
  }
  const sorted = [...c.layers].filter((l) => l.visible).sort((a, b) => a.zIndex - b.zIndex)
  sorted.forEach((l) => {
    const node = CanvasObjectFactory.createFromLayer(l, () => layer.draw())
    // Konva.Layer.add expects Shape | Group; the factory returns Konva.Node
    layer.add(node as unknown as Konva.Shape)
    eventManager.bindNodeDrag(node)
  })
  layer.draw()

  // Re-select previously selected node
  if (selectedId && stage) {
    const node = stage.findOne(`#${selectedId}`)
    if (node) {
      const tr = layer.children.find((c) => c instanceof Konva.Transformer) as
        Konva.Transformer | undefined
      // Konva Transformer requires Shape | Group; node from stage.findOne is Konva.Node
      tr?.nodes([node as unknown as Konva.Shape])
      layer.draw()
    }
  }
  prevLayerCount = canvasStore.getLayers().length
}

// ---- Incremental node update (property changes only) ----
function updateNodeProperties(layerId: string) {
  const stage = manager.getStage()
  const konvaLayer = manager.getLayer()
  if (!stage || !konvaLayer) return

  const layerData = canvasStore.getLayers().find((l) => l.id === layerId)
  if (!layerData) return

  const node = stage.findOne(`#${layerId}`)
  if (!node) return

  const t = layerData.transform
  node.x(t.x)
  node.y(t.y)
  node.width(t.width)
  node.height(t.height)
  node.rotation(t.rotation)
  node.scaleX(t.scaleX)
  node.scaleY(t.scaleY)
  node.opacity(t.opacity)
  node.visible(layerData.visible)

  if ('fill' in node && layerData.style.fill) {
    ;(node as any).fill(layerData.style.fill)
  }
  if ('stroke' in node && layerData.style.stroke) {
    ;(node as any).stroke(layerData.style.stroke)
  }

  konvaLayer.batchDraw()
}

function fitToScreen() {
  const el = viewportRef.value
  if (!el) return
  const vw = el.clientWidth,
    vh = el.clientHeight,
    pad = 80
  const sx = (vw - pad) / canvasWidth.value,
    sy = (vh - pad) / canvasHeight.value
  zoom.value = Math.min(Math.min(sx, sy), 1)
  panX.value = (vw - canvasWidth.value * zoom.value) / 2
  panY.value = (vh - canvasHeight.value * zoom.value) / 2
}

function zoomAtPoint(nz: number, cx: number, cy: number) {
  const clamped = Math.min(Math.max(nz, MIN_ZOOM), MAX_ZOOM)
  const oz = zoom.value
  zoom.value = clamped
  panX.value = cx - ((cx - panX.value) / oz) * clamped
  panY.value = cy - ((cy - panY.value) / oz) * clamped
}

function isInsideKonva(el: HTMLElement | null): boolean {
  while (el) {
    if (el.classList?.contains('konva-container')) return true
    el = el.parentElement
  }
  return false
}

// ---- Code 鈫?Canvas highlight ----
watch(
  () => uiStore.highlightLayer,
  (layerId) => {
    if (!layerId) return
    // Flash the selected layer on canvas via transformer
    const stage = manager.getStage()
    if (!stage) return
    const node = stage.findOne(`#${layerId}`)
    if (node && eventManager.transformer) {
      const tr = eventManager.transformer
      tr.nodes([node])
      manager.getLayer()?.draw()
      setTimeout(() => {
        tr.nodes([])
        manager.getLayer()?.draw()
      }, 1500)
    }
  },
)

// ---- Events ----
function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault()
    spaceHeld.value = true
    uiStore.setSpaceHeld(true)
  }
}
function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    spaceHeld.value = false
    uiStore.setSpaceHeld(false)
    isPanning.value = false
  }
}
function handleWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    zoomAtPoint(zoom.value * (1 - e.deltaY * 0.001), e.clientX, e.clientY)
  } else if (e.shiftKey) panX.value -= e.deltaY
  else panY.value -= e.deltaY
}
function handleMouseDown(e: MouseEvent) {
  const inside = isInsideKonva(e.target as HTMLElement)
  if (e.button === 1 || spaceHeld.value || (!inside && e.button === 0)) {
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    panStartOffset.value = { x: panX.value, y: panY.value }
    e.preventDefault()
  }
}
function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  panX.value = panStartOffset.value.x + (e.clientX - panStart.value.x)
  panY.value = panStartOffset.value.y + (e.clientY - panStart.value.y)
}
function handleMouseUp() {
  isPanning.value = false
}
function handleDoubleClick(e: MouseEvent) {
  if (!isInsideKonva(e.target as HTMLElement)) fitToScreen()
}

// ---- Crop ----
function enterCrop(id: string) {
  cropMode.value = true
  cropLayerId.value = id
}
function exitCrop() {
  cropMode.value = false
  cropLayerId.value = null
}
function handleRemoveBg(layerId: string) {
  const layer = canvasStore.getLayers().find((l) => l.id === layerId)
  if (!layer || !layer.asset?.url) return

  const imgUrl = layer.asset.url
  layer.asset.url = '' // clear while loading

  removeBackground(layerId, imgUrl).then((result) => {
    if (result.success && result.url && canvasStore.canvas) {
      const target = canvasStore.getLayers().find((l) => l.id === layerId)
      if (target && target.asset) {
        target.asset.url = result.url
        target.asset.mimeType = 'image/png'
        // Trigger re-render
        const idx = canvasStore.canvas.layers.indexOf(target)
        if (idx >= 0) canvasStore.canvas.layers[idx] = { ...target }
      }
    } else {
      console.warn('[RemoveBG] failed:', result.error)
      // Restore original
      if (layer.asset) layer.asset.url = imgUrl
    }
  })
}

// ---- Lifecycle ----
onMounted(() => {
  const canvas = canvasStore.canvas
  if (!canvas || !viewportRef.value) return
  manager.createCanvas(containerId, canvas.width, canvas.height)
  eventManager.initTransformer()

  // Wire up drag/transform sync callbacks so Konva changes persist to the store
  eventManager.setCallbacks({
    onMove: (nodeId, x, y) => {
      const layer = canvasStore.getLayers().find((l) => l.id === nodeId)
      if (!layer) return
      canvasStore.updateLayer(nodeId, {
        transform: { ...layer.transform, x, y },
      })
    },
    onResize: (nodeId, width, height) => {
      const layer = canvasStore.getLayers().find((l) => l.id === nodeId)
      if (!layer) return
      canvasStore.updateLayer(nodeId, {
        transform: { ...layer.transform, width, height },
      })
    },
    onRotate: (nodeId, rotation) => {
      const layer = canvasStore.getLayers().find((l) => l.id === nodeId)
      if (!layer) return
      canvasStore.updateLayer(nodeId, {
        transform: { ...layer.transform, rotation },
      })
    },
  })

  renderAllLayers()

  const el = viewportRef.value
  const vw = el.clientWidth,
    vh = el.clientHeight
  zoom.value = 0.35
  panX.value = (vw - canvasWidth.value * zoom.value) / 2
  panY.value = (vh - canvasHeight.value * zoom.value) / 2

  const stage = manager.getStage()
  if (stage) {
    stage.on('click', (e) => {
      if (e.target === stage) {
        eventManager.onDeselect()
      } else {
        eventManager.onNodeClick(e.target)
        // Emit for code highlight
        emit('layer-select', e.target.id())
      }
    })
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  el.addEventListener('wheel', handleWheel, { passive: false })
  el.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  el.addEventListener('dblclick', handleDoubleClick)
})

// Watch for any layer changes 鈫?re-render (with transformer preservation)
// Fingerprint-based watcher: detects both structural and property changes
// without requiring `deep: true`, and does incremental updates for property changes.
watch(
  () => {
    const ls = canvasStore.canvas?.layers
    if (!ls) return ''
    return ls
      .map(
        (l) =>
          `${l.id}:${l.visible}:${l.transform.x}:${l.transform.y}:${l.transform.width}:${l.transform.height}:${l.transform.rotation}:${l.transform.opacity}`,
      )
      .join('|')
  },
  (newFp, oldFp) => {
    if (!newFp) return
    if (!oldFp) {
      renderAllLayers()
      return
    }

    const newParts = newFp.split('|')
    const oldParts = oldFp.split('|')

    // Structural change (add/remove)  -> full re-render
    if (newParts.length !== oldParts.length) {
      renderAllLayers()
      return
    }

    // Property change  -> incremental node update
    if (newFp !== oldFp) {
      for (let i = 0; i < newParts.length; i++) {
        if (newParts[i] !== oldParts[i]) {
          const layerId = newParts[i].split(':')[0]
          updateNodeProperties(layerId)
          break
        }
      }
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  const el = viewportRef.value
  if (el) {
    el.removeEventListener('wheel', handleWheel)
    el.removeEventListener('mousedown', handleMouseDown)
    el.removeEventListener('dblclick', handleDoubleClick)
  }
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  manager.destroyCanvas()
  eventManager.destroy()
})
</script>

<template>
  <div
    ref="viewportRef"
    class="canvas-viewport"
    :class="{ panning: isPanning, space: spaceHeld }"
    :style="workspaceStyle"
  >
    <div v-if="uiStore.gridMode !== 'none'" :style="gridStyle"></div>
    <div v-if="cropMode" class="crop-overlay" @dblclick="exitCrop">
      <div class="crop-hint">Double-click to confirm crop</div>
    </div>

    <SelectionToolbar @crop="enterCrop" @remove-bg="handleRemoveBg" />

    <div ref="wrapperRef" class="canvas-wrapper" :style="{ transform: wrapperTransform }">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div :id="containerId" class="konva-container"></div>
      </div>
    </div>

    <div class="zoom-badge">{{ Math.round(zoom * 100) }}%</div>
  </div>
</template>

<style scoped>
.canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-canvas);
  cursor: default;
}
.canvas-viewport.space {
  cursor: grab;
}
.canvas-viewport.panning,
.canvas-viewport.space.panning {
  cursor: grabbing;
}
.crop-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.crop-hint {
  color: white;
  font-size: var(--text-sm);
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  pointer-events: none;
}
.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 0 0;
  will-change: transform;
  pointer-events: none;
}
.phone-frame {
  background: #0d0d0d;
  border-radius: 24px;
  padding: 8px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  pointer-events: auto;
}
.phone-notch {
  height: 20px;
  background: #0d0d0d;
}
.konva-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  pointer-events: auto;
}
.zoom-badge {
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  padding: 3px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--weight-medium);
  pointer-events: none;
  z-index: 10;
}
</style>
