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

- `TASK-SLICE-014`：实现 `VS-009` 掉落和拾取切片，复用 `drops-index.md` 和现有背包/装备切片。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-014 | Ready | TASK-SLICE | 实现掉落和拾取最小切片 | M-038、VS-009 | DropSystem、ItemData、现有背包/装备接入 | 先做一个装备和一个道具的死亡掉落、拾取入包和反馈 |

## 任务完成定义

### TASK-SLICE-014

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-038` 掉落
- `VS-009` 掉落和拾取

输入资料：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/monsters-index.md`
- `docs/tasks/vertical-slices.md`
- 现有 `src/systems/InventorySystem.ts`
- 现有 `src/systems/EquipmentSystem.ts`
- 现有怪物死亡相关 `src/` 文件

输出产物：

- 掉落系统或等价 `src/` 产物
- 物品数据或等价最小 `ItemData`/掉落表产物
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-history.md`

完成定义：

- 怪物死亡后能生成一个可见地面物，位置参考原版怪物上方约 100 像素。
- 至少支持一个装备掉落和一个道具掉落。
- 装备拾取后进入装备背包；道具同名拾取后堆叠数量增加。
- 背包满或分类容量不足时不拾取，地面物保留，并给出现代 UI 反馈。
- 成功拾取后地面物移除，并有清晰拾取反馈。

验收标准：

- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景中可通过击杀怪物观察掉落、拾取和背包数量/列表变化。

禁止范围：

- 不实现药品、aura、强化石、完整怪物掉落表、合成、商城或存档。
- 不重构现有背包/装备系统的大量结构。
- 不修改 `extracted_flash/` 原始提取结果。
- 不照搬 `FallEquipObj` 中疑似无显式碰撞的拾取写法；现代侧应使用明确可验收的拾取判定。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-038` 复现状态。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-009` 状态。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- 药品、aura、强化石或完整怪物掉落表应拆成新的后续任务，不要在本任务中顺手扩展。
