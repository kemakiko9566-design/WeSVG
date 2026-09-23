// Image compression utilities
export interface CompressionResult {
  blob: Blob
  url: string
  width: number
  height: number
  size: number
}

const MAX_DIMENSION = 4096

export async function compressImage(file: File): Promise<CompressionResult> {
  console.log('[Image] compressing:', file.name, file.type, `${(file.size / 1024).toFixed(1)}KB`)
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      let { width, height } = img
      let quality = 1.0

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      if (file.size > 2 * 1024 * 1024) {
        quality = 0.7
      } else if (file.size > 500 * 1024) {
        quality = 0.8
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(img, 0, 0, width, height)
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'))
          const url = URL.createObjectURL(blob)
          console.log('[Image] compressed:', width, height, `${(blob.size / 1024).toFixed(1)}KB`)
          resolve({ blob, url, width, height, size: blob.size })
        },
        mimeType,
        quality,
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
