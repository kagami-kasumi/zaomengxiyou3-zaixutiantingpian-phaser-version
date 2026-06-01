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

- `TASK-SLICE-032`：血海魔童/MagicPearl 多段随机打击法宝最小切片。摩多魂幡反制 debuff 已完成，下一步实现 `xhmt` 最近目标链式打击、三段 bullet 和结束随机效果。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-032 | Ready | TASK-SLICE | 血海魔童/MagicPearl 多段随机打击法宝最小切片 | M-043、M-032、M-033、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 实现 `xhmt` H 触发最近目标链式打击、三段 `fabao-pearl` bullet、结束随机回蓝/眩晕/中毒 |

## 任务完成定义

### TASK-SLICE-032

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
- `docs/reverse-engineering/projectiles-index.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicPearl.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMonster.as`
- `extracted_flash/scripts/172845/scripts/base/BaseAddEffect.as`
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
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `xhmt` 血海魔童触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 触发后按 `MagicPearlBegin` 等价起手进入攻击链；法宝自身约 `30` 帧回 `wait`，但攻击链继续执行；使用中重入边界必须可测试。
- 攻击次数按 `3 + floor(level / 3)` 计算，木五行额外 `+2` 次。
- 每轮重新选择离玩家最近且未死亡的 `Monster30`；无目标时提前进入结束随机效果。
- 用现代占位表现 `MagicPearlRun/Back/Effect/Bullet1-3`，并在每轮目标点按第 3/12/28 帧等价顺序生成三段 `fabao-pearl` 命中。
- 三段命中使用 `magic`、击退 `[2,-2]`、`attackInterval = 2` 的等价参数；首版可用当前玩家 `power` 和法宝等级推导占位伤害，但必须记录 MagicPearl 三 bullet 不走怪物防御修正的差异。
- 攻击链结束后随机三选一：回蓝、给当前 Monster30 全体眩晕、给当前 Monster30 全体中毒；无怪物时眩晕/中毒分支回退为回蓝。木五行把结束效果等级系数乘 `1.5`。
- 测试场景能装备/切换 `xhmt`，并能观察链式目标、段数、命中、结束随机结果和 Monster30 状态。
- 补系统测试覆盖：触发、攻击次数公式、木五行次数加成、最近目标选择、无目标结束、三段 bullet/伤害、回蓝分支、眩晕分支、中毒 tick、重入边界。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景里 `xhmt` 的链式打击、三段命中、结束随机效果和 Monster30 状态可观察。

禁止范围：

- 不修改 `extracted_flash/` 原始提取结果。
- 不实现真实 `MagicPearlBegin/Run/Back/Effect/Bullet1-3` 资源、法宝强化 UI、材料消耗、五行重置或联机同步。
- 不为本任务重构通用 AddEffect 系统；只做支撑 MagicPearl 的最小 Monster30 眩晕/中毒状态。
- 不一次性实现 `tjbg/zltc/stlp/qljfb` 等其他剩余法宝。
- 不接完整五角色 `getRealPower("fabao-pearl")`、吸血/qixue 和全怪物通用防御公式；首版保留可测试占位并在文档记录后置。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043` 复现状态；必要时同步 `M-032`/`M-033`。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 后续队列。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：

- `TASK-SLICE-032` 完成后，按剩余法宝或法宝强化 UI 继续拆分，优先从 `tjbg`、`zltc`、`stlp` 或强化界面中选择一个最小切片。
