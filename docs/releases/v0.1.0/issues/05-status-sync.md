<!-- Issue #5: STATUS.md Sync with Code -->

# [P0] docs/STATUS.md 与代码一致

## 背景

WeSVG Studio 历史上存在文档状态与代码不一致的问题：

- `package.json` 版本是 `0.0.0`，README 写 `0.3.2`
- Roadmap 把 RMBG-2.0 集成列为未来任务，Project Master 又写 RMBG 后端已完成
- Image Persistence 在已修复问题和进行中功能中同时出现

## 当前进度（本次 PR 已部分完成）

- [x] `docs/STATUS.md` 已创建并按"现实校准 / 已完成 / 进行中 / 已知问题 / V1 不包含 / 最近更新"结构组织
- [x] 已完成一项"现实校准"表，记录与代码的偏差
- [x] `package.json` 的 `version` 字段（`0.0.0`）与 `docs/STATUS.md` 顶部版本号一致
- [x] PR 模板加入复审 checkbox："我已检查 STATUS.md 是否需要更新"

## 目标

**建立 `docs/STATUS.md` 作为状态单一来源，每次合并到 main 前必须复审。**

## 剩余验收标准

- [ ] 每次发版时同步更新 `package.json` 的 `version`、`docs/STATUS.md`、`CHANGELOG.md`
- [ ] 建立 `CHANGELOG.md`（当前未建）
- [ ] 所有"已完成"项持续能在 main 分支上复现（每次发版前人工抽查）
- [ ] 所有"进行中"项持续对应具体 Issue 或 PR

## 技术要点

- `STATUS.md` 由 Release Manager 在每次发布时手动更新。
- 自动化任务不得修改本文件（CI 不覆盖）。
- 增加 PR 模板（`.github/PULL_REQUEST_TEMPLATE.md`），要求勾选 STATUS 复审项（已加）。
- 每次发版时同步更新 `package.json` 的 `version`、`docs/STATUS.md`、`CHANGELOG.md`。

## 关联

- 关联文档：[STATUS.md](../../STATUS.md)
- 模板：`.github/PULL_REQUEST_TEMPLATE.md`（已建）

## Definition of Done

- `docs/STATUS.md` 与代码真实状态一致（持续任务）
- `package.json` 版本号与文档一致（已达成）
- PR 模板要求复审 STATUS（已达成）
- 建立 `CHANGELOG.md`
