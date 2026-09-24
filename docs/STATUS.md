# WeSVG Studio 项目状态

> 最近更新：2026-09-23
> 当前版本：v0.0.0（与 `package.json` 一致；本仓库尚未发布第一个稳定版）
> 当前阶段：**P0（稳定编辑闭环）**
>
> 本文件由 Release Manager 在每次发布时手动更新一次。
> 自动化任务不得修改本文件，避免出现与代码不一致的描述。
> 任何"已完成"必须能在主分支上复现，否则不算完成。

---

## 现实校准（2026-09-23 摸底）

以下记录与代码现状的偏差，避免文档状态再次漂移：

| 项目                | 文档/计划描述                                          | 实际代码现状                                                             | 行动                                 |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| `package.json` 版本 | 0.0.0（来自 package.json）                             | 0.0.0                                                                    | 已一致                               |
| 持久化文档模型      | ADR-004 描述的 `ProjectDocument`（含 `schemaVersion`） | 实际为 `Project` 接口，`version: string` 字段，schemaVersion 不存在      | ADR-004 为目标态，迁移在 P1 推进     |
| 图层数据结构        | ADR-004 中 `EditorNode[]` 在顶层 `nodes`               | 实际在 `canvas.layers[]`                                                 | 实际结构更早固化，需评估迁移成本     |
| 资产                | ADR-004 中顶层 `assets` 数组                           | 实际通过 `assetManager.ts` 在 IndexedDB 单独管理，`Layer.asset` 存元数据 | 功能等价，需补 `AssetReference` 抽象 |
| Migration 函数      | 文档要求每次保存带 schemaVersion                       | 当前 IndexedDB 仅 `DB_VERSION = 3`，无项目级 schema 迁移                 | 列入 P1 必做                         |
| 工程脚本            | `dev / build / preview`                                | `dev / build / preview`                                                  | 与代码一致                           |

ADR-004 是架构目标，不是现状。`docs/WeSVG-开发文档.md` 已按 ADR-004 重写，但代码层改造尚未启动。

---

## 已完成（与代码可复现的能力）

> 满足以下任意一项视为已完成：
>
> 1. 主分支可复现该能力
> 2. 至少 1 个自动化测试覆盖关键路径
> 3. Definition of Done（开发文档第 18 节）全部勾选

- [x] 基础 Vue 3 + Vite + TypeScript 工程脚手架
- [x] Konva 画布渲染层与 vue-konva 集成
- [x] Pinia 状态管理（`projectStore` / `historyStore` / `canvasStore` 等）
- [x] 文字、图片、形状、SVG、GIF 图层数据结构（`src/types/index.ts`）
- [x] Konva 适配层：`CanvasManager` / `CanvasEventManager` / `CanvasObjectFactory` / `CanvasSerializer`
- [x] IndexedDB 项目持久化（`src/utils/db.ts`：projects + assets 双 store）
- [x] 资产 Blob 存储与 `URL.createObjectURL` 加载（`src/utils/assetManager.ts`）
- [x] 撤销/重做：基于快照，50 步上限（`src/stores/historyStore.ts`）
- [x] 自动保存：500ms 防抖（`src/stores/projectStore.ts`）
- [x] HTML 解析与节点映射（`src/editor/htmlParser.ts` / `nodeMapper.ts`）
- [x] Monaco 代码编辑器集成（`src/components/MonacoEditor.vue`）
- [x] Design / Split / Code 三视图（`src/components/SplitEditor.vue` 等）
- [x] SVG / WeChat 渲染器（`src/renderer/SvgGenerator.ts` / `WechatRenderer.ts`）
- [x] 文件导出器与剪贴板发布（`src/publisher/`）
- [x] AI 提示构建与输出校验骨架（`src/ai/OutputValidator.ts` / `PromptBuilder.ts` / `RenderAgent.ts`）

---

## 进行中

> 每条都对应一个 Issue 或 PR。P0 退出条件见 `WeSVG-开发文档.md §21`。

- [ ] **图片持久化可靠性**：刷新后图片 100% 恢复（已知偶发丢失，#45）
- [ ] **撤销/重做 20 次一致性**：连续输入与状态切换后文档哈希稳定
- [ ] **统一文档模型 ProjectDocument 落地**：执行 ADR-004，从 `Project` 迁移到 `ProjectDocument`
- [ ] **schemaVersion 迁移机制**：旧项目加载自动升级
- [ ] **既有 lint 警告清理**：162 个 pre-existing 警告（多数为 unused vars / no-explicit-any），列入 P1 跟进

---

## 已接入 CI（2026-09-23）

`npm run typecheck / lint / format:check / test / build` 五项闸门全部跑通：

