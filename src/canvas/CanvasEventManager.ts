import Konva from 'konva'
import type { CanvasManager } from './CanvasManager'

export interface CanvasEventCallbacks {
  onSelect?: (nodeId: string | null) => void
  onMove?: (nodeId: string, x: number, y: number) => void
  onResize?: (nodeId: string, width: number, height: number) => void
  onRotate?: (nodeId: string, rotation: number) => void
  onDelete?: (nodeId: string) => void
  onDeselect?: () => void
}

export class CanvasEventManager {
  private manager: CanvasManager
  private callbacks: CanvasEventCallbacks = {}
  private selectedNode: Konva.Node | null = null
  private _transformer: Konva.Transformer | null = null

  constructor(manager: CanvasManager) {
    this.manager = manager
  }

  get transformer(): Konva.Transformer | null {
    return this._transformer
  }

  setCallbacks(callbacks: CanvasEventCallbacks) {
    this.callbacks = callbacks
  }

  initTransformer() {
    const layer = this.manager.getLayer()
    if (!layer) return

    this._transformer = new Konva.Transformer({
      // Premium selection border
      borderStroke: '#FF6A00',
      borderStrokeWidth: 2,
      borderDash: [0],
      // Glow effect via shadow
      shadowColor: '#FF6A00',
      shadowBlur: 20,
      shadowOpacity: 0.25,
      shadowEnabled: true,
      // Corner handles: white circle with orange border, 12px
      anchorFill: '#ffffff',
      anchorStroke: '#FF6A00',
      anchorStrokeWidth: 2,
      anchorSize: 12,
      anchorCornerRadius: 6,
      // Rotation handle
      rotateEnabled: true,
      rotationSnaps: [
        0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285,
        300, 315, 330, 345,
      ],
      rotateAnchorOffset: 30,
      // Behavior
      keepRatio: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    })

    // Create and add rotation handle line (Konva doesn't have built-in rotation line handle)
    // The built-in rotate handle is already styled

    layer.add(this._transformer)
    layer.draw()

    // Bind transformer transformend -> sync resize/rotate back to store
    this._transformer.on('transformend', () => {
      if (!this._transformer) return
      const nodes = this._transformer.nodes()
      nodes.forEach((node) => {
        const id = node.id()
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        const width = node.width() * scaleX
        const height = node.height() * scaleY
        const rotation = node.rotation()
        const x = node.x()
        const y = node.y()
        this.callbacks.onResize?.(id, width, height)
        this.callbacks.onRotate?.(id, rotation)
        this.callbacks.onMove?.(id, x, y)

        // Reset Konva's scale to 1 after extracting actual size
        node.scaleX(1)
        node.scaleY(1)
        node.width(width)
        node.height(height)
      })
    })
  }

  /**
   * Bind dragend event to a Konva node so position changes sync back to the store.
   */
  bindNodeDrag(node: Konva.Node) {
    node.on('dragend', () => {
      const id = node.id()
      const pos = node.position()
      this.callbacks.onMove?.(id, pos.x, pos.y)
    })
  }

  onNodeClick(node: Konva.Node) {
    if (this.selectedNode === node) return

    this.selectedNode = node
    if (this._transformer) {
      this._transformer.nodes([node])
      this.manager.getLayer()?.draw()
    }

    this.callbacks.onSelect?.(node.id())
  }

  onDeselect() {
    this.selectedNode = null
    if (this._transformer) {
      this._transformer.nodes([])
      this.manager.getLayer()?.draw()
    }
    this.callbacks.onDeselect?.()
  }

  getSelectedNode(): Konva.Node | null {
    return this.selectedNode
  }

  destroy() {
    this.selectedNode = null
    this._transformer = null
  }
}
