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

- `TASK-SLICE-034`：震雷天锤/MagicZLHummer 前方雷锤法宝最小切片。`tjbg` 太极八卦已完成，下一步实现 `zltc` 等级门禁、前方 hitbox/projectile、木五行动作边界和 Monster30 眩晕/伤害联动。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-034 | Ready | TASK-SLICE | 震雷天锤/MagicZLHummer 前方雷锤法宝最小切片 | M-043、M-032、M-033、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 `zltc` H 触发等级门禁、前方雷锤占位命中、木五行 20 帧/普通 25 帧动作边界、Monster30 可观测受击/眩晕 |

## 任务完成定义

### TASK-SLICE-034

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `M-043` 法宝
- `M-032` 伤害/受击
- `M-033` 击退/硬直/保护
- `VS-013` 法宝最小可玩切片

输入资料：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicZLHummer.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：
- 在当前 `MagicWeaponSystem` 中扩展 `zltc` 震雷天锤触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 法宝等级至少 `1` 才能释放；等级不足时不进入 `hit`，并给出可观察反馈。
- 释放后在角色前方生成 `zltcskill` 等价的雷锤占位 hitbox/projectile；命中当前存活 `Monster30` 时通过现有伤害/受击或 projectile 桥接产生可测结果。
- 保留 AS3 动作窗口边界：普通五行约 `25` 帧回 `wait`，木五行约 `20` 帧回 `wait`；使用中重复按 H 拒绝重入。
- 命中反馈至少覆盖 Monster30 受击/硬直或眩晕等价状态，具体持续时间按 `BaseHero.attackBackInfoDict["fabao-zltc"]` 和 AS3 证据确认后实现。
- 测试场景能装备/切换 `zltc`，并能观察雷锤命中范围、Monster30 状态变化、动作回待机和重入拒绝。
- 补系统测试覆盖：触发、等级门禁、木五行动作边界、前方目标命中、无目标边界、到期清理、重入拒绝。

验收标准：
- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景里 `zltc` 的前方雷锤和 Monster30 命中/状态反馈可观察。

禁止范围：
- 不修改 `extracted_flash/` 原始提取结果。
- 不实现真实 `ZLHummerBmd/zltcskill` 资源、法宝强化 UI、材料消耗、五行重置或联机同步。
- 不一次性实现 `stlp/qljfb` 或其他剩余法宝。
- 不为了本任务重构通用 AddEffect 系统；复用当前 Monster30/Projectile 最小状态与命中桥接。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043/M-032/M-033/M-034` 复现状态。
- 完成后更新 `docs/reverse-engineering/magic-weapons-index.md` 的现代实现建议。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：
- `TASK-SLICE-034` 完成后，继续从 `stlp`、`qljfb`、法宝强化 UI 或真实法宝资源接入中拆出一个最小切片。
