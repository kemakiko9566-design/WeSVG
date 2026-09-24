// IndexedDB — Project Store + Asset Blob Store
const DB_NAME = 'WeSVGStudio'
const DB_VERSION = 3
const PROJECTS_STORE = 'projects'
const ASSETS_STORE = 'assets'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        db.createObjectStore(ASSETS_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ---- Project Save/Load ----
export async function saveProject(id: string, data: string) {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readwrite')
  tx.objectStore(PROJECTS_STORE).put({ id, data, ts: Date.now() })
  tx.commit()
  db.close()
}

export async function loadProject(id: string): Promise<string | null> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readonly')
  return new Promise((resolve) => {
    const get = tx.objectStore(PROJECTS_STORE).get(id)
    get.onsuccess = () => resolve(get.result?.data ?? null)
    get.onerror = () => resolve(null)
  })
}

export async function listProjects(): Promise<string[]> {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readonly')
  return new Promise((resolve) => {
    const getAll = tx.objectStore(PROJECTS_STORE).getAll()
    getAll.onsuccess = () => resolve(Array.from(getAll.result ?? []))
    getAll.onerror = () => resolve([])
  })
}

export async function deleteProject(id: string) {
  const db = await openDB()
  const tx = db.transaction(PROJECTS_STORE, 'readwrite')
  tx.objectStore(PROJECTS_STORE).delete(id)
  tx.commit()
  db.close()
}

// ---- Asset Blob Store ----
export async function saveAsset(id: string, blob: Blob, meta: Record<string, unknown> = {}) {
  const db = await openDB()
  const tx = db.transaction(ASSETS_STORE, 'readwrite')
  tx.objectStore(ASSETS_STORE).put({ id, blob, meta, ts: Date.now() })
  tx.commit()
  db.close()
}

export async function loadAssetBlob(id: string): Promise<Blob | null> {
  const db = await openDB()
  const tx = db.transaction(ASSETS_STORE, 'readonly')
  return new Promise((resolve) => {
    const get = tx.objectStore(ASSETS_STORE).get(id)
    get.onsuccess = () => resolve(get.result?.blob ?? null)
    get.onerror = () => resolve(null)
  })
}

export async function loadAssetMeta(id: string): Promise<Record<string, unknown> | null> {
  const db = await openDB()
  const tx = db.transaction(ASSETS_STORE, 'readonly')
  return new Promise((resolve) => {
    const get = tx.objectStore(ASSETS_STORE).get(id)
    get.onsuccess = () => {
      const r = get.result
      resolve(r ? { id: r.id, meta: r.meta, ts: r.ts } : null)
    }
    get.onerror = () => resolve(null)
  })
}

export async function deleteAsset(id: string) {
  const db = await openDB()
  const tx = db.transaction(ASSETS_STORE, 'readwrite')
  tx.objectStore(ASSETS_STORE).delete(id)
  tx.commit()
  db.close()
}

export async function listAllAssets(): Promise<
  { id: string; meta: Record<string, unknown>; ts: number }[]
> {
  const db = await openDB()
  const tx = db.transaction(ASSETS_STORE, 'readonly')
  return new Promise((resolve) => {
    const getAll = tx.objectStore(ASSETS_STORE).getAll()
    getAll.onsuccess = () => {
      const items = getAll.result ?? []
      resolve(items.map((r: any) => ({ id: r.id, meta: r.meta, ts: r.ts })))
    }
    getAll.onerror = () => resolve([])
  })
}
