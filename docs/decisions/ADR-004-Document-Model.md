# ADR-004: 统一文档模型 ProjectDocument

- **状态**：已接受
- **日期**：2026-09-23
- **作者**：WeSVG Studio 团队
- **取代**：无
- **关联**：[WeSVG-开发文档.md §5](../WeSVG-开发文档.md)、[ADR-002](./ADR-002-IndexedDB.md)、[ADR-003](./ADR-003-Monaco.md)

---

## 背景

WeSVG Studio 的编辑器涉及多个相互独立的子系统：

- Konva 画布
- Monaco 代码编辑器
- IndexedDB 持久化
- HTML / SVG / JSON 导出器
- 未来可能的 AI 操作与多人协作

在 ADR 制定前，每个子系统都倾向于维护自己的事实来源：

- Canvas Store 保存 Konva 节点树
- Code Editor 保存 HTML 字符串
- IndexedDB 保存项目 JSON
- 导出器接收额外的渲染参数

子系统之间的同步会变成 N × N 状态机，必然出现以下问题：

- 切换 Design / Code 视图时数据漂移
- 撤销 / 重做只在某一个视图生效
- 持久化版本之间无法对齐
- AI 输出难以验证是否破坏了文档约束
- 多人协作时无法定义"冲突"是什么

## 决策

建立唯一文档模型 `ProjectDocument`，作为整个编辑器的"事实来源"：

```ts
interface ProjectDocument {
  schemaVersion: number
  id: string
  name: string
  createdAt: string
  updatedAt: string
  canvas: CanvasSettings
  nodes: EditorNode[]
  assets: AssetReference[]
  animations: AnimationDefinition[]
  metadata: Record<string, unknown>
}
```

约束如下：

1. Konva、Monaco、导出器、持久化层都是 ProjectDocument 的消费者或编辑器。
2. ProjectDocument 是唯一可持久化格式。
3. Konva Node 不作为可持久化业务实体，仅作为渲染时的临时对象。
4. Monaco 中的 HTML 是一种编辑表示，不是第二套数据库。
5. 所有变更通过明确的 action / command 进入状态层。
6. 每次保存都带 `schemaVersion`，旧版本通过迁移函数升级。

## 理由

1. **持久化格式与运行模型一致**，避免二次映射带来的信息丢失。
2. **单一来源**让撤销 / 重做、版本迁移、协作冲突解决有共同语言。
3. 单元测试可以针对纯数据结构进行，**不需要启动 Vue 或 Konva**。
4. AI 输出只需校验能否转换为合法 ProjectDocument，**不需要让模型感知 Konva 或 HTML**。
5. 导出和导入是同一函数的两个方向，**减少代码重复**。

## 后果

### 优点

- 明确的数据契约，团队讨论有共同语言。
- 持久化与运行时合一，刷新恢复简单。
- 撤销 / 重做天然支持跨视图一致。
- 后续接入协作时，合并冲突的"双方"都退化为 ProjectDocument 差异。

### 代价

- Konva、Monaco 都成为"只读视图"，改造工作量大。
- 旧的 store 写法需要重构。
- 必须建立 schemaVersion 迁移机制。
- 部分性能优化（如 Konva 增量更新）需要重新评估。
- Vue 组件不再"拥有"自己的节点数据，所有权必须明确归属于 store。

## 替代方案

### 方案 A：每子系统自有模型

- **描述**：Canvas Store、Code Editor、Persistence 各自维护数据。
- **优点**：短期开发快，子系统解耦。
- **缺点**：四套数据相互同步，长期不可维护。
- **状态**：已否决。

### 方案 B：单一模型 + JSON Patch 增量更新

- **描述**：ProjectDocument 作为基线，store 之间用 JSON Patch 同步。
- **优点**：减少数据传输。
- **缺点**：与 Vue 响应式系统冲突，撤销 / 重做逻辑复杂。
- **状态**：保留为性能优化方向，不在 V1 采用。

### 方案 C：以 HTML 字符串为唯一模型

- **描述**：编辑器始终围绕 HTML 进行操作，画布从 HTML 渲染。
- **优点**：导出天然简单。
- **缺点**：HTML 无法表达完整图层层级、动画状态、资产引用，性能与可解析性差。
- **状态**：已否决。

## 实施要点

1. `src/types/document.ts` 定义 `ProjectDocument` 与子结构接口。
2. `src/stores/projectStore.ts` 持有 ProjectDocument，禁止直接持有 Konva 节点。
3. Canvas Adapter 监听 store 变化重建场景，不持有独立状态。
4. 导出器接受 ProjectDocument，返回字符串。
5. 持久化层直接 `JSON.stringify(ProjectDocument)`，不进行二次结构转换。
6. `schemaVersion` 起步为 1，任何破坏性变更必须 bump 并提供迁移函数。
7. 文档模型变更必须同步更新 `docs/STATUS.md` 与 `CHANGELOG.md`。
8. AI 输出经校验后转换为 action 序列，**复用 ProjectDocument 的 action 入口**，不另起通道。

## 验证标准

- 任意外部修改 ProjectDocument 字段后，所有视图（Design / Split / Code / 导出预览）保持一致。
- 旧版本项目加载后通过迁移函数升级，字段全部存在且语义正确。
- 单元测试在不启动 Vue 的情况下可验证文档模型的合法性。
- AI 输出经过 `OutputValidator` 后能转换为合法 ProjectDocument，否则拒绝应用。
- 撤销 / 重做、刷新恢复、协作合并三种场景都能收敛到同一份 ProjectDocument。

## 反模式（明确禁止）

- 在 Vue 组件内维护独立的 `nodes` 列表。
- 通过深层对象突变绕过 store action。
- 把 Blob URL 当作永久资源地址保存到 ProjectDocument（必须存 `assetId`）。
- 将 Konva 运行时对象或 Monaco 实例写入 ProjectDocument。
- 把网络请求状态混入文档模型。

## 参考

- 改进结论：架构改进重点（Document Model 段落）
- [WeSVG-开发文档.md §5](../WeSVG-开发文档.md)
- [ADR-002: IndexedDB 持久化方案](./ADR-002-IndexedDB.md)
- [ADR-003: Monaco 代码编辑器集成](./ADR-003-Monaco.md)

## 修订记录

- 2026-09-23：初稿，已接受。
