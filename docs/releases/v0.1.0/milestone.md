# v0.1.0 Milestone

## Title

`v0.1.0 — 稳定编辑闭环 + CI 闸门`

## Due date

`2026-10-31`（建议，但可调整）

## Description

```markdown
## 目标

完成 WeSVG Studio 的可靠编辑闭环，并通过工程闸门保证不再回退。

V1 的核心闭环：

新建画布 → 添加文字/图片/图形 → 调整图层 → 查看生成代码 → 验证微信兼容性 → 导出可用 HTML/SVG

V1 不以模板市场、实时协作或云同步为交付目标。AI 功能属于后续增强，不能阻塞编辑、保存和导出主流程。

## 完成标准

- 用户能在 10 分钟内完成一份作品并导出
- 关闭和重新打开浏览器后，项目及图片完整恢复
- Design/Split/Code 往返不会破坏文档
- 导出结果包含安全和微信兼容报告
- 至少 3 个内置示例
- CI 持续通过（typecheck + lint + format:check + test + build）
- README 提供 Demo、演示 GIF、快速开始和当前限制
- 发布版本号与 `package.json`、文档和 Git Tag 一致

## 关联 Issue

- #1 图片持久化 100% 恢复（@see issues/01-image-persistence.md）
- #2 撤销/重做 20 次一致性（@see issues/02-undo-redo-consistency.md）
- #3 画布刷新恢复（@see issues/03-canvas-persistence.md）
- #4 Canvas/JSON round-trip 测试已在 CI（@see issues/04-round-trip-test.md）— ✅ 已由 `feat(ci)` 完成
- #5 docs/STATUS.md 与代码一致（@see issues/05-status-sync.md）

## 反模式

- 在没有自动化测试的情况下"看起来可以"就关闭 Issue
- 把"修复方案"替换为"暂时规避方案"
- 在 Issue 里勾选 checkbox 但 PR 还没合并
- 跳过 P1 直接进入 P2
```

## 关联 PR

- `feat/ci-skeleton` — CI 闸门与首个 round-trip 测试（当前）

## 关闭规则

所有 5 个关联 Issue 全部关闭，且 Definition of Done 全部勾选后，才关闭 Milestone。