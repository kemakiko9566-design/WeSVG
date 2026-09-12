# Asset System Architecture

## Purpose

Manage uploaded images with persistent storage, avoiding ephemeral blob URLs.

## Responsibilities

- Store image blobs in IndexedDB
- Generate unique asset IDs
- Load blobs and create object URLs on demand
- Track asset metadata (name, type, dimensions)

## Data Flow

```
User uploads image
  ↓
FileReader / Image.onload (get dimensions)
  ↓
AssetManager.storeAsset(blob, name, meta)
  ↓
saveAsset() → IndexedDB (ASSETS_STORE)
  ↓
Return AssetHandle { id, name, mimeType, width, height }
  ↓
Layer.assetId = handle.id
  ↓
Canvas renders via loadAssetAsUrl(assetId)
```

## Asset Schema

```typescript
interface AssetRecord {
  id: string            // "asset_xxx"
  name: string          // Original filename
  mimeType: string      // "image/png", "image/jpeg"
  width: number         // Pixel width
  height: number        // Pixel height
  blob: Blob            // Actual image data
  createdAt: number     // Timestamp
}
```

## Storage

- **Database**: IndexedDB (`WeSVGStudio` v3)
- **Object Store**: `assets` (key: `id`)
- **Metadata**: Stored alongside blob in `meta` field
- **URL Strategy**: `URL.createObjectURL(blob)` created on load, valid until revoked

## API

| Function | Description |
|---|---|
| `storeAsset(blob, name, meta)` | Store blob, return handle |
| `loadAssetAsUrl(assetId)` | Load blob, return object URL |
| `getAssetList()` | List all stored assets (metadata only) |
| `deleteAsset(assetId)` | Remove blob from IndexedDB |

## Known Limitations

- No CDN storage (all images stored locally)
- No image optimization during storage
- No duplicate detection
- Blob URLs from `loadAssetAsUrl()` must be manually managed
