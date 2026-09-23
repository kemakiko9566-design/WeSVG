<!-- Issue #2: Undo/Redo Consistency -->

# [P0] 撤销/重做 20 次一致性

## 背景

WeSVG Studio 使用基于快照的撤销/重做机制，最多 50 步（参见 `src/stores/historyStore.ts`）。

当前未覆盖的场景：

- 连续输入操作未做合并，每个字符生成一次完整快照
- 撤销/重做后画布与代码视图可能不同步
- 打开项目后历史栈的基线行为未明确定义

## 目标

**连续执行 20 次任意编辑（拖动、修改文本、调整颜色等），再依次撤销 10 次、重做 10 次，文档状态完全可预测并与操作历史对应。**

## 验收标准

- [ ] 自动化测试覆盖以下场景：
  - 创建项目 → 添加 3 个图层 → 修改图层属性 20 次 → 撤销 10 次 → 文档等于"添加 3 个图层后第 5 次修改"的状态
  - 继续重做 10 次 → 文档回到最新状态
  - 任意中间步骤的文档哈希稳定
- [ ] 连续输入（如编辑器中连续键入）合并为单次快照，不每个字符生成快照。
- [ ] 撤销/重做后 Design / Split / Code 三视图保持一致。
- [ ] 打开项目后历史栈以当前文档为基线，不跨会话恢复。
- [ ] 修复方案有自动化测试覆盖（参见 #P0-4）。

## 技术要点

- 引入 debounce 合并连续输入操作，避免每个字符产生快照。
- 在 store 内部确保撤销/重做走同一份 ProjectDocument（参见 [ADR-004](../decisions/ADR-004-Document-Model.md)）。
- History 快照不包含 Blob 本体，仅存 `assetId`。
- 任何一次编辑操作必须经过 `useHistoryStore().pushState()`，绕过则视为 bug。

## 关联

- 当前代码：`src/stores/historyStore.ts` / `src/stores/projectStore.ts`
- 文档：[WeSVG-开发文档.md §9 历史记录](../../WeSVG-开发文档.md)

## Definition of Done

- 所有验收标准通过
- 自动化测试在 CI 中持续通过
- 文档 `docs/STATUS.md` 已更新
- 未引入新的历史快照存储格式