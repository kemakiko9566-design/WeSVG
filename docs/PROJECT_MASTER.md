# WeSVG Studio — Project Master

| Field                 | Value                          |
| --------------------- | ------------------------------ |
| **Project**           | WeSVG Studio                   |
| **Version**           | 0.3.2                          |
| **Current Milestone** | M1 — Editor Core Stabilization |
| **Status**            | In Progress                    |
| **Last Updated**      | 2026-06-18                     |

## Completed Modules

- [x] Konva Canvas — Layer rendering, zoom, pan, grid
- [x] Layer System — Add/remove/reorder/visible/locked
- [x] Image Upload — File picker, blob URL display
- [x] Shape/Text Creation — Rect, text primitives
- [x] Selection System — Konva Transformer, orange accent handles
- [x] Floating Toolbar — Lock/copy/delete/rotate/remove-bg/crop
- [x] Device Preview — Phone/Tablet/Fold/Desktop modes
- [x] Export System — Copy HTML, download HTML/SVG/JSON
- [x] Multi-Mode Editor — Design/Split/Code/AI modes
- [x] Monaco Editor — HTML editing with syntax highlighting
- [x] Auto-Save — 500ms debounce to IndexedDB
- [x] Undo/Redo — 50-step history via Ctrl+Z/Shift+Z/Y
- [x] History Store — Snapshot-based undo/redo system
- [x] Asset Manager — IndexedDB blob storage for images
- [x] Text Editor Overlay — Double-click text editing via textarea
- [x] Workspace Background — Solid color / image background
- [x] RMBG-2.0 Backend — Fastify server with remove-bg API
- [x] Node Mapper — Layer ↔ HTML bidirectional mapping
- [x] HTML ↔ Canvas Parser — Bidirectional conversion

## In Progress

- [ ] Image Persistence — Upload images store in IndexedDB as blobs
- [ ] Layer Panel Integration — Lock icon, drag reorder
- [ ] Refresh Recovery — Auto-restore project from IndexedDB
- [ ] Asset Browser — Left panel listing uploaded assets

## Known Issues

| ID      | Title                          | Status |
| ------- | ------------------------------ | ------ |
| BUG-001 | Image lost after restart       | Fixed  |
| BUG-002 | Color change resets position   | Fixed  |
| BUG-003 | Blank page on navigation       | Fixed  |
| BUG-004 | Text/Shape click not working   | Fixed  |
| BUG-005 | Image not displaying on canvas | Fixed  |

## Next Milestone

**M2 — AI Remove Background & Export Polish**

- [ ] Integrate RMBG-2.0 model (`@xenova/transformers`)
- [ ] Before/After preview for remove-bg
- [ ] Loading/progress states for image processing
- [ ] Enhanced SVG export (animation support)
- [ ] WeChat compatibility validation

## Document Index

| Document                 | Path                                    |
| ------------------------ | --------------------------------------- |
| Context Compression Rule | `docs/CONTEXT_COMPRESSION_RULE.md`      |
| Project Master           | `docs/PROJECT_MASTER.md`                |
| Project Context          | `docs/PROJECT_CONTEXT.json`             |
| Agent Rules              | `docs/AGENT_RULES.md`                   |
| Bug Log                  | `docs/BUG_LOG.md`                       |
| Roadmap                  | `docs/ROADMAP.md`                       |
| Architecture Overview    | `docs/architecture/ARCHITECTURE.md`     |
| Canvas System            | `docs/architecture/CANVAS_SYSTEM.md`    |
| Asset System             | `docs/architecture/ASSET_SYSTEM.md`     |
| Storage System           | `docs/architecture/STORAGE_SYSTEM.md`   |
| UI Design System         | `docs/architecture/UI_DESIGN_SYSTEM.md` |
| Visual Code Sync         | `docs/architecture/VISUAL_CODE_SYNC.md` |
| Export Engine            | `docs/architecture/EXPORT_ENGINE.md`    |
| AI Renderer              | `docs/architecture/AI_RENDERER.md`      |
| M1 Report                | `docs/reports/M1_REPORT.md`             |
| ADR-001                  | `docs/decisions/ADR-001-Konva.md`       |
| ADR-002                  | `docs/decisions/ADR-002-IndexedDB.md`   |
| ADR-003                  | `docs/decisions/ADR-003-Monaco.md`      |
