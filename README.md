# 再续天庭现代化重写

这是一个基于原 Flash 游戏提取资料的现代化重写项目。当前技术路线是 Phaser 3 + TypeScript + Vite，目标是在浏览器中逐步复现原版的外观、玩法、数值、手感和流程。

项目不追求维护原 Flash 工程，也不照搬 AS3 的技术结构。AS3 源码和导出资源只作为行为与素材参考；现代代码优先使用清晰模块边界、显式数据模型和可测试的系统函数。

## 当前状态

- 已搭建 Phaser 3 + TypeScript 工程。
- 已有最小战斗切片相关系统：输入、角色移动、普通攻击、技能、投射物、怪物、碰撞与关卡停止点。
- 已补充系统级测试入口和工作流校验。
- 原始 FFDec 提取目录 `extracted_flash/` 保留为本地资料，不纳入 Git 仓库。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

运行系统测试：

```bash
npm run test:systems
```

运行完整检查：

```bash
npm run check:all
```

## 目录说明

- `src/`: Phaser 现代重写代码。
- `src/scenes/`: 游戏场景。
- `src/systems/`: 输入、战斗、关卡、怪物、技能等可测试系统。
- `src/assets/`: 现代工程的资源清单与加载描述。
- `docs/`: 逆向记录、任务看板、纵向切片和工作流文档。
- `tools/`: 自动化检查与系统测试脚本。
- `public/`: Vite 静态资源入口。
- `extracted_flash/`: 本地 FFDec 提取资料，默认不提交到 Git。

## 关于提取资料

`extracted_flash/` 可能包含大量候选 SWF、反编译脚本、图片、声音和中间产物，其中有些文件体积大、路径不适合跨平台协作，也有误命中的候选包。当前仓库只提交现代重写代码、文档和必要脚手架。

如果未来确实需要把提取资料纳入仓库，应先拆分清楚：

- 哪些是原始提取结果。
- 哪些是经过筛选的可用资源。
- 哪些是只供逆向参考的中间产物。
- 哪些文件需要 Git LFS 或外部制品存储。

在完成这层治理前，不直接提交 `extracted_flash/`。

## 开发约定

- 先阅读 `AGENTS.md` 和 `TASK_OUTLINE.md`。
- 执行游戏任务时参考 `docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。
- 修改 `src/` 前参考 `docs/architecture/src-boundaries.md`。
- 脚手架和任务工作流变更后运行 `npm run check:workflow`。
- 默认不自动启动 `npm run dev`；优先运行可终止的构建或检查命令。
