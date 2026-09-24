# WeSVG Studio — 项目交接文档

> 面向**新接手的开发者 / AI Agent** 的项目全景与上下文文档
> 建议先通读本文档，再按需查阅 `docs/` 下对应的架构 / 决策 / 报告文档。

| 字段       | 值                                          |
| ---------- | ------------------------------------------- |
| 项目名称   | WeSVG Studio                                |
| 当前版本   | 0.3.2                                       |
| 当前里程碑 | **M1 — 编辑器核心稳定化**（进行中，约 70%） |
| 最近更新   | 2026-06-18                                  |
| 仓库类型   | 前后端一体（前端 Vite + Vue，后端 Fastify） |
| 许可证     | MIT                                         |

---

## 1. 项目定位

**WeSVG Studio** 是一款面向 **微信公众号 / H5** 场景的 **可视化 HTML · SVG 编辑器**。

- 拖拽即所得（Design 模式）
- 画布 + 代码同屏对照（Split 模式）
- Monaco 直接编写 HTML（Code 模式）
- 自然语言生成可编辑画布（AI 模式，M2/M3 路线中）
- 一键复制 / 下载，**重点兼容微信公众号后台环境**

灵感来源：Figma / 即时设计 / 秀米。

---

## 2. 技术栈一览

| 类别             | 选型                                               | 版本             |
| ---------------- | -------------------------------------------------- | ---------------- |
| 前端框架         | Vue 3（`<script setup>`）                          | ^3.5.34          |
| 语言             | TypeScript                                         | ~6.0.2           |
| 构建工具         | Vite                                               | ^8.0.12          |
| 画布引擎         | Konva + vue-konva                                  | ^10.3.0 / ^3.4.0 |
| 代码编辑器       | Monaco Editor + @monaco-editor/loader              | ^0.55.1          |
| 状态管理         | Pinia                                              | ^3.0.4           |
| 本地存储         | IndexedDB（v3，DB 名 `WeSVGStudio`）               | —                |
| 轻量元数据       | localStorage（`wesvg_meta`）                       | —                |
| ID 生成          | uuid                                               | ^14.0.0          |
| 后端框架         | Node.js + Fastify                                  | Fastify 5        |
| 后端中间件       | @fastify/cors、@fastify/multipart、@fastify/static | —                |
| 抠图模型（计划） | RMBG-2.0（`@xenova/transformers`，**未集成**）     | —                |

---

## 3. 目录结构与职责

