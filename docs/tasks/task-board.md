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

- `TASK-SLICE-031`：摩多魂幡/MagicFlag 反制 debuff 法宝最小切片。`mdhf` 和 `xhmt` 的逆向已补清，下一步先实现更窄的 MagicFlag 10 秒护体与被打反制 debuff，再拆 MagicPearl 多段随机打击。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-031 | Ready | TASK-SLICE | 摩多魂幡/MagicFlag 反制 debuff 法宝最小切片 | M-043、M-032、M-033、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 `mdhf` H 触发 10 秒护体、玩家受击反制 Monster30 debuff、每秒扣血和到期清理 |

## 任务完成定义

### TASK-SLICE-031

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-043` 法宝
- `M-032` 怪物受击/生命
- `M-033` 玩家受击/生命
- `VS-013` 法宝最小可玩切片

输入资料：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicFlag.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/base/BaseAddEffect.as`
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `mdhf` 摩多魂幡触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 触发后进入 `MagicFlagEffect` 等价护体状态：持续 `10s`；使用中拒绝重入；木五行只把法宝动作回待机窗口从约 `60` 帧缩短到约 `50` 帧，不改变护体持续时间。
- 玩家在护体期间被 `Monster30 hit1` 命中时，给攻击者添加 `MAGIC_FLAG_DEBUFF` 等价状态，持续 `5s`。
- debuff 期间每秒按怪物最大 HP 的 `2%` 扣血并显示/记录状态；Monster30 死亡或 debuff 到期后清理。
- 先把原版 `Hit` 降低事实记录为状态/调试展示或数据字段，不要求接入完整命中/闪避判定。
- 测试场景能装备/切换 `mdhf`，并能观察护体剩余时间、Monster30 debuff 剩余时间和每秒扣血反馈。
- 补系统测试覆盖：触发、重入拒绝、木五行动作边界、受击挂 debuff、每秒扣血、到期清理、死亡清理、无 `zbfb` 时 H 不触发且不影响普通技能。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景里 `mdhf` 的护体、被打反制、扣血和到期清理可观察。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现 `xhmt/MagicPearl`；它单独拆后续 `TASK-SLICE-032`。
- 不实现真实 `MagicFlagStart/Effect/Debuff` 资源、法宝强化 UI、材料消耗、五行重置或联机同步。
- 不为本任务重构通用 AddEffect 系统；只做支撑 MagicFlag 的最小状态。
- 不接完整命中/闪避系统，`Hit` 降低先作为记录或后置边界。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043` 复现状态；必要时同步 `M-032`/`M-033`。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-031` 完成后，推荐 `TASK-SLICE-032`：血海魔童/MagicPearl 多段随机打击法宝最小切片。
