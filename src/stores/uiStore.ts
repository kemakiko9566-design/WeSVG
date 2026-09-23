// UI Store — editor mode + viewport settings
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type GridMode = 'none' | 'dot' | 'grid'
export type EditorMode = 'design' | 'split' | 'code' | 'ai'

export const useUIStore = defineStore('ui', () => {
  const gridMode = ref<GridMode>('dot')
  const snapEnabled = ref(true)
  const spaceHeld = ref(false)

  // Editor mode
  const editorMode = ref<EditorMode>('design')

  // Highlight state for canvas ↔ code
  const highlightLayer = ref<string | null>(null)

  function setGridMode(mode: GridMode) {
    gridMode.value = mode
  }
  function toggleSnap() {
    snapEnabled.value = !snapEnabled.value
  }
  function setSpaceHeld(v: boolean) {
    spaceHeld.value = v
  }
  function setEditorMode(mode: EditorMode) {
    editorMode.value = mode
  }
  function setHighlightLayer(id: string | null) {
    highlightLayer.value = id
  }

  return {
    gridMode,
    snapEnabled,
    spaceHeld,
    editorMode,
    highlightLayer,
    setGridMode,
    toggleSnap,
    setSpaceHeld,
    setEditorMode,
    setHighlightLayer,
  }
})
