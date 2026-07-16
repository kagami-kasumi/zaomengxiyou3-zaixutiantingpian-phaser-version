# 游戏任务看板

本文只记录未完成的游戏复现任务：玩法逆向、现代架构、纵向切片、资源和实现。
AI 工作流、任务体系、文档职责等脚手架维护不进入本文，记录到 `docs/workflow/governance-log.md`。
已完成游戏任务迁移到 `docs/tasks/task-history.md`。新对话默认不要读取历史，除非用户要求追溯、当前任务依赖历史决策，或需要修改已完成任务。

## 状态定义

- `Ready`：依赖满足，可以作为下一次 prompt 执行。
- `Blocked`：缺前置任务、机制事实或用户材料。
- `Planned`：已经规划，但不是当前优先级。
- `Split`：任务过大，已经拆出子任务，不直接执行。
- `Done`：任务已完成，应从本文移动到 `docs/tasks/task-history.md`。

## 当前推荐

五角色已规划战斗扩展、1.1 合成配方与属性继承、双玩家三槽事务，以及炼丹炉完整 UI 和土灵珠/枯叶灵两个真图标配方族均已交付。
当前没有未完成的炼丹炉任务；继续批量补齐其余配方图标不属于当前优先级。
Stage 1-1 的恢复源包 `assets/levels/level11.swf` 已存在，但 `sl11/bg11/floorBg1` 仍缺精确符号定位。当前推荐执行 `TASK-SETTINGS-046`，先关闭这三个场景资源的来源合同，再决定后续选择性派生切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-046 | Ready | 资源逆向 | 定位 Stage 1-1 三个场景真资源符号 | M-035、Stage 1-1 资源合同 | `sl11/bg11/floorBg1` 的精确源包、character/tag/尺寸和标注状态 | 依据调查结果生成一个窄选择性派生切片 |

## 任务完成定义

### TASK-SETTINGS-046

任务类型：

- `TASK-SETTINGS`

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
- 更新 `levels-index.md`、Stage 1-1 标注 CSV、批次状态和项目汇总；将可直接派生项推进到 `export-ready`，无法闭合项保留证据与下一动作。
- 依据实际符号结构生成一个窄后续切片，不在调查任务中修改 `src/` 或接入运行时。

完成定义：

- `stage.stage1-1.layout`、`stage.stage1-1.background`、`stage.stage1.floor` 三条记录各有可复核的精确源符号结论，不再只停留在恢复语料库级别。
- 场景布局、背景与地面之间的嵌套或复用边界明确，墙体、传送门和碰撞标记若属于布局时间轴需单独记录。
- 所有结论优先来自恢复源包，旧提取集只作 AS3 和历史对照。

验收标准：

- `npm run check:annotations` 通过。
- `npm run check:workflow` 通过。
- 不要求浏览器运行时截图；若导出候选 PNG，则逐张人工检查并记录用途。

禁止范围：

- 不修改或重新生成恢复 SWF、旧提取结果。
- 不批量导出 `level11.swf` 全包，不顺带处理其他关卡。
- 不修改现代场景、碰撞、传送门或关卡流程代码。
- 不在符号未闭合时猜造 stableKey 来源或生成实现任务。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `asset-annotation/` 对应批次与项目状态

推荐后续任务：

- 依据三项符号的实际派生成本，生成一个 Stage 1-1 窄真资源接入切片。
