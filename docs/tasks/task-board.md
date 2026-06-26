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

Role3 八戒完整战斗扩展已经交付，当前没有未完成的 Role3 任务。
Role1 `slz/sx`、`lys/hytj`、`lyfb/jdy`、`qsez/zz` 与 `hmz/hyjj` 已全部交付；当前没有未完成的 Role1 任务。
Role4 毒系、巫毒娃娃、毒链、三项双形态位移攻击、标记传送与终结技已经交付；当前没有未完成的 Role4 任务。
下一步推荐执行 `TASK-SETTINGS-040`：Role5 白龙完整战斗逆向。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-040 | Ready | 逆向 | Role5 白龙完整战斗逆向 | M-022、M-024、M-025、M-034 | Role5 战斗索引、技能/输入/projectile/特殊对象事实表、后续切片任务建议 | 拆分 Role5 技能切片 |

## 任务完成定义

### TASK-SETTINGS-040

任务类型：
- `TASK-SETTINGS`

目标机制/切片：
- `M-022`、`M-024`、`M-025`、`M-034`。

输入资料：
- 正式逆向任务必读集、`roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`Role5.as` 及必要的关联 AS3 文件。

输出产物：
- Role5 完整战斗逆向索引，覆盖枪/剑形态、技能输入、MP 倍率、动作、projectile/特殊对象、能量/形态状态和后续切片拆分建议。

完成定义：
- 能从文档直接拆出 Role5 现代实现切片；所有关键技能链均有 AS3 证据入口、资源/对象名和不确定边界说明。

验收标准：
- `mechanics-index.md`、相关 reverse-engineering 索引、`vertical-slices.md` 或 task-board 后续拆分状态一致；`npm run check:workflow` 通过。

禁止范围：
- 不修改提取结果，不猜补 `doSingleHit(...)` 等反编译缺口，不实现代码。

状态更新：
- `task-board.md`、`mechanics-index.md`、相关 reverse-engineering 索引，必要时更新 `vertical-slices.md` 与 `task-history.md`。

推荐后续任务：
- 按逆向结果拆分 Role5 白龙现代技能切片。
