import { describe, it, expect } from 'vitest'
import { CanvasSerializer } from '@/canvas/CanvasSerializer'
import type { Canvas } from '@/types'

/**
 * Canvas → JSON → Canvas 往返测试
 *
 * 这是 P0 退出条件之一（见 docs/WeSVG-开发文档.md §21）。
 * 测试序列化器不会丢失图层的关键属性。
 */

function makeFixtureCanvas(): Canvas {
  return {
    id: 'canvas_test',
    width: 1080,
    height: 3000,
    background: '#ffffff',
    viewMode: 'phone',
    layers: [
      {
        id: 'layer_1',
        name: 'Background',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: 1,
        transform: {
          x: 0,
          y: 0,
          width: 1080,
          height: 3000,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        },
        style: { fill: '#f0f0f0', stroke: '#333333', strokeWidth: 2 },
        shapeType: 'rect',
      },
      {
        id: 'layer_2',
        name: 'Title',
        type: 'text',
        visible: true,
        locked: false,
        zIndex: 2,
        transform: {
          x: 100,
          y: 200,
          width: 880,
          height: 120,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        },
        style: { fill: '#222222' },
        content: 'WeSVG Studio',
        fontFamily: 'sans-serif',
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: 0,
        textAlign: 'left',
      },
    ],
  }
}

describe('CanvasSerializer', () => {
  it('exportJSON 产出合法 JSON', () => {
    const canvas = makeFixtureCanvas()
    const json = CanvasSerializer.exportJSON(canvas)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('Canvas → JSON → Canvas 关键属性不变', () => {
    const original = makeFixtureCanvas()
    const json = CanvasSerializer.exportJSON(original)
    const restored = CanvasSerializer.importJSON(json)

    // 画布级属性
    expect(restored.id).toBe(original.id)
    expect(restored.width).toBe(original.width)
    expect(restored.height).toBe(original.height)
    expect(restored.background).toBe(original.background)
    expect(restored.viewMode).toBe(original.viewMode)

    // 图层数量
    expect(restored.layers).toHaveLength(original.layers.length)

    // 逐层比较
    for (let i = 0; i < original.layers.length; i++) {
      const a = original.layers[i]
      const b = restored.layers[i]

      expect(b.id).toBe(a.id)
      expect(b.type).toBe(a.type)
      expect(b.zIndex).toBe(a.zIndex)
      expect(b.visible).toBe(a.visible)
      expect(b.locked).toBe(a.locked)
      expect(b.transform).toEqual(a.transform)
      expect(b.style).toEqual(a.style)

      if (a.type === 'text' && b.type === 'text') {
        expect(b.content).toBe(a.content)
        expect(b.fontFamily).toBe(a.fontFamily)
        expect(b.fontSize).toBe(a.fontSize)
        expect(b.fontWeight).toBe(a.fontWeight)
      }
      if (a.type === 'shape' && b.type === 'shape') {
        expect(b.shapeType).toBe(a.shapeType)
      }
    }
  })

  it('toMinimalJSON 不丢失 layer 关键字段', () => {
    const canvas = makeFixtureCanvas()
    const minimal = JSON.parse(CanvasSerializer.toMinimalJSON(canvas))

    expect(minimal.width).toBe(canvas.width)
    expect(minimal.height).toBe(canvas.height)
    expect(minimal.background).toBe(canvas.background)
    expect(minimal.layers).toHaveLength(2)
    expect(minimal.layers[0].id).toBe('layer_1')
    expect(minimal.layers[1].id).toBe('layer_2')
    expect(minimal.layers[1].content).toBe('WeSVG Studio')
  })

  it('空画布可以正常序列化与反序列化', () => {
    const empty: Canvas = {
      id: 'canvas_empty',
      width: 1080,
      height: 3000,
      background: '#ffffff',
      viewMode: 'phone',
      layers: [],
    }
    const json = CanvasSerializer.exportJSON(empty)
    const restored = CanvasSerializer.importJSON(json)
    expect(restored.layers).toEqual([])
    expect(restored.width).toBe(1080)
  })
})