| 命令                   | 状态    | 说明                                                   |
| ---------------------- | ------- | ------------------------------------------------------ |
| `npm run typecheck`    | ✅ PASS | `vue-tsc --noEmit`，0 错误                             |
| `npm run lint`         | ✅ PASS | 0 错误，162 警告（既有代码风格，列入跟进）             |
| `npm run format:check` | ✅ PASS | 全部文件符合 Prettier 规范                             |
| `npm run test`         | ✅ PASS | 4/4 测试通过（首个 round-trip 测试）                   |
| `npm run build`        | ✅ PASS | `vue-tsc -b && vite build`，含 13 个既有类型错误的修复 |

GitHub Actions CI 配置文件：`.github/workflows/ci.yml`。

---

## 已知问题

> 任何在主分支上未解决的缺陷。

| 现象                                 | 触发条件                                                       | 影响                     | Issue |
| ------------------------------------ | -------------------------------------------------------------- | ------------------------ | ----- |
| 刷新后偶发图片失效                   | 多标签页同时编辑同一项目                                       | 数据丢失                 | #45   |
| `Project` / `CanvasProject` 接口并存 | `projectStore` 用 `Project`，`historyStore` 用 `CanvasProject` | 类型不一致，未来重构成本 | —     |
| 无项目级 schema 迁移                 | IndexedDB 结构升级后旧项目无法加载                             | 数据丢失风险             | —     |
| Monaco 在 Firefox 下偶发无响应       | 文档超过 200 节点                                              | 编辑卡死                 | #67   |
| 导出大图（>2MB）偶发 OOM             | 多张高分辨率图片同时存在                                       | 导出失败                 | #88   |
| `Project` 接口未对齐 ADR-004         | 当前为 `version: string`，无 `schemaVersion`                   | 与新架构目标不符         | —     |
| 既有代码 lint 警告                   | 多数 `unused vars` / `no-explicit-any`                         | 无功能影响               | —     |

---

## V1 不包含

明确不在 V1 交付范围内，进入开发需重新评估：

- AI 自动生成完整页面（仅保留结构化 action 能力）
- AI 抠图（v0.4 之后单独启动）
- 模板市场
- 多人协作
- 云同步
- 第三方素材接入

这些功能只有在 V1 的编辑、保存、导出闭环稳定并通过 V1 发布标准（开发文档 §19）后，才进入 P3 之后的开发。

---

## 当前 P0 退出条件（来自 `WeSVG-开发文档.md §21`）

- [ ] 任意刷新后 100% 恢复图片
- [ ] 任意撤销/重做 20 次后文档哈希一致
- [ ] 关闭浏览器再打开，画布位置与颜色不变
- [ ] 至少 1 个 round-trip 自动化测试在 CI 通过
- [ ] `docs/STATUS.md` 已更新到与代码一致（已部分完成，仍需复审）

完成 P0 后立即进入 P1（建立质量证据），不允许跳过。

---

## 最近一次更新

### 2026-09-23（当前）

- 写 `docs/STATUS.md` 并完成与代码的首次对齐。
- 新增 ADR-004：统一文档模型 `ProjectDocument`（目标态）。
- 重写 `docs/WeSVG-开发文档.md`，加入 `CompatibilityFix` 接口与导出失败回滚规则。
- **接入完整 CI 闸门**：
  - `package.json` 加入 `typecheck / lint / format / format:check / test / test:watch / test:coverage` 脚本
  - `vitest.config.ts` 配置
  - `eslint.config.js` flat config
  - `.prettierrc.json` + `.prettierignore`
  - `.github/workflows/ci.yml` 五步 CI
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/ISSUE_TEMPLATE/` 7 个模板（含 5 个 P0 退出条件）
- **首个 round-trip 测试**：`tests/unit/canvas/CanvasSerializer.test.ts`（4 个用例全部通过）
- **修复 13 个既有代码类型错误**：
  - `src/editor/htmlParser.ts`：parseInt 返回类型修正
  - `src/renderer/WechatRenderer.ts`：GroupLayer 类型窄化
  - `src/stores/historyStore.ts`：Project / CanvasProject 不一致修正
  - `src/stores/projectStore.ts`：补全 `updateLayer` 方法
  - `src/components/RightSidebar.vue`：使用 `projectStore.updateLayer`
  - `src/components/MonacoEditor.vue`：修复 `MouseTargetType.CONTENT_LINE` 与 null check
  - `src/components/CanvasViewport.vue`：Konva.Node vs Shape 类型断言
  - `src/canvas/CanvasEventManager.ts`：删除重复属性 + null check
  - `src/animation/AnimationRegistry.ts`：补全 config 类型
  - `src/ai/PromptBuilder.ts`：layers 类型断言
  - `tsconfig.app.json`：添加 `ignoreDeprecations: "6.0"`
- **格式化全部源文件**：67 个文件由 Prettier 重写为统一风格
- `docs/P0-MILESTONE.md`：P0 退出条件与关联 Issue 总览

完整变更记录见 `CHANGELOG.md`（待建）。
