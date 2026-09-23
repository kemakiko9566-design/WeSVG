# Storage System Architecture

## Purpose

Provide reliable persistence for project data and assets.

## Layers

```
┌────────────────────────────────────────────┐
│              localStorage                   │
│  Project meta list (ids, names, dates)     │
│  Key: "wesvg_meta"                         │
├────────────────────────────────────────────┤
│              IndexedDB                      │
│  Database: "WeSVGStudio" (v3)              │
│  ├── ObjectStore: "projects"               │
│  │   { id, data: JSON string, ts }         │
│  └── ObjectStore: "assets"                 │
│       { id, blob, meta, ts }               │
├────────────────────────────────────────────┤
│            Auto-Save (Pinia)               │
│  500ms debounce on any project change      │
│  Triggered by deep:true watch              │
│  Saves full project JSON to IndexedDB      │
└────────────────────────────────────────────┘
```

## Data Flow

```
User Action → Pinia Store → watch (deep:true)
  ↓
triggerAutoSave() → 500ms debounce
  ↓
saveProject(id, JSON.stringify(project))
  ↓
IndexedDB.put({ id, data, ts })
```

## Project Recovery Flow

```
App loads
  ↓
HomePage shown
  ↓
User clicks project card
  ↓
projectStore.loadProject(id)
  ↓
loadProject(id) from IndexedDB
  ↓
If found → restore CanvasProject
  ↓
If not found → fallback to localStorage meta (empty canvas)
  ↓
Editor mounts → canvas renders
```

## Auto-Save Triggers

Any of the following trigger a 500ms debounced save:

- Layer added/removed/reordered
- Layer properties changed (position, style, visibility)
- Layer locked/unlocked
- Text content modified
- Canvas resized
- Zoom/pan changed

## IndexedDB Schema v3

| Object Store | Key  | Value                                          |
| ------------ | ---- | ---------------------------------------------- |
| `projects`   | `id` | `{ id, data: string, ts: number }`             |
| `assets`     | `id` | `{ id, blob: Blob, meta: object, ts: number }` |

## Known Limitations

- No version history in storage (old data overwritten)
- No cloud sync
- No conflict resolution
- Single-user only
