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
当前推荐执行 `TASK-ASSET-001`：五角色战斗真实资源缺口盘点与接入计划。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 输出 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-ASSET-001 | Ready | 资源/逆向 | 五角色战斗真实资源缺口盘点与接入计划 | M-035、M-047、VS-039、VS-040、VS-041 | 梳理 Role1..5 普攻/技能占位 key 对应原始素材缺口、可直接接入素材和需重新提取素材；不修改 `extracted_flash/` | 生成具体资源接入切片 |

## 任务完成定义

### TASK-ASSET-001

任务类型：
- `TASK-ASSET`

目标机制/切片：
- `M-035`、`M-047`、`VS-039`、`VS-040`、`VS-041`。

输入资料：
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/attack-effects-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `src/assets/AssetManifest.ts`
- `src/systems/Role1*SkillSystem.ts`、`src/systems/Role4*SkillSystem.ts`、`src/systems/Role5SkillTuning.ts`

输出产物：
- 一份五角色战斗资源缺口清单，标明每个占位 key 对应的 AS3 资源名、当前是否在 `extracted_flash/resources` 中可用、是否需要用户手工补提取或提供素材。
- 若可直接接入，拆出最小资源接入切片；若需要复杂提取或 GitHub 软件，按 AGENTS 规则停止并让用户手工处理。

完成定义：
- Role1、Role4、Role5 当前占位战斗资源的缺口状态清晰；后续实现任务能逐项接入，不再需要重新全量扫角色技能代码。

验收标准：
- `npm run check:workflow` 通过。
- 如仅改文档，不要求 `npm run build`。

禁止范围：
- 不修改、删除或重新生成 `extracted_flash/`。
- 不一次性替换全部素材，不改玩法数值。

状态更新：
- `task-board.md`、`task-history.md`、`mechanics-index.md`、`vertical-slices.md`，以及相关资源索引文档。

推荐后续任务：
- 根据清单拆出一个最小真实资源接入切片；若需要复杂软件或重新提取，交由用户手工处理。
