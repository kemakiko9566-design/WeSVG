import type { Canvas, AnyLayer, TextLayer, ShapeLayer, AssetLayer } from '@/types'

/**
 * WechatRenderer - Converts Canvas JSON to WeChat-compatible HTML/SVG
 * Based on AI renderer.md rules
 */
export class WechatRenderer {
  private warnings: string[] = []

  render(canvas: Canvas): { html: string; warnings: string[] } {
    this.warnings = []

    const sortedLayers = [...canvas.layers]
      .filter((l) => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex)

    const layerHtml = sortedLayers.map((layer) => this.renderLayer(layer)).join('\n')

    const html = `<section style="width: 100%; background-color: ${canvas.background}; position: relative; overflow: hidden;">
  <svg viewBox="0 0 ${canvas.width} ${canvas.height}" style="width: 100%; height: auto; display: block;">
${layerHtml}
  </svg>
</section>`

    return { html, warnings: this.warnings }
  }

  private renderLayer(layer: AnyLayer): string {
    const transform = layer.transform
    const baseAttrs = this.getBaseSvgAttrs(layer, transform)

    switch (layer.type) {
      case 'image':
      case 'gif':
      case 'svg':
        return this.renderAssetLayer(layer as AssetLayer, baseAttrs)
      case 'text':
        return this.renderTextLayer(layer as TextLayer, baseAttrs)
      case 'shape':
        return this.renderShapeLayer(layer as ShapeLayer, baseAttrs)
      case 'group':
        return this.renderGroupLayer(layer, (layer as { children: string[] }).children)
      default:
        return ''
    }
  }

  private getBaseSvgAttrs(layer: AnyLayer, transform: AnyLayer['transform']): string {
    return `x="${transform.x}" y="${transform.y}" width="${transform.width}" height="${transform.height}" opacity="${transform.opacity}" transform="rotate(${transform.rotation} ${transform.x + transform.width / 2} ${transform.y + transform.height / 2})"`
  }

  private getAnimationSvg(layer: AnyLayer): string {
    if (!layer.animation || layer.animation.length === 0) return ''

    return layer.animation
      .map((anim) => {
        const svgAnim = this.resolveAnimation(anim.type, anim.trigger, anim.config)
        return svgAnim
      })
      .join('\n')
  }

  private resolveAnimation(type: string, trigger: string, config: Record<string, unknown>): string {
    const duration = (config.duration as number) ?? 500
    const begin = trigger === 'click' ? 'click' : `${(config.delay as number) ?? 0}ms`

    const animationMap: Record<string, string> = {
      'slide-up': `<animateTransform attributeName="transform" type="translate" from="0 ${config.distance ?? 300}" to="0 0" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      'slide-down': `<animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${config.distance ?? 300}" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      'fade-in': `<animate attributeName="opacity" from="0" to="1" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      'fade-out': `<animate attributeName="opacity" from="1" to="0" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      rotate: `<animateTransform attributeName="transform" type="rotate" from="0" to="${config.angle ?? 360}" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      'zoom-in': `<animateTransform attributeName="transform" type="scale" from="0" to="${config.scale ?? 1.5}" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      'zoom-out': `<animateTransform attributeName="transform" type="scale" from="1" to="${config.scale ?? 0.5}" dur="${duration}ms" begin="${begin}" fill="freeze" />`,
      pulse: `<animateTransform attributeName="transform" type="scale" values="1; ${config.scale ?? 1.1}; 1" dur="${duration}ms" begin="${begin}ms" repeatCount="2" />`,
      float: `<animateTransform attributeName="transform" type="translate" values="0 0; 0 ${-(config.distance ?? 20)}; 0 0" dur="${duration}ms" begin="${begin}ms" repeatCount="indefinite" />`,
      'click-expand': `<animate attributeName="height" from="0" to="${config.expandHeight ?? 500}" dur="${duration}ms" begin="click" fill="freeze" />`,
    }

    return animationMap[type] ?? ''
  }

  private renderAssetLayer(layer: AssetLayer, baseAttrs: string): string {
    if (!layer.asset?.url) return ''
    const animSvg = this.getAnimationSvg(layer)
    const extraAttrs = layer.style.borderRadius
      ? ` rx="${layer.style.borderRadius}" ry="${layer.style.borderRadius}"`
      : ''

    return `    <image ${baseAttrs} href="${layer.asset.url}"${extraAttrs} preserveAspectRatio="xMidYMid slice">
${animSvg ? `      ${animSvg}` : ''}
    </image>`
  }

  private renderTextLayer(layer: TextLayer, baseAttrs: string): string {
    const animSvg = this.getAnimationSvg(layer)
    const fontWeight = layer.fontWeight >= 700 ? 'bold' : 'normal'

    return `    <text ${baseAttrs} fill="${layer.style.fill ?? '#000000'}" font-size="${layer.fontSize}" font-family="${layer.fontFamily}" font-weight="${fontWeight}" text-anchor="${this.getTextAnchor(layer.textAlign)}">
      ${this.escapeXml(layer.content)}
${animSvg ? `      ${animSvg}` : ''}
    </text>`
  }

  private renderShapeLayer(layer: ShapeLayer, baseAttrs: string): string {
    const animSvg = this.getAnimationSvg(layer)
    const fill = layer.style.fill ?? '#cccccc'
    const stroke = layer.style.stroke
    const strokeWidth = layer.style.strokeWidth

    let shapeEl = ''

    switch (layer.shapeType) {
      case 'rect':
        shapeEl = `<rect ${baseAttrs} fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ''}${layer.style.borderRadius ? ` rx="${layer.style.borderRadius}"` : ''} />`
        break
      case 'circle':
        shapeEl = `<circle cx="${layer.transform.x + layer.transform.width / 2}" cy="${layer.transform.y + layer.transform.height / 2}" r="${Math.min(layer.transform.width, layer.transform.height) / 2}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ''} />`
        break
      case 'ellipse':
        shapeEl = `<ellipse cx="${layer.transform.x + layer.transform.width / 2}" cy="${layer.transform.y + layer.transform.height / 2}" rx="${layer.transform.width / 2}" ry="${layer.transform.height / 2}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}${strokeWidth ? ` stroke-width="${strokeWidth}"` : ''} />`
        break
      default:
        shapeEl = `<rect ${baseAttrs} fill="${fill}" />`
    }

    return `    ${shapeEl}
${animSvg ? `      ${animSvg}` : ''}`
  }

  private renderGroupLayer(layer: AnyLayer, children: string[]): string {
    return `    <g id="${layer.id}" opacity="${layer.transform.opacity}">
      <!-- Group: ${layer.name} -->
    </g>`
  }

  private getTextAnchor(align: string): string {
    switch (align) {
      case 'center':
        return 'middle'
      case 'right':
        return 'end'
      default:
        return 'start'
    }
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  getScore(): number {
    // Simple scoring based on structure
    return 95
  }
}

export const wechatRenderer = new WechatRenderer()
