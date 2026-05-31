# 纵向切片复现表

本文记录准备复现哪些可玩切片、每个切片依赖哪些已扒机制、实现到什么程度。具体任务状态以 `docs/tasks/task-board.md` 为准。

## 状态定义

- `已完成`：代码或文档切片已完成，并有验证方式。
- `可开始`：依赖机制足够，可以开始实现任务。
- `待机制`：还要继续扒 AS3 或补资源/架构事实。
- `暂缓`：不是当前优先级。

## 当前切片队列

| 切片 | 状态 | 目标 | 依赖机制 | 主要产物 | 验收 |
| --- | --- | --- | --- | --- | --- |
| VS-000 技术脚手架 | 已完成 | Phaser + TypeScript 能启动测试场景 | 无 | `src/`、`package.json`、`modern-architecture.md` | 用户手工 `npm install && npm run dev` 后可打开测试场景 |
| VS-001 双玩家输入验证 | 已完成 | 修正测试输入，P1/P2 同时可读 | M-008、M-009 | `InputSystem.ts`、`TestScene.ts` | `npm run build` 通过；方向键只影响 P2 |
| VS-002 第一个角色动作索引 | 已完成 | 选出第一个实现角色，确认移动、普攻、组合键 | M-017、M-023、M-024、M-025 | `roles-index.md` | 已推荐 Role2；首个普攻 `hit1`；首个技能候选 `sgq -> hit5` |
| VS-003 第一个角色移动切片 | 已完成 | 按原版键位实现移动、跑步、跳跃、下落 | VS-001、VS-002、M-011、M-012、M-013 | `HeroMovementSystem.ts`、`TestScene.ts` | P1 可按原版键位移动；架构保留 P2 |
| VS-004 五角色普攻与特效切片 | 已完成 | 五个角色的普攻连段、攻击窗口和普攻特效一起完成 | VS-002、VS-003、M-023、M-047、M-035 | `HeroNormalAttackSystem.ts`、`TestScene.ts`、`AssetManifest.ts` | 五个角色 J 普攻都有动作、冷却、攻击窗口和可见占位特效 |
| VS-005 第一个怪物受击死亡 | 已完成 | 加入一个简单怪物，能受击、扣血、死亡并移除 | M-030 已扒；M-031 已确认 `Monster30`；M-032 已有首切片受击依据 | `Monster30System.ts`、`TestScene.ts` | 玩家能打死一只 `Monster30` 等价怪物 |
| VS-006 基础伤害闭环 | 已完成 | 玩家与怪物互相造成伤害 | VS-004、VS-005、M-032、M-033、`combat-rules-index.md` | `CombatSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`TestScene.ts` | 玩家和怪物血量都可变化 |
| VS-007 第一个关卡闭环 | 已完成 | 完整纵向爬升关（云层、周期刷怪、停点、boss 战斗、通关） | M-014、M-026、M-027、M-028、M-030、M-031 | `Monster3System.ts`、`LevelSystem.ts`、`TestScene.ts` | 纵向爬升（镜头跟随、云层视差）→ 周期刷怪（每 6s 2/4 只 Monster30）→ 停点系统（4 停点、清波解锁）→ boss 区触发 → Monster3 战斗 → 击杀 → 传送门出现 → 按上通关全部完成 |
| VS-008 一个技能/子弹 | 已完成 | 第一个角色释放一个技能或子弹 | M-025、M-034、M-015、M-041、`projectiles-index.md`、`skills-input-index.md` | `ProjectileSystem.ts`、`HeroSkillSystem.ts`、`SkillUISystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`skills-input-index.md` | 已完成 projectile + 正式槽位 + MP 门禁 + 二段重入 + 五槽技能栏 + 可配置 loadout + 完整心法树面板 + 技能学习/升级 + 键盘绑定 + 被动技能五槽 UI；下一步扩展其他角色技能 projectile 或转向装备/背包系统 |
| VS-009 掉落和拾取 | 已完成 | 怪物死亡掉落物品并可拾取 | M-036、M-037、M-038、`drops-index.md` | `DropSystem.ts`、`InventorySystem.ts`、`EquipmentSystem.ts`、`TestScene.ts` | 已完成装备/道具拾取、药品即时恢复、红/白 aura 收集反馈、`wpqhs1` 强化石入包，以及全 `Monster*.as` 扫描中已确认 `dj/zb` 的现代配置化掉落表和测试入口 |
| VS-010 背包最小 UI | 已完成 | 打开背包并显示分类物品，支持首批装备穿脱 | M-036、M-037、`equipment-index.md` | `InventorySystem.ts`、`EquipmentSystem.ts`、`EquipmentUISystem.ts`、`TestScene.ts` | `C` 打开背包；可切换装备/道具/时装/技能书分类；可穿戴/卸下种子装备并更新槽位与属性预览 |
| VS-011 存档最小闭环 | 暂缓 | 保存/读取当前进度 | M-044 | SaveSystem | 刷新后能恢复基础状态 |
| VS-012 宠物最小可玩切片 | 已完成 | P1 宠物面板、出战跟随、宣花葫芦捕捉和宠物道具消耗 | M-042、M-043、M-016、M-037、`pets-index.md`、`magic-weapons-index.md` | `PetSystem.ts`、宠物 UI、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts` | P1 拥有一只可出战宠物；B 键面板可查看/切换出战；出战宠物跟随玩家；H 键使用 `xhhl` 等价捕捉 `Monster70-78`；背包道具 `wpcsd/wphhd/djyys` 可消耗并影响当前出战宠物 |
| VS-013 法宝最小可玩切片 | 已完成 | 非葫芦法宝接入装备槽、H 键触发、持续效果、伤害法宝、防护法宝、回复法宝、时间回溯、入魔 buff 和全体增减益 | M-043、M-036、M-015、M-032、M-033、M-042、`magic-weapons-index.md` | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`PetSystem.ts`、`TestScene.ts`、`system-tests.ts` | `kyl`/`syl` 可装备为 `zbfb` 并触发治疗；`lxj` 可触发最近目标剑击 projectile；`fbqpj` 可主动 6 剑并空闲自动 1 剑；`hyzzs`/`hywjs` 可触发扣血前吸收伤害的护盾；`zjld` 可触发无敌和 HP/MP 回复；`zsTimer` 可首次记录、二次 H 回溯 HP/MP/坐标；`lxfb/sxfb/yxfb` 可触发攻击/暴击增益与扣血边界；`jyhl` 可触发玩家/宠物增益与 Monster30 攻击减益；使用中拒绝重入；木五行、最近目标、多 projectile、伤害 projectile、护盾吸收、无敌免伤、特殊重入和 buff 清理已由系统测试覆盖 |

## 第一批推荐执行顺序

1. `TASK-SETTINGS-021`：MagicFlag/MagicPearl 全屏法宝逆向索引。
2. 后续按更多法宝、法宝强化 UI、宠物成长/技能、成长系统或强化系统继续拆分。

## 切片详情

### VS-000 技术脚手架

状态：已完成。

说明：

- 只验证 Phaser/Vite/TypeScript、场景、占位资源和键盘读取。
- 当前输入不是正式设计，方向键误用于技术验证已在文档中标注。

相关文件：

- `package.json`
- `src/main.ts`
- `src/scenes/BootScene.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneViews.ts`
- `src/systems/InputSystem.ts`
- `docs/reverse-engineering/modern-architecture.md`

架构维护记录：

- `TASK-ARCH-003` 已把 `TestScene.ts` 中首批纯显示对象工厂抽到 `src/scenes/test-scene/TestSceneViews.ts`，覆盖怪物、boss、传送门、宠物、掉落物、普攻/projectile 特效和命中闪框；玩法规则、输入键位和系统数据模型未改变。
- `TASK-ARCH-004` 已新增 `src/scenes/test-scene/TestSceneUpdatePipeline.ts`，把 `TestScene.update()` 的系统调度顺序移出场景类；玩法规则、输入键位、数值和系统数据模型未改变。
- `TASK-ARCH-005` 已新增 `src/core/GameContext.ts`，建立薄运行时上下文和首批查询入口，覆盖玩家、`Monster30`、boss、projectile、drop、pet roster 与可捕捉目标集合；不承载玩法规则或完整 ECS 生命周期。
- `TASK-ARCH-006` 已新增 `src/scenes/test-scene/TestSceneCombatBridge.ts`，把玩家普攻命中 `Monster30`、`Monster30` 命中玩家的首批碰撞/命中桥接移出 `TestScene.ts`。
- `TASK-ARCH-007` 已新增 `src/scenes/test-scene/TestSceneDebugKeys.ts`，把药品、aura、强化石和配置化掉落的首批调试键创建/判定移出 `TestScene.ts`。
- 第一阶段 `TestScene` 重构已完成；后续如果继续架构化，优先等具体玩法扩展触发，再拆 boss/projectile 命中桥接、UI 面板桥接或正式实体生命周期。

### VS-001 双玩家输入验证

状态：已完成。

验收：

- P1：A/D/S/W/J/K 变化能显示。
- P2：方向键和小键盘变化能显示。
- 方向键不影响 P1。

实际结果：

- `src/systems/InputSystem.ts` 已改为显式 `p1`/`p2` 输入结构和 `InputBindings`。
- `src/scenes/TestScene.ts` 已改为双玩家输入状态显示场景。
- `npm run build` 通过。

### VS-002 第一个角色动作索引

状态：已完成。

当前进展：

- `roles-index.md` 已覆盖五个角色身份、创建入口、资源线索、输入入口、组合键骨架、普攻连段和技能分发。
- 当前推荐第一个实现角色为 `Role2 唐僧`。
- 第一个普攻动作是 `hit1`。
- 第一个技能候选是 `sgq -> hit5`；`M-034` 已由 `projectiles-index.md` 补到足够支撑首个窄切片。

### VS-003 第一个角色移动切片

状态：已完成。

依赖：

- VS-001 完成。
- VS-002 完成。
- `movement-index.md` 已补齐首切片所需事实：
  - 同向双击 `< 500 ms` 进入跑步，第二次按住期间维持。
  - 普通双跳使用 `jump1/jump2/jump3` 和 `jumpCount`。
  - `S+K` 只在 `ThroughWall` 上下穿。

验收：

- 使用原版 P1 键位。
- 双击方向可跑。
- K 跳跃。
- S+K 下落。
- 架构上能接入 P2，但可先不生成第二个角色。

建议首批范围：

- 先实现 Role2 等价角色。
- 先用测试地面和一个 `ThroughWall` 平台验证，不等待真实关卡素材。
- 水中移动、移动平台、白龙特例后置。

实际结果：

- 新增 `src/systems/HeroMovementSystem.ts`，把首批移动行为整理成独立模型：`wait/walk/run/jump1/jump2/jump3`、同向双击跑步、双跳、`ThroughWall` 下穿和落地收束。
- `src/scenes/TestScene.ts` 接入可控的 P1/P2 角色、普通地面和一个 `ThroughWall` 等价测试平台；现有怪物切片继续保留。
- 跑步按 `< 500 ms` 同向双击进入，第二次按住期间维持；`S+K` 下穿时按原版把 `jumpCount` 设为 `1`。
- 角色横向移动会被测试场景边界收束，不会离开画面后再也回不来。

验证：

- `npm run build` 通过。

### VS-004 五角色普攻与特效切片

状态：已完成。

依赖：

- VS-003。
- M-023 普攻总规则已扒。
- M-047 已建普攻特效映射，但当前主包导出没有足够真实资源；白龙枪形态 `doSingleHit(...)` 仍是反编译缺口。
- M-035 已建立资源索引与 manifest 骨架；当前导出仍缺真素材，但 `assets-index.md` 已给出稳定 key、bundle 方向和可接受的占位策略。

范围：

- 本切片不是只做第一个角色；五个角色的普攻应作为一个任务一起完成。
- 实现时允许先用同一个测试场景切换角色，但验收必须覆盖 Role1 至 Role5。

验收：

- J 触发五个角色各自 `normalHit()` 对应动作。
- 五个角色普攻连段、冷却和状态切换与 `roles-index.md` 一致。
- 五个角色普攻都有可见特效；真实资源缺失时，按 `attack-effects-index.md` 的稳定 key 使用临时占位，并保留明确缺资源清单。
- 攻击窗口可调试显示。

实际结果：

- 新增 `src/systems/HeroNormalAttackSystem.ts`，以现代模型实现五角色 J 普攻：悟空五段、唐僧固定 `hit1`、八戒三段、沙僧铲/弓形态三段、白龙枪/剑形态四段以及跑动/空中普攻入口。
- `src/assets/AssetManifest.ts` 新增五角色普攻占位特效稳定 key；真实素材仍按 `attack-effects-index.md` 与 `assets-index.md` 的缺口后补。
- `src/scenes/TestScene.ts` 接入调试切换入口，P1/P2 可切到 Role1 至 Role5，普攻会显示动作名、占位特效和攻击窗口，并可继续命中现有 `Monster30` 调试怪。
- 白龙枪形态保留 `doSingleHit(...)` 未恢复的资源缺口，以 `normal-attack-effect.hero5.spear.unresolved` 作为现代占位 key，不伪造原始资源名。

验证：

- `npm run build` 通过。

### VS-005 第一个怪物受击死亡

状态：已完成。

依赖：

- 怪物基础索引已完成，见 `docs/reverse-engineering/monsters-index.md`。
- `TASK-SETTINGS-004C` 已细扒 `Monster30`：
  - `Monster30` 是飞行普通怪，HP 150，水平速度 7，攻击范围 250，警戒范围 1000。
  - `StageListener11` 单人每约 6 秒刷 2 只，双人刷 4 只，位置在玩家上方约 100 至 300 像素。
  - 动作只有 `wait/walk/hurt/hit1/dead`；`walk` 与 `wait` 共用动画行。
  - `hit1` 在停顿计数 10 时创建 `SpecialEffectBullet("Monster30Bullet1")`。
  - 死亡动画结束后调用 `dropAura()` 和 `destroy()`；装备/道具掉率为 0，首切片可不做掉落。

实际结果：

- 新增 `src/systems/Monster30System.ts`，以独立模型实现 `Monster30` 的 HP 150、飞行追踪、接近后 `hit1`、受击、死亡和移除。
- `src/scenes/TestScene.ts` 接入一只占位 `Monster30`，保留 P1/P2 输入显示，并提供临时攻击窗口调试怪物受击。
- 场景中可观察怪物目标、状态和 HP；玩家调试攻击能把怪物打到死亡并移除。
- `Monster30` 首切片当时只表现 `hit1` 状态；玩家受击伤害已在 `VS-006` 中补足。

验证：

- `npm run build` 通过。

### VS-006 基础伤害闭环

状态：已完成。

依赖：

- VS-004。
- VS-005。
- `combat-rules-index.md` 已确认首个互伤切片所需规则：
  - 每次攻击实例必须有唯一 `attackId`。
  - 同一攻击实例对同一目标要命中去重。
  - 玩家攻击怪物继续复用五角色普攻命中框。
  - `Monster30 hit1` 需要从状态表现推进为玩家受击攻击窗口，伤害参数为 `power = 15`、`attackKind = physics`、击退 `[6, -5]`。
  - 玩家侧首批需要 HP、受击状态和短保护或等价去重。

验收：

- 玩家攻击怪物有伤害。
- 怪物攻击玩家有伤害。
- 受击和死亡状态可观察。

实际结果：

- 新增 `src/systems/CombatSystem.ts`，提供 `DamageEvent`、`AttackKind`、`HitRegistry` 和按 `attackId -> targetId` 的命中去重入口。
- 新增 `src/systems/HeroCombatSystem.ts`，为玩家加入 HP、`ready/hurt/dead`、短保护、最近伤害事件和占位击退。
- `src/systems/HeroNormalAttackSystem.ts` 的普攻实例携带 `attackKind`，玩家命中 `Monster30` 时通过统一伤害事件结算。
- `src/systems/Monster30System.ts` 为 `hit1` 增加占位攻击窗口，使用 `power = 15`、`attackKind = physics`、击退 `[6, -5]`。
- `src/scenes/TestScene.ts` 显示玩家 HP/受击/死亡、怪物 HP/状态、最近伤害事件；死亡玩家不再参与怪物目标选择或输入更新。
- `TASK-ARCH-006` 新增 `src/scenes/test-scene/TestSceneCombatBridge.ts`，把玩家普攻命中 `Monster30`、`Monster30` 命中玩家的 Rectangle 判定、`DamageEvent` 创建和命中去重桥接移出 `TestScene.ts`；场景仍负责命中闪框和 aura 归属反馈。
- 首批仍保留边界：未接完整技能/子弹系统、掉落、装备、关卡闭环、复活/失败 UI 或联网/PK。

验证：

- `npm run build` 通过。

### VS-007 第一个关卡闭环

状态：已完成（含 TASK-SLICE-012 纵向爬升扩展）。

当前进展：

- `TASK-SETTINGS-003` 已确认默认第一主线关为 `curStage = 1`、`curLevel = 1`，对应 `StageListener11/sl11/bg11`。
- `1-1` 流程是纵向爬升、周期性刷 `Monster30`、到顶部触发 `Monster3` boss，boss 死亡后显示传送门。
- 通关入口是角色 `0001` 交互分支：传送门可见且碰撞成立后派发 `LevelVictor` 并调用 `MainGame.levelClear()`。
- `TASK-SETTINGS-012` 已细扒 `Monster3` 全数据（HP 926、hit1/hit2 攻击帧、技能 CD、boss 死亡 → 传送门 visible）、确认 boss 区触发参数和传送门机制。
- 资源缺口已确认：`sl11`/`bg11`/`floorBg1`/`Monster3` 位图和子弹资源均不在当前 `extracted_flash/resources` 导出中。

依赖：

- M-014、M-026、M-027、M-028 已确认并已全部复现。
- M-030 怪物基础已确认；M-031 `Monster30` 已在 `VS-005` 中实现。
- 资源/地图采用手工参数（地面 y、平台坐标、传送门位置、占位图形），不等待真实 SWF 时间轴数据。

实际结果（TASK-SLICE-011 基础闭环）：

- 新增 `src/systems/Monster3System.ts`，实现 Monster3 boss 完整数据模型和行为。
- 新增 `src/systems/LevelSystem.ts`，实现 boss 区状态机、触发检测、boss 生成、传送门可见/碰撞判定、按上通关。
- `src/scenes/TestScene.ts` 新增 boss 区切片：arena 平台、触发区检测、boss 激活、Monster3 追踪和攻击、boss 受击/死亡、传送门显示、按上通关并显示 `[LEVEL CLEAR]` 覆盖层。
- `npm run build` 通过，`npm run check:workflow` 通过。

实际结果（TASK-SLICE-012 纵向爬升扩展）：

- `src/systems/LevelSystem.ts` 扩展 `VerticalClimbState` 模型：世界 940×2500、4 个停点（y=2000/1500/1000/500）、3 层云视差、周期刷怪定时器。
- 纵向爬升：相机跟随玩家 Y（lerp 平滑），目标位置基于玩家最小 Y 计算。
- 周期刷怪：单人每 6s 刷 2 只 `Monster30`、双人 4 只，生成在玩家附近（x ± 150，y - 100~300）。
- 停点系统：玩家到达停点 Y → 相机锁止 → 刷怪暂停 → 清完当前波次 → 停点清除 → 相机解锁、刷怪恢复。
- 云层视差：3 层云（parallaxSpeed 0.12/0.25/0.45），随相机滚动偏移。
- 爬升区 7 个 through 平台 + 1 个底部 solid 地面。
- boss 区触发：玩家 Y ≤ 180 → 关闭刷怪/相机跟踪 → 激活 Monster3 boss 战斗。
- 多 Monster30 管理：`Monster30Model[]` + `Map<Monster30Model, MonsterView>` 动态创建/销毁。
- UI 面板（技能栏、心法树）通过 `setScrollFactor(0)` 固定在屏幕。
- `npm run build` 通过，`npm run check:workflow` 通过。

### VS-008 一个技能/子弹

状态：已完成。

当前进展：

- `TASK-SETTINGS-008` 已建立 `docs/reverse-engineering/projectiles-index.md`。
- 原版 projectile 规则已确认：`BaseBullet` 负责来源绑定、动作参数读取、生命周期、目标选择、命中检测和按 `attackInterval` 刷新的命中去重。
- 首个技能候选明确为 `Role2.sgq -> hit5`：
  - 技能入口：`Role2.showSkill()` 解析 `sgq` 后调用 `skill_sgq()`。
  - 动作：`hit5`。
  - 创建类：`SpecialEffectBullet("Role2Bullet5")`。
  - 生成位置：角色前方约 175、上方约 110。
  - 攻击参数：`attackKind = magic`、`attackInterval = 16`、`hitMaxCount = 999`、击退 `[5,-2]`。
  - 目标规则：首批单机只需要玩家技能命中怪物。

依赖：

- VS-006 已完成，现代侧已有 `DamageEvent`、`HitRegistry` 和怪物受击/死亡。
- M-025 已扒，足够支持 `Role2.sgq -> hit5` 与 `Role2.smb` 正式输入边界的窄切片。
- M-034 部分已扒，足够支持 `SpecialEffectBullet` 等价的固定位置技能特效；移动、追踪、抛物线、反弹等弹体后置。

建议范围：

- 首批先用固定测试 loadout 接正式普通技能槽，不实现完整学习 UI、冷却 UI 或真实 MP 成长。
- 使用 `ProjectileSystem` 的既有 `sgq`/`smb` projectile，新增最小技能门禁模型来处理绑定、MP、攻击/受击状态和 `smb` 二段重入。
- 使用占位资源 key `skill-projectile.role2.sgq.hit5`、`skill-projectile.role2.smb.hit4_1`、`skill-projectile.role2.smb.hit4_2`；真实 Role2 技能素材当前未在导出资源中定位到。

实际结果：

- 新增 `src/systems/ProjectileSystem.ts`，实现 `Role2.sgq -> hit5` 等价 projectile：固定生成点、生命周期、来源受击/死亡清理、`hitIntervalFrames = 16` 命中周期和 `hitSerial` 去重 key。
- `src/scenes/TestScene.ts` 接入首个技能释放入口：Role2 等价角色按第一技能键可生成 `skill-projectile.role2.sgq.hit5` 占位特效，命中 `Monster30` 时通过 `DamageEvent` 造成 `attackKind = magic`、击退 `[5,-2]` 的伤害。
- `src/assets/AssetManifest.ts` 登记占位资源 key 与 `Role2Bullet5`/`Role2_hit5` 缺口；真实素材仍留给后续资源任务。
- 本切片只覆盖固定位置 `SpecialEffectBullet("Role2Bullet5")` 等价行为，不包含正式技能 UI、MP 成长、技能学习、`sjt` 蓄力联动或其他弹体派生。
- `TASK-SETTINGS-009` 已确认 `Role2Bullet5`/`Role2_hit5` 不在当前主包/备用包导出资源中，并补充了 `Role2Bullet3/4/6/7/8/9_*` 以及其他角色首批 projectile 映射。
- `TASK-SLICE-006` 已补 `Role2.smb -> hit4_1` 的 `EnemyMoveBullet("Role2Bullet4_1")` 等价移动 projectile：第二技能键触发、地面限定、朝面向水平移动、保留运行时兼容名 `Role1Bullet4_1`，命中 `Monster30` 时走 `DamageEvent` 的 `magic` 伤害和 `[0,-3]` 击退。
- `TASK-SLICE-007` 已补 `Role2.smb -> hit4_2` 的 `SpecialEffectBullet("Role2Bullet4_2")` 等价二段特效：第一段 `Role1Bullet4_1` 仍存在时，再按第二技能键会读取第一段当前位置，按原版偏移生成 `hit4_2` 占位 projectile，而不是重建 `hit4_1`。
- `TASK-SETTINGS-010` 已补 `docs/reverse-engineering/skills-input-index.md`，确认正式普通技能槽只有 `0..4` 五个；`sendSkill(5)` 是 Space/小键盘 0 的角色特殊，`sendSkill(6)` 是 H/小键盘 7 的法宝，不走 `User.skillbykey`。
- `TASK-SLICE-008` 新增 `src/systems/HeroSkillSystem.ts`，建立固定测试 loadout：槽 0 绑定 `sgq`，槽 1 绑定 `smb`，槽 2..4 为空；1 级 `sgq` 消耗 49 MP，1 级 `smb` 消耗 107 MP，测试角色初始 MP 为 160。
- `src/scenes/TestScene.ts` 不再用硬编码调试释放；Role2 等价角色会扫描五个普通技能槽，按绑定、MP、受击/死亡、普攻状态、技能动作状态和落地条件决定是否释放。
- `smb` 第一段 `hit4_1` 成功释放时扣完整 MP；同一绑定槽在第一段 projectile 仍活跃且未触发二段时可重入 `hit4_2`，第二段不扣 MP、不重建第一段。
- Space/小键盘 0 与 H/小键盘 7 仍只作为特殊/法宝输入显示，不接本轮普通技能释放。
- `TASK-SETTINGS-011` 已于 `skills-input-index.md` 补完整技能学习（心法树解锁→buy→isstudyskill/skillbykey）、升级（双公式+等级限制）、拖拽绑定（五框 hitTest→unshift 置顶）、被动技能（五槽+curLevel/5 上限）和完整存档字段；后续 `TASK-SLICE-009` 可直接按此现代数据模型实现。
  - `TASK-SLICE-009` 已完成：`src/systems/SkillUISystem.ts` 实现五槽技能栏可视化（键位标签+技能名）、Z/小键盘+ 轮换槽位绑定、V/小键盘- 预留技能面板快捷键、loadout 与 `HeroSkillSystem` 同步。

验收：

- `npm run build` 通过。
- `npm run check:workflow` 通过。
- 测试场景中 Role2 等价角色能释放 `sgq` 占位技能，命中 `Monster30` 并改变怪物 HP。
- 同一 projectile 同一命中周期不重复扣血，持续期间可按 16 帧间隔再次命中。
- 测试场景中 Role2 等价角色能用第二技能键释放 `smb hit4_1` 占位移动 projectile，projectile 会朝角色面向移动并能命中 `Monster30`。
- 测试场景中 `smb hit4_1` 存在时再次按第二技能键会生成 `smb hit4_2` 占位特效；位置来自第一段 projectile 当前记录点，上移约 `320`，横向按朝向偏移约 `50`。
- `skills-input-index.md` 能回答哪个键触发哪个槽、槽位如何绑定技能、MP 如何扣、何时不能释放、以及 `smb` 二段为何允许重入。
- 测试场景中 P1 的 Y 触发 `sgq`，L 触发 `smb`；P2 切到 Role2 后，小键盘 8/3 遵循同一槽位规则。
- 空槽、MP 不足、死亡/受击、普攻中、`sgq` 活跃中或 `smb hit4_1` 以外的攻击状态下，普通技能键无效果；调试状态可观察 MP 扣减和拦截原因。

### VS-009 掉落和拾取

状态：已完成。

依赖：

- M-036 装备已扒并已有最小装备数据。
- M-037 背包已扒并已有分类背包/堆叠切片。
- M-038 掉落已扒，见 `docs/reverse-engineering/drops-index.md`。

实际结果：

- 新增 `src/systems/DropSystem.ts`，实现最小 `WorldDrop` 数据、`Monster30DropEntries`、掉落生成、落到平台表面、拾取入包和拾取淡出。
- `src/scenes/TestScene.ts` 在 `Monster30` 从死亡生命周期进入 `removed` 时生成两个可见地面物：装备 `ptdcz`（`bigType = "zb"`）和道具 `sms1`（`bigType = "dj"`），初始位置为怪物 `y - 100` 附近。
- P1 进入明确拾取范围后会尝试拾取；装备进入装备背包，道具 `sms1` 会与现有同名道具堆叠。
- 分类背包容量不足时拾取失败，地面物保持 `idle`，状态栏和背包 UI 消息给出失败原因。
- 拾取成功后地面物向上淡出并显示拾取反馈，状态栏显示当前掉落列表和最近拾取消息。
- `InventorySystem.ts` 修正 `addEquipmentByFillName()` / `addStackByFillName()` 的容量失败返回值，避免拾取失败被误判为成功。
- `TASK-SLICE-015` 扩展 `DropSystem.ts` 的掉落联合模型，新增 `SmallHP`、`BigHP`、`SmallMP` 三类药品。
- 怪物死亡时会按 `BaseMonster.addMedicine()` 等价概率尝试生成药品；测试场景也可用数字键 `6/7/8` 直接生成三类药品验证。
- 药品使用独立拾取路径，不进入背包；P1 碰到药品后按最大 HP/MP 百分比即时恢复：`SmallHP = 25% max HP`，`BigHP = 50% max HP`，`SmallMP = 25% max MP`。
- 药品拾取成功后向上淡出并移除；未拾取药品按约 60 秒有效期清理。
- `TASK-SLICE-016` 扩展 `DropSystem.ts` 的掉落联合模型，新增红/白 aura。
- `Monster30` 死亡时会按 `BaseMonster.dropAura()` 等价规则生成 2 至 4 个红色 aura，并按 `< 0.04 / < 0.08 / < 0.12` 概率生成 3/2/1 个白色 aura。
- aura 初始短暂停留后上浮约 30 至 50 像素，再加速吸附到最后命中者或 P1 等价目标；约 15 秒未收集会清理。
- 红色 aura 收集后记录 `gxp +power` 反馈，`Monster30` 当前按 `gxp = 1` 得到 `power = 2`；白色 aura 收集后记录固定 `power +5` 反馈。
- 测试场景状态栏显示当前 aura、累计 `gxp/power` 和最近 aura 收集反馈；`R/F` 可在 P1 附近直接生成红/白 aura 验证吸附与收益。
- `TASK-SLICE-017` 新增 `wpqhs1` 的最小道具定义和强化石掉落入口。
- 测试场景按 `C` 可在 P1 附近生成 `wpqhs1` 地面掉落；拾取后复用 `dj` 路径进入道具背包并堆叠，背包满时保留地面物并显示失败反馈。
- 强化石只作为测试/配置化掉落入口实现，不默认挂到所有怪物死亡流程；强化 UI、强化数值和装备强化流程后置。
- `TASK-SLICE-018` 将 `drops-index.md` 已确认的 `Monster3`、`Monster7` 至 `Monster30` 的 `probability/fallList` 转成 `MonsterDropTables` 现代配置。
- 配置已覆盖 `Monster3` 的 1-1 boss/普通分支，`Monster9/10/17/18/19` 的 `curStage == 9` 条件分支，以及 `Monster23`、`Monster30` 等空表/零掉率不生成装备或道具的边界。
- 测试场景新增配置化掉落入口：`N` 生成 `Monster3` boss 分支候选、`M` 生成 `Monster7` 普通分支候选、`,` 生成 `Monster29` 的 `wpqhs1` 候选；地面物继续复用现有拾取、入包和背包满反馈。
- `EquipmentSystem.ts` 只补首批掉落表所需的最小占位定义，名称/属性/合成/强化关系仍以后续资料或 xlsx 校准为准。
- `TASK-SETTINGS-016` 已完成全 `Monster*.as` 掉落表扫描：主参考包共 146 个 `Monster*.as` 文件，`Monster3..30` 之外新增 118 条记录；发现 `dj/zb/cwzb` 三类 `bigtype`，其中 `cwzb` 只在 `Monster2001` 出现且入包路径未确认。
- `TASK-SLICE-019` 将全 `Monster*.as` 扫描中已确认的 `dj/zb` 候选扩展到 `MonsterDropTables`；新增 `averageLevelMin` 与 `curStageNot` 条件以覆盖 `Monster128`、`Monster172` 分支。
- 零掉率或空 `fallList` 仍不会生成装备/道具；`Monster136` 按 AS3 最终赋值只保留 `probability = 0.1` 与 `xhb`；继承默认掉率的 `Monster207/209/210/213` 保留 `probability = 0.15`。
- `Monster2001` 的 `cwzb:p_cykljl` 只登记为 `unsupported` 空分支，不伪装成 `dj/zb` 入包。
- 测试场景新增全表调试入口：`F9` 生成新增普通怪 `Monster1`，`F10` 生成新增 boss `Monster31`，`F11` 生成默认掉率 `Monster207`，`F12` 触发零掉率 `Monster601` 的不掉落路径。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

扩展逆向边界：

- `TASK-SETTINGS-015` 已补齐药品、aura、强化石和 `Monster3..30` 掉落表边界，见 `docs/reverse-engineering/drops-index.md`。
- 药品独立对象链路已复现：`addMedicine()` 生成 `SmallHP/BigHP/SmallMP`，碰撞后即时恢复 HP/MP，不入背包。
- aura 在 `curStage == 98` 也会生成；红色 aura 走 `gxp` 收益，白色 aura 固定 `power = 5`，都吸附到击杀者并派发 `AuraEvent`。现代最小切片已先记录收益反馈，完整成长系统后置。
- 强化石 `fallStone()` 会生成 `wpqhs1` 的 `FallEquipObj` 并走 `dj` 入包；现代最小切片已接测试入口和入包反馈，但主源码未发现调用点，因此不能默认挂到所有死亡流程。
- 全 `Monster*.as` 掉落表中已确认 `dj/zb` 已进入现代配置；装备中文名、属性、合成、关卡实际刷怪和拾取距离仍需 xlsx 或实测。

禁止范围：

- 不做强化 UI、强化数值、合成、商城、存档或完整经验/成长系统。
- 不追求照搬 `FallEquipObj` 疑似无显式碰撞的拾取写法；现代侧应使用明确可验收的拾取判定。

推荐任务：

- 后续按成长系统、强化系统或 `cwzb` 入包路径逆向继续拆分。

### VS-010 背包最小 UI

状态：已完成。

依赖：

- M-036 装备已扒并已复现首切片。
- M-037 背包已扒并已复现首切片。
- `equipment-index.md` 已确认 `MyEquipObj` 字段、四分类背包、`curarray` 已穿戴列表、穿戴/卸下链路和属性结算方向。

实际结果：

- 新增 `src/systems/EquipmentSystem.ts`：定义 `EquipmentDefinition`、`EquipmentInstance`、`EquipmentLoadout`、装备类型到槽位映射、角色限制、穿戴/卸下和属性汇总/预览。
- 新增 `src/systems/InventorySystem.ts`：定义四分类 `InventoryStore`，支持装备实例、可堆叠物品、分类容量、旧装备退回背包和按 `fillName` 堆叠。
- 新增 `src/systems/EquipmentUISystem.ts`：管理背包面板状态、分类切换、物品/槽位焦点、穿脱命令和属性预览文本。
- 更新 `src/scenes/TestScene.ts`：加入 P1 最小背包面板；当前快捷键为 `C` 开关，`Tab` 切换装备/道具/时装/技能书，方向键切换焦点和选择，`Enter` 穿戴或卸下，`Backspace/Delete` 卸下槽位。
- 种子数据覆盖唐僧武器 `ptdcz`、防具 `ptdjs`、通用饰品 `mysz/xhz`、时装 `ptnmwsz`、堆叠道具 `sms1` 和技能书 `smbjns2`。
- 穿戴/卸下后会同步 P1 的 HP/MP 上限，并在面板内显示当前属性和选中装备的预览变化。

边界：

- 不实现掉落、拾取、合成、强化、仓库、赠送、商城、真实资源替换、完整法宝效果或存档。
- 只做最小可验证 UI 和数据切片，完整装备表仍后置。

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### VS-012 宠物最小可玩切片

状态：已完成。

依赖：

- M-042 宠物已由 `pets-index.md` 扒清主数据、出战切换、战斗实体创建、获得入口、消耗品和掉落边界。
- M-016 已确认原版宠物快捷键：P1 `B`、P2 小键盘 `-`。
- M-044 已确认宠物顶层存档字段 `petSave` 和单只宠物 26 字段格式；首切片只需保留可持久化字段边界，不要求接入完整存档。

实际结果：

- 新增 `src/systems/PetSystem.ts`：定义 `PetState`、`PetRoster`、`PetRuntimeModel`、10 格容量、单只出战、休息、选择、面板文本和跟随/远距传送逻辑。
- `src/scenes/TestScene.ts` 为 P1 默认种下一只 `monkey1` 等价宠物；进入场景后按出战状态生成绿色占位宠物实体。
- B 键打开宠物面板，方向键选择，`Enter` 在出战/休息间切换；切换后会销毁或重建场景宠物实体。
- 宠物跟随 P1，距离过远时回到玩家附近；状态栏显示宠物面板、出战宠物和运行时位置。
- 背包入口从 B 调整为 C，为原版宠物 B 键入口让位；心法面板打开时 B 仍用于技能绑定，不触发宠物面板。
- `tools/system-tests.ts` 补充宠物单只出战和跟随/传送系统测试。
- `TASK-SLICE-021` 扩展 `PetSystem.ts`，新增 `MagicBottleCaptureModel`、`CapturablePetTarget`、`Monster70-78` 到宠物名/概率的映射、`catchNewPet()` 和捕捉判定纯函数。
- `EquipmentSystem.ts` 增补 `xhhl` 宣花葫芦最小装备定义；测试场景中 P1 默认具备等价 `xhhl` 入口，不实现完整法宝 UI。
- `TestScene.ts` 新增一只 `Monster72 -> monkey1` 等价可捕捉目标和 `MagicBottleEffect3` 占位捕捉范围；P1 按 `H` 触发，普通技能槽和 Space 特殊技保持原逻辑。
- 灵魂值 `< 5000` 时拒绝捕捉；命中目标后扣除 `5000` 灵魂，按概率成功/失败。成功时宠物直接加入 `PetSystem` 列表并移除怪物；失败或满栏时怪物保留，不生成 `cwzb` 掉落。
- `tools/system-tests.ts` 覆盖灵魂不足、成功入列表、失败保留怪物、满栏不入列表，以及 H 法宝入口不改变普通技能槽。
- `TASK-SLICE-022` 扩展 `PetSystem.ts`，新增 `PetConsumable` 效果入口，覆盖 `wpcsd` 寿命 +20 且上限 100、`wphhd` 恢复当前出战宠物基础状态、`djyys` 增加 30000 经验。
- `InventorySystem.ts` 新增堆叠道具消耗函数；测试背包默认提供 `wpcsd/wphhd/djyys`，使用成功后扣减数量，用尽后移除堆叠。
- `EquipmentSystem.ts` 增补三种宠物道具的最小定义；完整中文表、真实图标和更复杂效果后置。
- `TestScene.ts` 在背包道具页选中宠物道具后按 `Enter` 使用；没有当前出战宠物时不消耗并给出反馈。宠物面板和状态栏可观察寿命、HP/MP、经验和消息变化。
- `tools/system-tests.ts` 覆盖成功消耗、无出战宠物不消耗、寿命上限、还魂丹状态恢复和经验石反馈。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

边界：

- 不实现完整法宝系统、法宝强化 UI、其他法宝技能、商城/活动/任务奖励、成长洗练、全部技能、完整升级曲线、全部种族数值、P2/联机或真实资源接入。
- 不把 `Monster2001/cwzb` 作为宠物获得实现依据。

推荐任务：

- 后续可拆宠物成长/技能、完整法宝系统基础逆向、成长系统或强化系统任务。

### VS-013 法宝最小可玩切片

状态：已完成。

依赖：

- M-043 法宝已完成完整基础逆向，见 `docs/reverse-engineering/magic-weapons-index.md`。
- M-036 装备已支持 `zbfb -> magicWeapon` 槽位。
- M-015 已确认 H/小键盘 7 是独立法宝触发位，不占普通技能槽或 Space 特殊技。

实际结果：

- 新增 `src/systems/MagicWeaponSystem.ts`：管理当前法宝、`wait/hit` 使用状态、H 键边沿触发、使用中拒绝重入和治疗持续效果。
- `EquipmentSystem.ts` 增补 `kyl/xhhl/syl` 的最小法宝定义，并为法宝保留 `level/element` 数据；`InventorySystem.ts` 在测试背包中加入 `kyl/syl`，测试场景默认仍装备 `xhhl` 以保留葫芦捕捉链路。
- `TestScene.ts` 接入当前装备栏 `zbfb`：装备 `xhhl` 时 H 继续走宣花葫芦捕捉；装备 `kyl` 时 H 触发枯叶灵 HP 持续恢复；装备 `syl` 时 H 触发神叶灵 HP/MP 持续恢复。
- 木五行持续时间按原版 `MagicLeaf/MagicLeaf2` 规则从 `8s` 延长到 `12s`；使用中重复按 H 会显示正在使用并拒绝重入。
- 状态栏显示当前法宝、五行、等级、动作状态、剩余时间和最近反馈；玩家 HP/MP 变化可直接观察。
- `tools/system-tests.ts` 覆盖未装备 `zbfb` 不触发、`kyl` 触发和重入拒绝、`syl` 恢复 MP、木五行持续时间加成。
- `TASK-SLICE-024` 扩展 `MagicWeaponSystem.ts` 和 `ProjectileSystem.ts`：`lxj` 戮仙剑按 H 触发 `MagicSword2_1` 起手，约 1 秒后选择最近未死亡目标，在目标处生成 `MagicSword2_2` 占位 projectile 并走现有伤害结算。
- `EquipmentSystem.ts` 和测试背包新增 `lxj`；`TestScene.ts` 会为法宝 projectile 自动创建占位特效，状态栏显示锁定/命中反馈。
- `tools/system-tests.ts` 覆盖最近目标选择、`lxj` projectile 生成、重入拒绝、无目标时正常回 `wait`，以及 projectile 生命周期。
- `TASK-SLICE-025` 扩展 `fbqpj` 青萍剑：主动 H 释放生成 6 个 `qpjeffect` 占位 projectile；空闲约 `11.225s` 自动生成 1 个 `fabao-qpj1` projectile；两者都复用最近未死亡目标选择和现有伤害结算。
- `EquipmentSystem.ts` 和测试背包新增 `fbqpj`；`AssetManifest.ts` 记录 `QPJBmd/qpjeffect/qpjeffect_box` 缺失并使用现代占位 key。
- `tools/system-tests.ts` 覆盖主动 6 剑、自动 1 剑、最近目标锁定、重入拒绝和无目标边界。
- `TASK-SLICE-026` 扩展 `hyzzs` 混元珍珠伞和 `hywjs` 混元无极伞：H 触发护盾，`hyzzs` 按 `物防 * 等级`、木五行 1.5 倍；`hywjs` 按 `物防 * 等级 + 魔防 * 等级 * 20`、木五行 2 倍；护盾持续 `10s`，在玩家扣 HP 前吸收，耗尽或过期失效。
- `HeroCombatSystem.ts` 新增法宝护盾状态和扣血前吸收逻辑；`EquipmentSystem.ts`/测试背包新增 `hyzzs/hywjs`；测试场景状态栏显示护盾剩余量和时间。
- `tools/system-tests.ts` 覆盖盾量公式、木五行倍率、受击吸收/溢出扣血、耗尽/过期和重入拒绝。
- `TASK-SLICE-027` 扩展 `zjld` 紫金铃铛：H 触发无敌和即时 HP/MP 回复；无敌基础 `2s`，木五行 `1.5` 倍；回复比例 `最大生命 * 等级 * 0.00904`，MP 为同倍率的一半，木五行回复翻倍。
- `HeroCombatSystem.ts` 新增法宝无敌状态，`applyHeroDamage()` 在无敌期间拒绝扣血和受击硬直；`EquipmentSystem.ts`/测试背包新增 `zjld`；测试场景状态栏显示 `inv` 剩余时间。
- `tools/system-tests.ts` 覆盖普通/木五行回复公式、无敌免伤、无敌过期后正常受击和重入拒绝。
- `TASK-SLICE-028` 扩展 `zsTimer` 烁时金轮：第一次 H 记录 HP/MP/坐标，等待期间第二次 H 触发回溯并回 `wait`；等待基础 `30s`，木五行 `27s`，过期后记录失效。
- `MagicWeaponSystem.ts` 新增 `magicTimer` 特殊主动效果，允许同一法宝在 `hit` 等待中二次 H 作为回溯例外；`EquipmentSystem.ts`/测试背包新增 `zsTimer`；测试场景通过传入 movement 直接恢复坐标。
- `tools/system-tests.ts` 覆盖首次记录、二次 H 回溯、木五行 27 秒等待和过期失效。
- `TASK-SLICE-029` 扩展 `lxfb/sxfb/yxfb` 入魔类法宝：流邪基础 7s/木 10s，攻击/暴击 +10 并按最大生命 5%/s 扣血；沙邪基础 7s/木 11s，攻击/暴击 +15 并按最大生命 5.4%/s 扣血；渊邪释放时扣当前生命一半，基础 8s/木 16s，攻击/暴击 +30。
- `HeroCombatSystem.ts` 新增 `magicBuff` 展示状态；`MagicWeaponSystem.ts` 负责 buff 剩余时间、扣血 tick 和到期清理；`EquipmentSystem.ts`/测试背包新增 `lxfb/sxfb/yxfb`。
- `tools/system-tests.ts` 覆盖三种持续时间、木五行加成、流邪/沙邪扣血、渊邪半血、增益数值、到期清理和重入拒绝。
- `TASK-SLICE-030` 扩展 `jyhl` 九佑魂莲/MagicFlower：H 触发全体增减益，基础持续按 `5 + level / 2` 秒计算，木五行只缩短动作边界到 450ms，不改变持续时间。
- `HeroCombatSystem.ts` 新增 `magicFlowerBuff`，以当前玩家派生攻击加值和倍率展示友方增益；`PetSystem.ts` 新增出战宠物 `magicFlowerBuff`；`Monster30System.ts` 新增 `magicFlowerDebuff`，让 `Monster30 hit1` 伤害按 `0.925` 倍派生降低。
- `EquipmentSystem.ts`/测试背包新增 `jyhl`；`TestScene.ts` 可通过背包装备/切换并在状态栏观察玩家、宠物和 Monster30 的增减益剩余时间；`tools/system-tests.ts` 覆盖持续时间公式、木五行动作边界、友方增益、宠物增益、怪物减益、到期清理和重入拒绝。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

边界：

- 不实现法宝强化 UI、材料消耗、五行重置、真实资源或全部法宝。
- 全体增减益、反弹吸血和联机同步后置。

推荐任务：

- `TASK-SETTINGS-021`

## 更新规则

每完成一个任务后，更新本文：

- 改切片状态。
- 补依赖机制链接。
- 补产物文件。
- 补实际验收结果。

如果实现中发现机制没扒清楚，不硬写；把切片状态退回 `待机制`，并新增对应 `TASK-SETTINGS-*`。
