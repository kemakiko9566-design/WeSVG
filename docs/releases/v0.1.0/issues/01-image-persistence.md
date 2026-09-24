<!-- Issue #1: Image Persistence -->

# [P0] 图片持久化 100% 恢复

## 背景

WeSVG Studio 通过 IndexedDB 存储项目 JSON 和图片 Blob（参见 `src/utils/db.ts` 和 `src/utils/assetManager.ts`）。

当前已知缺陷：

- 刷新页面后偶发图片丢失（约 5%，issue #45）
- 触发条件：多标签页同时编辑同一项目 / 浏览器在 IndexedDB 写入期间强制刷新

## 目标

**任意刷新场景（手动刷新、强制刷新、关闭浏览器再打开、崩溃后恢复）后，所有图片必须 100% 可用。**

## 验收标准

- [ ] 手动刷新（F5）后，任意项目含有的所有图片均能正常显示。
- [ ] 强制刷新（Ctrl+Shift+R）后，所有图片均能正常显示。
- [ ] 关闭浏览器再打开，所有图片均能正常显示。
- [ ] 在项目保存过程中刷新，不会出现 Blob URL 失效或图片无法加载。
- [ ] 浏览器隐私模式或 IndexedDB 被禁用时，降级到 localStorage 元数据并明确提示用户，不静默失败。
- [ ] 修复方案有自动化测试覆盖（参见 #P0-4）。

## 技术要点

- `AssetResolver` 接口封装 IndexedDB 读写，Vue 组件不直接访问 IndexedDB。
- 每次加载项目时，对所有 `Layer.assetId` 解析 Blob 并 `URL.createObjectURL`，记录引用计数。
- 组件卸载时 `revokeObjectURL` 避免内存泄漏。
- 项目保存成功后清除旧 Blob URL 引用。

## 关联

- 已知 issue：#45
- 文档：[WeSVG-开发文档.md §8 持久化设计](../../WeSVG-开发文档.md)
- 依赖 ADR-004 文档模型迁移：[ADR-004](../decisions/ADR-004-Document-Model.md)

## Definition of Done

- 所有验收标准通过
- CI 中相关测试通过
- 文档（`docs/STATUS.md` 和 CHANGELOG）已更新
- 关闭 issue #45
