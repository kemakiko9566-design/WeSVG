// Remove background API client
const API_BASE = 'http://localhost:4000'

export interface RemoveBgResult {
  success: boolean
  url?: string
  error?: string
}

export async function removeBackground(layerId: string, imageUrl: string): Promise<RemoveBgResult> {
  try {
    // Fetch the image blob from the blob URL
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Create form data
    const formData = new FormData()
    formData.append('image', blob, `layer-${layerId}.png`)

    // Send to backend
    const apiResponse = await fetch(`${API_BASE}/api/v1/image/remove-bg`, {
      method: 'POST',
      body: formData,
    })

    if (!apiResponse.ok) {
      const err = await apiResponse.text()
      return { success: false, error: `Server error: ${err}` }
    }

    const result = await apiResponse.json()

    if (result.success && result.transparentUrl) {
      return { success: true, url: result.transparentUrl }
    }

    return { success: false, error: result.message || 'Remove background failed' }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to remove background',
    }
  }
}
