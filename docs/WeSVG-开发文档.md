# WeSVG Studio 开发文档

> 面向微信公众号与 H5 内容制作的可视化 HTML/SVG 编辑器。
>
> 本文档描述项目的当前开发方式、架构边界、质量标准和近期交付目标。功能完成状态以代码、自动化测试和 `docs/STATUS.md` 为准，不以路线图描述代替实现事实。

---

## 1. 产品目标

WeSVG Studio 希望让不熟悉代码的内容创作者通过可视化操作制作 HTML/SVG 内容，同时保留代码编辑和导出能力。

V1 的核心闭环是：

```text
新建项目
  ↓
添加文字、图片和基础图形
  ↓
管理图层与画布
  ↓
在 Design / Split / Code 视图间编辑
  ↓
执行安全与微信兼容检查
  ↓
导出 HTML / SVG / JSON
```

V1 不以模板市场、实时协作或云同步为交付目标。AI 功能属于后续增强，不能阻塞编辑、保存和导出主流程。

---

## 2. 当前技术栈

| 领域     | 技术              | 实际版本（来自 `package.json`） |
| -------- | ----------------- | ------------------------------- |
| 前端框架 | Vue 3             | 3.5.34                          |
| 开发语言 | TypeScript        | 6.0.2                           |
| 构建工具 | Vite              | 8.0.12                          |
| 状态管理 | Pinia             | 3.0.4                           |
| 画布     | Konva + vue-konva | 10.3.0 / 3.4.0                  |
| 代码编辑 | Monaco Editor     | 0.55.1                          |
| 本地存储 | IndexedDB         | 浏览器原生                      |
| 可选后端 | Node.js + Fastify | 仅在 `server/` 目录             |

> `package.json` 是版本号的单一真相。任何文档、ADR 或 Issue 描述的版本都必须与之对齐。
> 不再区分"目标基线"与"实际版本"——只有 `package.json`。

当前 `package.json` 仅提供 `dev`、`build` 和 `preview`。测试、Lint、格式检查和 CI 属于近期必须补齐的工程能力，不能视为当前已经存在。

---

## 3. 环境要求

- Node.js 20 LTS 或更高版本
- npm 10 或兼容的 pnpm/yarn
- 支持 IndexedDB、Clipboard API 和现代 SVG 的浏览器
- 推荐使用最新版 Chrome 或 Edge 开发和调试

克隆并启动：

```bash
git clone https://github.com/kemakiko9566-design/WeSVG.git
cd WeSVG
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

提交代码前至少执行：

```bash
npm run build
```

质量工具接入后，应改为：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

---

## 4. 目录职责

```text
src/
├── ai/             AI 请求编排、提示构建和输出校验
├── animation/      动画定义、时间参数和导出映射
├── canvas/         Konva 适配层、对象工厂、事件与序列化
├── components/     Vue 展示组件和编辑器界面
├── editor/         HTML 解析、节点映射和代码同步
├── layer/          图层排序、锁定、可见性和选择规则
├── pages/          页面级组合，不承载底层编辑逻辑
├── publisher/      HTML/SVG/JSON 导出和剪贴板发布
├── renderer/       文档模型到目标格式的渲染
├── stores/         Pinia 状态与用户操作入口
├── types/          跨模块数据契约
└── utils/          无业务状态的通用工具

server/
└── src/            可选图像处理服务，不参与编辑器核心状态

docs/
├── STATUS.md                当前版本、已完成能力、已知问题
├── ROADMAP.md               后续版本计划
├── architecture/            模块边界和数据流
└── decisions/               重要架构决策记录（ADR-NNN）
```

### 目录规则

- Vue 组件不得直接读写 IndexedDB。
- 页面组件不得直接操作 Konva 内部对象。
- 导出逻辑不得散落在 UI 组件中。
- `utils/` 不得成为无边界的业务代码堆放区。
- 跨模块数据必须在 `types/` 中定义明确类型。
- 新增关键依赖或改变持久化格式时，需要增加 ADR。

---

## 5. 核心领域模型

编辑器需要一份唯一、可序列化的文档模型。Konva 场景、代码编辑器、持久化和导出器都是该模型的消费者，不应各自维护互相竞争的事实来源。

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

核心原则：

1. 文档模型是唯一持久化格式。
2. Konva Node 不是可持久化业务实体。
3. Monaco 中的 HTML 是一种编辑表示，不是第二套数据库。
4. 所有文档变更通过明确的 action/command 进入状态层。
5. 每次保存都带 `schemaVersion`，旧版本通过迁移函数升级。
6. AI 输出经校验后转换为 ProjectDocument 的 action 序列，复用同一数据通道。

详细的背景、决策与替代方案见 [ADR-004](./decisions/ADR-004-Document-Model.md)。

---

## 6. 数据流

### 6.1 可视化编辑

```text
用户操作
  ↓
