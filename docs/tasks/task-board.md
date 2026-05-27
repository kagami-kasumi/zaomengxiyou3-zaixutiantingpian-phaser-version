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

- `TASK-SLICE-016`：只实现 aura 收集反馈最小切片，不做经验/成长完整系统、强化石或完整怪物掉落表。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-016 | Ready | TASK-SLICE | aura 掉落和收集反馈最小切片 | M-038、VS-009 | `DropSystem.ts` 或等价 aura 模块、`TestScene.ts`、`vertical-slices.md` | 只实现红/白 aura 生成、吸附和收益反馈，不实现完整成长系统 |

## 任务完成定义

### TASK-SLICE-016

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-038` 掉落
- `VS-009` 掉落和拾取

输入资料：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/DropSystem.ts`
- `src/scenes/TestScene.ts`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/base/BaseAura.as`
- `extracted_flash/scripts/172845/scripts/export/aura/auraRed.as`
- `extracted_flash/scripts/172845/scripts/export/aura/auraWhile.as`

输出产物：

- aura 掉落现代实现文件（可扩展现有 `src/systems/DropSystem.ts`，或新增小型 aura 模块）
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-history.md`

完成定义：

- 在现代测试场景中，怪物死亡后能生成红色 aura 和概率白色 aura。
- aura 能按原版等价节奏先短暂停留/上浮，再吸附到击杀者或 P1 等价目标。
- 红色 aura 收集后记录 `gxp` 等价收益反馈；白色 aura 收集后记录固定 `power = 5` 等价收益反馈。
- aura 未收集时有约 15 秒有效期清理。
- 测试场景能观察当前 aura 数量和最近 aura 收集反馈。

验收标准：

- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景中能通过击杀或测试入口触发红/白 aura，并观察吸附、收集和收益反馈。

禁止范围：

- 不实现经验/成长完整系统。
- 不实现强化石掉落或强化系统。
- 不实现完整怪物掉落表。
- 不实现合成、商城或存档。
- 不修改 `extracted_flash/` 原始提取结果。
- 不修改 `TASK-SLICE-014` 和 `TASK-SLICE-015` 已完成范围。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-038` 复现说明。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-009` 实际结果和后续边界。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- 强化石掉落/入包最小切片，或完整怪物掉落表配置雏形。具体 ID 在本任务完成后按当时优先级生成。
