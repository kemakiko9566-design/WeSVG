export class ClipboardPublisher {
  async copy(html: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(html)
        return { success: true }
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = html
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const result = document.execCommand('copy')
      document.body.removeChild(textArea)

      return {
        success: result,
        error: result ? undefined : 'Copy command failed',
      }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown copy error',
      }
    }
  }
}

export const clipboardPublisher = new ClipboardPublisher()
