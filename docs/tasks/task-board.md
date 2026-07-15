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

Role3 八戒完整战斗扩展已经交付，当前没有未完成的 Role3 任务。
Role1 `slz/sx`、`lys/hytj`、`lyfb/jdy`、`qsez/zz` 与 `hmz/hyjj` 已全部交付；当前没有未完成的 Role1 任务。
Role4 毒系、巫毒娃娃、毒链、三项双形态位移攻击、标记传送与终结技已经交付；当前没有未完成的 Role4 任务。
Role5 白龙完整战斗扩展已经交付；当前没有未完成的 Role5 任务。
五角色战斗资源缺口盘点已完成，EVB 原始资源提取也已经完成，Role1/4/5 源包阻塞已解除。
首个真资源族已完成：Role1 普攻 `Role1Bullet1/3/4/5` 已从 `WuKong.swf` 接入。
1.1 合成配方权威数据清单、`direct_static` 注册表、全部 41 个默认属性继承配方及四条特殊属性继承配方已经完成；现代版明确不复现时装生成时间戳。当前推荐执行 `TASK-SLICE-116`，补齐三槽材料暂存交互。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-116 | Ready | 切片 | 接入合成材料暂存交互 | M-039、M-037、VS-042 | 三材料槽会话、选择/移除/关闭退回、实时预览与双玩家隔离测试 | 评估完整炼丹炉视觉或转向下一系统缺口 |

## 任务完成定义

### TASK-SLICE-116

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-039`
- `M-037`
- `VS-042`

输入资料：

- `docs/reverse-engineering/crafting-index.md`
- `src/systems/CraftingSystem.ts`
- `src/systems/EquipmentUISystem.ts`
- `src/scenes/test-scene/TestSceneUIHandlers.ts`
- `tools/crafting-tests.ts`

输出产物：

- 新增玩家归属明确的三槽合成会话和最小测试 UI 交互。
- 支持从背包选择单件材料、从槽位移除、关闭面板退回全部暂存材料，以及材料变化后的实时配方预览。
- 更新机制、切片和任务状态文档。

完成定义：

- P1/P2 各自拥有独立暂存会话，同一材料实例不能重复进入多个槽位，槽位上限固定为 3。
- 材料加入、移除和关闭退回均不丢失或复制库存对象；三个槽位填满时按现有无序注册表实时显示产物、1000 灵魂门禁和不可合成原因。
- 确认合成后复用现有原子事务；成功清空槽位，失败保留材料会话并允许继续调整。
- 测试 UI 提供可观察的槽位、预览、选择/移除、确认和关闭入口，不重做完整炼丹炉美术。

验收标准：

- 测试覆盖槽位上限、对象唯一性、乱序预览、移除/关闭无损退回、成功清空、失败保留和 P1/P2 隔离。
- `npm run check:structure`、`npm run test:systems`、`npm run build` 和 `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 或权威 JSON。
- 不接入时装时间戳、真实炼丹炉美术、拖拽动画、存档迁移、制作/强化/分解或五行重置。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`

推荐后续任务：

- 评估完整炼丹炉视觉，或从新的机制/切片缺口生成后续任务。
