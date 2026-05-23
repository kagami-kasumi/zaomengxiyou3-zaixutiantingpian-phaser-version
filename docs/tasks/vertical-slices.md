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
| VS-009 掉落和拾取 | 暂缓 | 怪物死亡掉落物品并可拾取 | M-036、M-038 | DropSystem、ItemData | 怪物死亡生成可拾取物 |
| VS-010 背包最小 UI | 暂缓 | 打开背包并显示物品 | M-037 | UI、InventoryStore | 能看到拾取物 |
| VS-011 存档最小闭环 | 暂缓 | 保存/读取当前进度 | M-044 | SaveSystem | 刷新后能恢复基础状态 |

## 第一批推荐执行顺序

1. `TASK-SLICE-010`：扩展完整技能学习/升级 UI（心法树、升级、拖拽绑定、被动技能）。`TASK-SETTINGS-011` 已提供完整现代数据模型，可直接按最小范围实现。
2. 后续可扩展 `VS-007` 完整纵向爬升关（云层、周期刷 Monster30、停点系统），或转向装备/背包系统。

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
- `src/systems/InputSystem.ts`
- `docs/reverse-engineering/modern-architecture.md`

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

## 更新规则

每完成一个任务后，更新本文：

- 改切片状态。
- 补依赖机制链接。
- 补产物文件。
- 补实际验收结果。

如果实现中发现机制没扒清楚，不硬写；把切片状态退回 `待机制`，并新增对应 `TASK-SETTINGS-*`。
