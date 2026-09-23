# v0.1.0 Release Preparation

> 创建日期：2026-09-23
> 分支：`feat/ci-skeleton`
> 关联文档：[STATUS.md](../../STATUS.md)、[P0-MILESTONE.md](../../P0-MILESTONE.md)

## 当前进展

`feat/ci-skeleton` 分支已包含 4 个提交，本地 CI 全部通过：

```text
dcb75b8 docs(format+handover): prettier reformat three ADRs + track missing HANDOVER.md
370cac7 feat(ci): introduce typecheck/lint/test/format gate + first round-trip test
3281dc7 fix(types): resolve pre-existing TypeScript errors blocking strict build
4a39d82 style(format): apply Prettier formatting to existing codebase
0430fff chore: initial commit — WeSVG Studio v0.3.2 (M1 Editor Core Stabilization)
```

## 落地清单

1. ✅ 分支 `feat/ci-skeleton` 已创建并提交
2. ⏳ 推送分支到 GitHub（见 `push-commands.md`）
3. ⏳ 创建 `v0.1.0` Milestone（见 `milestone.md`）
4. ⏳ 创建 5 个 P0 Issue（见 `issues/` 目录）
5. ⏳ 创建 PR（见 `pr-body.md`）
6. ⏳ 等待 CI 在 GitHub 上跑通并合并

## 文件清单

- [milestone.md](./milestone.md) — `v0.1.0` Milestone 的描述与配置
- [pr-body.md](./pr-body.md) — PR 的标题与正文
- [push-commands.md](./push-commands.md) — `git push` / `gh` CLI 命令
- [issues/](./issues/) — 5 个 P0 Issue 的标题与正文
  - [01-image-persistence.md](./issues/01-image-persistence.md)
  - [02-undo-redo-consistency.md](./issues/02-undo-redo-consistency.md)
  - [03-canvas-persistence.md](./issues/03-canvas-persistence.md)
  - [04-round-trip-test.md](./issues/04-round-trip-test.md)
  - [05-status-sync.md](./issues/05-status-sync.md)
