import type { AnyLayer, LayerType, ShapeType, Transform, Style, Asset } from '@/types'
import { useCanvasStore } from '@/stores/canvasStore'
import { useProjectStore } from '@/stores/projectStore'
import { generateId } from '@/utils/id'

export class LayerManager {
  private _canvasStore: ReturnType<typeof useCanvasStore> | null = null
  private _projectStore: ReturnType<typeof useProjectStore> | null = null

  private get canvasStore() {
    if (!this._canvasStore) {
      this._canvasStore = useCanvasStore()
    }
    return this._canvasStore
  }

  private get projectStore() {
    if (!this._projectStore) {
      this._projectStore = useProjectStore()
    }
    return this._projectStore
  }

  createLayer(type: LayerType, props: Partial<AnyLayer> = {}): AnyLayer {
    const baseLayer: AnyLayer = {
      id: `layer_${generateId()}`,
      name: props.name ?? `${type}-${Date.now().toString(36)}`,
      type,
      visible: true,
      locked: false,
      zIndex: props.zIndex ?? this.getNextZIndex(),
      transform: props.transform ?? {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      },
      style: props.style ?? {
        fill: type === 'shape' ? '#4A90D9' : undefined,
      },
      asset: props.asset,
      animation: props.animation ?? [],
    }

    return baseLayer
  }

  createTextLayer(content = 'Text', props: Partial<AnyLayer> = {}) {
    return {
      ...this.createLayer('text', props),
      content,
      fontFamily: 'sans-serif',
      fontSize: 32,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      textAlign: 'left',
    } as import('@/types').TextLayer
  }

  createShapeLayer(shapeType: ShapeType, props: Partial<AnyLayer> = {}) {
    return {
      ...this.createLayer('shape', props),
      shapeType,
    } as import('@/types').ShapeLayer
  }

  createAssetLayer(type: 'image' | 'gif' | 'svg', asset: Asset, props: Partial<AnyLayer> = {}) {
    return {
      ...this.createLayer(type, {
        ...props,
        transform: {
          x: 0,
          y: 0,
          width: asset.width,
          height: asset.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        },
        asset,
      }),
    } as import('@/types').AssetLayer
  }

  createGroupLayer(props: Partial<AnyLayer> = {}) {
    return {
      ...this.createLayer('group', props),
      children: [],
    } as import('@/types').GroupLayer
  }

  addLayer(layer: AnyLayer) {
    this.canvasStore.addLayer(layer)
  }

  removeLayer(layerId: string) {
    this.canvasStore.removeLayer(layerId)
  }

  updateLayer(layerId: string, updates: Partial<AnyLayer>) {
    this.canvasStore.updateLayer(layerId, updates)
  }

  moveLayerUp(layerId: string) {
    const layers = this.canvasStore.getSortedLayers()
    const index = layers.findIndex((l) => l.id === layerId)
    if (index < layers.length - 1) {
      const currentZ = layers[index].zIndex
      const nextZ = layers[index + 1].zIndex
      this.canvasStore.reorderLayer(layerId, nextZ)
      this.canvasStore.reorderLayer(layers[index + 1].id, currentZ)
    }
  }

  moveLayerDown(layerId: string) {
    const layers = this.canvasStore.getSortedLayers()
    const index = layers.findIndex((l) => l.id === layerId)
    if (index > 0) {
      const currentZ = layers[index].zIndex
      const prevZ = layers[index - 1].zIndex
      this.canvasStore.reorderLayer(layerId, prevZ)
      this.canvasStore.reorderLayer(layers[index - 1].id, currentZ)
    }
  }

  toggleVisibility(layerId: string) {
    const layer = this.canvasStore.getLayers().find((l) => l.id === layerId)
    if (layer) {
      this.canvasStore.updateLayer(layerId, { visible: !layer.visible })
    }
  }

  toggleLock(layerId: string) {
    const layer = this.canvasStore.getLayers().find((l) => l.id === layerId)
    if (layer) {
      this.canvasStore.updateLayer(layerId, { locked: !layer.locked })
    }
  }

  private getNextZIndex(): number {
    const layers = this.canvasStore.getLayers()
    if (layers.length === 0) return 1
    return Math.max(...layers.map((l) => l.zIndex)) + 1
  }
}

export const layerManager = new LayerManager()
