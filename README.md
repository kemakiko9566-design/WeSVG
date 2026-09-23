# WeSVG Studio

> 一款面向 **微信公众号 / H5** 的可视化 HTML · SVG 编辑器 — 拖拽即所得、代码可同步、AI 可辅助、一键导出到公众号。

![Status](https://img.shields.io/badge/status-M1%20In%20Progress-orange)
![Version](https://img.shields.io/badge/version-0.3.2-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-42b883)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff)
![Konva](https://img.shields.io/badge/Konva-10.3-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 核心特性

### 🎨 多模式编辑器

- **Design 模式** — 纯画布拖拽设计
- **Split 模式** — 画布与代码同屏对照
- **Code 模式** — Monaco 编辑器直接编写 HTML
- **AI 模式** — 自然语言生成可编辑画布

### 🖼️ 画布与图层

- 基于 **Konva** 的高性能矢量画布（缩放 / 平移 / 网格）
- 完整的图层系统：增删 / 排序 / 可见 / 锁定
- Canva 风格的选择体验（橙色高亮、白色控制柄）
- 浮动工具栏：锁定 / 复制 / 删除 / 旋转 / 抠图 / 裁剪

### 📱 设备预览

- 手机 / 平板 / 折叠屏 / 桌面 四种视口实时预览
- 一键切换，贴近真实展示效果

### 💾 持久化与历史

- **500ms 防抖** 自动保存到 IndexedDB
- **50 步** 撤销 / 重做（`Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`）
- 基于快照的 History Store
- 图片资源以 Blob 形式持久化（`AssetManager`）

### 🔁 可视 ↔ 代码双向同步

- 画布点击 → 代码行高亮
- 代码行点击 → 画布图层定位
- HTML ↔ Canvas 解析器（`NodeMapper` / `htmlParser`）
- 500ms 防抖实时同步

### 🤖 AI 辅助（M2 / M3 路线中）

- `RenderAgent` 智能体调度
- `PromptBuilder` 提示词构建
- `OutputValidator` 输出安全校验

### 📤 一键导出

- 复制 HTML 到剪贴板
- 下载 HTML / SVG / JSON
- 微信兼容性校验（M5 路线中）

---

## 🧰 技术栈

| 类别     | 选型                                     |
| -------- | ---------------------------------------- |
| 前端框架 | Vue 3.5 (`<script setup>`)               |
| 语言     | TypeScript 6.0                           |
| 构建工具 | Vite 8.0                                 |
| 画布引擎 | Konva 10.3 + vue-konva 3.4               |
| 代码编辑 | Monaco Editor 0.55                       |
| 状态管理 | Pinia 3.0                                |
| 本地存储 | IndexedDB                                |
| 后端服务 | Node.js + Fastify（抠图 API）            |
| 抠图模型 | RMBG-2.0（@xenova/transformers，待集成） |

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm / npm / yarn（任选）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/kemakiko9566-design/WeSVG.git
cd WeSVG

# 安装依赖
npm install

# 启动前端开发服务
npm run dev
# 默认运行在 http://localhost:5173

# 启动后端抠图服务（可选）
cd server
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📁 目录结构

```
WeSVG Studio/
├── src/                    # 前端源码
│   ├── ai/                 # AI 渲染：RenderAgent / PromptBuilder / OutputValidator
│   ├── animation/          # 动画引擎与注册表
│   ├── canvas/             # Konva 画布抽象层
│   │   ├── CanvasManager.ts
│   │   ├── CanvasObjectFactory.ts
│   │   ├── CanvasEventManager.ts
│   │   └── CanvasSerializer.ts
│   ├── components/         # Vue 组件（TopBar / Sidebar / Viewport …）
│   ├── editor/             # HTML 解析与节点映射
│   ├── layer/              # 图层管理工具
│   ├── pages/              # HomePage / EditorPage
│   ├── publisher/          # 剪贴板 / 文件导出
│   ├── renderer/           # SvgGenerator / WechatRenderer
│   ├── stores/             # Pinia 状态（6 个 store）
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 通用工具（id / db / image / asset …）
│   ├── App.vue             # 根组件（全局快捷键）
│   └── main.ts             # 入口
├── server/                 # Fastify 后端（抠图 API）
├── docs/                   # 项目文档
│   ├── PROJECT_MASTER.md   # 项目总览
│   ├── PROJECT_CONTEXT.json
│   ├── architecture/       # 架构设计
│   ├── decisions/          # ADR 决策记录
│   └── reports/            # 里程碑报告
├── public/                 # 静态资源
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🏛️ 架构概览

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                 │
│  HomePage · EditorPage · Split · AI Mode    │
├─────────────────────────────────────────────┤
│          Component Layer                    │
│  TopBar · Sidebar · Viewport · Overlay      │
├─────────────────────────────────────────────┤
│          Canvas Layer (Konva)               │
│  Manager · ObjFactory · EventMgr · Serializer│
├─────────────────────────────────────────────┤
│          State Layer (Pinia)                │
│  Project · Canvas · Animation · History     │
├─────────────────────────────────────────────┤
│          Service Layer                      │
│  AssetMgr · IDB · RemoveBG · ImageCompress  │
├─────────────────────────────────────────────┤
│          Backend (Fastify)                  │
│  /api/v1/image/remove-bg · /assets/upload   │
└─────────────────────────────────────────────┘
```

> 📖 详细架构设计参见 [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)

### 关键设计决策

- **单一数据源**：所有状态走 Pinia，组件只读取
- **三层画布**：workspace（背景）/ design（图层）/ UI（控制柄）
- **CSS Transform 缩放**：用 `transform: scale()` 而非 Konva stage 缩放，性能更好
- **防抖自动保存**：500ms 后统一写 IndexedDB
- **快照式撤销**：全量 JSON 快照，逻辑简单可靠

---

## 🗺️ 路线图

| 里程碑 | 主题              | 状态              |
| ------ | ----------------- | ----------------- |
| **M1** | 编辑器核心稳定化  | 🚧 进行中（~70%） |
| **M2** | AI 抠图与导出打磨 | 📋 计划中         |
| **M3** | AI 内容生成       | 📋 计划中         |
| **M4** | 可视 ↔ 代码同步   | ✅ 已完成基础     |
| **M5** | 微信兼容性引擎    | 🚧 进行中         |
| **M6** | 模板市场与协作    | 💭 远期规划       |

> 📖 详情见 [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## 🐛 已知问题与修复

| ID      | 标题                 | 状态     |
| ------- | -------------------- | -------- |
| BUG-001 | 重启后图片丢失       | ✅ Fixed |
| BUG-002 | 修改颜色导致位置重置 | ✅ Fixed |
| BUG-003 | 跳转后页面空白       | ✅ Fixed |
| BUG-004 | 文本/图形点击无效    | ✅ Fixed |
| BUG-005 | 上传图片不显示       | ✅ Fixed |

> 完整记录见 [`docs/BUG_LOG.md`](docs/BUG_LOG.md)

---

## 🤝 贡献指南

欢迎贡献代码、文档、Issue 与 PR！

1. Fork 本仓库
2. 创建 feature 分支：`git checkout -b feature/amazing-feature`
3. 提交变更：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

请遵循：

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- 重要决策请先在 [`docs/decisions/`](docs/decisions/) 写 ADR
- Bug 修复请同步更新 `docs/BUG_LOG.md`

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 协议开源。

---

## 💬 致谢

- 灵感来源于 Figma / 即时设计 / 秀米
- 感谢 Konva、Monaco、Pinia 等开源项目
- Made with ❤️ by WeSVG Studio Team