```
WeSVG Studio/
├── index.html                        # Vite 入口 HTML
├── package.json                      # 前端依赖与脚本
├── vite.config.ts                    # Vite 配置（@ → ./src 别名）
├── tsconfig*.json                    # 三个 TS 配置（app / node / base）
│
├── public/                           # 静态资源（favicon、icons）
│
├── src/                              # 前端源码
│   ├── main.ts                       # 入口：注册 Pinia + VueKonva
│   ├── App.vue                       # 根组件，承载页面切换 + 全局快捷键
│   ├── style.css                     # 全局样式 + Design Token
│   │
│   ├── pages/                        # 页面级组件
│   │   ├── HomePage.vue              # 首页：新建/打开/删除项目
│   │   └── EditorPage.vue            # 编辑器：TopBar + 三栏 + 状态栏
│   │
│   ├── components/                   # 编辑器 UI 组件
│   │   ├── TopNavigationBar.vue
│   │   ├── LeftSidebar.vue
│   │   ├── RightSidebar.vue
│   │   ├── BottomStatusBar.vue
│   │   ├── CanvasViewport.vue        # ★ Konva 画布宿主
│   │   ├── SelectionToolbar.vue      # 浮动工具栏（锁定/复制/删除/旋转/抠图/裁剪）
│   │   ├── TextEditorOverlay.vue     # 双击文本编辑
│   │   ├── MonacoEditor.vue          # Monaco 封装
│   │   ├── SplitEditor.vue           # 画布 + 代码同屏
│   │   ├── ExportDialog.vue
│   │   └── DevicePreview.vue         # 设备视口预览
│   │
│   ├── canvas/                       # Konva 画布抽象层
│   │   ├── CanvasManager.ts          # Stage 生命周期
│   │   ├── CanvasObjectFactory.ts    # Layer → Konva Node
│   │   ├── CanvasEventManager.ts     # 选择 / Transformer / 回调
│   │   └── CanvasSerializer.ts       # 序列化
│   │
│   ├── editor/                       # HTML ↔ 画布解析
│   │   ├── htmlParser.ts             # HTML 与画布的双向解析
│   │   └── nodeMapper.ts             # Layer ↔ HTML 节点映射
│   │
│   ├── stores/                       # Pinia 状态（6 个 store）
│   │   ├── projectStore.ts           # ★ 当前项目、列表、自动保存、撤销/重做
│   │   ├── canvasStore.ts            # 画布状态
│   │   ├── historyStore.ts           # 50 步快照历史
│   │   ├── animationStore.ts         # 动画
│   │   ├── backgroundStore.ts        # 工作区背景
│   │   └── uiStore.ts                # UI 状态（编辑器模式 / 高亮等）
│   │
│   ├── renderer/                     # 导出渲染
│   │   ├── SvgGenerator.ts
│   │   └── WechatRenderer.ts         # 微信公众号兼容渲染
│   │
│   ├── publisher/                    # 输出通道
│   │   ├── ClipboardPublisher.ts     # 复制 HTML 到剪贴板
│   │   └── FileExporter.ts           # 下载 HTML/SVG/JSON
│   │
│   ├── animation/                    # 动画引擎与注册
│   │   ├── AnimationEngine.ts
│   │   └── AnimationRegistry.ts
│   │
│   ├── ai/                           # AI 渲染（占位 + 基础脚手架）
│   │   ├── RenderAgent.ts
│   │   ├── PromptBuilder.ts
│   │   └── OutputValidator.ts
│   │
│   ├── layer/                        # 图层工具
│   │   └── LayerManager.ts
│   │
│   ├── utils/                        # 工具函数
│   │   ├── id.ts                     # generateId
│   │   ├── db.ts                     # ★ IndexedDB（projects + assets）
│   │   ├── assetManager.ts           # 资源管理（storeAsset / loadAssetAsUrl …）
│   │   ├── image.ts                  # 图片压缩
│   │   └── removeBg.ts               # 抠图 API 客户端
│   │
│   └── types/
│       └── index.ts                  # ★ 全局 TypeScript 类型契约
│
├── server/                           # Fastify 后端（抠图 API）
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts                  # /api/v1/health、/api/v1/image/remove-bg、/uploads
│
└── docs/                             # ★ 项目文档（交接前必读）
    ├── PROJECT_MASTER.md             # 项目总览（已完成 / 进行中 / 下一里程碑）
    ├── PROJECT_CONTEXT.json          # 给 AI Agent 用的结构化上下文
    ├── AGENT_RULES.md                # AI Agent 工作流规范
    ├── CONTEXT_COMPRESSION_RULE.md   # 上下文压缩与里程碑摘要规则
    ├── BUG_LOG.md                    # Bug 流水（含已修复 + 复现步骤）
    ├── ROADMAP.md                    # 6 个里程碑路线图
    ├── architecture/                 # 子系统架构
    │   ├── ARCHITECTURE.md
    │   ├── CANVAS_SYSTEM.md
    │   ├── ASSET_SYSTEM.md
    │   ├── STORAGE_SYSTEM.md
    │   ├── UI_DESIGN_SYSTEM.md
    │   ├── VISUAL_CODE_SYNC.md
    │   ├── EXPORT_ENGINE.md
    │   └── AI_RENDERER.md
    ├── decisions/                    # 关键架构决策 ADR
    │   ├── ADR-001-Konva.md
    │   ├── ADR-002-IndexedDB.md
    │   └── ADR-003-Monaco.md
    └── reports/
        ├── M1_REPORT.md
        └── TEMPLATE.md
```

---

## 4. 整体架构（六层模型）

