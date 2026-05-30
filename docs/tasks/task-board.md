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

- `TASK-SLICE-021`：宣花葫芦捕捉宠物最小切片。基于已完成的宠物列表/出战系统和 `MagicBottle` 逆向结果，实现 P1 装备葫芦、H 键捕捉、灵魂消耗、概率反馈和成功入宠物列表。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-021 | Ready | TASK-SLICE | 宣花葫芦捕捉宠物最小切片 | M-042、M-043、M-030、VS-012 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` | 实现 P1 `xhhl` 等价法宝、H 键投掷捕捉特效、可捕捉怪物、灵魂消耗、捕捉概率、满栏/失败/成功反馈和成功入宠物列表 |

## 任务完成定义

### TASK-SLICE-021

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-043` 法宝
- `M-030` 怪物基础
- `VS-012` 宠物最小可玩切片

输入资料：

- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/equipment-index.md`
- `src/systems/PetSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts` 或新增窄范围捕捉系统文件
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- P1 默认具备一个等价 `xhhl` 宣花葫芦入口，按 `H` 触发捕捉；普通技能槽和 Space 特殊技不受影响。
- 测试场景提供至少一只 `Monster70-78` 等价可捕捉怪物，带宠物名、等级、概率和可命中碰撞体。
- 灵魂值 `< 5000` 时拒绝捕捉并给出可见反馈；命中可捕捉怪物后扣除 `5000` 灵魂。
- 按 `pets-index.md` 概率判定成功/失败；成功时把宠物直接加入 `PetSystem` 列表并移除怪物，失败时怪物保留。
- 宠物栏满时给出反馈；不生成 `cwzb` 掉落，不进入背包。
- 增加自动化测试覆盖灵魂不足、成功入列表、失败保留怪物、满栏不入列表和 H 键入口不影响普通技能。

验收标准：

- `npm run build` 通过。
- `npm run test:systems` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现完整法宝系统、法宝强化 UI、其他法宝技能、宠物技能、宠物成长或真实资源接入。
- 不把 `Monster2001/cwzb` 作为宠物获得实现依据。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042/M-043` 复现说明。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-012` 后续扩展说明。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- 捕捉切片完成后，可继续拆宠物道具消耗、宠物成长/技能，或完整法宝系统基础逆向。
