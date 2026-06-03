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

- `TASK-SLICE-040`：宠物升级形态变化最小闭环。宠物经验/升级已接入，下一步可实现出战宠物达到形态阈值后的 form/name 更新、运行时实体重建和状态显示。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-040 | Ready | TASK-SLICE | 宠物升级形态变化最小闭环 | M-042、VS-015 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 按 `pets-index.md` 实现出战宠物升级到形态阈值时的形态更新、运行时实体重建和最小状态显示 |

## 任务完成定义

### TASK-SLICE-040

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-015` 宠物经验/升级最小闭环扩展

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 当前出战宠物通过自然经验或 `djyys` 升到形态阈值时，按 `pets-index.md` 记录的首批规则更新形态尾号：`16 <= level < 30` 且形态为 1 时变为 2；`level > 30` 且形态为 2 时变为 3。
- 形态变化后更新宠物 `species/form/displayName` 或等价可观察状态，并触发测试场景当前出战宠物运行时实体重建。
- 宠物经验、升级、属性刷新仍复用 `TASK-SLICE-039` 的统一升级入口，不新增平行升级路径。
- 测试场景能显示形态变化和重建后的 runtime 状态。

验收标准：

- 系统测试覆盖自然经验触发形态 1→2、`djyys` 触发形态变化、非阈值等级不变化、已是形态 3 不重复变化，以及运行时模型在形态变化后重建。
- `npm run test:systems` 通过。
- `npm run build` 通过。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现完整宠物技能学习、宠物存档、P2 宠物、成长洗练、真实宠物资源或全部宠物族特殊规则。
- 不重构完整宠物运行时、怪物、掉落或玩家成长系统。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 下一步。
- 完成后按需要更新 `docs/tasks/vertical-slices.md` 的 `VS-015` 扩展记录。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-040` 完成后，转向任务奖励经验同步、宠物存档或宠物技能扩展。
