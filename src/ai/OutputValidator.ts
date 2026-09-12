import type { ValidationResult, ValidationIssue } from '@/types'

/**
 * OutputValidator - Validates AI output HTML
 * Ensures WeChat compatibility and safety
 */
export class OutputValidator {
  // WeChat allowed tags
  private readonly allowedTags = new Set([
    'section', 'div', 'span', 'img', 'svg', 'g', 'path',
    'rect', 'circle', 'text', 'animate', 'animateTransform',
    'clipPath', 'mask', 'style', 'br', 'p', 'strong', 'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'table', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
    'thead', 'tbody', 'tfoot',
  ])

  // Forbidden tags
  private readonly forbiddenTags = new Set([
    'script', 'iframe', 'video', 'audio', 'canvas',
    'webgl', 'object', 'embed', 'frame', 'frameset',
    'applet', 'form', 'input', 'select', 'textarea',
    'button',
  ])

  validate(html: string): ValidationResult {
    const issues: ValidationIssue[] = []

    // Check 1: No forbidden tags
    for (const tag of this.forbiddenTags) {
      const regex = new RegExp(`<${tag}[\\s>]`, 'gi')
      if (regex.test(html)) {
        issues.push({
          type: 'error',
          message: `Forbidden tag detected: ${tag}`,
          code: `FORBIDDEN_${tag.toUpperCase()}`,
        })
      }
    }

    // Check 2: HTML is parseable
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const parseErrors = doc.querySelectorAll('parsererror')
    if (parseErrors.length > 0) {
      issues.push({
        type: 'error',
        message: 'Invalid HTML structure',
        code: 'INVALID_HTML',
      })
    }

    // Check 3: No unknown tags
    const allTags = doc.body.querySelectorAll('*')
    allTags.forEach((el) => {
      const tagName = el.tagName.toLowerCase()
      if (!this.allowedTags.has(tagName) && !this.forbiddenTags.has(tagName)) {
        issues.push({
          type: 'warning',
          message: `Unknown tag: <${tagName}>`,
          code: 'UNKNOWN_TAG',
        })
      }
    })

    // Check 4: No onclick or event handlers
    if (/on\w+=["']/i.test(html)) {
      issues.push({
        type: 'error',
        message: 'Inline event handlers detected (onclick etc.)',
        code: 'INLINE_EVENT',
      })
    }

    // Check 5: No external JS URLs
    const jsUrlPattern = /src=["'][^"']*\.js["']/gi
    if (jsUrlPattern.test(html)) {
      issues.push({
        type: 'error',
        message: 'External JS file reference detected',
        code: 'EXTERNAL_JS',
      })
    }

    // Check 6: Has svg viewBox
    if (!/viewBox\s*=\s*["']\d+\s+\d+\s+\d+\s+\d+["']/i.test(html)) {
      issues.push({
        type: 'warning',
        message: 'Missing SVG viewBox attribute',
        code: 'MISSING_VIEWBOX',
      })
    }

    const score = this.calculateScore(issues)
    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      score,
      issues,
    }
  }

  private calculateScore(issues: ValidationIssue[]): number {
    let score = 100
    for (const issue of issues) {
      if (issue.type === 'error') {
        score -= 15
      } else {
        score -= 5
      }
    }
    return Math.max(0, score)
  }
}

export const outputValidator = new OutputValidator()