组件发出编辑意图
  ↓
Store / Command 更新 ProjectDocument
  ↓
Canvas Adapter 更新 Konva 场景
  ↓
History 记录可撤销状态
  ↓
Persistence Service 防抖保存
```

### 6.2 代码编辑

```text
Monaco 输入
  ↓
HTML 安全解析
  ↓
生成候选 Document
  ↓
结构与兼容性校验
  ↓
无冲突：提交到 Store
有冲突：提示用户选择或回退
```

### 6.3 导出

```text
ProjectDocument
  ↓
结构校验
  ↓
微信兼容转换
  ↓
安全清洗
  ↓
资源处理与压缩
  ↓
HTML / SVG / JSON
  ↓
最终验证报告
```

#### 导出失败处理

导出失败的回滚规则必须显式定义，避免失败时污染状态：

| 阶段         | 失败行为                 | 用户感知                               |
| ------------ | ------------------------ | -------------------------------------- |
| 结构校验     | 不写文件                 | 显示错误列表，保留原文档               |
| 微信兼容转换 | 不写文件                 | 显示不兼容项与建议                     |
| 安全清洗     | 不写文件                 | 显示被拦截的危险输入                   |
| 资源处理     | 标记失败节点，跳过该资源 | 报告内列出失败节点，可继续导出其他节点 |
| 写入 / 下载  | 不写文件                 | 显示具体写入失败原因                   |

总原则：

- 任何阶段失败都不会修改 ProjectDocument。
- 已应用的自动修复会写入 `CompatibilityFix` 记录（见第 11 节），与失败报告一同展示。
- 部分节点失败时允许"尽力导出"，但必须明确标记哪些节点缺失。

---

## 7. 状态管理约定

Pinia Store 负责业务状态，不负责具体渲染。

建议拆分：

- `projectStore`：项目生命周期和当前文档。
- `selectionStore`：选中、悬停和焦点。
- `historyStore`：撤销/重做。
- `assetStore`：资源索引与加载状态。
- `editorStore`：视图模式、缩放、面板状态。
- `settingsStore`：用户偏好和 Provider 配置。

禁止：

- 在组件内部维护另一份节点列表。
- 将 Blob URL 当作永久资源地址保存。
- 通过深层对象突变绕过 Store action。
- 把网络请求状态混入文档模型。

---

## 8. 持久化设计

本地存储必须保证刷新、关闭浏览器和版本升级后仍可恢复项目。

### 8.1 保存内容

- 项目文档 JSON
- 图片和其他二进制资源 Blob
- 文档到资源的引用关系
- 最近打开项目 ID
- 用户设置
- 数据库版本

### 8.2 不应保存

- 临时 Blob URL
- Konva 运行时对象
- Monaco 实例
- DOM 引用
- 正在进行的网络请求
- 未加密的远程服务密钥副本

### 8.3 保存状态

界面必须向用户显示：

- 正在保存
- 已保存
- 保存失败
- 本地空间不足
- 项目恢复成功
- 数据迁移失败

保存失败不能静默忽略。

---

## 9. 历史记录

当前方案采用最多 50 步的文档快照。V1 可继续使用，但必须满足：

- 快照内容不包含 Blob 本体。
- 连续输入操作应合并，不能每个字符生成一次完整快照。
- 撤销/重做后文档、画布和代码视图必须一致。
- 打开项目时清空历史栈，以当前文档为基线，不跨会话恢复。
- 历史记录通常不跨浏览器会话恢复，除非产品明确需要。

打开项目时清空历史的理由：避免"撤销把别人改的内容撤销掉"的协作语义混乱，也避免历史快照中存在不再有效的资源引用。

当大型文档出现明显内存问题后，再考虑命令式增量历史；不要在没有性能证据时提前重写。

---

## 10. HTML 与 SVG 安全

WeSVG 会处理用户输入和未来的 AI 输出，因此预览和导出必须默认不信任输入。

必须拦截：

- `<script>`
- `onerror`、`onclick` 等事件属性
- `javascript:` URL
- 未允许的 iframe、object、embed
- 外部资源追踪代码
- 不安全 CSS URL
- 超出白名单的 SVG 标签和属性

建议：

- 预览运行在 sandboxed iframe。
- 解析、预览和导出共用一套白名单策略。
- AI 输出先通过 `OutputValidator`，再转换为文档模型。
- API Key 只保存在本机，并提示用户浏览器存储的安全边界。
- 安全清洗应有固定攻击样例测试。

---

## 11. 微信兼容性

兼容性引擎应输出结构化问题，而不是简单返回通过/失败。

```ts
interface CompatibilityIssue {
  code: string
  severity: 'error' | 'warning' | 'info'
  nodeId?: string
  message: string
  autoFixAvailable: boolean
}
```

为了支持"所有自动修复必须对用户可见，不能静默改变作品"，增加 `CompatibilityFix` 类型：

```ts
interface CompatibilityFix {
  issueCode: string // 对应 CompatibilityIssue.code
  nodeId?: string
  before: string // 修复前片段（用于预览对比）
  after: string // 修复后片段
  appliedAt: string // ISO 时间戳
  appliedBy: 'system' | 'user' // 系统自动应用或用户手动确认
}
```

导出报告必须包含 `appliedFixes: CompatibilityFix[]`，并在 UI 中以"差异对比"形式展示，让用户能够看到每个修复改动的具体内容。

导出前报告至少包含：

- 不兼容标签和属性
- 已自动修复项目（带 `CompatibilityFix` 列表）
- 可能失效的动画
- 外部资源数量
- 图片总体积
- 可复制/可下载状态
- 整体兼容性评分（0–100）

所有自动修复必须对用户可见，不能静默改变作品。

---

## 12. AI 功能边界

AI 功能是辅助编辑，而不是独立于编辑器的数据通道。

优先支持结构化操作：

```json
{
  "actions": [
    { "type": "setFill", "nodeId": "title", "value": "#ff5f36" },
    { "type": "setFontSize", "nodeId": "title", "value": 42 }
  ]
}
```

结构化 action 具有以下优势：

- 可以校验
- 可以撤销（复用 `historyStore`，不另起通道）
- 可以生成变更预览
- 不允许模型绕过文档约束
- 能记录用户接受或拒绝的修改

关键约束：AI 输出的每一组 action 必须走和手动编辑完全一样的 dispatch 路径，撤销栈记录的是"一组 actions"而不是"AI 调用本身"。

V1 不要求 AI 生成完整页面。AI 功能失败时，基础编辑和导出必须继续可用。

---

## 13. 测试策略

### 13.1 单元测试

优先测试纯逻辑模块：

- 文档模型迁移
- Canvas/HTML 节点映射
- SVG/HTML 生成
- 微信兼容规则
- 安全清洗
- History 合并策略
- 资源引用解析

### 13.2 集成测试

必须覆盖：

1. Canvas → HTML → Canvas 往返后关键属性不变。
2. 上传图片、刷新页面后图片仍可用。
3. 保存旧 schema 文档并迁移到新版本。
4. 修改代码后画布更新，冲突时不覆盖原文档。
   - 4a. 修改代码 → 自动同步到画布，且不丢现有选中状态。
   - 4b. 修改代码触发校验失败 → 显示错误，不污染文档模型。
   - 4c. 并发修改（代码 + Design 同时）→ 后到者收到冲突提示。
5. 导出结果通过安全和兼容性检查。

### 13.3 端到端测试

至少保留三个 Playwright 流程：

- 新建项目、添加对象、保存、刷新、恢复。
- 编辑文字和图片、撤销、重做、导出 HTML。
- 打开 Split 视图、修改代码、返回 Design 视图。

### 13.4 回归 Fixture

建立 `tests/fixtures/`：

- 基础文字卡片
- 图片与图层组合
- 微信 SVG 动画
- 危险 HTML 输入
- 旧版本项目数据
- 大型 100 图层文档

---

## 14. 建议的工程脚本

目标配置：

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "vue-tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

该配置是改进目标，接入依赖和配置文件后才能加入仓库，不能只修改 scripts 而不安装工具。

---

## 15. CI 质量闸门

每个 Pull Request 应执行：

```text
npm ci
  ↓
