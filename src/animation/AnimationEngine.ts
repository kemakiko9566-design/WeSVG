import type { Animation, AnimationPreset, AnimationConfig, Trigger, AnyLayer } from '@/types'
import { AnimationRegistry } from './AnimationRegistry'

export class AnimationEngine {
  applyAnimation(layer: AnyLayer, animation: Animation): void {
    const preset = AnimationRegistry.getPreset(animation.type)
    if (!preset) return

    const config: AnimationConfig = {
      type: animation.type,
      trigger: animation.trigger,
      duration: (animation.config.duration as number) ?? 500,
      delay: (animation.config.delay as number) ?? 0,
    }

    switch (animation.type) {
      case 'slide-up':
      case 'slide-down':
      case 'fade-in':
      case 'fade-out':
      case 'rotate':
      case 'zoom-in':
      case 'zoom-out':
        this.applyTransformAnimation(layer, animation.type, config)
        break
      case 'pulse':
      case 'float':
        this.applyRepeatAnimation(layer, animation.type, config)
        break
      case 'click-expand':
        this.applyExpandAnimation(layer, config)
        break
      case 'parallax':
        this.applyParallaxAnimation(layer, config)
        break
    }
  }

  private applyTransformAnimation(
    _layer: AnyLayer,
    preset: AnimationPreset,
    _config: AnimationConfig,
  ) {
    // Konva animation logic will be handled at the canvas render level
    // This engine manages the configuration and metadata
  }

  private applyRepeatAnimation(
    _layer: AnyLayer,
    preset: AnimationPreset,
    _config: AnimationConfig,
  ) {
    // Continuous animation (pulse, float)
  }

  private applyExpandAnimation(_layer: AnyLayer, _config: AnimationConfig) {
    // Click-to-expand animation
  }

  private applyParallaxAnimation(_layer: AnyLayer, _config: AnimationConfig) {
    // Scroll-based parallax (note: limited wechat support)
  }

  getEffectiveConfig(animation: Animation): AnimationConfig {
    return {
      type: animation.type as AnimationPreset,
      trigger: animation.trigger as Trigger,
      duration: (animation.config.duration as number) ?? 500,
      delay: (animation.config.delay as number) ?? 0,
    }
  }

  getSVGCode(animation: Animation): string {
    const config = this.getEffectiveConfig(animation)
    return AnimationRegistry.getSVGAnimationMapping(animation.type, {
      type: animation.type,
      trigger: animation.trigger,
      duration: config.duration,
      delay: config.delay,
    })
  }
}

export const animationEngine = new AnimationEngine()