```
┌──────────────────────────────────────────────────────────┐
│  Presentation Layer   HomePage · EditorPage · AI Mode    │
├──────────────────────────────────────────────────────────┤
│  Component Layer      TopBar · LeftSide · Viewport ·     │
│                       Overlay · RightSide · Export       │
├──────────────────────────────────────────────────────────┤
│  Canvas Layer (Konva) Manager · ObjectFactory ·          │
│                       EventManager · Serializer          │
├──────────────────────────────────────────────────────────┤
│  State Layer (Pinia)  project · canvas · history ·       │
│                       animation · background · ui        │
├──────────────────────────────────────────────────────────┤
│  Service Layer        AssetManager · IDB · RemoveBG ·    │
│                       ImageCompress                      │
├──────────────────────────────────────────────────────────┤
│  Backend (Fastify)    /api/v1/image/remove-bg            │
│                       /api/v1/assets/upload  (计划)      │
└──────────────────────────────────────────────────────────┘
```

### 4.1 关键设计原则

1. **单一数据源**：所有状态走 Pinia，组件只读不写。
2. **三层画布**：`workspace`（背景）/ `design`（图层）/ `UI`（控制柄）。
3. **CSS Transform 缩放**：用 `transform: scale()` 而非 Konva stage 缩放，性能更好、坐标映射更稳定。
4. **防抖自动保存**：500ms 后统一写 IndexedDB。
5. **快照式撤销/重做**：全量 JSON 快照，逻辑简单可靠。
6. **Canvas ↔ Code 中间层**：所有变更走 AST 层（`htmlParser` + `nodeMapper`），避免双向直接修改。

---

## 5. 子系统速览

| 子系统          | 文档                                    | 关键文件                                            |
| --------------- | --------------------------------------- | --------------------------------------------------- |
| 画布            | `docs/architecture/CANVAS_SYSTEM.md`    | `src/canvas/*`、`src/components/CanvasViewport.vue` |
| 资源            | `docs/architecture/ASSET_SYSTEM.md`     | `src/utils/assetManager.ts`、`src/utils/db.ts`      |
| 存储            | `docs/architecture/STORAGE_SYSTEM.md`   | `src/utils/db.ts`、`src/stores/projectStore.ts`     |
| UI 设计系统     | `docs/architecture/UI_DESIGN_SYSTEM.md` | `src/style.css`（CSS Variables）                    |
| 画布 ↔ 代码同步 | `docs/architecture/VISUAL_CODE_SYNC.md` | `src/editor/*`                                      |
| 导出引擎        | `docs/architecture/EXPORT_ENGINE.md`    | `src/renderer/*`、`src/publisher/*`                 |
| AI 渲染         | `docs/architecture/AI_RENDERER.md`      | `src/ai/*`                                          |
| 后端            | —                                       | `server/src/index.ts`                               |

### 5.1 画布系统

- 缩放范围 **10% – 800%**，默认 35%，以光标为缩放中心
- 平移：`Space + LMB` / `中键` / 背景拖拽
- 网格：none / dot / square
- 双击文本进入编辑（`TextEditorOverlay`）
- 选区样式：**橙色（#FF6A00）** 高亮 + 白色控制柄（Canva 风格）

### 5.2 存储系统

| 层                   | 用途                           | Key          | 值                       |
| -------------------- | ------------------------------ | ------------ | ------------------------ |
| `localStorage`       | 项目元数据列表（id/name/date） | `wesvg_meta` | JSON 字符串              |
| IndexedDB `projects` | 项目完整数据                   | `id`         | `{ id, data, ts }`       |
| IndexedDB `assets`   | 图片 Blob                      | `id`         | `{ id, blob, meta, ts }` |

**自动保存触发条件（任一即触发 500ms 防抖）**：

- 图层增/删/排序
- 图层属性变更（位置、样式、可见性、锁定）
- 文本内容修改
- 画布尺寸 / 缩放 / 平移变更

### 5.3 资源（图片）系统

- 图片以 **Blob 形式** 存入 IndexedDB（`assets` 库），由 `assetId` 引用
- 渲染时 `loadAssetAsUrl(assetId)` → `URL.createObjectURL`（**调用方负责 revoke**）
- 这是修复 BUG-001（图片重启后丢失）的核心方案

### 5.4 画布 ↔ 代码同步

```
Canvas Layer Tree
       ↕
  Virtual DOM AST (htmlParser.ts)
       ↕
  HTML Source      (MonacoEditor.vue)
       ↕
  Node Mapping     (nodeMapper.ts)
```

