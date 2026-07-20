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

`TASK-SLICE-126` 是唯一当前推荐，属于唯一 `Active` 功能线 `LINE-STAGE-1-2`，负责普通关卡闭环。前置任务已接入真场景、完整地图数据和已解锁入口。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-126 | Ready | LINE-STAGE-1-2 | 普通关卡闭环 | 实现五停点 46 怪、双 boss 普通门、失败/胜利与解锁 1-3 | M-026、M-027、M-030、M-044、VS-046 | Stage 1-2 flow/monster adapters、结果与存档接线、专项测试 | 普通路径闭合后生成 `fbEnter` 特殊入口切片 |

## 任务完成定义

### TASK-SLICE-126

任务类型：

- `TASK-SLICE`

功能条线：

- `LINE-STAGE-1-2`（当前唯一 `Active`）

目标机制/切片：

- `M-026`
- `M-027`
- `M-030`
- `M-044`
- `VS-046`

输入资料：

- `docs/reverse-engineering/levels-index.md` 的五停点、46 怪、双 boss、普通门完成/失败合同
- `src/systems/Stage12Layout.ts`、`src/scenes/Stage12Scene.ts` 与 `src/scenes/stage12/Stage12WorldBridge.ts`
- `src/systems/Stage11FlowSystem.ts`、`src/scenes/test-scene/TestSceneStage11FlowBridge.ts`、`src/systems/SaveSystem.ts` 的可复用合同
- 恢复 `StageListener12.as`、`MonsterAppearPoint.as`、`Monster2.as`、`Monster4.as`，只按关键词窄读所需行为
- `docs/architecture/src-boundaries.md`、当前线覆盖台账、`mechanics-index.md`、`vertical-slices.md`

输出产物：

- 新增独立 Stage 1-2 普通推进状态机，按停点 0..4 驱动 8/11/12/13/2 的刷怪批次；只有当前批生成完且全场怪物清空才移除停点并继续。
- 为 Monster7/8 普通批和 Monster4/2 末批提供满足本关合同的现代 adapter；敌人类型、delay、interval、totalNum 必须直接消费 `Stage12Layout`，不得复制第二份波次表。
- 末批同时生成 Monster4 与 Monster2，只有两个类型都死亡才显示/启用普通门；按上门触发一次性普通胜利。
- 复用并配置统一 1P/2P 全灭 2.5 秒失败、重玩全新 Stage 1-2、返回入口和结果页边界；失败不得推进解锁。
- 扩展 V3 关卡进度到 1-3，普通胜利幂等保存；增加推进、双 boss 门禁、1P/2P 失败、胜利/迁移/清理专项测试。

完成定义：

- Stage 1-2 运行时能按五个停点完成 46 怪普通路径；提前清怪、跨批或末批只死一个 boss 均不能显示门。
- 1P/2P 全灭均在 2.5 秒后失败并可重玩/返回；普通门胜利只触发一次，保存解锁推进到 1-3，刷新后保持。
- Stage 1-1 入口、V1/V2/V3 迁移及既有系统测试不回归。
- 本 task 结束只把 `VS-046` 标为已完成；功能线继续 `Active`，随后生成同线 `fbEnter` 特殊入口切片。

验收标准：

- 修改现有代码前先运行 `npm run check:structure`；不得向结构 warning 的 `TestScene.ts` 堆入 Stage 1-2 流程。
- Stage 1-2 普通流程专项测试、`npm run test:systems`、`npm run build`、`npm run check:workflow` 通过。
- 浏览器验收覆盖至少 1P/2P 进入、五批推进、双 boss 门、失败重玩/返回、普通胜利和刷新后 1-3 解锁。

禁止范围：

- 不修改恢复源包、旧提取结果或已接入 Stage 1-2 资源 provenance。
- 不实现 `fbEnter` 五击、1 秒防重复、30 帧开放、72 帧驻留或切 Stage 5-1。
- 不接入 Stage 1-3/Stage 5-1 内容、怪物真素材、与本关无关的完整怪物系统或全局菜单重构。
- 不回开已关闭的 `LINE-STAGE-1-1` / `LINE-CRAFTING`。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/feature-line-coverage/LINE-STAGE-1-2.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- Stage 1-2 flow/monster/result/save bridges 与专项测试

推荐后续任务：

- 生成同线 `TASK-SLICE-*`，实现 `fbEnter` 五击防抖、30 帧开放、72 帧驻留和切 Stage 5-1 的特殊入口状态机；不得伪造专属返回 1-2。
