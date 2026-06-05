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

- `TASK-SLICE-054`：宠物 `sxkb` 嗜血狂暴自动 buff 最小闭环。主人四项属性自动 buff 已串完，下一步扩展作用于宠物自身暴击加成的自动 buff 边界。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-054 | Ready | TASK-SLICE | 宠物 `sxkb` 嗜血狂暴自动 buff 最小闭环 | M-042、VS-029 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 扩展当前出战宠物已学 `sxkb` 后，自动增加宠物自身暴击加成并到期恢复的最小链路 |

## 任务完成定义

### TASK-SLICE-054

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `VS-029` 宠物 `sxkb` 嗜血狂暴自动 buff 最小闭环

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

- 在 `PetSystem.ts` 中复用基础自动 buff 模型，新增 `sxkb` 嗜血狂暴：当前出战宠物已学 `sxkb`、MP `>= 20`、内部计数器归零时自动触发。
- 触发后消耗 20 MP，按 `form * 0.07 * technique * 0.27 * 1.05` 增加当前出战宠物自身暴击加成的最小可测字段。
- 持续时间沿用基础自动 buff 规则；重触发计数使用原版 `sxkb` 的 4320 帧等价值；到期后移除暴击加成。
- 宠物面板或状态栏显示 `sxkb` 最近结果、剩余时间、暴击加成和宠物 MP 变化。
- 系统测试覆盖未学不触发、MP 不足不触发、计数未归零不触发、触发扣宠物 MP、宠物暴击加成增加、到期恢复和 4320 帧重触发门禁。

验收标准：

- `npm run test:systems` 通过，覆盖 `sxkb` 自动 buff 门禁、消耗、宠物自身暴击加成、持续和移除。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

禁止范围：

- 不实现全部基础自动 buff、其他宠物专属技能、真实 buff 特效、完整 buff 图标 UI、完整全局存档文件读写、AMF/compress/encrypt、超级进化、成长洗练、P2 宠物或真实资源。
- 不修改、删除或重新生成 `extracted_flash/` 原始提取结果。
- 不把普通角色技能书 `jns` 当作宠物技能学习入口。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-054` 完成后，再扩展 `fsnl`，或继续其他宠物专属技能。
