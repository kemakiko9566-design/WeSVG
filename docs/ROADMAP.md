# WeSVG Studio — Roadmap

## M1: Editor Core Stabilization (Current)

**Goal**: Solidify editor foundation — auto-save, undo/redo, image persistence, text editing, Canva-style selection.

**Status**: In Progress (~70%)

| Feature | Status |
|---|---|
| Auto-Save (500ms debounce to IndexedDB) | ✅ |
| Undo/Redo (50-step, Ctrl+Z/Shift+Z/Y) | ✅ |
| Asset Manager (IndexedDB blob storage) | ✅ |
| Double-click text editing (textarea overlay) | ✅ |
| Canva-style selection (orange glow, white handles) | ✅ |
| Layer locking system | ✅ |
| Workspace background (color/image) | ✅ |
| Refresh recovery (load from IndexedDB) | ⏳ |
| Image persistence (store blob, not URL) | ⏳ |
| Asset browser in sidebar | ⏳ |

---

## M2: AI Remove Background & Export Polish

**Goal**: Integrate RMBG-2.0 model, enhance SVG export, add WeChat compatibility validation.

| Feature | Priority |
|---|---|
| RMBG-2.0 model integration (`@xenova/transformers`) | P0 |
| Before/After preview for remove-bg | P1 |
| Loading/progress states | P1 |
| Enhanced SVG export (animation, SMIL) | P1 |
| WeChat HTML validation engine | P2 |
| Export quality scoring | P2 |

---

## M3: AI Content Generation

**Goal**: LLM-powered HTML/SVG generation with canvas synchronization.

| Feature | Priority |
|---|---|
| AI Chat panel in AI Mode | P0 |
| HTML generation via LLM | P0 |
| HTML sanitization & validation | P1 |
| Canvas layer generation from AI output | P1 |
| Prompt templates library | P2 |

---

## M4: Visual ↔ Code Sync

**Goal**: Full bidirectional synchronization between canvas and code editor.

| Feature | Priority |
|---|---|
| Canvas click → code line highlight | ✅ |
| Code line click → canvas layer highlight | ✅ |
| HTML → Canvas layer parsing | ✅ |
| Canvas → HTML generation | ✅ |
| Real-time sync (500ms debounce) | P1 |
| Conflict detection & resolution | P2 |

---

## M5: WeChat Compatibility Engine

**Goal**: Ensure all exported code runs in WeChat Official Account environment.

| Feature | Priority |
|---|---|
| Tag whitelist validation | ✅ |
| Forbidden tag removal | ✅ |
| SVG animation SMIL mapping | P0 |
| Responsive viewBox generation | P1 |
| Auto-fix engine | P1 |
| WeChat draft API integration | P2 |

---

## M6: Template Market & Collaboration

**Goal**: Community templates, team collaboration (future).

| Feature | Priority |
|---|---|
| Template gallery | P2 |
| Team projects | P3 |
| Real-time collaboration | P3 |
| Cloud sync | P3 |
