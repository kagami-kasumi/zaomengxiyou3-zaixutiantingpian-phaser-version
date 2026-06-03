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

- `TASK-SLICE-041`：宠物技能最小闭环。宠物技能基础已扒清，下一步只实现 P1 出战 `monkey1` 的 `xj` 等价触发、MP/冷却门禁和对 `Monster30` 的一次伤害闭环。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-041 | Ready | TASK-SLICE | 宠物技能最小闭环 | VS-016、M-042 | `PetSystem.ts`、`Monster30System.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 P1 出战 `monkey1` 的已学 `xj`、受击触发、MP/冷却门禁、占位效果和 `Monster30` 伤害闭环 |

## 任务完成定义

### TASK-SLICE-041

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-016` 宠物技能最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/PetSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- P1 当前出战 `monkey1` 可持有已学技能列表，测试种子包含 `xj`。
- `xj` 只在已学习、宠物 MP `>= 20`、宠物曾受击或等价触发标记为 true、冷却就绪且存在 `Monster30` 目标时释放。
- 释放时扣 20 MP，重置触发标记和冷却，生成可见占位 projectile/特效或等价释放反馈。
- `xj` 对 `Monster30` 造成 `2.6 * pet.atk` 等价伤害，并能通过状态栏或测试观察最近释放结果。
- 保持现有宠物经验、升级、形态变化、出战跟随和法宝宠物增益功能不回退。

验收标准：

- `npm run test:systems` 通过，覆盖已学习/未学习、MP 不足、冷却门禁、伤害、扣 MP 和触发重置。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现随机自动学习、完整 8 槽宠物面板、`sname~sname` 存档、全部宠物技能、全部被动/自动 buff、`monkey2/3/4`、P2 宠物、成长洗练或真实宠物资源。
- 不一次性重构宠物系统；只扩展 `VS-016` 所需的最小数据和战斗链路。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 和 `docs/tasks/vertical-slices.md` 的 `VS-016` 状态。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-041` 完成后，再决定是补宠物技能存档/面板，还是扩展 `monkey2/3` 主动技能或通用被动/自动 buff。
