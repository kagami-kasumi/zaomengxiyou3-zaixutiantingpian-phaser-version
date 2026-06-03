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

- `TASK-SLICE-044`：`monkey3/lyq` 宠物技能最小闭环。`monkey2/xj` 已接通，下一步扩展三阶猴 `lyq` 的已学技能、MP/冷却/距离门禁、占位效果和 `Monster30` 伤害闭环。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-044 | Ready | TASK-SLICE | `monkey3/lyq` 宠物技能最小闭环 | VS-019、M-042 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 P1 出战 `monkey3` 的已学 `lyq`、MP/冷却/距离门禁、占位效果和 `Monster30` 伤害闭环 |

## 任务完成定义

### TASK-SLICE-044

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-019` `monkey3/lyq` 宠物技能最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- P1 可切到或种下出战 `monkey3`，并持有已学 `lyq`。
- `lyq` 只在已学习、宠物 MP `>= 20`、冷却就绪、存在 `Monster30` 目标且目标距离不超过 AS3 等价门禁 `400` 时释放。
- 释放时扣 20 MP、重置冷却，生成可见占位 projectile/特效或等价释放反馈。
- `lyq` 对 `Monster30` 造成 `6.8 * pet.atk` 等价伤害，并能通过状态栏或测试观察最近释放结果。
- 保持 `monkey1/xj`、`monkey2/lj`、`monkey2/xj`、宠物经验、升级、形态变化、出战跟随和法宝宠物增益功能不回退。

验收标准：

- `npm run test:systems` 通过，覆盖已学习/未学习、MP 不足、冷却门禁、距离门禁、无目标、伤害和扣 MP。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现完整 8 槽宠物面板、`sname~sname` 存档、随机自动学习、全部宠物技能、全部被动/自动 buff、`monkey4`、P2 宠物、成长洗练或真实宠物资源。
- 不重构宠物系统；只复用 `VS-016` 至 `VS-018` 已建立的最小技能链路并扩展 `monkey3/lyq`。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 和 `docs/tasks/vertical-slices.md` 的 `VS-019` 状态。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-044` 完成后，再决定是扩展更多宠物技能，还是补宠物技能存档/面板。