- 画布点击 → `data-layer-id` 查表 → Monaco 高亮行（橙色 1500ms）
- 代码点击 → 解析 `data-layer-id` → 画布蓝色描边（1500ms）
- `data-layer-id` 与 `data-node-id` 双 ID 关联

### 5.5 导出引擎

| 格式      | 实现                 | 用途                                             |
| --------- | -------------------- | ------------------------------------------------ |
| 微信 HTML | `WechatRenderer`     | 公众号后台可直接粘贴（Section + SVG，SMIL 动画） |
| 标准 SVG  | `SvgGenerator`       | 单文件 SVG                                       |
| JSON      | `FileExporter`       | 项目完整导出                                     |
| 剪贴板    | `ClipboardPublisher` | 一键复制 HTML                                    |

**微信允许标签白名单**：`section, div, span, img, svg, g, path, rect, circle, text, animate, animateTransform, clipPath, mask`
**禁用标签**：`script, iframe, video, audio, canvas, webgl, object, embed`

### 5.6 AI 渲染（M2/M3 计划）

```
Canvas JSON → Validator → PromptBuilder → LLM
                                         ↓
                              OutputValidator → AutoFix
                                         ↓
                              失败则回退到 WechatRenderer
```

当前仅完成**脚手架**（`RenderAgent` / `PromptBuilder` / `OutputValidator`），尚未接 LLM。

### 5.7 后端 Fastify

`server/src/index.ts`：

- `GET  /api/v1/health` — 健康检查
- `POST /api/v1/image/remove-bg` — multipart 上传图片，返回透明 PNG（**当前为占位，pass-through 原图**）
- `GET  /uploads/*` — 静态文件目录
- 上传限制 10MB
- 端口默认 4000（`PORT` 环境变量可改）

**TODO 注释已在代码中标记**：`briaai/RMBG-2.0` 通过 `@xenova/transformers` 集成。

---

## 6. 核心数据模型

详见 `src/types/index.ts`。最重要的几个契约：

```ts
interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: string
  canvas: Canvas
}

interface Canvas {
  id: string
  width: number
  height: number
  background: string
  viewMode: DeviceMode
  layers: AnyLayer[]
}

type AnyLayer = Layer | TextLayer | ShapeLayer | GroupLayer | AssetLayer

interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  zIndex: number
  transform: Transform
  style: Style
  asset?: Asset
  animation?: Animation[]
  assetId?: string // ★ 引用 IndexedDB 资源
}

// M1 阶段新增
interface CanvasProject {
  id
  name
  version
  zoom
  panX
  panY
  layers
}
interface AssetRecord {
  id
  name
  mimeType
  width
  height
  blob
  createdAt
}
interface ProjectMeta {
  id
  name
  updatedAt
  createdAt
}
```

设备视口宽度（`DeviceModeWidths`）：`phone 375 / tablet 768 / fold 677 / desktop 1280`

---

## 7. 已完成 / 进行中 / 待办

### 7.1 已完成（19 项）

- Konva 画布（缩放 / 平移 / 网格）
- 图层系统（增删 / 排序 / 可见 / 锁定）
- 图片上传（File picker → Blob URL）
- 形状 / 文本创建
- Canva 风格选择 + 浮动工具栏
- 设备预览（手机 / 平板 / 折叠屏 / 桌面）
- 导出系统（剪贴板 / HTML / SVG / JSON）
- 多模式编辑器（Design / Split / Code / AI）
- Monaco 集成
- 500ms 自动保存
- 50 步撤销/重做
- History Store（快照式）
- Asset Manager（IndexedDB Blob）
- 文本编辑 Overlay
- 工作区背景（纯色 / 图片）
- RMBG-2.0 后端脚手架
- Node Mapper（Layer ↔ HTML）
- HTML ↔ Canvas 解析

### 7.2 进行中（M1 收尾）

- 图片持久化（上传即入 IndexedDB）
- 图层面板集成（锁图标、拖拽排序）
- 刷新自动恢复（从 IndexedDB 还原）
- 资源浏览器（左侧栏）

### 7.3 已修复 Bug（5 项）

