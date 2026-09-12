# Canvas System Architecture

## Purpose

Provide professional-grade canvas interaction for SVG-based design, comparable to Figma/Canva.

## Responsibilities

- Render layers on Konva Stage
- Handle zoom (Ctrl+wheel) at cursor position
- Handle pan (Space+drag, middle mouse, background drag)
- Manage selection via Konva Transformer
- Render grid overlays (none/dot/square)
- Handle double-click for text editing
- Sync with workspace background

## Data Flow

```
User Action
  ↓
Konva Event Handler
  ↓
CanvasEventManager (selection, transformer)
  ↓
CanvasStore (state update)
  ↓
ProjectStore (auto-save + history)
  ↓
watch → renderAllLayers() / updateNodeProperties()
  ↓
Konva Stage re-draw
```

## Three-Layer Canvas

```
┌─────────────────────────────────┐
│  Workspace Background           │  ← #171717 or custom image
│  ┌───────────────────────────┐  │
│  │  Dot/Grid Overlay         │  │  ← Pointer events: none
│  │  ┌─────────────────────┐  │  │
│  │  │  Phone Frame        │  │  │  ← Dark frame, shadow
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │  Konva Stage   │  │  │  │  ← Canvas elements
│  │  │  │  + Transformer │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│  Floating Toolbar               │  ← SelectionToolbar
│  Text Editor Overlay            │  ← TextEditorOverlay
└─────────────────────────────────┘
```

## Key Components

| Component | Path | Responsibility |
|---|---|---|
| `CanvasManager` | `src/canvas/CanvasManager.ts` | Konva Stage lifecycle |
| `CanvasObjectFactory` | `src/canvas/CanvasObjectFactory.ts` | Layer → Konva Node |
| `CanvasEventManager` | `src/canvas/CanvasEventManager.ts` | Selection, Transformer, callbacks |
| `CanvasViewport` | `src/components/CanvasViewport.vue` | Zoom, pan, grid, crop, orchestration |
| `SelectionToolbar` | `src/components/SelectionToolbar.vue` | Floating action bar |
| `TextEditorOverlay` | `src/components/TextEditorOverlay.vue` | Inline text editing |

## Zoom System

| Property | Value |
|---|---|
| Range | 10% – 800% |
| Default | 35% |
| Center | Cursor position |
| Method | CSS transform on wrapper |
| Animation | Instant (no interpolation) |

## Pan System

| Trigger | Behavior |
|---|---|
| Space + LMB drag | Pan canvas |
| Middle mouse button | Pan canvas |
| Background click + drag | Pan canvas |
| Scroll wheel | Vertical scroll |
| Shift + scroll wheel | Horizontal scroll |

## Known Limitations

- Crop mode is implemented as overlay only (no actual crop operation)
- Text editing uses textarea overlay, not native Konva text editing
- No multi-select (shift+click)
- No alignment guides yet
- No layer dragging in layer panel
