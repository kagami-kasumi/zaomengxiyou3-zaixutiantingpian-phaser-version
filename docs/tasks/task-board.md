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

- 宠物系统的双玩家玩法与存档闭环已完成。下一块大任务推荐进入五角色完整战斗扩展，先执行 `TASK-SETTINGS-036` 补清 Role2 唐僧剩余技能与组合键链路。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-036 | Ready | TASK-SETTINGS | Role2 唐僧完整技能与组合键逆向 | M-019、M-024、M-025、VS-008 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、后续实现任务 | 拆出 Role2 剩余技能与组合键的可执行纵向切片 |

## 任务完成定义

### TASK-SETTINGS-036

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-019` Role2 唐僧
- `M-024` 角色组合键
- `M-025` 角色技能效果
- `VS-008` 一个技能/子弹

输入资料：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `extracted_flash/scripts/172845/scripts/export/hero/Role2.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- Role2 直接引用的技能、bullet 与 effect 类

输出产物：

- Role2 普攻之外的全部技能入口、组合键、MP/冷却/重入门禁索引
- 每条技能的 projectile/effect、伤害、状态和资源依赖映射
- 可分批执行的 Role2 实现任务与状态文档

完成定义：

- 列全 Role2 可学习技能和组合键入口，不只重复已实现的 `sgq/smb`。
- 对每条技能记录输入、技能槽/组合键来源、MP、冷却或阶段状态、攻击类型、伤害公式、目标/距离、projectile/effect 和可观察反馈。
- 明确哪些事实已足够实现，哪些仍缺资源或 P-code；不猜造缺失数值。
- 按依赖和可玩价值拆出一个或多个标准 `TASK-SLICE-*`，首个切片应能在一个对话内验收。

验收标准：

- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/`。
- 不修改 `src/` 或 `extracted_flash/`。
- 不在同一任务中逆向 Role1/Role3/Role4/Role5 全部技能。
- 不因资源缺失改为猜测技能行为。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md` 和 `docs/tasks/task-history.md`。

推荐后续任务：

- 执行首个 Role2 剩余技能纵向切片。
