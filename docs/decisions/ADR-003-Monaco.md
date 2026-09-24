# ADR-003: Monaco Editor for Code Mode

## Decision

Use **Monaco Editor** (VSCode's editor) for code editing in Split and Code modes.

## Reason

- Same engine as VSCode — professional code editing
- Built-in syntax highlighting for HTML, CSS, JavaScript, SVG
- Minimap, code folding, search/replace
- Language services (auto-complete, error markers)
- Well-maintained by Microsoft

## Alternatives Considered

| Editor              | Reason Rejected                        |
| ------------------- | -------------------------------------- |
| **CodeMirror 6**    | Less feature-rich, no built-in minimap |
| **Ace Editor**      | Less maintained, older architecture    |
| **ContentEditable** | Too primitive, no syntax highlighting  |
| **Prism.js**        | Read-only highlighting, no editing     |

## Consequences

- Large bundle size (~4MB gzipped)
- Worker threads for language services
- Extra build configuration for web workers
- Theming requires CSS overrides

## Status

**Accepted** — Implemented in `src/components/MonacoEditor.vue` via `monaco-editor` npm package
