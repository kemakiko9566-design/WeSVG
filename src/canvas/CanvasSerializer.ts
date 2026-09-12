import type { Canvas, AnyLayer } from '@/types'

export class CanvasSerializer {
  static exportJSON(canvas: Canvas): string {
    return JSON.stringify(canvas, this.replacer, 2)
  }

  static importJSON(json: string): Canvas {
    const data = JSON.parse(json)
    return data as Canvas
  }

  private static replacer(_key: string, value: unknown): unknown {
    return value
  }

  static toMinimalJSON(canvas: Canvas): string {
    const minimal = {
      width: canvas.width,
      height: canvas.height,
      background: canvas.background,
      layers: canvas.layers.map((layer) => ({
        id: layer.id,
        type: layer.type,
        zIndex: layer.zIndex,
        transform: layer.transform,
        style: layer.style,
        asset: layer.asset,
        animation: layer.animation,
        ...(layer.type === 'text' && {
          content: (layer as import('@/types').TextLayer).content,
          fontFamily: (layer as import('@/types').TextLayer).fontFamily,
          fontSize: (layer as import('@/types').TextLayer).fontSize,
        }),
        ...(layer.type === 'shape' && {
          shapeType: (layer as import('@/types').ShapeLayer).shapeType,
        }),
        ...(layer.type === 'group' && {
          children: (layer as import('@/types').GroupLayer).children,
        }),
      })),
    }
    return JSON.stringify(minimal)
  }
}
