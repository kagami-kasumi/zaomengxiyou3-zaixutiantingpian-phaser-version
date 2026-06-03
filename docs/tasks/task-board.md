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

- `TASK-SLICE-047`：`monkey4/jgaoyi` 宠物技能最小闭环。`monkey3/lj` 已接通，下一步扩展四阶猴首个奥义技能 `jgaoyi` 的已学技能、30 MP 门禁、`hit5` 最小表现和 `Monster30` 可观察闭环。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-047 | Ready | TASK-SLICE | `monkey4/jgaoyi` 宠物技能最小闭环 | VS-022、M-042 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 P1 出战 `monkey4` 的已学 `jgaoyi`、30 MP 门禁、`hit5` 最小表现和 `Monster30` 可观察闭环 |

## 任务完成定义

### TASK-SLICE-047

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-022` `monkey4/jgaoyi` 宠物技能最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `extracted_flash/scripts/172845/scripts/export/pet/PetMonkey4.as`
- `extracted_flash/scripts/172845/scripts/petInfo/PetInfo.as`
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

- P1 可切到或种下出战 `monkey4`，并持有已学 `jgaoyi`。
- 先复查 `PetMonkey4.as` 的 `beforeSkill4Start()`、`releSkill4()`、`hit5` 命中/表现段和 `PetInfo.findPetUsedMagic("jgaoyi")`，确认最小可观察边界。
- `jgaoyi` 只在已学习、宠物 MP `>= 30`、冷却就绪且存在 `Monster30` 目标时释放。
- 释放时扣 30 MP、重置冷却，生成 `hit5` 可见占位 projectile/特效或等价释放反馈，并能通过状态栏或测试观察最近释放结果。
- 若 AS3 `hit5` 有明确 `Monster30` 伤害或多段命中事实，本任务实现最小伤害闭环；若确认奥义最小阶段仅表现/状态，则在系统测试中固定无伤害或占位伤害边界。
- 保持 `monkey1/xj`、`monkey2/lj`、`monkey2/xj`、`monkey3/lyq`、`monkey3/xj`、`monkey3/lj`、宠物经验、升级、形态变化、出战跟随和法宝宠物增益功能不回退。

验收标准：

- `npm run test:systems` 通过，覆盖已学习/未学习、MP 不足、冷却门禁、无目标、扣 MP、`hit5` 可观察反馈，以及 AS3 确认后的伤害/无伤害边界。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现完整 8 槽宠物面板、`sname~sname` 存档、随机自动学习、全部宠物技能、全部被动/自动 buff、P2 宠物、成长洗练或真实宠物资源。
- 不重构宠物系统；只复用 `VS-016` 至 `VS-021` 已建立的最小技能链路并扩展 `monkey4/jgaoyi`。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 和 `docs/tasks/vertical-slices.md` 的 `VS-022` 状态。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-047` 完成后，再决定是继续 `monkey4` 其他技能，还是补宠物技能存档/面板。
