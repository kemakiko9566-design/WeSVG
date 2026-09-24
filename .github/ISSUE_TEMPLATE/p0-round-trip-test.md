---
name: P0 - Canvas/JSON round-trip 测试
about: 在 CI 中跑通至少 1 个 Canvas ↔ JSON 往返测试
title: '[P0] Canvas/JSON round-trip 测试在 CI 通过'
labels:
  - 'P0'
  - 'test'
  - 'ci'
assignees: ''
---

## 背景

WeSVG Studio 的核心数据流是 `Canvas → JSON → Canvas`（参见 `src/canvas/CanvasSerializer.ts` 和 ADR-004）。

当前**没有任何自动化测试**，任何修改都可能破坏这个核心数据流。

## 目标

**在 CI 中至少 1 个 round-trip 测试持续通过，覆盖文字、图片、形状三种图层类型的关键属性保持不变。**

## 验收标准

- [ ] 接入 vitest（PR 已在准备）。
- [ ] `npm run test` 至少包含 1 个 Canvas → JSON → Canvas 往返测试。
- [ ] 测试覆盖以下场景：
  - 文字图层：content、fontFamily、fontSize、fontWeight、颜色
  - 图片图层：assetId、位置、尺寸、可见性、锁定
  - 形状图层：shapeType、fill、stroke、borderRadius
- [ ] GitHub Actions CI 配置包含 `npm run test` 步骤（参见 `.github/workflows/ci.yml`）。
- [ ] PR 状态检查要求 test 通过才允许 merge。

## 技术要点

- 使用 Vitest + happy-dom。
- 测试文件位于 `tests/unit/canvas/CanvasSerializer.test.ts`。
- 测试用例可直接复用 `src/types/index.ts` 中的类型。
- 后续可扩展到：
  - Canvas ↔ HTML round-trip（`src/editor/htmlParser.ts` + `src/renderer/`）
  - History 一致性测试（参见 #P0-2）
  - 持久化测试（参见 #P0-1）

## 关联

- 当前代码：`src/canvas/CanvasSerializer.ts`
- 文档：[WeSVG-开发文档.md §13 测试策略](../../docs/WeSVG-开发文档.md)
- 关联 ADR：[ADR-004](../../docs/decisions/ADR-004-Document-Model.md)

## Definition of Done

- CI 持续通过 `npm run test`
- 测试覆盖文字、图片、形状三种图层类型
- `docs/STATUS.md` 中 P0 退出条件 #4 已勾选
