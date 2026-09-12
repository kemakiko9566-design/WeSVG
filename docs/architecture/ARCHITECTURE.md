# WeSVG Studio — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ HomePage │ │EditorPage│ │ Split    │ │ AI Mode      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Component Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ TopBar   │ │LeftSide  │ │ Viewport │ │ RightSide    │   │
│  │ StatusBr │ │Toolbar   │ │Overlay   │ │ ExportDialog │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Canvas Layer                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Canvas   │ │ Canvas   │ │ Canvas   │ │ Canvas        │   │
│  │ Manager  │ │ObjFactory│ │EventMgr  │ │ Serializer   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    State Layer (Pinia)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Project  │ │ Canvas   │ │Animation │ │ History      │   │
│  │ Store    │ │ Store    │ │ Store    │ │ Store        │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Asset    │ │ DB       │ │ RemoveBG │ │ Image        │   │
│  │ Manager  │ │ (IDB)    │ │ API      │ │ Compress     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Fastify)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/v1/image/remove-bg     /api/v1/assets/upload    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── types/          Data models and TypeScript interfaces
├── stores/         Pinia state management (5 stores)
├── canvas/         Konva canvas abstraction layer
├── layer/          Layer management utilities
├── animation/      Animation registration and engine
├── editor/         HTML parser, node mapper
├── renderer/       WeChat/SVG renderers
├── publisher/      Clipboard/file export
├── ai/             Prompt builder, output validator
├── components/     Vue components (20+)
├── pages/          Page-level components (Home, Editor)
├── utils/          Utilities (id, db, image, asset, removeBg)
├── assets/         Static assets
├── App.vue         Root component with global shortcuts
└── main.ts         Entry point
```

## Key Design Decisions

1. **Single Source of Truth**: All state flows through Pinia stores
2. **Layer-Architecture**: Canvas has 3 layers (workspace, design, UI)
3. **CSS Transform for Zoom**: Using CSS transform on wrapper div instead of Konva stage scaling
4. **Debounced Auto-Save**: 500ms debounce before writing to IndexedDB
5. **Snapshot Undo/Redo**: Full JSON snapshots, not incremental diffs
