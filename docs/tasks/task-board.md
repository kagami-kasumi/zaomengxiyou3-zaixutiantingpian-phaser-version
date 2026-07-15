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
当前推荐执行 `TASK-ASSET-002`：从已恢复源 SWF 中选择一个最小五角色真战斗资源族接入。
不进入资源接入时，`TASK-SETTINGS-041` 合成机制逆向仍是独立 Ready 任务。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SETTINGS-041 | Ready | 逆向 | 合成机制逆向 | M-039 | 梳理装备/道具合成入口、配方数据来源、消耗/产出规则和 UI 触发边界 | 生成最小合成实现切片 |
| TASK-ASSET-002 | Ready | 资源/实现 | 接入首个五角色真战斗资源族 | M-035、M-047、VS-039、VS-040、VS-041 | 从 `D:\flash-restored-swfs` 选择性导出并接入一个最小资源族 | 优先 Role1 普攻或 Role4 普攻，不一次性处理全部角色 |

## 任务完成定义

### TASK-SETTINGS-041

任务类型：
- `TASK-SETTINGS`

目标机制/切片：
- `M-039`

输入资料：
- `docs/reverse-engineering/reference/equipment-spreadsheet/crafting-recipes.csv`
- `docs/reverse-engineering/reference/equipment-spreadsheet.md`
- `docs/reverse-engineering/equipment-index.md`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/strength/`
- 必要时按窄关键词读取 `extracted_flash/resources_by_swf/[172845].swf/scripts/my/` 与装备/背包相关 AS3 文件

输出产物：
- 新增或更新合成逆向文档，记录合成 UI 入口、配方字段、材料消耗、产物生成、失败/门禁边界和与背包/装备系统的关系。
- 更新 `mechanics-index.md` 的 M-039 逆向状态，并在需要时生成一个最小合成实现切片。

完成定义：
- 合成机制的首个可实现闭环已经有 AS3 证据和现代边界说明；后续实现任务不需要重新全量扫 `export/strength/`。

验收标准：
- `npm run check:workflow` 通过。

禁止范围：
- 不写现代合成代码。
- 不修改 `extracted_flash/`。
- 不一次性覆盖完整装备表、强化、五行重置或存档。

状态更新：
- `task-board.md`
- `task-history.md`
- `mechanics-index.md`
- 必要时更新 `vertical-slices.md`

推荐后续任务：
- 生成一个最小合成实现切片，或在机制事实不足时拆出更窄的合成子逆向任务。

### TASK-ASSET-002

任务类型：
- `TASK-ASSET`

目标机制/切片：
- `M-035`、`M-047`、`VS-039`、`VS-040`、`VS-041`。

输入资料：
- `docs/reverse-engineering/combat-assets-gap-plan.md`
- `docs/reverse-engineering/evb-extraction-report.md`
- `D:\flash-restored-swfs` 中的角色战斗资源包
- `src/assets/AssetManifest.ts`
- 目标角色对应的最小战斗系统或 manifest 注册文件

准备状态：
- `TASK-ASSET-003` 已恢复 Role1/4/5 源包；本任务可以从一个资源族开始选择性 FFDec 导出和接入。

输出产物：
- 一个最小真资源接入切片，例如 Role1 普攻 `Role1Bullet1/3/4/5` 或 Role4 普攻 `Role4Bullet1/2/3 + Role4BulletArrow1/2`。
- 更新 manifest、资源索引和必要的场景观察说明。

完成定义：
- 一个角色的一组真资源可以在现代场景中替换对应占位表现，且不改变玩法数值、命中时序或战斗流程。

验收标准：
- `npm run check:workflow` 通过。
- 如修改 `src/`，先运行 `npm run check:structure`，再运行 `npm run build`。

禁止范围：
- 不修改、删除或重新生成 `extracted_flash/`。
- 不一次性替换全部素材，不改玩法数值。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`，以及相关资源索引文档。

推荐后续任务：
- 优先选择 Role1 普攻或 Role4 普攻，按实际 MovieClip/位图结构拆得更窄。