typecheck
  ↓
lint + format:check
  ↓
unit/integration tests
  ↓
production build
  ↓
Playwright smoke tests
```

禁止在 CI 失败时合并到主分支。涉及文档 schema、导出格式或持久化格式的变更，必须带回归测试。

---

## 16. 性能目标

| 指标         |                 V1 目标 |
| ------------ | ----------------------: |
| 首页可交互   |                  2 秒内 |
| 编辑器可操作 |                  3 秒内 |
| 常规编辑反馈 |               100 ms 内 |
| 自动保存完成 | 500 ms 左右，不阻塞编辑 |
| 撤销/重做    |               100 ms 内 |
| 100 图层操作 |          桌面端保持流畅 |

Monaco、AI 面板和图像处理模块应延迟加载。首页和 Design 模式不应提前加载全部编辑器依赖。

---

## 17. 分支与提交

建议分支：

```text
main                   可部署版本
feat/<short-name>      功能
fix/<short-name>       缺陷
docs/<short-name>      文档
refactor/<short-name>  无行为变化的重构
```

提交示例：

```text
feat(storage): restore image assets after refresh
fix(export): preserve SVG viewBox in WeChat output
test(editor): cover canvas-to-html round trip
docs(status): align milestone state with implementation
```

一次提交应表达一个完整意图，避免同时修改架构、样式和无关文档。

---

## 18. Definition of Done

一个功能只有在满足以下条件时才算完成：

- 主流程在真实 UI 中可用
- 空状态、加载状态和失败状态已处理
- TypeScript 类型通过
- 自动化测试覆盖关键逻辑
- 构建成功
- 刷新和恢复行为已验证
- 安全边界已评估
- 文档和状态清单已更新
- 没有把未来计划写成已完成能力

---

## 19. V1 发布标准

V1 发布前必须满足：

- 用户能在 10 分钟内完成一份作品并导出。
- 关闭和重新打开浏览器后，项目及图片完整恢复。
- Design/Split/Code 往返不会破坏文档。
- 导出结果包含安全和微信兼容报告。
- 至少有 3 个内置示例。
- CI 持续通过。
- README 提供 Demo、演示 GIF、快速开始和当前限制。
- 发布版本号与 `package.json`、文档和 Git Tag 一致。

---

## 20. 近期执行顺序

### P0：稳定编辑闭环

1. 统一版本号和项目状态。
2. 完成刷新恢复和图片 Blob 持久化。
3. 完成图层排序、锁定和资产浏览器。
4. 修复所有数据丢失路径。

### P1：建立质量证据

1. 接入 ESLint、Prettier、Vitest 和 Playwright。
2. 为 round-trip、持久化、History 和导出建立测试。
3. 配置 GitHub Actions。

### P2：可靠导出

1. 建立统一 Export Pipeline。
2. 完成安全白名单和微信兼容报告（含 `CompatibilityFix` 记录）。
3. 使用真实微信内容 Fixture 验收。

### P3：公开发布

1. 部署 Live Demo。
2. 增加首次使用引导和 3 个模板。
3. 录制演示 GIF。
4. 发布第一个状态一致的正式版本。

### 延后

- 完整 AI 页面生成
- 模板市场
- 多人协作
- 云同步

这些功能只有在 V1 的编辑、保存和导出已经稳定后才进入开发。

---

## 21. 当前执行状态（2026-09-23）

当前处于 **P0 阶段**。退出 P0 的客观条件：

- [ ] 任意刷新后 100% 恢复图片
- [ ] 任意撤销/重做 20 次后文档哈希一致
- [ ] 关闭浏览器再打开，画布位置与颜色不变
- [ ] 至少 1 个 round-trip 自动化测试在 CI 通过
- [ ] `docs/STATUS.md` 已更新到与代码一致

完成 P0 后立即进入 P1，不允许跳过。

---

最后更新：2026-09-23
