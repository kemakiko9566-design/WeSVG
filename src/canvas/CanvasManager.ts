import Konva from 'konva'
import { ref, onUnmounted } from 'vue'

export class CanvasManager {
  private stage: Konva.Stage | null = null
  private layer: Konva.Layer | null = null

  createCanvas(containerId: string, width: number, height: number) {
    if (this.stage) {
      this.destroyCanvas()
    }

    this.stage = new Konva.Stage({
      container: containerId,
      width,
      height,
    })

    this.layer = new Konva.Layer()
    this.stage.add(this.layer)

    return this.stage
  }

  destroyCanvas() {
    if (this.stage) {
      this.stage.destroy()
      this.stage = null
      this.layer = null
    }
  }

  resizeCanvas(width: number, height: number) {
    if (this.stage) {
      this.stage.width(width)
      this.stage.height(height)
    }
  }

  getStage(): Konva.Stage | null {
    return this.stage
  }

  getLayer(): Konva.Layer | null {
    return this.layer
  }

  getSize(): { width: number; height: number } | null {
    if (!this.stage) return null
    return {
      width: this.stage.width(),
      height: this.stage.height(),
    }
  }
}
