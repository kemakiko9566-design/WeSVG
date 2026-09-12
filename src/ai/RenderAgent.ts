import type { Canvas, AIRenderResponse, AIRenderPayload } from '@/types'
import { PromptBuilder } from './PromptBuilder'
import { OutputValidator } from './OutputValidator'
import { WechatRenderer } from '@/renderer/WechatRenderer'

/**
 * RenderAgent - Orchestrates the AI rendering pipeline
 * Pipeline: Validator → Prompt Builder → LLM → Code Validator → Auto Fix → Output
 */
export class RenderAgent {
  private promptBuilder = new PromptBuilder()
  private validator = new OutputValidator()
  private fallbackRenderer = new WechatRenderer()

  /**
   * Render canvas to WeChat HTML using AI
   * Falls back to rule-based renderer if LLM fails
   */
  async renderToWeChat(canvas: Canvas): Promise<AIRenderResponse> {
    const warnings: string[] = []
    const errors: string[] = []

    try {
      // Phase 1: Build prompt
      const prompt = this.promptBuilder.build(canvas, [
        '禁止script',
        '禁止iframe',
        '仅允许svg动画',
      ])

      // Phase 2: Try calling LLM via API
      const aiResult = await this.callLLM(prompt)

      if (aiResult.success && aiResult.html) {
        // Phase 3: Validate output
        const validation = this.validator.validate(aiResult.html)

        if (validation.valid) {
          return {
            html: aiResult.html,
            warnings: validation.issues.filter((i) => i.type === 'warning').map((i) => i.message),
            errors: [],
          }
        }

        // Phase 4: Auto-fix if needed
        const fixedHtml = this.autoFix(aiResult.html, validation.issues)

        if (fixedHtml) {
          return {
            html: fixedHtml,
            warnings: [...warnings, 'AI output was auto-fixed'],
            errors: [],
          }
        }

        errors.push('AI output validation failed and auto-fix could not resolve')
      }

      // Phase 5: Fallback to rule-based renderer
      warnings.push('Using fallback renderer (AI unavailable or failed)')
      const fallbackResult = this.fallbackRenderer.render(canvas)

      return {
        html: fallbackResult.html,
        warnings: [...warnings, ...fallbackResult.warnings],
        errors,
      }
    } catch (e) {
      // Final fallback
      warnings.push('Using fallback renderer (error in AI pipeline)')
      const fallbackResult = this.fallbackRenderer.render(canvas)

      return {
        html: fallbackResult.html,
        warnings,
        errors: [e instanceof Error ? e.message : 'Unknown error'],
      }
    }
  }

  private async callLLM(prompt: { system: string; user: string }): Promise<{
    success: boolean
    html?: string
  }> {
    try {
      const response = await fetch('/api/v1/ai/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: prompt.system,
          user: prompt.user,
        }),
      })

      if (!response.ok) return { success: false }

      const data = await response.json()
      if (data.html) {
        return { success: true, html: data.html }
      }

      return { success: false }
    } catch {
      return { success: false }
    }
  }

  private autoFix(
    html: string,
    issues: Array<{ type: string; message: string; code: string }>,
  ): string | null {
    let fixed = html

    for (const issue of issues) {
      switch (issue.code) {
        case 'FORBIDDEN_SCRIPT':
          fixed = fixed.replace(/<script[\s\S]*?<\/script>/gi, '')
          break
        case 'FORBIDDEN_IFRAME':
          fixed = fixed.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
          break
        case 'UNKNOWN_TAG':
          // Replace unknown tags with div
          fixed = fixed.replace(/<(?!\/?(section|div|span|img|svg|g|path|rect|circle|text|animate|animateTransform|clipPath|mask|style|br|p|strong|em|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|caption|colgroup|col|thead|tbody|tfoot)\b)(\w+)/gi, '<div')
          break
        case 'INVALID_ANIMATION':
          // Replace invalid animation with fade-in
          fixed = fixed.replace(
            /<animateTransform[\s\S]*?<\/animateTransform>/gi,
            '<animate attributeName="opacity" from="0" to="1" dur="500ms" fill="freeze" />',
          )
          break
        default:
          break
      }
    }

    return fixed
  }
}

export const renderAgent = new RenderAgent()
