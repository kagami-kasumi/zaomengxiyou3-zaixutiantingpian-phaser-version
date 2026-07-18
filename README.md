# 再续天庭现代化重写

用 Phaser 3、TypeScript 和 Vite 重写 Flash 动作 RPG《再续天庭》的现代浏览器版本。

本仓库的目标不是维护原 Flash 工程，也不是照搬 AS3 架构，而是在保留原版外观、玩法、数值、手感和流程的前提下，用现代前端工程方式逐步复现一个可测试、可演进的 2D 动作 RPG。

## 项目亮点

- **Flash 游戏现代化**：以 FFDec 提取资料和 AS3 反编译源码为行为参考，重建浏览器端游戏体验。
- **Phaser 3 + TypeScript**：游戏场景、输入、角色、技能、怪物、碰撞和关卡逻辑都放在现代工程结构中迭代。
- **系统级测试**：把输入、战斗、技能、投射物、怪物和关卡停止点等规则沉到可自动验证的 `src/systems/`。
- **AI Agent 协作脚手架**：通过任务看板、机制索引、纵向切片、统一语言和工作流校验，让不同 AI agent 可以冷启动接手。
- **逆向与实现分离**：AS3 只作为玩法证据；现代代码按清晰模块边界和显式数据模型重写。

## 当前进度

已完成基础 Phaser 工程和最小战斗切片所需的多项系统：

- 双玩家输入与动作状态。
- 角色移动、普通攻击、技能槽和投射物。
- 怪物受击、死亡、掉落与基础碰撞。
- 关卡停止点、测试场景和系统级断言。
- 任务看板、机制索引、纵向切片和工作流治理文档。

更多实现状态见 `docs/tasks/feature-lines.md`、`docs/tasks/task-board.md`、`docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。

## 快速开始

```bash
npm install
npm run dev
```

常用检查：

```bash
npm run build
npm run test:systems
npm run check:workflow
npm run check:all
```

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `src/` | Phaser 现代重写代码 |
| `src/scenes/` | Phaser 场景创建与系统调度 |
| `src/systems/` | 输入、战斗、技能、怪物、关卡等可测试规则 |
| `src/assets/` | 现代工程资源清单与加载描述 |
| `docs/reverse-engineering/` | AS3 逆向记录和机制索引 |
| `docs/tasks/` | 功能条线、覆盖台账、游戏 task、历史和纵向切片 |
| `docs/workflow/` | AI agent 协作脚手架、质量门禁和治理日志 |
| `docs/domain/` | 轻量 DDD 统一语言和命名流程 |
| `tools/` | 工作流校验和系统测试脚本 |
| `local-resources/regima/legacy-extraction/` | 本地 FFDec 提取资料，默认不提交 |

## 协作方式

新接手时先读 `AGENTS.md` 和 `TASK_OUTLINE.md`，再按任务类型补读最小必读文档。

- 轻量请求只读直接相关文件。
- 正式游戏任务先确认 `docs/tasks/feature-lines.md` 的唯一 Active 条线，再从 `task-board.md` 执行同线 task。
- 修改 `src/` 前参考 `docs/architecture/src-boundaries.md`。
- 修改任务或工作流文档后运行 `npm run check:workflow`。
- 修改代码后优先运行 `npm run test:systems` 和 `npm run build`。

## 提取资料边界

`local-resources/regima/legacy-extraction/` 是本地逆向参考资料，可能包含大量 SWF、反编译脚本、图片、声音和中间产物。当前仓库只提交现代重写代码、文档和必要脚手架。

除非明确要重新提取或整理资源，不修改、不删除、不重新生成 `local-resources/regima/legacy-extraction/` 中的原始提取结果。

## 关键词

Flash 游戏重写、Phaser 3、TypeScript 游戏开发、Vite、2D 动作 RPG、浏览器游戏、AS3 逆向、AI Agent 工作流、Harness Engineering。
