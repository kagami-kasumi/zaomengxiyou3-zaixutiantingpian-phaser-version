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

推荐下一次：

- `TASK-SETTINGS-025`：宠物经验/升级逆向。玩家等级/经验最小闭环已完成，下一步先补清宠物经验、升级曲线、属性成长和怪物经验分成边界，再决定宠物成长切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-025 | Ready | TASK-SETTINGS | 宠物经验/升级逆向 | M-042 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 细读 `PetInfo.as`、`BasePet.as`、`BaseMonster.as` 和宠物经验相关引用，补清宠物升级曲线和属性成长 |

## 任务完成定义

### TASK-SETTINGS-025

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-042` 宠物

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `extracted_flash/scripts/172845/scripts/petInfo/PetInfo.as`
- `extracted_flash/scripts/172845/scripts/base/BasePet.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- 通过关键词定位到的 `setCurExper`、`getPetNextExper`、宠物升级、宠物属性成长、宠物经验道具相关 AS3 小范围上下文

输出产物：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 补清宠物当前经验字段、下级经验计算、升级触发、升级后属性成长和 HP/MP 处理。
- 补清玩家击杀怪物时带当前宠物的经验分成如何影响宠物，确认 `BaseMonster.reduceHp()` 的普通路径和特殊怪物/任务奖励旁路。
- 补清宠物经验道具（如已知 `djyys`）与自然战斗经验是否共用同一升级入口。
- 明确首个现代宠物成长切片的最小事实和禁止范围。

验收标准：

- `pets-index.md` 能支撑后续实现者不再全文扫宠物经验/升级入口。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现现代 `src/` 宠物成长系统、宠物存档、全部宠物技能、成长洗练或 P2 宠物。
- 不全文读入大型 AS3；先关键词定位，再读取命中上下文。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 下一步。
- 完成后按需要更新 `docs/tasks/vertical-slices.md` 的宠物成长切片缺口。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SETTINGS-025` 完成后，若机制足够清楚，生成或执行宠物经验/升级最小切片；否则继续拆更小的宠物成长逆向任务。
