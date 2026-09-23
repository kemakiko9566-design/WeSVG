// HTML ↔ Canvas Layer bidirectional converter
import type { AnyLayer, Canvas, Asset, Animation } from '@/types'
import { generateId } from '@/utils/id'
import { nodeMapper } from './nodeMapper'

// ---- Canvas → HTML ----
export function canvasToHtml(canvas: Canvas): string {
  const sorted = [...canvas.layers].filter((l) => l.visible).sort((a, b) => a.zIndex - b.zIndex)

  const body = sorted.map((l) => layerToHtml(l)).join('\n')

  return `<!-- WeSVG Studio — Generated HTML -->
<section style="width:100%;background:${canvas.background};position:relative;overflow:hidden;">
  <svg viewBox="0 0 ${canvas.width} ${canvas.height}" style="width:100%;height:auto;display:block;">
${body}
  </svg>
</section>`
}

function layerToHtml(layer: AnyLayer, indent = 4): string {
  const pad = ' '.repeat(indent)
  const nodeId = `node_${generateId()}`
  nodeMapper.register(layer.id, nodeId)

  const common = ` data-layer-id="${layer.id}" data-node-id="${nodeId}"`

  switch (layer.type) {
    case 'image':
    case 'gif': {
      const url = layer.asset?.url ?? ''
      return `${pad}<image${common} x="${layer.transform.x}" y="${layer.transform.y}" width="${layer.transform.width}" height="${layer.transform.height}" href="${url}" preserveAspectRatio="xMidYMid slice" opacity="${layer.transform.opacity}" />`
    }
    case 'text': {
      const tl = layer as import('@/types').TextLayer
      return `${pad}<text${common} x="${tl.transform.x}" y="${tl.transform.y}" font-size="${tl.fontSize}" font-family="${tl.fontFamily}" fill="${tl.style.fill ?? '#000'}" opacity="${tl.transform.opacity}">${escapeHtml(tl.content)}</text>`
    }
    case 'shape': {
      const sl = layer as import('@/types').ShapeLayer
      const fill = sl.style.fill ?? '#ccc'
      if (sl.shapeType === 'rect') {
        return `${pad}<rect${common} x="${sl.transform.x}" y="${sl.transform.y}" width="${sl.transform.width}" height="${sl.transform.height}" fill="${fill}"${sl.style.borderRadius ? ` rx="${sl.style.borderRadius}"` : ''} opacity="${sl.transform.opacity}" />`
      }
      if (sl.shapeType === 'circle') {
        return `${pad}<circle${common} cx="${sl.transform.x + sl.transform.width / 2}" cy="${sl.transform.y + sl.transform.height / 2}" r="${Math.min(sl.transform.width, sl.transform.height) / 2}" fill="${fill}" opacity="${sl.transform.opacity}" />`
      }
      return `${pad}<rect${common} x="${sl.transform.x}" y="${sl.transform.y}" width="${sl.transform.width}" height="${sl.transform.height}" fill="${fill}" opacity="${sl.transform.opacity}" />`
    }
    default:
      return `${pad}<!-- Layer ${layer.id}: ${layer.type} -->`
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- HTML → Canvas ----
export interface ParseResult {
  layers: AnyLayer[]
  warnings: string[]
}

export function htmlToCanvas(html: string): ParseResult {
  const warnings: string[] = []
  const layers: AnyLayer[] = []
  let zIndex = 0

  // Simple regex-based parser for the supported subset of HTML/SVG
  const tagRegex = /<(\w+)([^>]*)>/gi
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(html)) !== null) {
    const [, tag, attrsStr] = match
    const attrs = parseAttributes(attrsStr)

    try {
      const layer = tagToLayer(tag, attrs, ++zIndex)
      if (layer) layers.push(layer)
    } catch (e) {
      warnings.push(`Failed to parse <${tag}>: ${e}`)
    }
  }

  return { layers, warnings }
}

function parseAttributes(str: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w[\w-]*)\s*=\s*"([^"]*)"/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(str)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

function tagToLayer(tag: string, attrs: Record<string, string>, zIndex: number): AnyLayer | null {
  const x = parseNum(attrs.x) ?? parseNum(attrs.cx, 100)
  const y = parseNum(attrs.y) ?? parseNum(attrs.cy, 100)
  const rStr = attrs.r
  const rDoubled = rStr !== undefined ? String(parseInt(rStr) * 2) : undefined
  const width = parseNum(attrs.width) ?? parseNum(rDoubled, 200)
  const height = parseNum(attrs.height) ?? parseNum(rDoubled, 200)
  const opacity = parseNum(attrs.opacity, 1)
  const fill = attrs.fill

  const base = {
    id: `layer_${generateId()}`,
    name: `${tag}-${zIndex}`,
    zIndex,
    visible: true,
    locked: false,
    transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1, opacity },
    style: { fill },
    animation: [] as Animation[],
  }

  switch (tag) {
    case 'image':
      return {
        ...base,
        type: 'image' as const,
        asset: {
          id: `asset_${generateId()}`,
          url: attrs.href ?? attrs.src ?? '',
          mimeType: 'image/png',
          size: 0,
          width,
          height,
        },
      } as AnyLayer

    case 'text': {
      return {
        ...base,
        type: 'text' as const,
        content: attrs.content ?? 'Text',
        fontFamily: attrs['font-family'] ?? 'sans-serif',
        fontSize: parseNum(attrs['font-size'], 32),
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0,
        textAlign:
          attrs['text-anchor'] === 'middle'
            ? 'center'
            : attrs['text-anchor'] === 'end'
              ? 'right'
              : 'left',
      } as unknown as AnyLayer
    }

    case 'rect':
      return {
        ...base,
        type: 'shape' as const,
        shapeType: 'rect' as const,
      } as AnyLayer

    case 'circle':
      return {
        ...base,
        type: 'shape' as const,
        shapeType: 'circle' as const,
      } as AnyLayer

    default:
      return null
  }
}

function parseNum(val: string | undefined, fallback = 0): number {
  if (val === undefined) return fallback
  const n = parseFloat(val)
  return isNaN(n) ? fallback : n
}
