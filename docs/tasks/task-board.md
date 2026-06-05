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

- `TASK-SLICE-049`：宠物基础自动 buff 最小闭环。宠物基础被动、`qlfj` 反击和六个自动 buff 边界已补清，下一步先实现一个不依赖新资源的当前出战宠物自动 buff 链路。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-049 | Ready | TASK-SLICE | 宠物基础自动 buff 最小闭环 | M-042、VS-024 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现当前出战宠物已学 `smjc` 或 `gjjc` 后，自动消耗 MP 给 P1 英雄加可观察 buff 的最小链路 |

## 任务完成定义

### TASK-SLICE-049

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-024` 宠物被动/自动 buff 最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/architecture/src-boundaries.md`
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

- 在 `PetSystem.ts` 中建立基础宠物自动 buff 的现代最小模型，首个目标固定为 `smjc` 或 `gjjc` 二选一；建议优先 `gjjc`，因为只影响 P1 英雄攻击数值，测试更直接。
- 当前出战宠物已学目标技能、MP `>= 20`、内部计数器归零时自动触发；触发后消耗 20 MP、记录持续时间和重触发计数，不走主动技能 `skillCD1..4`。
- 对 P1 英雄应用可观察 buff：`smjc` 提升 HP 上限并按当前 HP 比例同步，或 `gjjc` 提升攻击/基础攻击；持续到期后移除并恢复原数值。
- 宠物面板或状态栏给出最近 buff/MP/剩余时间的最小反馈；不要求真实 buff 特效。
- 系统测试覆盖未学技能不触发、MP 不足不触发、计数未归零不触发、触发扣 MP、数值增加、到期恢复和重触发门禁。

验收标准：

- `npm run test:systems` 通过，覆盖目标自动 buff 的门禁、消耗、持续和移除。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不实现全部六个自动 buff、`qlfj` 反击、其他宠物专属技能、真实 buff 特效、完整 buff 图标 UI、完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练、P2 宠物或真实资源。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-049` 完成后，再扩展剩余基础自动 buff、`qlfj` 反击，或继续其他宠物专属技能。
