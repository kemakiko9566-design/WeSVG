# ADR-001: Konva.js as Canvas Library

## Decision

Use **Konva.js** as the primary canvas rendering library.

## Reason

- Superior large-canvas performance vs Fabric.js
- Mature Transformer implementation (selection handles, resize, rotate)
- Built-in layer management (zIndex, groups)
- Active maintenance and community
- Vue-Konva integration available

## Alternatives Considered

| Library        | Reason Rejected                                            |
| -------------- | ---------------------------------------------------------- |
| **Fabric.js**  | Slower on large canvases, less polished Transformer        |
| **Pixi.js**    | Game-focused, no built-in selection/transform              |
| **HTML DOM**   | Cannot render SVG interactively, performance limits        |
| **Canvas API** | Too low-level, would need to build everything from scratch |

## Consequences

- Better performance for 100+ layer documents
- Konva Transformer provides professional selection UX
- Dependency on Konva ecosystem
- Learning curve for advanced features (filters, animations)

## Status

**Accepted** — Implemented in `src/canvas/`
