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

- `TASK-SETTINGS-021`：MagicFlag/MagicPearl 全屏法宝逆向索引。九佑魂莲已完成全体增减益最小切片，下一步先扒清剩余全屏法宝的目标选择、持续对象、随机结算和现代实现边界。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-021 | Ready | TASK-SETTINGS | MagicFlag/MagicPearl 全屏法宝逆向索引 | M-043、M-032、M-033、VS-013 | `magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 细扒 `mdhf`、`xhmt` 的 AS3 行为，为下一轮全屏法宝实现任务补足事实 |

## 任务完成定义

### TASK-SETTINGS-021

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-043` 法宝
- `M-032` 怪物受击/生命
- `M-033` 玩家受击/生命
- `VS-013` 法宝最小可玩切片

输入资料：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicFlag.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicPearl.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/export/bullet/`

输出产物：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 梳理 `MagicFlag`（`mdhf` 摩多魂幡）的释放入口、动作回待机时间、跟随效果物、持续时间、命中/环绕目标、伤害/控制参数和销毁边界。
- 梳理 `MagicPearl`（`xhmt` 血海魔童）的起手、攻击次数公式、木五行次数加成、最近目标选择、多段 bullet 链、结束随机效果和 MP 记录字段边界。
- 更新 `magic-weapons-index.md`，给出足够支撑一个或两个后续 `TASK-SLICE` 的现代实现建议，明确哪些行为可先做占位，哪些必须后置。
- 同步更新 `mechanics-index.md` 中 `M-043` 的下一步；如果 `M-032`/`M-033` 的伤害、控制或 debuff 事实有新增，也同步补充。
- 更新 `vertical-slices.md` 的 `VS-013` 后续说明和任务队列推荐。
- 不修改现代游戏代码；本任务只做逆向索引和任务交接。

验收标准：

- `npm run check:workflow` 通过。
- `magic-weapons-index.md` 能回答：两个法宝如何触发、持续多久、命中谁、造成什么效果、如何结束、现代最小切片应怎么拆。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不写 `src/` 现代实现。
- 不实现真实特效资源、法宝强化 UI、材料消耗、五行重置或联机同步。
- 不一次性扒完全部剩余法宝；本任务只覆盖 `mdhf` 和 `xhmt`。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043` 逆向/下一步；必要时同步 `M-032`/`M-033`。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SETTINGS-021` 完成后，推荐拆 `MagicFlag` 或 `MagicPearl` 的最小实现切片。
