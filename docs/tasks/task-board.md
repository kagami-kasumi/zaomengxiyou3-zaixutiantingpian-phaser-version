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
1.1 合成配方权威数据清单、`direct_static` 注册表与全部 41 个 `get_sutra_value` 属性继承配方已经完成；现代版明确不复现时装生成时间戳。当前推荐执行 `TASK-SETTINGS-043`，补清两类特殊属性继承公式和实现边界。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-043 | Ready | 逆向 | 补清特殊合成属性继承分类 | M-039、VS-042 | `get_sun_sutra_value` 与 `get_mingding_huayan` 的逐属性公式、上限、特例和现代测试边界 | 生成独立实现切片 |

## 任务完成定义

### TASK-SETTINGS-043

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-039`
- `VS-042`

输入资料：

- `docs/reverse-engineering/crafting-index.md`
- `docs/reverse-engineering/reference/crafting-recipes-1.1.json`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/my/AllEquipment.as`
- `src/systems/CraftingSystem.ts`

输出产物：

- 扩充 `docs/reverse-engineering/crafting-index.md`，记录 `getSunSutraValueEquip()` 与 `getMingDingHuaYanEquip()` 的完整可观察规则。
- 更新机制、切片和任务状态文档，并为实现生成可验收的独立切片。

完成定义：

- 三个 `get_sun_sutra_value` 配方和一个 `get_mingding_huayan` 配方的逐属性来源、倍率、截断、上限与产物特例均有 AS3 行号证据。
- 明确哪些现有装备字段可直接承载，哪些需要后置或数据模型扩展；不把特殊分类并入默认四属性平均继承。

验收标准：

- 逆向文档能直接导出确定性测试用例和实现任务完成定义，不依赖猜测。
- 权威 JSON 的四条特殊记录与 AS3 分支一一对应。
- `npm run check:workflow` 通过。

禁止范围：

- 不修改 `extracted_flash/` 或权威 JSON。
- 不写现代合成实现，不接入时装时间戳、材料暂存 UI 或存档迁移。

状态更新：

- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- `vertical-slices.md`

推荐后续任务：

- 根据逆向结论生成一个或两个特殊继承实现切片。
