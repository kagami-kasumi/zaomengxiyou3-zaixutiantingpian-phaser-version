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
1.1 合成配方权威数据清单、`direct_static` 注册表与首个 `get_sutra_value` 属性继承配方已经完成；现代版明确不复现时装生成时间戳。当前推荐执行 `TASK-SLICE-114`，按同一规则扩展剩余 `get_sutra_value` 配方。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-114 | Ready | 切片 | 扩展全部 `get_sutra_value` 属性继承配方 | M-039、VS-042 | 从权威 JSON 接入剩余 `get_sutra_value` 唯一组合，共用已验证的四属性平均继承事务 | 后续评估其他特殊继承分类 |

## 任务完成定义

### TASK-SLICE-114

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-039`
- `VS-042`

输入资料：

- `docs/reverse-engineering/crafting-index.md`
- `docs/reverse-engineering/reference/crafting-recipes-1.1.json`
- `src/systems/CraftingRecipeRegistry.ts`
- `src/systems/CraftingSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `tools/crafting-tests.ts`

输出产物：

- 从权威 JSON 接入除首个种子配方外的全部 `productionBehavior = get_sutra_value` 唯一组合。
- 扩展合成测试与状态文档。

完成定义：

- 全部 `get_sutra_value` 唯一组合可预览和合成，产物共用已确认的 HP/MP/攻击/防御三材料平均继承规则。
- 既有 `direct_static`、土灵珠兼容配方、灵魂门禁、容量预检、原子事务和 P1/P2 隔离保持不变。

验收标准：

- 测试校验权威 `get_sutra_value` 记录与现代唯一注册表数量一致，并覆盖重复材料、混合材料、材料顺序变化、继承结果和失败无副作用。
- `get_sun_sutra_value`、`get_mingding_huayan` 与时装分类仍不可误走默认继承路径。
- `npm run check:structure`、`npm run test:systems`、`npm run build`、`npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 或权威 JSON。
- 不接入 `direct_fashion_timestamp`、`get_sun_sutra_value` 或 `get_mingding_huayan`。
- 不实现时钟/生成时间戳、时装期限、新 UI、材料暂存会话或存档迁移。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`

推荐后续任务：

- 评估并为 `get_sun_sutra_value` 或 `get_mingding_huayan` 生成独立切片。
