import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Project, AnyLayer } from '@/types'
import { generateId } from '@/utils/id'
import { saveProject as dbSave, loadProject as dbLoad } from '@/utils/db'
import { useHistoryStore } from './historyStore'

const META_KEY = 'wesvg_meta'

interface ProjectMeta {
  id: string
  name: string
  updatedAt: string
  createdAt: string
}

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<Project | null>(null)
  const metas = ref<ProjectMeta[]>(loadMetas())

  function loadMetas(): ProjectMeta[] {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || '[]')
    } catch {
      return []
    }
  }
  function saveMetas() {
    localStorage.setItem(META_KEY, JSON.stringify(metas.value))
  }

  const hasProject = computed(() => currentProject.value !== null)

  function createProject(name: string) {
    const now = new Date().toISOString()
    const project: Project = {
      id: `proj_${generateId()}`,
      name,
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      canvas: {
        id: `canvas_${generateId()}`,
        width: 1080,
        height: 3000,
        background: '#ffffff',
        viewMode: 'phone',
        layers: [],
      },
    }
    metas.value.push({ id: project.id, name, updatedAt: now, createdAt: now })
    saveMetas()
    currentProject.value = project
    useHistoryStore().clear()
    triggerAutoSave()
    return project
  }

  async function loadProject(id: string) {
    // Try IndexedDB first
    const data = await dbLoad(id)
    if (data) {
      currentProject.value = JSON.parse(data)
      useHistoryStore().clear()
      return currentProject.value
    }
    // Fallback: localStorage
    const meta = metas.value.find((m) => m.id === id)
    if (meta) {
      // Minimal project from meta (layers may be lost)
      currentProject.value = {
        id: meta.id,
        name: meta.name,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        version: '1.0.0',
        canvas: {
          id: `canvas_${generateId()}`,
          width: 1080,
          height: 3000,
          background: '#ffffff',
          viewMode: 'phone',
          layers: [],
        },
      }
      return currentProject.value
    }
    return null
  }

  function saveCurrentProject() {
    if (!currentProject.value) return
    currentProject.value.updatedAt = new Date().toISOString()
    const idx = metas.value.findIndex((m) => m.id === currentProject.value!.id)
    if (idx >= 0) metas.value[idx].updatedAt = currentProject.value.updatedAt
    saveMetas()
    dbSave(currentProject.value.id, JSON.stringify(currentProject.value))
  }

  function deleteProject(id: string) {
    metas.value = metas.value.filter((m) => m.id !== id)
    saveMetas()
    if (currentProject.value?.id === id) currentProject.value = null
  }

  function getProjectList() {
    return metas.value
  }

  // ----- Layer helpers (delegate to canvas store) -----
  function updateLayer(layerId: string, updates: Partial<AnyLayer>) {
    if (!currentProject.value) return
    const layer = currentProject.value.canvas.layers.find((l) => l.id === layerId)
    if (layer) {
      Object.assign(layer, updates)
      triggerAutoSave()
    }
  }

  // Auto-save: 500ms debounce
  let autoTimer: ReturnType<typeof setTimeout> | null = null
  function triggerAutoSave() {
    if (autoTimer) clearTimeout(autoTimer)
    autoTimer = setTimeout(() => saveCurrentProject(), 500)
  }

  // Watch for deep changes
  watch(
    currentProject,
    () => {
      if (currentProject.value) triggerAutoSave()
    },
    { deep: true },
  )

  // ----- Undo/Redo -----
  function pushHistory() {
    if (currentProject.value) useHistoryStore().pushState(currentProject.value)
  }

  function undo() {
    if (!currentProject.value) return
    const restored = useHistoryStore().undo(currentProject.value)
    if (restored) currentProject.value = restored
  }

  function redo() {
    if (!currentProject.value) return
    const restored = useHistoryStore().redo(currentProject.value)
    if (restored) currentProject.value = restored
  }

  // ----- Layer helpers -----
  function getSortedLayers() {
    if (!currentProject.value) return []
    return [...currentProject.value.canvas.layers].sort((a, b) => a.zIndex - b.zIndex)
  }

  function getNextZIndex(): number {
    if (!currentProject.value) return 1
    const ls = currentProject.value.canvas.layers
    if (ls.length === 0) return 1
    return Math.max(...ls.map((l) => l.zIndex)) + 1
  }

  return {
    currentProject,
    metas,
    hasProject,
    createProject,
    loadProject,
    saveCurrentProject,
    deleteProject,
    getProjectList,
    triggerAutoSave,
    undo,
    redo,
    pushHistory,
    getSortedLayers,
    getNextZIndex,
    updateLayer,
  }
})
