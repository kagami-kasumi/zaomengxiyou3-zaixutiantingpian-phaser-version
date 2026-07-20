# 游戏任务看板

本文只记录未完成的游戏复现 task。完整系统范围和激活状态以 `docs/tasks/feature-lines.md` 为准；task 是功能条线内部执行单位，完成 task 不等于完成功能条线。

AI 工作流、任务体系和文档职责维护记录到 `docs/workflow/governance-log.md`。已完成游戏 task 迁移到 `docs/tasks/task-history.md`；新对话默认不读历史，除非需要追溯或修改已完成事实。

## 状态定义

- `Ready`：属于唯一 `Active` 功能线，依赖满足，可以立即执行。
- `Blocked`：属于唯一 `Active` 功能线，但当前有明确阻塞；下一步只能解除本线阻塞。
- `Planned`：功能线尚未激活或当前不是同线下一步，不得执行。
- `Split`：任务过大，已拆出同功能线子任务，不直接执行。
- `Done`：task 完成定义已满足，应移入历史；所属功能线保持激活，除非其完整关闭合同也满足。

## 当前推荐

Stage 1-1 功能线已完整关闭。按项目“内容扩展”路线，调度已顺延到新的唯一 `Active` 功能线 `LINE-STAGE-1-2`；当前推荐先执行只读 `TASK-SETTINGS-051`，闭合 Stage 1-2 真场景、特殊入口和关卡流程证据，再生成实现切片。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-051 | Ready | LINE-STAGE-1-2 | 资源/流程逆向 | 闭合 Stage 1-2 真场景资源、地图标记和完整关卡流程 | M-026、M-027、M-030、M-035 | 资源/流程证据、覆盖矩阵与同线实现切片 | 窄查恢复源包和 StageListener12/相关 AS3 |

## 任务完成定义

### TASK-SETTINGS-051

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-1-2`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-030`
- `M-035`

输入资料：

- `docs/tasks/feature-lines.md` 与 `docs/tasks/feature-line-coverage/LINE-STAGE-1-2.md`
- `docs/reverse-engineering/levels-index.md`、`mechanics-index.md`、`assets-index.md`
- `docs/reverse-engineering/evb-extraction-report.md` 与资源标注 workflow
- `local-resources/regima/source/restored-swfs/` 中 Stage 1-2 相关源包
- `local-resources/regima/legacy-extraction/` 中 `StageListener12.as`、`sl12`/`bg12` 创建链和 `fbEnter` 相关 AS3 窄范围证据

输出产物：

- 定位 `sl12`、`bg12`、Stage 1 公共地面及 1-2 专属交互的精确源包、SymbolClass、character、tag、时间轴、尺寸和组合层级。
- 数据化墙体、门、刷怪/停点/出生点等地图标记全集，明确 `fbEnter` 五次命中入口的对象、门禁和退出目标。
- 闭合普通通关、全灭失败、特殊入口和返回流程；复用 Stage 1-1 正式流程系统的边界与必须新增部分形成差异矩阵。
- 更新资源标注/覆盖台账，只生成一个同线最小实现切片。

完成定义：

- 视觉结论以恢复源包为准，旧提取集只作为 AS3/历史交叉对照；未知资源不得伪称缺失。
- Stage 1-2 的真资源、完整地图标记、普通推进、boss/门（若存在）、`fbEnter` 特殊入口和失败/返回路径都有可追溯证据。
- 差异矩阵明确可复用的 `Stage11FlowSystem`/V3 存档边界与 Stage 1-2 专属状态，下一实现 task 不靠猜测。

验收标准：

- PowerShell 中文/AS3 读取使用 UTF-8 和窄查规则。
- `npm run check:annotations`、`npm run check:workflow` 通过。
- 看板、功能线、覆盖台账、机制索引与关卡索引一致。

禁止范围：

- 不修改 `src/`、`public/assets`、恢复源包或旧提取结果。
- 不扩张到 Stage 1-3、其他世界、怪物真素材接入或全局菜单重构。
- 不回开已关闭的 `LINE-STAGE-1-1` / `LINE-CRAFTING`。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-1-2.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- Stage 1-2 资源标注文件

推荐后续任务：

- 依据资源/流程差异矩阵生成一个同线 `TASK-SLICE-*` 最小实现切片。
