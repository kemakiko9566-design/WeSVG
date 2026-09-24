# P0 Milestone — 稳定编辑闭环

> 创建日期：2026-09-23
> 截止日期：—
> 关联文档：[WeSVG-开发文档.md §21](../WeSVG-开发文档.md)、[STATUS.md](../STATUS.md)

## 目标

建立 WeSVG Studio 的可靠编辑闭环，结束"功能很多、没有一个完全可靠"的阶段。
**完成 P0 后立即进入 P1（建立质量证据），不允许跳过。**

## 退出条件（全部勾选才能关闭 Milestone）

- [ ] 任意刷新后 100% 恢复图片
- [ ] 任意撤销/重做 20 次后文档哈希一致
- [ ] 关闭浏览器再打开，画布位置与颜色不变
- [ ] 至少 1 个 round-trip 自动化测试在 CI 通过
- [ ] `docs/STATUS.md` 已更新到与代码一致

## 关联 Issue

| #     | 标题                                                                                   | 状态   |
| ----- | -------------------------------------------------------------------------------------- | ------ |
| #P0-1 | [图片 100% 持久化恢复](./.github/ISSUE_TEMPLATE/p0-image-persistence.md)               | 待创建 |
| #P0-2 | [撤销/重做 20 次一致性测试](./.github/ISSUE_TEMPLATE/p0-undo-redo-consistency.md)      | 待创建 |
| #P0-3 | [画布刷新恢复](./.github/ISSUE_TEMPLATE/p0-canvas-persistence.md)                      | 待创建 |
| #P0-4 | [Canvas ↔ JSON round-trip 测试已在 CI](./.github/ISSUE_TEMPLATE/p0-round-trip-test.md) | 待创建 |
| #P0-5 | [docs/STATUS.md 与代码对齐](./.github/ISSUE_TEMPLATE/p0-status-sync.md)                | 进行中 |

## 执行顺序

1. 完成 `package.json` 中 `typecheck / lint / test / format` 脚本接入（PR 已在准备）
2. 接入 vitest + eslint + prettier + GitHub Actions（当前 CI 已配置）
3. 解决 #P0-1 图片丢失问题（已知 issue #45）
4. 完成 #P0-2 撤销/重做一致性测试
5. 完成 #P0-3 画布刷新恢复
6. 完成 #P0-4 round-trip 测试在 CI 通过
7. 关闭 #P0-5，关闭 Milestone

## 反模式（明确禁止）

- 在没有自动化测试的情况下"看起来可以"就关闭 Issue。
- 把"修复方案"替换为"暂时规避方案"（如禁用某路径）。
- 在 Issue 里勾选 checkbox 但 PR 还没合并。
- 跳过 P1 直接进入 P2。
