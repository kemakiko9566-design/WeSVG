import type { Canvas, AnyLayer } from '@/types'

/**
 * SvgGenerator - Generates pure SVG output from Canvas JSON
 */
export class SvgGenerator {
  generate(canvas: Canvas): string {
    const sortedLayers = [...canvas.layers]
      .filter((l) => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex)

    const defs = this.generateDefs(sortedLayers)
    const elements = sortedLayers.map((layer) => this.renderLayer(layer)).join('\n')

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="100%" height="auto" style="background-color: ${canvas.background};">
${defs ? `  <defs>\n${defs}\n  </defs>\n` : ''}  <g id="canvas-content">
${this.indent(elements, 4)}
  </g>
</svg>`
  }

  private generateDefs(_layers: AnyLayer[]): string {
    // Future: generate clip paths, masks, gradients
    return ''
  }

  private renderLayer(layer: AnyLayer): string {
    const t = layer.transform
    const attrs = `x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" opacity="${t.opacity}"`

    switch (layer.type) {
      case 'image':
      case 'gif':
      case 'svg':
        if (!layer.asset?.url) return ''
        return `<image ${attrs} href="${layer.asset.url}" preserveAspectRatio="xMidYMid slice" />`

      case 'text': {
        const textLayer = layer as import('@/types').TextLayer
        const fontWeight = textLayer.fontWeight >= 700 ? 'bold' : 'normal'
        return `<text ${attrs} fill="${textLayer.style.fill ?? '#000000'}" font-size="${textLayer.fontSize}" font-family="${textLayer.fontFamily}" font-weight="${fontWeight}">${textLayer.content}</text>`
      }

      case 'shape': {
        const shapeLayer = layer as import('@/types').ShapeLayer
        const fill = shapeLayer.style.fill ?? '#cccccc'
        switch (shapeLayer.shapeType) {
          case 'rect':
            return `<rect ${attrs} fill="${fill}"${shapeLayer.style.borderRadius ? ` rx="${shapeLayer.style.borderRadius}"` : ''} />`
          case 'circle':
            return `<circle cx="${t.x + t.width / 2}" cy="${t.y + t.height / 2}" r="${Math.min(t.width, t.height) / 2}" fill="${fill}" />`
          case 'ellipse':
            return `<ellipse cx="${t.x + t.width / 2}" cy="${t.y + t.height / 2}" rx="${t.width / 2}" ry="${t.height / 2}" fill="${fill}" />`
          default:
            return `<rect ${attrs} fill="${fill}" />`
        }
      }

      case 'group':
        return `<g id="${layer.id}">\n    </g>`

      default:
        return ''
    }
  }

  private indent(str: string, spaces: number): string {
    const indent = ' '.repeat(spaces)
    return str
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join('\n')
  }
}

export const svgGenerator = new SvgGenerator()
