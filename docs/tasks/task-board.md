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

- `TASK-SLICE-035`：`stlp/Ling` 随机落雪法宝最小可玩切片。落雪创建、命中参数、冰冻效果和资源缺口已补清，下一步可把 `stlp` 接入现代 `MagicWeaponSystem`/`ProjectileSystem`。

## 待完成任务

| Task | 状态 | 类型 | 目标 | 目标机制/切片 | 产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-SLICE-035 | Ready | TASK-SLICE | `stlp/Ling` 随机落雪法宝最小可玩切片 | M-043、M-032、M-033、VS-013 | `src/systems/MagicWeaponSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/systems/Monster30System.ts`、`src/systems/EquipmentSystem.ts`、`src/systems/InventorySystem.ts`、`src/assets/AssetManifest.ts`、`src/scenes/TestScene.ts`、`tools/system-tests.ts`、`magic-weapons-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` | 按 `Ling.as` 实现 H 触发 120 个随机 `ef_snow` projectile、`fabao-snow` 命中参数、3 秒冰冻最小状态、木五行动作窗口和资源缺口登记 |

## 任务完成定义

### TASK-SLICE-035

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `M-043` 法宝
- `M-032` 伤害/受击
- `M-033` 击退/硬直/保护
- `VS-013` 法宝最小可玩切片

输入资料：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/architecture/src-boundaries.md`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/Ling.as`
- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/base/BaseBullet.as`

输出产物：
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：
- `stlp` 可作为测试种子法宝装备到 `zbfb`，并由 H 键触发；无显式 MP、灵魂或等级门禁，使用中重复 H 拒绝重入。
- 触发时创建 `LingPaiEffect` 等价起手反馈，并一次性生成 120 个 `ef_snow` 等价 projectile；雪花从当前相机上方随机区域斜向下移动，非目标锁定，行进距离约 1500 后销毁。
- `fabao-snow` 命中参数接入现有伤害闭环：`attackKind = magic`、击退 `[2,-2]`、`attackInterval = 999`、`hitMaxCount = 999`。
- 命中 `Monster30` 后附加 3 秒冰冻最小状态，到期或死亡清理；首版可只覆盖 `Monster30`，不做全怪物通用 AddEffect 泛化。
- 普通五行动作窗口约 25 帧，木五行约 20 帧；法宝自身到期回 `wait`，雪花 projectile 继续按自身生命周期清理。
- `AssetManifest` 登记 `LingBmd`、`LingPaiEffect`、`ef_snow` 真资源缺口，并使用稳定占位 key。
- 系统测试覆盖触发、重入拒绝、雪花数量/生成范围、木五行动作窗口、命中伤害、冰冻状态和到期清理。

验收标准：
- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景可通过背包装备/切换 `stlp` 并观察随机落雪、Monster30 受击和冰冻反馈。

禁止范围：
- 不修改 `extracted_flash/` 原始提取结果。
- 不实现真实 `LingBmd`、`LingPaiEffect`、`ef_snow` 素材。
- 不实现法宝强化 UI、材料消耗、五行重置、完整五角色 `getRealPower("fabao-snow")`、qixue/吸血、全怪物 AddEffect 泛化或联机同步。
- 不顺手实现 `qljfb` 或其他法宝。

状态更新：

- 完成后更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-043/M-034/M-033` 复现状态/下一步。
- 完成后更新 `docs/tasks/vertical-slices.md` 的 `VS-013` 产物和验收说明。
- 完成后同步 `docs/reverse-engineering/magic-weapons-index.md` 与 `docs/reverse-engineering/projectiles-index.md` 的现代实现结果。
- 完成后从本文移入 `docs/tasks/task-history.md`。

推荐后续任务：
- `TASK-SLICE-035` 完成后，可按 `qljfb` 青龙剑、法宝强化 UI、宠物成长/技能、成长系统或强化系统继续拆分。
