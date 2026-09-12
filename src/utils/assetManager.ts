// Asset Manager — store images as blobs in IndexedDB
import { saveAsset, loadAssetBlob, deleteAsset, listAllAssets } from './db'
import { generateId } from './id'

export interface AssetHandle {
  id: string
  name: string
  mimeType: string
  width: number
  height: number
}

export async function storeAsset(
  blob: Blob,
  name: string,
  meta: { width: number; height: number },
): Promise<AssetHandle> {
  const id = `asset_${generateId()}`
  const record = {
    id,
    blob,
    meta: { name, mimeType: blob.type, width: meta.width, height: meta.height },
  }
  await saveAsset(id, blob, record.meta)
  return { id, name, mimeType: blob.type, width: meta.width, height: meta.height }
}

export async function loadAssetAsUrl(assetId: string): Promise<string | null> {
  const blob = await loadAssetBlob(assetId)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export async function getAssetList() {
  return listAllAssets()
}

export { deleteAsset }
