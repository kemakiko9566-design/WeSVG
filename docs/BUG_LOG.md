# WeSVG Studio — Bug Log

## BUG-001: Image lost after restart

| Field | Value |
|---|---|
| **Title** | Image lost after browser restart |
| **Description** | Images uploaded as blob URLs (`blob:http://...`) become invalid after page refresh |
| **Root Cause** | `URL.createObjectURL()` generates temporary URLs that don't survive page reload |
| **Solution** | Store image blobs in IndexedDB via `AssetManager`, reference by `assetId` instead of blob URL |
| **Status** | Fixed |
| **Affected Files** | `src/utils/db.ts`, `src/utils/assetManager.ts`, `src/utils/image.ts` |
| **Verification** | Upload image → refresh → image should restore from IndexedDB |

---

## BUG-002: Color change resets layer position

| Field | Value |
|---|---|
| **Title** | Changing shape color resets position |
| **Description** | When user changes shape fill color, the layer jumps back to default position |
| **Root Cause** | Deep watch on layers triggered `renderAllLayers()` which destroyed and recreated all Konva nodes, losing Transformer selection |
| **Solution** | Save and restore Transformer selection in `renderAllLayers()`, preserve selected node reference |
| **Status** | Fixed |
| **Affected Files** | `src/components/CanvasViewport.vue`, `src/canvas/CanvasEventManager.ts` |
| **Verification** | Add shape → change color → position stays correct |

---

## BUG-003: Blank page on navigation

| Field | Value |
|---|---|
| **Title** | Page renders blank after entering editor |
| **Description** | Navigating from HomePage to EditorPage shows blank screen |
| **Root Cause** | Split watch logic caused race condition — immediate watch fired before `onMounted` ran |
| **Solution** | Reverted to single `deep: true` watch, removed `immediate` watch that interfered with mount lifecycle |
| **Status** | Fixed |
| **Affected Files** | `src/components/CanvasViewport.vue` |
| **Verification** | Create project → enter editor → page should render |

---

## BUG-004: Text/Shape click not working

| Field | Value |
|---|---|
| **Title** | Clicking Text or Shape buttons has no effect |
| **Description** | Left sidebar buttons for adding text and shape layers don't create anything on canvas |
| **Root Cause** | Removed `layers` ref from `LeftSidebar.vue` during refactor but `addTextLayer()` and `addShapeLayer()` still referenced `layers.value`, causing `ReferenceError` |
| **Solution** | Remove `layers.value = canvasStore.getSortedLayers()` lines from all add functions |
| **Status** | Fixed |
| **Affected Files** | `src/components/LeftSidebar.vue` |
| **Verification** | Click Text → text layer appears on canvas |

---

## BUG-005: Image not displaying on canvas

| Field | Value |
|---|---|
| **Title** | Uploaded images don't show on canvas |
| **Description** | Images can be uploaded but the Konva canvas shows nothing |
| **Root Cause** | `image.crossOrigin = 'anonymous'` caused blob URL load failure. Also, compression pipeline using `compressImage()` could produce invalid blobs |
| **Solution** | Remove `crossOrigin` setting for blob URLs. Use original file blob URL directly instead of compression pipeline |
| **Status** | Fixed |
| **Affected Files** | `src/canvas/CanvasObjectFactory.ts`, `src/utils/image.ts`, `src/components/LeftSidebar.vue` |
| **Verification** | Upload image → image renders on canvas |
