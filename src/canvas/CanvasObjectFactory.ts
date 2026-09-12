import Konva from 'konva'
import type { AnyLayer, TextLayer, ShapeLayer, AssetLayer } from '@/types'

export class CanvasObjectFactory {
  static createFromLayer(layer: AnyLayer, onDraw?: () => void): Konva.Node {
    switch (layer.type) {
      case 'image':
      case 'gif':
      case 'svg':
        return this.createAssetNode(layer as AssetLayer, onDraw)
      case 'text':
        return this.createTextNode(layer as TextLayer)
      case 'shape':
        return this.createShapeNode(layer as ShapeLayer)
      case 'group':
        return this.createGroupNode(layer)
      default:
        return this.createPlaceholderNode(layer)
    }
  }

  private static createAssetNode(layer: AssetLayer, onDraw?: () => void): Konva.Image {
    const image = new window.Image()
    // Don't set crossOrigin for blob URLs to avoid loading failures

    const konvaImage = new Konva.Image({
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      width: layer.transform.width,
      height: layer.transform.height,
      image,
      opacity: layer.transform.opacity,
      rotation: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      draggable: !layer.locked,
      visible: layer.visible,
    })

    image.onload = () => {
      konvaImage.image(image)
      konvaImage.width(layer.transform.width || image.naturalWidth)
      konvaImage.height(layer.transform.height || image.naturalHeight)
      onDraw?.()
    }

    image.onerror = () => {
      console.warn(`[Image] Failed to load: ${layer.asset?.url?.slice(0, 60)}`)
      const placeholder = new Konva.Rect({
        x: layer.transform.x,
        y: layer.transform.y,
        width: layer.transform.width,
        height: layer.transform.height,
        fill: '#ff0000',
        opacity: 0.2,
        stroke: '#ff0000',
        strokeWidth: 1,
      })
      konvaImage.destroy()
      onDraw?.()
    }

    image.src = layer.asset?.url ?? ''
    if (!image.src) console.warn('[Image] Empty src for layer:', layer.id)

    return konvaImage
  }

  private static createTextNode(layer: TextLayer): Konva.Text {
    return new Konva.Text({
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      width: layer.transform.width,
      height: layer.transform.height,
      text: layer.content,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      fontStyle: layer.fontWeight >= 700 ? 'bold' : 'normal',
      fill: layer.style.fill ?? '#000000',
      align: layer.textAlign as 'left' | 'center' | 'right',
      lineHeight: layer.lineHeight,
      letterSpacing: layer.letterSpacing,
      opacity: layer.transform.opacity,
      rotation: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      draggable: !layer.locked,
      visible: layer.visible,
    })
  }

  private static createShapeNode(layer: ShapeLayer): Konva.Shape {
    const shapeOptions = {
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      width: layer.transform.width,
      height: layer.transform.height,
      fill: layer.style.fill ?? '#cccccc',
      stroke: layer.style.stroke,
      strokeWidth: layer.style.strokeWidth,
      opacity: layer.transform.opacity,
      rotation: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      draggable: !layer.locked,
      visible: layer.visible,
    }

    switch (layer.shapeType) {
      case 'rect':
        return new Konva.Rect({
          ...shapeOptions,
          cornerRadius: layer.style.borderRadius,
        })
      case 'circle':
        return new Konva.Circle({
          ...shapeOptions,
          radius: Math.min(layer.transform.width, layer.transform.height) / 2,
        })
      case 'ellipse':
        return new Konva.Ellipse({
          ...shapeOptions,
          radiusX: layer.transform.width / 2,
          radiusY: layer.transform.height / 2,
        })
      case 'polygon':
        return new Konva.RegularPolygon({
          ...shapeOptions,
          sides: 6,
          radius: Math.min(layer.transform.width, layer.transform.height) / 2,
        })
      default:
        return new Konva.Rect(shapeOptions)
    }
  }

  private static createGroupNode(layer: AnyLayer): Konva.Group {
    return new Konva.Group({
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      width: layer.transform.width,
      height: layer.transform.height,
      opacity: layer.transform.opacity,
      rotation: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      visible: layer.visible,
    })
  }

  private static createPlaceholderNode(layer: AnyLayer): Konva.Rect {
    return new Konva.Rect({
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      width: layer.transform.width,
      height: layer.transform.height,
      fill: '#ff00ff',
      opacity: 0.3,
      draggable: !layer.locked,
      visible: layer.visible,
    })
  }
}
