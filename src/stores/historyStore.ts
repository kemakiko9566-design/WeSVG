// History Store — Undo/Redo (50 steps)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasProject } from '@/types'

const MAX_STEPS = 50

export const useHistoryStore = defineStore('history', () => {
  const past = ref<string[]>([])
  const future = ref<string[]>([])

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function pushState(project: CanvasProject) {
    const snapshot = JSON.stringify(project)
    // Don't push duplicate
    if (past.value[past.value.length - 1] === snapshot) return

    past.value.push(snapshot)
    if (past.value.length > MAX_STEPS) past.value.shift()
    future.value = [] // Clear redo on new action
  }

  function undo(current: CanvasProject): CanvasProject | null {
    if (!canUndo.value) return null
    future.value.push(JSON.stringify(current))
    const prev = past.value.pop()!
    return JSON.parse(prev)
  }

  function redo(current: CanvasProject): CanvasProject | null {
    if (!canRedo.value) return null
    past.value.push(JSON.stringify(current))
    const next = future.value.pop()!
    return JSON.parse(next)
  }

  function clear() {
    past.value = []
    future.value = []
  }

  return { past, future, canUndo, canRedo, pushState, undo, redo, clear }
})
