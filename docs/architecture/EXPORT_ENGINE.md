# Export Engine Architecture

## Purpose

Convert Canvas JSON to various output formats: HTML, SVG, WeChat-compatible HTML.

## Responsibilities

- Generate WeChat Official Account compatible HTML/SVG
- Generate standalone SVG files
- Validate output against WeChat tag whitelist
- Auto-fix common issues (forbidden tags, invalid animations)

## Data Flow

```
Canvas JSON
  ↓
Renderer (WechatRenderer / SvgGenerator)
  ↓
OutputValidator
  ↓
AutoFix (if needed)
  ↓
ClipboardPublisher / FileExporter
  ↓
Copy / Download
```

## Supported Outputs

| Format      | Class                | Description                                              |
| ----------- | -------------------- | -------------------------------------------------------- |
| WeChat HTML | `WechatRenderer`     | Section/SVG wrapper, SMIL animations, responsive viewBox |
| SVG         | `SvgGenerator`       | Standalone SVG with viewBox, inline styles               |
| JSON        | `FileExporter`       | Full project JSON export                                 |
| Clipboard   | `ClipboardPublisher` | Copy HTML string                                         |

## WeChat Compatibility Rules

**Allowed Tags:**
`section`, `div`, `span`, `img`, `svg`, `g`, `path`, `rect`, `circle`, `text`, `animate`, `animateTransform`, `clipPath`, `mask`

**Forbidden Tags:**
`script`, `iframe`, `video`, `audio`, `canvas`, `webgl`, `object`, `embed`

## Animation Mapping

| Canvas Animation | SVG SMIL Equivalent                   |
| ---------------- | ------------------------------------- |
| slide-up         | `animateTransform translate`          |
| fade-in          | `animate opacity`                     |
| rotate           | `animateTransform rotate`             |
| zoom-in          | `animateTransform scale`              |
| float            | `animateTransform translate (repeat)` |
| pulse            | `animateTransform scale (repeat)`     |
