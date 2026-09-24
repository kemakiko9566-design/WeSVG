import type { AnimationPreset, AnimationConfig, Trigger } from '@/types'

export interface AnimationDefinition {
  preset: AnimationPreset
  label: string
  description: string
  defaultTrigger: Trigger
  wechatCompatible: boolean
  defaultConfig: Record<string, unknown>
}

export class AnimationRegistry {
  private static presets: AnimationDefinition[] = [
    {
      preset: 'slide-up',
      label: 'Slide Up',
      description: 'Element slides upward from its position',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { distance: 300, duration: 500 },
    },
    {
      preset: 'slide-down',
      label: 'Slide Down',
      description: 'Element slides downward from its position',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { distance: 300, duration: 500 },
    },
    {
      preset: 'fade-in',
      label: 'Fade In',
      description: 'Element fades into view',
      defaultTrigger: 'load',
      wechatCompatible: true,
      defaultConfig: { duration: 500 },
    },
    {
      preset: 'fade-out',
      label: 'Fade Out',
      description: 'Element fades out of view',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { duration: 500 },
    },
    {
      preset: 'parallax',
      label: 'Parallax',
      description: 'Element moves at different speed on scroll',
      defaultTrigger: 'scroll',
      wechatCompatible: false,
      defaultConfig: { speed: 0.5 },
    },
    {
      preset: 'pulse',
      label: 'Pulse',
      description: 'Element pulses (scales in and out)',
      defaultTrigger: 'load',
      wechatCompatible: true,
      defaultConfig: { duration: 1000, scale: 1.1 },
    },
    {
      preset: 'float',
      label: 'Float',
      description: 'Element floats up and down continuously',
      defaultTrigger: 'load',
      wechatCompatible: true,
      defaultConfig: { duration: 2000, distance: 20 },
    },
    {
      preset: 'rotate',
      label: 'Rotate',
      description: 'Element rotates on trigger',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { duration: 500, angle: 360 },
    },
    {
      preset: 'zoom-in',
      label: 'Zoom In',
      description: 'Element zooms in from smaller size',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { duration: 500, scale: 1.5 },
    },
    {
      preset: 'zoom-out',
      label: 'Zoom Out',
      description: 'Element zooms out to smaller size',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { duration: 500, scale: 0.5 },
    },
    {
      preset: 'click-expand',
      label: 'Click Expand',
      description: 'Element expands on click (reveal more content)',
      defaultTrigger: 'click',
      wechatCompatible: true,
      defaultConfig: { duration: 300, expandHeight: 500 },
    },
  ]

  static getAllPresets(): AnimationDefinition[] {
    return this.presets
  }

  static getPreset(preset: AnimationPreset): AnimationDefinition | undefined {
    return this.presets.find((p) => p.preset === preset)
  }

  static getWechatCompatiblePresets(): AnimationDefinition[] {
    return this.presets.filter((p) => p.wechatCompatible)
  }

  static isWechatCompatible(preset: AnimationPreset): boolean {
    return this.presets.find((p) => p.preset === preset)?.wechatCompatible ?? false
  }

  static getSVGAnimationMapping(
    preset: AnimationPreset,
    config: AnimationConfig & { config?: Record<string, unknown> },
  ): string {
    const mappings: Record<AnimationPreset, string> = {
      'slide-up': `
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 ${config.config?.distance ?? 300}"
          to="0 0"
          dur="${config.duration}ms"
          begin="${config.trigger === 'click' ? 'click' : `${config.delay}ms`}"
          fill="freeze"
        />`,
      'slide-down': `
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="0 ${config.config?.distance ?? 300}"
          dur="${config.duration}ms"
          begin="${config.trigger === 'click' ? 'click' : `${config.delay}ms`}"
          fill="freeze"
        />`,
      'fade-in': `
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="${config.duration}ms"
          begin="${config.delay}ms"
          fill="freeze"
        />`,
      'fade-out': `
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="${config.duration}ms"
          begin="click"
          fill="freeze"
        />`,
      rotate: `
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="${config.config?.angle ?? 360}"
          dur="${config.duration}ms"
          begin="click"
          fill="freeze"
        />`,
      'zoom-in': `
        <animateTransform
          attributeName="transform"
          type="scale"
          from="0"
          to="${config.config?.scale ?? 1.5}"
          dur="${config.duration}ms"
          begin="click"
          fill="freeze"
        />`,
      'zoom-out': `
        <animateTransform
          attributeName="transform"
          type="scale"
          from="1"
          to="${config.config?.scale ?? 0.5}"
          dur="${config.duration}ms"
          begin="click"
          fill="freeze"
        />`,
      pulse: `
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1; ${config.config?.scale ?? 1.1}; 1"
          dur="${config.duration}ms"
          begin="${config.delay}ms"
          repeatCount="2"
        />`,
      float: `
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 ${-(config.config?.distance ?? 20)}; 0 0"
          dur="${config.duration}ms"
          begin="${config.delay}ms"
          repeatCount="indefinite"
        />`,
      'click-expand': `
        <animate
          attributeName="height"
          from="0"
          to="${config.config?.expandHeight ?? 500}"
          dur="${config.duration}ms"
          begin="click"
          fill="freeze"
        />`,
      parallax: '',
    }

    return mappings[preset]
  }
}
