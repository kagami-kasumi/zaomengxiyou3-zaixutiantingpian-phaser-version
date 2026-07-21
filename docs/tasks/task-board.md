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

`TASK-SETTINGS-052` 是唯一当前推荐，属于唯一 `Active` 功能线 `LINE-STAGE-1-3`。它只读闭合 Stage 1-3 的恢复源包与 AS3 事实，不提前实现未知内容。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-052 | Ready | LINE-STAGE-1-3 | 资源/流程逆向 | 闭合 Stage 1-3 真场景、地图标记、怪物编排与正式结果边界 | M-026、M-027、M-030、M-035 | `stage13` 权威索引、覆盖台账更新与首个实现切片 | 依据事实生成同线资源/场景基础任务 |

## 任务完成定义

### TASK-SETTINGS-052

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-1-3`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-030`
- `M-035`

输入资料：

- `local-resources/regima/source/restored-swfs/` 中按 level13/stage13/场景类名定位的目标源包
- 恢复源包对应 SymbolClass、MovieClip、shape/bitmap 与实例属性；视觉结论不得只依据旧提取集
- 旧提取集中的 `StageListener13.as`、对应场景类、MonsterAppearPoint/StopPoint 和本关怪物类，仅按稳定关键词窄读行为
- `docs/reverse-engineering/levels-index.md`、`evb-extraction-report.md`、资源标注流程、当前线覆盖台账和任务生成规范

输出产物：

- 在 `levels-index.md` 新增 Stage 1-3 权威小节，记录源包、SymbolClass/character/tag、层级/尺寸、地图标记和运行时组合边界。
- 闭合监听器注册对象、刷怪/停点/boss/门或专属交互、完成/失败、解锁推进和返回路径；明确源码缺口和现代补正规则。
- 在恢复语料库做窄查并记录证据，不修改、删除或重新生成恢复源包和旧提取结果。
- 同步 `mechanics-index.md`、本线覆盖台账和必要的资源标注；依据事实生成唯一同线最小实现 task/纵向切片。

完成定义：

- Stage 1-3 的真视觉资源身份和组合方式有恢复源包证据，不能再以“旧提取缺失”作为资源不存在结论。
- 地图标记、敌人/波次、boss/门或专属机制，以及进入、失败、胜利、后续进度/返回边界均有可复查 AS3/资源证据或明确缺口。
- 产出一个完成定义独立、禁止范围明确、能自动验证的同线实现 task；不得在本逆向任务内写 `src/` 或接入资源。

验收标准：

- 所有中文/Markdown 读取显式 UTF-8；大型资源/AS3 只做关键词和路径窄查。
- `npm run check:annotations`（若更新标注）、`npm run check:workflow` 与 `git diff --check` 通过。
- 覆盖台账中的未知项被证据或明确缺口替换，任务看板保持 `WIP=1`。

禁止范围：

- 不修改 `local-resources/regima/legacy-extraction/` 或恢复源包，不重新全量提取。
- 不在事实未闭合前修改 `src/`、生成 Stage 1-3 视觉派生物或猜测复用 Stage 1-2 波次/布局。
- 不推进 Stage 2、Stage 5-1 内容或其他功能线。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-1-3.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`（完成时）
- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`（生成实现切片时）

推荐后续任务：

- 依据逆向结果生成 `LINE-STAGE-1-3` 的首个真资源/场景基础任务，不得切线。