- BUG-001 图片重启丢失 → AssetManager
- BUG-002 改色位置重置 → Transformer 保存/恢复
- BUG-003 跳转空白页 → 单一 deep watch
- BUG-004 文本/图形点击无效 → 移除失效的 layers.value 引用
- BUG-005 图片不显示 → 移除 crossOrigin + 直传原始 Blob

---

## 8. 路线图（M1 – M6）

| 里程碑 | 主题               | 状态    | 关键内容                                                  |
| ------ | ------------------ | ------- | --------------------------------------------------------- |
| **M1** | 编辑器核心稳定化   | 🚧 70%  | 自动保存 / 撤销重做 / 图片持久化 / 文本编辑 / Canva 选择  |
| **M2** | AI 抠图 + 导出打磨 | 📋 计划 | RMBG-2.0 集成、Before/After 预览、SMIL 动画导出、微信校验 |
| **M3** | AI 内容生成        | 📋 计划 | AI Chat 面板、HTML 生成、Prompt 模板库                    |
| **M4** | 画布 ↔ 代码同步    | ✅ 基础 | 双向高亮已做，实时同步与冲突解决待办                      |
| **M5** | 微信兼容性引擎     | 🚧 进行 | 标签白名单 + SMIL 映射 + 响应式 viewBox                   |
| **M6** | 模板市场 + 协作    | 💭 远期 | 模板库 / 团队项目 / 实时协作 / 云同步                     |

---

## 9. 快速开始

### 9.1 环境要求

- Node.js ≥ 18
- 包管理器：pnpm / npm / yarn 均可

### 9.2 安装与启动

```bash
# 克隆
git clone https://github.com/kemakiko9566-design/WeSVG.git
cd WeSVG

# 前端
npm install
npm run dev          # http://localhost:5173

# 后端（可选，目前仅抠图占位）
cd server
npm install
npm run dev          # http://localhost:4000
```

### 9.3 构建与预览

```bash
npm run build        # vue-tsc 类型检查 + vite build
npm run preview
```

### 9.4 全局快捷键

- `Ctrl/Cmd + Z` — 撤销
- `Ctrl/Cmd + Shift + Z` — 重做
- `Ctrl/Cmd + Y` — 重做（兼容）
- 监听器在 `src/App.vue` 的 `handleKeydown` 中

---

## 10. AI Agent 工作流（接手必读）

按 `docs/AGENT_RULES.md` 与 `docs/CONTEXT_COMPRESSION_RULE.md` 规定：

1. **STEP 0** — 读 `CONTEXT_COMPRESSION_RULE.md`
2. **STEP 1** — 读 `PROJECT_CONTEXT.json`
3. **STEP 2** — 读 `PROJECT_MASTER.md`
4. **STEP 2.5** — 读 `docs/reports/MILESTONE_SUMMARY.md`（若存在）
5. **STEP 3** — 读当前里程碑报告（`docs/reports/M*.md`）
6. **STEP 4** — 读 `BUG_LOG.md`
7. **STEP 5** — 按需读 `docs/architecture/*.md` 对应子系统
8. **STEP 6** — 必要时再读源码
9. **STEP 7** — 更新 `MILESTONE_SUMMARY.md`
10. **STEP 8** — 生成 `docs/logs/YYYY-MM-DD-task-name.md` 开发日志

**黄金法则**：

- 不要扫整个仓库，先读文档
- 重大决策前先写 ADR
- 修复 Bug 后同步更新 `BUG_LOG.md`
- 完成模块后更新 `PROJECT_CONTEXT.json`

---

## 11. 开发注意事项 / 坑位

> 这些都是从已修复 Bug 中提炼出的经验，新人务必注意。

1. **Blob URL 是临时的** — 跨刷新需用 `assetId` 引用 IndexedDB，渲染时再 `createObjectURL`。
2. **Konva 节点销毁会丢选择** — `renderAllLayers()` 前要保存 Transformer 选区引用并恢复。
3. **deep watch 不要叠加 immediate** — 会导致 mount 生命周期竞态（BUG-003 教训）。
4. **不要给 blob URL 设置 `crossOrigin = 'anonymous'`** — 会导致图片加载失败（BUG-005 教训）。
5. **CSS transform 缩放比 Konva stage 缩放更稳** — 避免坐标映射问题。
6. **`assetId` 是图像持久化的关键字段** — `Layer.assetId`（非 `Layer.asset.url`）才能在刷新后还原。
7. **多 watch 容易引发竞态** — 优先使用单个 `deep: true` watch。

