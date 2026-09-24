<!-- Issue #4: Round-Trip Test in CI -->

# [P0] Canvas/JSON round-trip 测试在 CI 通过

## 背景

WeSVG Studio 的核心数据流是 `Canvas → JSON → Canvas`（参见 `src/canvas/CanvasSerializer.ts` 和 ADR-004）。

在本次 PR（`feat/ci-skeleton`）中：

- ✅ 已接入 vitest
- ✅ 已创建 `tests/unit/canvas/CanvasSerializer.test.ts`（4 个用例）
- ✅ CI 已包含 `npm run test` 步骤

## 目标

**在 CI 中至少 1 个 round-trip 测试持续通过，覆盖文字、图片、形状三种图层类型的关键属性保持不变。**

## 当前进度（本次 PR 已完成）

- [x] 接入 vitest
- [x] `npm run test` 至少包含 1 个 Canvas → JSON → Canvas 往返测试
- [x] 测试覆盖文字图层（content / fontFamily / fontSize / fontWeight / 颜色）
- [x] GitHub Actions CI 配置包含 `npm run test` 步骤
- [ ] 测试覆盖图片图层（assetId / 位置 / 尺寸 / 可见性 / 锁定）
- [ ] 测试覆盖形状图层（shapeType / fill / stroke / borderRadius）
- [ ] PR 状态检查要求 test 通过才允许 merge

## 剩余验收标准

- [ ] 测试覆盖图片图层关键属性
- [ ] 测试覆盖形状图层关键属性
- [ ] 在 `tsconfig.app.json` 中确认 `tsBuildInfoFile` 与 CI 兼容
- [ ] （可选）增加 canvas/HTML round-trip 测试

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
- 当前测试：`tests/unit/canvas/CanvasSerializer.test.ts`
- 文档：[WeSVG-开发文档.md §13 测试策略](../../WeSVG-开发文档.md)
- 关联 ADR：[ADR-004](../decisions/ADR-004-Document-Model.md)

## Definition of Done

- CI 持续通过 `npm run test`
- 测试覆盖文字、图片、形状三种图层类型
- `docs/STATUS.md` 中 P0 退出条件 #4 已勾选
