<!-- Issue #3: Canvas Refresh Recovery -->

# [P0] 画布刷新恢复

## 背景

当前画布数据通过 `useProjectStore` + IndexedDB 持久化（参见 `src/utils/db.ts`）。

需要保证：

- 任意刷新场景后画布尺寸、背景色、视图模式不变
- 所有图层的位置、尺寸、颜色、可见性、锁定状态不变
- 选中状态不强制恢复（不跨会话）

## 目标

**关闭浏览器再打开任意项目，画布尺寸、背景色、所有图层的位置/尺寸/颜色等关键属性 100% 不变。**

## 验收标准

- [ ] 创建一个画布为 1080×3000、背景 `#ffffff`、含 3 个不同颜色图层（红/绿/蓝）的项目。
- [ ] 关闭浏览器，重新打开。
- [ ] 画布尺寸、背景色、图层位置、尺寸、颜色全部一致。
- [ ] 自动化测试覆盖以下场景：
  - 创建项目 → 修改画布尺寸与背景 → 保存 → 模拟刷新 → 重新加载 → 属性比对
  - 添加 10 个图层，每个图层使用随机颜色 → 持久化 → 重新加载 → 颜色比对
- [ ] 刷新后选中状态被清空（避免恢复过时的引用）。

## 技术要点

- `saveCurrentProject()` 必须原子写入项目 JSON 与所有 `assetId` 对应的 Blob。
- 加载项目时按依赖顺序：先解析项目 JSON，再异步加载所有 `assetId` 对应的 Blob，最后通知 store 渲染。
- 引入加载状态机：`idle → loading → ready | partial | failed`。
- 任何 `partial` 状态下允许编辑但禁用依赖缺失资源的操作。

## 关联

- 当前代码：`src/stores/projectStore.ts` / `src/utils/db.ts` / `src/utils/assetManager.ts`
- 文档：[WeSVG-开发文档.md §8 持久化设计](../../WeSVG-开发文档.md)
- 关联 ADR：[ADR-004](../decisions/ADR-004-Document-Model.md)

## Definition of Done

- 所有验收标准通过
- 自动化测试在 CI 中持续通过
- 文档 `docs/STATUS.md` 已更新
- 加载状态机已在 UI 中暴露（"正在加载资源…"）
