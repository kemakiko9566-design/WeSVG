// ============================================================
// WeSVG Studio - Data Contract & Type Definitions
// ============================================================

export type DeviceMode = 'phone' | 'tablet' | 'desktop' | 'fold'

export const DeviceModeWidths: Record<DeviceMode, number> = {
  phone: 375,
  tablet: 768,
  desktop: 1280,
  fold: 677,
}

export type LayerType = 'image' | 'gif' | 'svg' | 'text' | 'shape' | 'group'
export type ShapeType = 'rect' | 'circle' | 'ellipse' | 'polygon'
export type BlendMode = 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten' | 'darken'
export type Trigger = 'load' | 'click' | 'scroll' | 'hover'
export type AnimationPreset =
  | 'slide-up'
  | 'slide-down'
  | 'fade-in'
  | 'fade-out'
  | 'parallax'
  | 'pulse'
  | 'float'
  | 'rotate'
  | 'zoom-in'
  | 'zoom-out'
  | 'click-expand'
export type ExportTarget = 'html' | 'svg' | 'wechat'

export interface Transform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
}

export interface Shadow {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export interface Style {
  fill?: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
  shadow?: Shadow
  blendMode?: BlendMode
}

export interface Asset {
  id: string
  url: string
  mimeType: string
  size: number
  width: number
  height: number
}

export interface Animation {
  id: string
  type: AnimationPreset
  trigger: Trigger
  config: Record<string, unknown>
}

export interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  zIndex: number
  transform: Transform
  style: Style
  asset?: Asset
  animation?: Animation[]
  assetId?: string // IndexedDB asset reference for persistence
}

export interface TextLayer extends Layer {
  type: 'text'
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  textAlign: string
}

export interface ShapeLayer extends Layer {
  type: 'shape'
  shapeType: ShapeType
}
export interface GroupLayer extends Layer {
  type: 'group'
  children: string[]
}
export interface AssetLayer extends Layer {
  type: 'image' | 'gif' | 'svg'
}

export type AnyLayer = Layer | TextLayer | ShapeLayer | GroupLayer | AssetLayer

export interface Canvas {
  id: string
  width: number
  height: number
  background: string
  viewMode: DeviceMode
  layers: AnyLayer[]
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  version: string
  canvas: Canvas
}

export interface AnimationConfig {
  type: AnimationPreset
  trigger: Trigger
  duration: number
  delay: number
}

export interface ExportPayload {
  projectId: string
  target: ExportTarget
  canvas: Canvas
}
export interface AIRenderPayload {
  target: 'wechat'
  canvas: Canvas
  rules: string[]
}
export interface AIRenderResponse {
  html: string
  warnings: string[]
  errors: string[]
}
export interface ValidationResult {
  valid: boolean
  score: number
  issues: ValidationIssue[]
}
export interface ValidationIssue {
  type: 'error' | 'warning'
  message: string
  code: string
}
export interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data?: T
}
export interface QualityScore {
  score: number
  structure: number
  compatibility: number
  animation: number
  performance: number
  maintainability: number
}

export const ErrorCodes = {
  CANVAS_INIT_FAILED: 'CANVAS_INIT_FAILED',
  IMAGE_UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',
  JSON_EXPORT_FAILED: 'JSON_EXPORT_FAILED',
  AI_RENDER_FAILED: 'AI_RENDER_FAILED',
  CLIPBOARD_COPY_FAILED: 'CLIPBOARD_COPY_FAILED',
} as const

// -- M1 Additions --
export interface AssetRecord {
  id: string
  name: string
  mimeType: string
  width: number
  height: number
  blob: Blob
  createdAt: number
}

export interface CanvasProject {
  id: string
  name: string
  version: number
  zoom: number
  panX: number
  panY: number
  layers: AnyLayer[]
}

export interface ProjectMeta {
  id: string
  name: string
  updatedAt: string
  createdAt: string
}
