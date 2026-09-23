import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Animation, AnimationPreset, AnimationConfig, Trigger } from '@/types'
import { useCanvasStore } from './canvasStore'
import { useProjectStore } from './projectStore'
import { generateId } from '@/utils/id'

export const useAnimationStore = defineStore('animation', () => {
  const canvasStore = useCanvasStore()
  const projectStore = useProjectStore()

  const selectedLayerId = ref<string | null>(null)

  function selectLayer(layerId: string | null) {
    selectedLayerId.value = layerId
  }

  function getAnimations(layerId: string): Animation[] {
    const layer = canvasStore.getLayers().find((l) => l.id === layerId)
    return layer?.animation ?? []
  }

  function addAnimation(
    layerId: string,
    preset: AnimationPreset,
    trigger: Trigger,
    config: Record<string, unknown> = {},
  ) {
    const animation: Animation = {
      id: `anim_${generateId()}`,
      type: preset,
      trigger,
      config,
    }
    canvasStore.updateLayer(layerId, {
      animation: [...getAnimations(layerId), animation],
    })
    projectStore.saveCurrentProject()
    return animation
  }

  function removeAnimation(layerId: string, animationId: string) {
    const animations = getAnimations(layerId).filter((a) => a.id !== animationId)
    canvasStore.updateLayer(layerId, { animation: animations })
    projectStore.saveCurrentProject()
  }

  function updateAnimation(layerId: string, animationId: string, updates: Partial<Animation>) {
    const animations = getAnimations(layerId).map((a) =>
      a.id === animationId ? { ...a, ...updates } : a,
    )
    canvasStore.updateLayer(layerId, { animation: animations })
    projectStore.saveCurrentProject()
  }

  function getAnimationConfig(preset: AnimationPreset): AnimationConfig {
    const defaults: Record<AnimationPreset, AnimationConfig> = {
      'slide-up': { type: 'slide-up', trigger: 'click', duration: 500, delay: 0 },
      'slide-down': { type: 'slide-down', trigger: 'click', duration: 500, delay: 0 },
      'fade-in': { type: 'fade-in', trigger: 'load', duration: 500, delay: 0 },
      'fade-out': { type: 'fade-out', trigger: 'click', duration: 500, delay: 0 },
      parallax: { type: 'parallax', trigger: 'scroll', duration: 1000, delay: 0 },
      pulse: { type: 'pulse', trigger: 'load', duration: 1000, delay: 0 },
      float: { type: 'float', trigger: 'load', duration: 2000, delay: 0 },
      rotate: { type: 'rotate', trigger: 'click', duration: 500, delay: 0 },
      'zoom-in': { type: 'zoom-in', trigger: 'click', duration: 500, delay: 0 },
      'zoom-out': { type: 'zoom-out', trigger: 'click', duration: 500, delay: 0 },
      'click-expand': { type: 'click-expand', trigger: 'click', duration: 300, delay: 0 },
    }
    return defaults[preset]
  }

  return {
    selectedLayerId,
    selectLayer,
    getAnimations,
    addAnimation,
    removeAnimation,
    updateAnimation,
    getAnimationConfig,
  }
})
