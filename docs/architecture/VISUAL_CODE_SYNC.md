# Visual ↔ Code Sync Architecture

## Purpose
Enable bidirectional synchronization between the visual canvas and the HTML code editor.

## Core Concept

```
Canvas Layer Tree
       ↕
  Virtual DOM AST  (htmlParser.ts)
       ↕
  HTML Source      (MonacoEditor.vue)
       ↕
  Node Mapping     (nodeMapper.ts)
```

All changes must pass through the AST layer. Neither canvas nor HTML directly modifies the other.

## Data Flow

### Canvas → Code
```
User selects layer on canvas
  ↓
CanvasViewport emits 'layer-select'
  ↓
SplitEditor.onCanvasLayerSelect()
  ↓
Query nodeMapper for data-node-id
  ↓
Search HTML source for data-layer-id
  ↓
MonacoEditor reveals line + highlights orange (1500ms)
```

### Code → Canvas
```
User clicks code line in Monaco
  ↓
MonacoEditor emits 'line-click'
  ↓
SplitEditor.onCodeLineClick()
  ↓
Parse line for data-layer-id attr
  ↓
Set uiStore.highlightLayer = layerId
  ↓
CanvasViewport watch → select node via Transformer
  ↓
Blue stroke highlight (1500ms)
```

## Node Mapping

```typescript
// Registered for each layer during HTML generation
<image data-layer-id="layer_001" data-node-id="node_abc123" ... />

// Mapping table (in-memory)
nodeMapper.getByLayerId('layer_001') → { layerId, nodeId }
nodeMapper.getByNodeId('node_abc123') → { layerId, nodeId }
```

## HTML ↔ Canvas Conversion

### Canvas → HTML (`canvasToHtml()`)
- Traverses sorted layers
- Generates `<section>` + `<svg>` wrapper
- Sets `viewBox`, `width: 100%`, `height: auto`
- Each layer rendered as appropriate SVG element
- `data-layer-id` and `data-node-id` attributes added

### HTML → Canvas (`htmlToCanvas()`)
- Regex-based tag parser (for supported subset)
- Extracts attributes: x, y, width, height, fill, opacity
- Creates corresponding layer objects with generated IDs
- Returns layers array + warnings for unsupported tags

## Known Limitations

- HTML → Canvas parsing is regex-based (not full DOM parser)
- Only supports a limited tag subset (image, text, rect, circle)
- No CSS style parsing (only inline attributes)
- Re-parsing overwrites all layers (no merge)
