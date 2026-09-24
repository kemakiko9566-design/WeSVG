# AI Renderer Architecture

## Purpose

Convert Canvas JSON to WeChat-compatible HTML/SVG using AI (with rule-based fallback).

## Pipeline

```
Canvas JSON
  ↓
Validator (input validation)
  ↓
Prompt Builder (construct LLM prompt)
  ↓
LLM (OpenAI / Claude / Gemini)
  ↓
Output Validator (check against whitelist)
  ↓
Auto Fix (remove forbidden tags, replace unknown)
  ↓
If LLM fails → Fallback Renderer (rule-based WechatRenderer)
  ↓
Final Output + Warnings
```

## Components

| Component         | Path                        | Responsibility                        |
| ----------------- | --------------------------- | ------------------------------------- |
| `PromptBuilder`   | `src/ai/PromptBuilder.ts`   | Build stable prompts, strip UI fields |
| `RenderAgent`     | `src/ai/RenderAgent.ts`     | Orchestrate pipeline, handle fallback |
| `OutputValidator` | `src/ai/OutputValidator.ts` | HTML tag validation, scoring          |

## Prompt Strategy

**System Prompt:**

```
You are a WeChat Official Account SVG engineer.
Convert input JSON into WeChat-compatible runnable code.
Rules: No script, no iframe, no video, no external JS.
Keep layer order by zIndex.
Output pure HTML only.
```

**User Prompt:**

```
Canvas JSON:
{...cleaned canvas data...}
```

**Token Optimization:**

- Strip UI-only fields (`selected`, `hover`, `editing`, `temp`)
- Reduce token count by ~60%
- Only include essential fields: id, type, zIndex, transform, asset URL

## Fallback Strategy

When LLM fails (API error, invalid output, timeout):

1. Log the error
2. Use `WechatRenderer` (rule-based renderer)
3. Return rendered HTML with warning about fallback
