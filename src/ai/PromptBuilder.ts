import type { Canvas, AnyLayer } from '@/types'

/**
 * PromptBuilder - Constructs stable prompts for LLM rendering
 * Based on AI renderer.md specification
 */
export class PromptBuilder {
  private readonly systemPrompt = `You are a WeChat Official Account SVG engineer.
Your task is to convert input JSON into WeChat-compatible runnable code.

Rules:
- No script tags
- No iframe tags
- No video tags
- No external JS
- No unknown tags
- Keep layer order by zIndex
- Keep animation semantics
- Output pure HTML only

Allowed tags: section, div, span, img, svg, g, path, rect, circle, text, animate, animateTransform, clipPath, mask

Forbidden tags: script, iframe, video, audio, canvas, webgl, object, embed

Animation mapping:
- slide-up → animateTransform translateY
- fade-in → animate opacity
- rotate → animateTransform rotate
- zoom-in → animateTransform scale
- float → translate with repeat`

  build(canvas: Canvas, extraRules: string[] = []): { system: string; user: string } {
    const cleanedCanvas = this.cleanCanvasForPrompt(canvas)

    const rulesText = extraRules.length > 0
      ? `\n\nAdditional rules:\n${extraRules.map((r) => `- ${r}`).join('\n')}`
      : ''

    return {
      system: this.systemPrompt + rulesText,
      user: `Canvas JSON:\n${JSON.stringify(cleanedCanvas)}\n\nPlease output the final HTML.`,
    }
  }

  private cleanCanvasForPrompt(canvas: Canvas): Partial<Canvas> {
    // Remove UI-only fields to reduce token count by ~60%
    return {
      width: canvas.width,
      height: canvas.height,
      background: canvas.background,
      layers: canvas.layers.map((layer) => this.cleanLayer(layer)),
    }
  }

  private cleanLayer(layer: AnyLayer): Partial<AnyLayer> {
    const cleaned: Partial<AnyLayer> = {
      id: layer.id,
      type: layer.type,
      zIndex: layer.zIndex,
      transform: layer.transform,
    }

    if (layer.style?.fill) cleaned.style = { fill: layer.style.fill }
    if (layer.asset?.url) {
      cleaned.asset = { url: layer.asset.url, width: layer.asset.width, height: layer.asset.height } as AnyLayer['asset']
    }
    if (layer.animation && layer.animation.length > 0) {
      cleaned.animation = layer.animation.map((a) => ({
        id: a.id,
        type: a.type,
        trigger: a.trigger,
        config: a.config,
      }))
    }
    if (layer.type === 'text') {
      const textLayer = layer as import('@/types').TextLayer
      ;(cleaned as Record<string, unknown>).content = textLayer.content
      ;(cleaned as Record<string, unknown>).fontSize = textLayer.fontSize
      ;(cleaned as Record<string, unknown>).fontFamily = textLayer.fontFamily
    }

    return cleaned
  }
}

export const promptBuilder = new PromptBuilder()
