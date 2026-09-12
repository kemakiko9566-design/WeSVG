import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Canvas, DeviceMode, AnyLayer } from '@/types'
import { useProjectStore } from './projectStore'

export const useCanvasStore = defineStore('canvas', () => {
  const projectStore = useProjectStore()

  const canvas = ref<Canvas | null>(null)

  watch(
    () => projectStore.currentProject,
    (project) => {
      canvas.value = project?.canvas ?? null
    },
    { immediate: true, deep: true },
  )

  function setViewMode(mode: DeviceMode) {
    if (!canvas.value) return
    canvas.value.viewMode = mode
  }

  function setBackground(color: string) {
    if (!canvas.value) return
    canvas.value.background = color
  }

  function resize(width: number, height: number) {
    if (!canvas.value) return
    canvas.value.width = width
    canvas.value.height = height
  }

  function addLayer(layer: AnyLayer) {
    if (!canvas.value) return
    canvas.value.layers.push(layer)
    projectStore.saveCurrentProject()
  }

  function removeLayer(layerId: string) {
    if (!canvas.value) return
    canvas.value.layers = canvas.value.layers.filter((l) => l.id !== layerId)
    projectStore.saveCurrentProject()
  }

  function updateLayer(layerId: string, updates: Partial<AnyLayer>) {
    if (!canvas.value) return
    const layer = canvas.value.layers.find((l) => l.id === layerId)
    if (layer) {
      Object.assign(layer, updates)
      projectStore.saveCurrentProject()
    }
  }

  function getLayers(): AnyLayer[] {
    return canvas.value?.layers ?? []
  }

  function getSortedLayers(): AnyLayer[] {
    return [...getLayers()].sort((a, b) => a.zIndex - b.zIndex)
  }

  function reorderLayer(layerId: string, newZIndex: number) {
    if (!canvas.value) return
    const layer = canvas.value.layers.find((l) => l.id === layerId)
    if (layer) {
      layer.zIndex = newZIndex
      projectStore.saveCurrentProject()
    }
  }

  function exportJson(): string {
    return JSON.stringify(canvas.value, null, 2)
  }

  function importJson(json: string) {
    try {
      const data = JSON.parse(json) as Canvas
      canvas.value = data
      projectStore.saveCurrentProject()
    } catch (e) {
      console.error('Failed to import canvas JSON:', e)
      throw new Error('Invalid canvas JSON')
    }
  }

  return {
    canvas,
    setViewMode,
    setBackground,
    resize,
    addLayer,
    removeLayer,
    updateLayer,
    getLayers,
    getSortedLayers,
    reorderLayer,
    exportJson,
    importJson,
  }
})
