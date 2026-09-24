# Git 推送与 PR 创建命令

## 1. 推送分支

```bash
cd 'd:\SynologyDrive\SynologyDrive\wzq\Project\WeSVG Studio'
git push -u origin feat/ci-skeleton
```

## 2. 创建 PR（任选一种）

### 方式 A：使用 GitHub CLI

```bash
gh pr create \
  --base main \
  --head feat/ci-skeleton \
  --title "feat(ci): introduce typecheck/lint/test/format gate + first round-trip test" \
  --body-file docs/releases/v0.1.0/pr-body.md \
  --label "enhancement" \
  --label "ci/cd" \
  --label "P0" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"
```

### 方式 B：浏览器

1. 打开 `https://github.com/kemakiko9566-design/WeSVG/pull/new/feat/ci-skeleton`
2. 填写标题（见 `pr-body.md`）
3. 粘贴正文（见 `pr-body.md`）
4. 选择 Milestone：`v0.1.0 — 稳定编辑闭环 + CI 闸门`
5. 创建 PR

## 3. 创建 5 个 Issue（任选一种）

### 方式 A：使用 GitHub CLI（批量）

```bash
cd 'd:\SynologyDrive\SynologyDrive\wzq\Project\WeSVG Studio'

gh issue create \
  --title "[P0] 图片持久化 100% 恢复" \
  --body-file docs/releases/v0.1.0/issues/01-image-persistence.md \
  --label "P0" --label "bug" --label "storage" --label "data-loss" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"

gh issue create \
  --title "[P0] 撤销/重做 20 次一致性" \
  --body-file docs/releases/v0.1.0/issues/02-undo-redo-consistency.md \
  --label "P0" --label "test" --label "history" --label "reliability" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"

gh issue create \
  --title "[P0] 画布刷新恢复" \
  --body-file docs/releases/v0.1.0/issues/03-canvas-persistence.md \
  --label "P0" --label "persistence" --label "canvas" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"

gh issue create \
  --title "[P0] Canvas/JSON round-trip 测试在 CI 通过" \
  --body-file docs/releases/v0.1.0/issues/04-round-trip-test.md \
  --label "P0" --label "test" --label "ci" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"

gh issue create \
  --title "[P0] docs/STATUS.md 与代码一致" \
  --body-file docs/releases/v0.1.0/issues/05-status-sync.md \
  --label "P0" --label "docs" --label "process" \
  --milestone "v0.1.0 — 稳定编辑闭环 + CI 闸门"
```

### 方式 B：浏览器

按 `issues/0X-*.md` 逐个粘贴到 GitHub Issues 页面。

## 4. 触发 Milestone 创建

GitHub CLI：

```bash
gh milestone create \
  --title "v0.1.0 — 稳定编辑闭环 + CI 闸门" \
  --description-file docs/releases/v0.1.0/milestone.md \
  --due-date "2026-10-31"
```

或者在浏览器中：仓库首页 → Milestones → New Milestone，按 `milestone.md` 填写。

## 5. 验证 CI 在 GitHub 上跑通

1. PR 创建后，GitHub Actions 会自动触发
2. 检查 5 步是否全绿：
   - typecheck
   - lint + format:check
   - test
   - build
3. 全部勾上后即可合并

## 6. （可选）启用分支保护

合并前建议在仓库 Settings → Branches 中设置 `main` 分支保护：

- Require status checks to pass before merging
- Required checks：`typecheck`、`lint`、`test`、`build`
- Require pull request reviews before merging（至少 1 个 reviewer）
- Do not allow bypassing the above settings

设置完成后，未通过 CI 的 PR 不能被合并到 `main`。
