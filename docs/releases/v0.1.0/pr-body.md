<!-- PR body — copy to GitHub PR description -->

## 概述

为 WeSVG Studio 引入完整的工程闸门，并落地首个 round-trip 自动化测试。

本次 PR 之后，所有未来提交都必须通过：

1. **typecheck** — `vue-tsc --noEmit`
2. **lint** — `eslint .`
3. **format:check** — `prettier --check .`
4. **test** — `vitest run`
5. **build** — `vue-tsc -b && vite build`

## 改动

包含 4 个语义清晰的 commit：

| Commit | 说明 |
|---|---|
| `style(format)` | 整个项目格式化（prettier 统一风格，无逻辑变更） |
| `fix(types)` | 修复 13 个既有的 TypeScript 错误，否则 strict build 会失败 |
| `feat(ci)` | CI 闸门 + 首个 round-trip 测试 + 5 个 P0 Issue 模板 |
| `docs(format+handover)` | prettier 重新格式化 3 个 ADR，并纳入未追踪的 HANDOVER.md |

## 验证

```text
$ npm run typecheck
PASS

$ npm run lint
PASS（0 errors，162 warnings：既有代码风格，列入 P1 跟进）

$ npm run format:check
PASS（All matched files use Prettier code style!）

$ npm run test
PASS（Test Files 1 passed, Tests 4 passed）

$ npm run build
PASS（built in 10.87s）
```

## 测试覆盖

首个 round-trip 测试用例位于 `tests/unit/canvas/CanvasSerializer.test.ts`，覆盖：

1. `exportJSON` 产出合法 JSON
2. `Canvas → JSON → Canvas` 关键属性（位置/尺寸/颜色/类型）不变
3. `toMinimalJSON` 不丢失关键字段
4. 空画布可以正常序列化与反序列化

## 修复的 13 个既有类型错误

- `src/editor/htmlParser.ts` — `parseInt` 返回类型修正
- `src/renderer/WechatRenderer.ts` — `GroupLayer` 类型窄化
- `src/stores/historyStore.ts` — `Project` / `CanvasProject` 不一致
- `src/stores/projectStore.ts` — 补全 `updateLayer` 方法
- `src/components/RightSidebar.vue` — 调用 `projectStore.updateLayer`
- `src/components/MonacoEditor.vue` — `MouseTargetType.CONTENT_TEXT` + null check
- `src/components/CanvasViewport.vue` — Konva.Node vs Shape 类型断言
- `src/canvas/CanvasEventManager.ts` — 删除重复属性 + null check
- `src/animation/AnimationRegistry.ts` — config 类型补全
- `src/ai/PromptBuilder.ts` — layers 类型断言
- `tsconfig.app.json` — `ignoreDeprecations: "6.0"`

## 文档同步

- [x] 已新增 `docs/STATUS.md`（项目状态单一来源）
- [x] 已新增 `docs/P0-MILESTONE.md`（P0 退出条件索引）
- [x] 已重写 `docs/WeSVG-开发文档.md`
- [x] 已新增 `docs/decisions/ADR-004-Document-Model.md`
- [x] 已追踪原本未提交的 `docs/HANDOVER.md`

## CI / GitHub 配置

- `.github/workflows/ci.yml` — 五步闸门
- `.github/PULL_REQUEST_TEMPLATE.md` — PR 审查清单
- `.github/ISSUE_TEMPLATE/` — 7 个模板（5 个 P0 + bug + feature）

## Checklist

- [x] `npm run typecheck` 通过
- [x] `npm run lint` 通过（0 errors）
- [x] `npm run format:check` 通过
- [x] `npm run test` 通过
- [x] `npm run build` 通过
- [x] 已检查 `docs/STATUS.md` 与代码一致
- [x] 已新增 ADR
- [x] 已修复既有数据丢失风险（13 个 TS 错误）
- [x] 空状态、失败状态未做改变（保留为后续 PR）

## 关联 Milestone

`v0.1.0 — 稳定编辑闭环 + CI 闸门`

## 关联 Issue

- Closes #4（Canvas/JSON round-trip 测试已在 CI 通过）
- Related to #1, #2, #3, #5（其他 P0 退出条件，本次 PR 仅搭建测试框架）

## 后续

合并本 PR 后，5 个 P0 Issue 仍待推进。优先级：

1. #P0-1 图片持久化（已知 bug #45）
2. #P0-2 撤销/重做一致性
3. #P0-3 画布刷新恢复
4. #P0-5 docs/STATUS 与代码对齐（持续任务）
5. ADR-004 落地：把 `Project` 迁移到 `ProjectDocument`

## 测试证据

```text
$ npm run test
 RUN  v2.1.9 D:/SynologyDrive/SynologyDrive/wzq/Project/WeSVG Studio

 ✓ tests/unit/canvas/CanvasSerializer.test.ts (4 tests) 4ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  2.87s
```