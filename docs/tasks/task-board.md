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

当前唯一激活功能线是 `LINE-STAGE-1-1`，严格单线 `WIP=1`。`LINE-CRAFTING` 已以 112 配方、201/201 真图标、224 条 P1/P2 事务和运行时 UI 证据完整关闭；当前推荐 `TASK-SETTINGS-046`。

本次 `/goal` 在 `LINE-CRAFTING` 关闭处结束，不自动执行下一功能线；后续开始工作时从 `TASK-SETTINGS-046` 进入 Stage 1-1。

## 待完成任务

| Task | 状态 | 功能条线 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-046 | Ready | LINE-STAGE-1-1 | 资源逆向 | 定位 Stage 1-1 三个场景真资源符号 | M-035、Stage 1-1 资源合同 | `sl11/bg11/floorBg1` 的精确源包、character/tag/尺寸和标注状态 | 建立 Stage 1-1 覆盖台账并窄查恢复源包 |

## 任务完成定义

### TASK-SETTINGS-046

任务类型：

- `TASK-SETTINGS`

功能条线：

- `LINE-STAGE-1-1`（当前唯一 `Active`）

目标机制/切片：

- `M-035`
- Stage 1-1 场景资源合同

输入资料：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/asset-annotation/batches/stage11.md`
- `docs/reverse-engineering/asset-annotation/annotations/stage11.csv`
- `docs/reverse-engineering/asset-annotation/workflow.md`
- `docs/reverse-engineering/evb-extraction-report.md`
- `local-resources/regima/source/restored-swfs/assets/levels/level11.swf`
- 对应 `MainGame.as`、`BaseGameSence.as` 与 `PhysicsWorld.as` 小范围证据

输出产物：

- 窄查 `level11.swf` 的 SymbolClass、tag 和时间轴，分别定位 `export.gameSence.sl11`、`bg11`、`floorBg1` 的精确 character 或明确其嵌套/别名关系。
- 记录三项资源的 tag 类型、尺寸、帧/时间轴结构和选择性派生可行性；只在需要视觉消歧时导出最小候选证据。
- 更新 `levels-index.md`、Stage 1-1 标注 CSV、批次状态和项目汇总；依据实际符号结构生成同线后续 task。

完成定义：

- `stage.stage1-1.layout`、`stage.stage1-1.background`、`stage.stage1.floor` 三条记录各有可复核的精确源符号结论。
- 场景布局、背景与地面之间的嵌套或复用边界明确。
- 所有结论优先来自恢复源包，旧提取集只作 AS3 和历史对照。

验收标准：

- `LINE-STAGE-1-1` 已激活，可以执行。
- `npm run check:annotations` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不回开已关闭的 `LINE-CRAFTING`，不顺带处理合成系统。
- 不修改或重新生成恢复 SWF、旧提取结果。
- 不批量导出 `level11.swf` 全包，不顺带处理其他关卡。
- 不在符号未闭合时猜造 stableKey 来源或生成实现任务。

状态更新：

- `docs/tasks/feature-lines.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/asset-annotation/` 对应批次与项目状态

推荐后续任务：

- 激活后依据三项符号的实际派生成本，生成一个 `LINE-STAGE-1-1` 同线真资源接入 task。