---

## 12. 文档与代码索引

### 12.1 文档地图

| 类别   | 路径                               | 用途                     |
| ------ | ---------------------------------- | ------------------------ |
| 总览   | `docs/PROJECT_MASTER.md`           | 状态、已完成、下一里程碑 |
| 上下文 | `docs/PROJECT_CONTEXT.json`        | 给 AI Agent 的结构化数据 |
| 架构   | `docs/architecture/*.md`           | 各子系统设计             |
| 决策   | `docs/decisions/ADR-*.md`          | 关键选型记录             |
| 报告   | `docs/reports/M*.md`               | 里程碑交付报告           |
| 规范   | `docs/AGENT_RULES.md`              | AI Agent 行为准则        |
| 规范   | `docs/CONTEXT_COMPRESSION_RULE.md` | 上下文压缩规范           |
| Bug    | `docs/BUG_LOG.md`                  | Bug 流水 + 复现步骤      |

### 12.2 关键源码地图

| 模块      | 文件                                                     | 备注                                        |
| --------- | -------------------------------------------------------- | ------------------------------------------- |
| 入口      | `src/main.ts`                                            | 注册 Pinia + VueKonva                       |
| 根组件    | `src/App.vue`                                            | 页面切换 + 全局快捷键                       |
| 类型      | `src/types/index.ts`                                     | 全局 TS 契约                                |
| 项目状态  | `src/stores/projectStore.ts`                             | CRUD + 自动保存 + 撤销重做                  |
| 历史      | `src/stores/historyStore.ts`                             | 50 步快照                                   |
| 画布      | `src/canvas/CanvasManager.ts` 等 4 个                    | Konva 抽象层                                |
| IndexedDB | `src/utils/db.ts`                                        | projects + assets 两库                      |
| 资源      | `src/utils/assetManager.ts`                              | storeAsset / loadAssetAsUrl / list / delete |
| 解析      | `src/editor/htmlParser.ts` + `nodeMapper.ts`             | 画布 ↔ HTML                                 |
| 渲染      | `src/renderer/WechatRenderer.ts`、`SvgGenerator.ts`      | 导出                                        |
| 发布      | `src/publisher/ClipboardPublisher.ts`、`FileExporter.ts` | 剪贴板 / 下载                               |
| AI        | `src/ai/RenderAgent.ts` 等 3 个                          | 渲染脚手架                                  |
| 后端      | `server/src/index.ts`                                    | Fastify + 抠图占位                          |

---

## 13. 交接清单（接收人请确认）

接手前，请逐项确认：

- [ ] 已克隆仓库并能 `npm install` + `npm run dev` 启动前端
- [ ] 已读 `README.md` + `docs/PROJECT_MASTER.md`
- [ ] 已读 `docs/PROJECT_CONTEXT.json`
- [ ] 已读 `docs/architecture/ARCHITECTURE.md` 总览
- [ ] 已按需读相关子系统架构文档
- [ ] 已读 `docs/BUG_LOG.md`（了解历史坑位）
- [ ] 已读 `docs/AGENT_RULES.md`（如为 AI Agent）
- [ ] 了解当前里程碑（M1）目标与未完成项
- [ ] 了解下一里程碑（M2 — AI 抠图）的目标
- [ ] 知道如何写 ADR / 里程碑报告 / 开发日志

---

## 14. 联系方式 / 资源

- 仓库：<https://github.com/kemakiko9566-design/WeSVG>
- 协议：MIT
- 灵感：Figma / 即时设计 / 秀米
- 致谢：Konva、Monaco、Pinia、Vue 3、Vite 等开源项目

---

> **一句话总结**：WeSVG Studio 是一个基于 Vue 3 + Konva + Monaco 的微信公众号 SVG 编辑器，M1 阶段（核心编辑能力）已基本就绪，正在补齐图片持久化、图层面板、自动恢复；M2 阶段将集成 RMBG-2.0 抠图与微信兼容性引擎。交接时务必先读 `docs/`，再读源码。
