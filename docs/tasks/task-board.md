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

- `TASK-SETTINGS-013`：逆向装备/背包系统（M-036 装备、M-037 背包）。
- 备选：扩展其他角色技能 projectile（M-025 角色技能效果）。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-013 | Ready | TASK-SETTINGS | 逆向装备/背包系统 | M-036、M-037 | `docs/reverse-engineering/equipment-index.md` | 需读 AS3 源码和 xlsx 资料表建立装备/背包索引 |

## 任务完成定义

### TASK-SETTINGS-013

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-036` 装备
- `M-037` 背包

输入资料：

- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
- `extracted_flash/scripts/172845/scripts/my/User.as`
- `再续1.0装备属性合成掉落表.xlsx`
- `docs/reverse-engineering/mechanics-index.md`

输出产物：

- `docs/reverse-engineering/equipment-index.md`（装备/背包系统索引）

完成定义：

- 逆向装备系统：装备类型、属性字段、装备槽位、穿戴/卸下逻辑。
- 逆向背包系统：物品类型、背包容量、物品存取、物品使用。
- 记录关键 AS3 证据和现代实现建议。

验收标准：

- `npm run check:workflow` 通过。

禁止范围：

- 不写现代游戏代码。
- 不改 `extracted_flash/` 原始提取结果。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md`。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- 根据逆向结果生成装备/背包实现切片任务。
