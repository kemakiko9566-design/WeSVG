import type { ExportTarget } from '@/types'

export interface ExportResult {
  success: boolean
  blob?: Blob
  filename?: string
  error?: string
}

export class FileExporter {
  exportHtml(html: string, filename = 'wechat.html'): ExportResult {
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      return { success: true, blob, filename }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Export failed',
      }
    }
  }

  exportSvg(svg: string, filename = 'output.svg'): ExportResult {
    try {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      return { success: true, blob, filename }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Export failed',
      }
    }
  }

  exportJson(json: string, filename = 'project.json'): ExportResult {
    try {
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      return { success: true, blob, filename }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Export failed',
      }
    }
  }

  download(result: ExportResult): void {
    if (!result.success || !result.blob) return

    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename ?? 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  export(target: ExportTarget, content: string, filename?: string): ExportResult {
    switch (target) {
      case 'html':
        return this.exportHtml(content, filename ?? 'wechat.html')
      case 'svg':
        return this.exportSvg(content, filename ?? 'output.svg')
      case 'wechat':
        return this.exportHtml(content, filename ?? 'wechat.html')
      default:
        return { success: false, error: 'Unknown export target' }
    }
  }
}

export const fileExporter = new FileExporter()
