# 总机制表

本文记录整个项目的机制总进度：什么还没扒、什么已经扒了、什么已经复现。它是事实和进度清单，不是实现方案。

它与 `docs/tasks/vertical-slices.md` 的分工：

- `mechanics-index.md`：按机制记录逆向状态和复现状态。
- `vertical-slices.md`：按可玩切片记录实现队列和验收。

## 状态定义

逆向状态：

- `不适用`：不是从 AS3 机制逆向来的事项。
- `未扒`：知道有这个机制，但还没系统阅读源码。
- `部分已扒`：大方向清楚，但细节不足以完整实现。
- `已扒`：有明确 AS3 证据和机制说明，可作为实现依据。
- `暂缓`：当前阶段不准备逆向。

复现状态：

- `不适用`：不是现代游戏功能。
- `未复现`：现代版本还没实现。
- `部分复现`：已有技术验证或局部实现，但不完整或不符合正式玩法。
- `已复现`：现代版本已实现并有验证方式。
- `暂缓`：当前阶段不准备实现。

## 总览

| ID | 机制 | 逆向状态 | 复现状态 | 证据/逆向文档 | 现代产物 | 下一步 |
| --- | --- | --- | --- | --- | --- | --- |
| M-001 | 提取资料状态 | 已扒 | 不适用 | `extracted_flash/README_extract.md` | 无 | 缺资源时先列明资料缺口 |
| M-002 | 主参考源码 | 已扒 | 不适用 | `extracted_flash/scripts/172845/scripts` | 无 | 遇疑点再看 `25034429` |
| M-003 | 现代目标 | 已扒 | 部分复现 | `AGENTS.md`、`TASK_OUTLINE.md` | 当前文档体系 | 后续任务持续遵守 |
| M-004 | 技术脚手架 | 不适用 | 已复现 | `modern-architecture.md` | `package.json`、`src/`、Vite/Phaser 骨架、`src/scenes/test-scene/TestSceneViews.ts`、`src/scenes/test-scene/TestSceneUpdatePipeline.ts`、`src/core/GameContext.ts` | `TASK-ARCH-003/004/005` 已抽出首批 TestScene 视图工厂、update 调度层和薄查询上下文；下一步 `TASK-ARCH-006` 拆碰撞/命中桥接 |
| M-005 | 主流程 | 部分已扒 | 未复现 | `gameplay-index.md`、`runtime-index.md` | 无 | 继续细化 UI、读档、开场、地图分支 |
| M-006 | 单人/双人规则 | 已扒 | 未复现 | `controls-index.md`、`gameplay-index.md` | 无 | 输入和选人实现时保留 P1/P2 |
| M-007 | 玩家控制位 | 已扒 | 未复现 | `User.as`、`KeyBoardControl.as` | 无 | 实现 `PlayerSlot` |
| M-008 | 基础键位 | 已扒 | 已复现 | `controls-index.md` | `src/systems/InputSystem.ts`、`src/scenes/TestScene.ts` 双玩家输入验证 | 后续角色控制器读取结构化 input state |
| M-009 | 方向键归属 | 已扒 | 已复现 | `KeyBoardControl.as`、`controls-index.md` | `InputBindings.p2` 独占方向键，`TestScene` 同时显示 P1/P2 状态 | 后续移动切片继续保持方向键只属于 P2 |
| M-010 | `keyarray` 四位 | 已扒 | 未复现 | `BaseHero.as`、`controls-index.md` | 无 | 角色控制器实现时转成结构化 input intent |
| M-011 | 跑步 | 已扒 | 已复现 | `movement-index.md`、`BaseHero.addDoubleCount()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts` | 后续在正式角色控制器中复用并按真素材继续校准手感 |
| M-012 | 跳跃 | 已扒 | 已复现 | `movement-index.md`、`BaseHero.jump()`、`BaseHero.step()`、`BaseObject.getDownFloor()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts` | 水中重复跳与白龙特例继续后置 |
| M-013 | 下落平台 | 已扒 | 已复现 | `movement-index.md`、`BaseObject.getFallDown()`、`PhysicsWorld.addSubObj()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts` | 后续补完整平台库并继续校准特殊平台类型 |
| M-014 | 上/交互/通关 | 已扒 | 已复现 | `levels-index.md`、`BaseHero.checkTransferDoor()`、`Role*.myKeyDown()`、`MainGame.levelClear()` | `src/systems/LevelSystem.ts`、`src/scenes/TestScene.ts` | 传送门可见性判定和按上通关已接入完整纵向爬升 → boss 区 → 通关闭环；完整多关卡流程后置 |
| M-015 | 技能槽输入 | 已扒 | 已复现 | `skills-input-index.md`、`BaseHero.sendSkill()`、`KeyBoardControl.as`、`User.returnSkillNameBySkillKey()`、`roles-index.md` | `src/systems/InputSystem.ts`、`src/systems/HeroSkillSystem.ts`、`src/scenes/TestScene.ts` | 现代测试场景已按 0..4 普通技能槽触发，Space/小键盘 0 与 H/小键盘 7 不接普通技能；后续 UI 任务只负责可视化与配置 |
| M-016 | UI 快捷键 | 已扒 | 已复现 | `skills-input-index.md`、`pets-index.md`、`KeyBoardControl.as`、`GameInfo.as`、`RoleInfo.as`、`magic-weapons-index.md` | `src/systems/SkillUISystem.ts`、`src/systems/PetSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts` | 原版 P1 `C/V/B/N/Esc` 与 P2 小键盘 `/ * -` 控制背包/心法/宠物/副本/设置；现代侧 C 打开背包，V 打开心法树，B 打开宠物面板，Tab/B/U/L/G/P/1-5 在心法面板内处理学习/绑定；背包面板内 U 触发现代最小法宝强化 |
| M-017 | 角色列表 | 已扒 | 未复现 | `roles-index.md`、`export/hero/Role1.as` 至 `Role5.as`、`User.getRoleName()` | 无 | 角色动作索引已够支撑选择首个角色，后续实现前先补移动和资源 |
| M-018 | Role1 悟空 | 部分已扒 | 未复现 | `roles-index.md`、`Role1.as`、`gameplay-index.md` | 无 | 战斗任务中补伤害帧、子弹/特效细节和 `sx` 缺口 |
| M-019 | Role2 唐僧 | 部分已扒 | 未复现 | `roles-index.md`、`Role2.as` | 无 | 推荐首个角色；补 `hit1`、`sgq -> hit5` 的攻击窗口 |
| M-020 | Role3 八戒 | 部分已扒 | 未复现 | `roles-index.md`、`Role3.as` | 无 | 补伤害帧、`rj` 缺口和盾牌类状态 |
| M-021 | Role4 沙僧 | 部分已扒 | 未复现 | `roles-index.md`、`Role4.as` | 无 | 补铲/弓攻击表现、`mds` 缺口和技能弹体 |
| M-022 | Role5 白龙 | 部分已扒 | 未复现 | `roles-index.md`、`Role5.as` | 无 | 补枪/剑形态技能弹体、特殊对象和资源加载 |
| M-023 | 普攻总规则 | 已扒 | 已复现 | `roles-index.md`、`attack-effects-index.md`、`Role*.normalHit()` | `src/systems/HeroNormalAttackSystem.ts`、`src/scenes/TestScene.ts` | 五角色普攻切片已完成；普攻已接入 `DamageEvent` 首批互伤结算 |
| M-024 | 角色组合键 | 已扒 | 未复现 | `roles-index.md`、`Role*.myKeyDown()`、`controls-index.md` | 无 | 实现角色控制器时按结构化 input intent 转换 |
| M-025 | 角色技能效果 | 已扒 | 部分复现 | `skills-input-index.md`、`roles-index.md`、`projectiles-index.md`、`Role*.showSkill()`、`Config.allSklName` | `src/systems/ProjectileSystem.ts`、`src/systems/HeroSkillSystem.ts`、`src/scenes/TestScene.ts` | `Role2.sgq -> hit5` 与 `Role2.smb -> hit4_1/hit4_2` 已接正式槽位、MP 门禁和二段重入；其他角色/技能效果后续分任务扩展 |
| M-026 | 关卡类命名 | 已扒 | 未复现 | `levels-index.md`、`gameplay-index.md`、`MainGame.newGame()`、`PhysicsWorld.pWorldInit()` | 无 | 资源缺口已确认：`sl11`/`bg11`/`floorBg1` 均不在当前导出；VS-007 采用手工参数 |
| M-027 | 地图标记 | 已扒 | 已复现 | `levels-index.md`、`BaseGameSence.as`、`PhysicsWorld.addSubObj()`、`StopPoint.as`、`MonsterAppearPoint.as` | `src/systems/LevelSystem.ts`（停点系统、刷怪点逻辑、传送门标记） | VS-007 已实现停点系统、刷怪管理和传送门通关闭环 |
| M-028 | 第一个关卡 | 已扒 | 已复现 | `levels-index.md`、`Config.initData()`、`StageListener11.as`、`Monster3.as` | `src/systems/Monster3System.ts`、`src/systems/LevelSystem.ts`、`src/scenes/TestScene.ts` | 已实现完整纵向爬升（镜头跟随、云层视差）、周期刷怪（每 6s 2/4 只 Monster30）、停点系统、Monster3 boss 战斗和传送门通关闭环 |
| M-029 | 世界主循环 | 已扒 | 部分复现 | `runtime-index.md` | `src/scenes/test-scene/TestSceneUpdatePipeline.ts`、`src/core/GameContext.ts` | 已把测试场景 update 调度顺序抽为 pipeline，并建立薄 `GameContext` 查询入口；下一步 `TASK-ARCH-006` 拆碰撞/命中桥接 |
| M-030 | 怪物系统 | 已扒 | 部分复现 | `monsters-index.md`、`BaseMonster.as`、`BaseObject.as`、`BaseBullet.as`、`PhysicsWorld.as`、`MainGame.as` | `src/systems/Monster30System.ts`、`src/systems/Monster3System.ts`、`src/scenes/TestScene.ts` | 已有飞行小怪和地面 boss 两种模式；后续扩展为通用怪物/战斗系统 |
| M-031 | 第一个怪物 | 已扒 | 已复现 | `monsters-index.md`、`Monster30.as`、`StageListener11.as`、`SpecialEffectBullet.as` | `src/systems/Monster30System.ts`、`src/scenes/TestScene.ts` | `Monster30` 首切片已完成；后续在真实角色/关卡中复用 |
| M-032 | 伤害/受击 | 已扒 | 已复现 | `combat-rules-index.md`、`monsters-index.md`、`BaseBullet.as`、`BaseHero.as`、`BaseMonster.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicZLHummer.as`、`Ling.as`、`magic-weapons-index.md` | `src/systems/CombatSystem.ts`、`src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`src/systems/HeroNormalAttackSystem.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`src/systems/MagicWeaponSystem.ts`、`src/systems/ProjectileSystem.ts` | 首批互伤闭环已完成；`Monster30` 已接 `jyhl/MagicFlower` 攻击减益状态，攻击伤害按 `0.925` 派生倍率降低；`mdhf/MagicFlag` 已接玩家护体被打反制，Monster30 debuff 每秒扣最大 HP 2% 并可致死清理；`xhmt/MagicPearl` 已接三段 `fabao-pearl` projectile，占位伤害按玩家 power 和法宝等级派生；`zltc/MagicZLHummer` 已接前方 `fabao-zltc` projectile 伤害和 Monster30 受击反馈；`stlp/Ling` 已接 120 个 `fabao-snow` 落雪 projectile，按 `magic`、击退 `[2,-2]`、`attackInterval = 999` 命中 Monster30；后续 boss/projectile 命中可继续迁移 |
| M-033 | 击退/硬直/保护 | 已扒 | 部分复现 | `combat-rules-index.md`、`BaseObject.setAttackBack()`、`BaseHero.beAttackDoing()`、`BaseObject.setYourFather()`、`magic-weapons-index.md`、`MagicUmbrella.as`、`MagicUmbrella2.as`、`MagicRing.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicBagua.as`、`MagicZLHummer.as`、`Ling.as` | `src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`src/systems/MagicWeaponSystem.ts` | 已有玩家受击短保护、`Monster30 hit1` 击退占位、伞类护盾扣 HP 前吸收、铃铛无敌免伤、`jyhl/MagicFlower` 友方增益状态展示、`mdhf/MagicFlag` 10 秒护体反制状态、`xhmt/MagicPearl` 结束随机 Monster30 眩晕/中毒最小状态、`tjbg/MagicBagua` 全体 Monster30 眩晕最小状态、`zltc/MagicZLHummer` 命中后 4.5 秒 Monster30 眩晕最小状态，以及 `stlp/Ling` 命中后 3 秒 Monster30 `magicSnowIce` 冰冻最小状态；完整受击条、浮空、反弹吸血、命中/闪避系统、通用 AddEffect 和原版硬直校准后置 |
| M-034 | 子弹/技能飞行物 | 部分已扒 | 部分复现 | `projectiles-index.md`、`BaseBullet.as`、`export/bullet/`、`Role2.as`、`Role1.as` 至 `Role5.as`、`MagicPearl.as`、`MagicZLHummer.as`、`Ling.as`、`MagicBigBottle.as` | `src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`src/assets/AssetManifest.ts` | 已复现固定位置 `Role2Bullet5`、移动 `Role2Bullet4_1`、基于第一段记录点生成的 `Role2Bullet4_2` 二段、`MagicPearlBullet1/2/3` 三段 `fabao-pearl` 占位 projectile、`zltcskill` 前方 `fabao-zltc` 占位 projectile，以及 `stlp/Ling` 的 `ef_snow` 随机落雪 `fabao-snow` 占位 projectile；`qljfb/MagicBigBottle` 已确认并实现为 `StageBoat extends ThroughWall` 临时墙/船对象，不进入 projectile 伤害系统 |
| M-035 | 资源加载策略 | 已扒 | 部分复现 | `README_extract.md`、`modern-architecture.md`、`attack-effects-index.md`、`assets-index.md`、`projectiles-index.md` | `src/assets/AssetManifest.ts` 的状态化 manifest 骨架和 `skill-projectile.role2.sgq.hit5`、`skill-projectile.role2.smb.hit4_1`、`skill-projectile.role2.smb.hit4_2` 缺口登记 | 已确认 Role2 技能 projectile 真素材不在当前主包/备用包导出目录；真素材需补 `TangSeng`/`SpecialUI/TangSeng` 等角色包，不阻塞占位资源切片 |
| M-036 | 装备 | 已扒 | 已复现 | `equipment-index.md`、`magic-weapons-index.md`、`my/AllEquipment.as`、`my/MyEquipObj.as`、`export/pack/BackPack.as`、`export/strength/SutraInterface.as`、`base/BaseRoleProperies.as` | `src/systems/EquipmentSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts` | 最小装备槽位、角色限制、穿戴/卸下、属性预览和 `zbfb` 1→2 级灵魂强化闭环已完成；完整材料阶段、五行重置、真实装备表和存档后置 |
| M-037 | 背包 | 已扒 | 已复现 | `equipment-index.md`、`user/User.as`、`export/pack/BackPackElement.as`、`export/pack/PackThings.as`、`config/Config.as` | `src/systems/InventorySystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts` | 分类背包、堆叠数量、种子装备/道具/时装/技能书已完成；掉落拾取已接入最小切片，完整容量/存档后置 |
| M-038 | 掉落 | 已扒 | 已复现 | `drops-index.md`、`BaseMonster.as`、`BaseAura.as`、`my/FallEquipObj.as`、`SmallHP.as`、`BigHP.as`、`SmallMP.as`、`Monster*.as` | `src/systems/DropSystem.ts`、`src/systems/InventorySystem.ts`、`src/scenes/TestScene.ts` | `VS-009` 已覆盖装备/道具掉落拾取、药品即时恢复、红/白 aura 生成吸附、`wpqhs1` 强化石测试掉落入包，以及全 `Monster*.as` 扫描中已确认 `dj/zb` 的现代配置化掉落表；`Monster2001` 的 `cwzb` 已确认为未接通/unsupported 配置，不作为现代掉落类型 |
| M-039 | 合成 | 未扒 | 未复现 | `docs/reverse-engineering/reference/equipment-spreadsheet/crafting-recipes.csv`、`export/strength/` 待读 | 无 | 背包首切片之后，先用拆分 CSV 辅助定位配方，再按 AS3 合成 UI 校验 1.1 事实 |
| M-040 | 等级/经验 | 已扒 | 已复现 | `progression-index.md`、`User.as`、`BaseHero.as`、`BaseRoleProperies.as`、`Role1.as` 至 `Role5.as`、`BaseMonster.as`、`TaskInterface.as` | `src/systems/ProgressionSystem.ts`、`src/systems/Monster30System.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`tools/system-tests.ts` | `VS-014` 已完成：`Monster30` 击杀经验、自动升级、扣本级经验、HP/MP 回满、五角色基础属性表、P1/P2 成长隔离和状态栏展示已复现；任务奖励经验、宠物经验、难度倍率、无尽模式经验和存档持久化后置 |
| M-041 | 技能学习/绑定 | 已扒 | 已复现 | `skills-input-index.md`、`User.skillbykey`、`SkillControl.as`、`SkillSetControl.as`、`BuySkill.as`、`PassiveSkillControl.as` | `src/systems/SkillUISystem.ts`、`src/systems/HeroSkillSystem.ts`、`src/scenes/TestScene.ts` | 完整心法树面板（5 角色 × 2 树 × 5 技能）、技能学习（上限 10）、升级（双公式+等级门禁）、键盘绑定交互（五槽分配）、被动技能五槽 UI 已全部实现；后续可接入存档持久化 |
| M-042 | 宠物 | 已扒 | 部分复现 | `pets-index.md`、`BasePet`、`BaseHero.initPet()`、`User.petsAry`、`User.findCurrentPet()`、`User.catchNewPet()`、`PetInfo.as`、`PetInterface.as`、`PackThings.as`、`MagicBottle.as`、`MagicFlower.as`、`Monster70.as` 至 `Monster78.as` | `src/systems/PetSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`tools/system-tests.ts` | 已复现 P1 预置宠物、B 键宠物面板、单只出战/休息、跟随/远距传送、宣花葫芦捕捉、宠物消耗品、`jyhl/MagicFlower` 对出战宠物的增益状态、`VS-015` 宠物经验/升级最小闭环、`VS-016` `monkey1/xj`、`VS-017` `monkey2/lj`、`VS-018` `monkey2/xj`、`VS-019` `monkey3/lyq`、`VS-020` `monkey3/xj`、`VS-021` `monkey3/lj` 和 `VS-022` `monkey4/jgaoyi` 宠物技能最小闭环：P1 可切换出战 `monkey2/monkey3/monkey4`；`monkey2` 持有已学 `lj/xj`，`lj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey2Bullet2` 占位 projectile 并造成 `4.2 * pet.atk` 伤害，`xj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey2Bullet3` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害；`monkey3` 持有已学 `lyq/xj/lj`，`lyq` 满足 MP/冷却/目标和距离 `<= 400` 门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey3Bullet2` / `hit2` 占位 projectile 并造成 `6.8 * pet.atk` 伤害，`xj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，复用 `PetMonkey1Bullet2` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害，`lj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey3Bullet3_2` / `hit4` 占位 projectile 并造成 `4.2 * pet.atk` 伤害；`monkey4` 持有已学 `xj/lj/lyq/jgaoyi`，`jgaoyi` 满足已学习、MP `>= 30`、冷却和目标门禁后扣 30 MP、重置 500ms 冷却，生成 `PetMonkey4Hit5` / `hit5` 占位反馈；AS3 `getRealPower("hit5")` 为 0，本切片固定无直接伤害。`VS-023` 已完成宠物技能存档/面板最小闭环：`PetState.skills` 可字段级编解码为 `sname~sname`，空技能保存为空字符串，未知 key 可安全保留但不会释放；宠物面板展示 8 个技能槽；背包种子新增 `cwjnxld`，当前出战宠物可按等级/种类/形态重算技能并消耗 1 个，道具无出战宠物时不消耗，随机源可注入并由系统测试固定。`TASK-SETTINGS-028` 已补清基础属性被动 `tsml/zrsh/smzf/mfby`、受击反击 `qlfj`、六个自动 buff `sxkb/fsnl/smjc/mfjc/gjjc/fyjc` 的入口、MP、计数器、持续和数值公式，并列出其他宠物形态专属技能仍未复现。`VS-024` 已完成首个基础自动 buff：当前出战宠物已学 `gjjc` 且 MP/计数器满足时自动扣 20 MP，为 P1 主人按 `form * 6 * technique * 1.05` 增加攻击，到期恢复，并在宠物面板展示状态。`VS-025` 已完成 `qlfj` 强力反击：当前出战宠物已学、受击且存活时按可注入随机概率触发，命中对最近 `Monster30` 造成 `pet.atk` 等价物理反击且不消耗 MP。`VS-026` 已完成 `smjc` 生命加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 HP 上限并按比例同步当前 HP，到期恢复。`VS-027` 已完成 `mfjc` 魔法加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 MP 上限并按比例同步当前 MP，到期恢复。`VS-028` 已完成 `fyjc` 防御加成：自动扣 20 MP，给主人按 `form * 5 * technique * 1.05` 增加防御，到期恢复。`VS-029` 已完成 `sxkb` 嗜血狂暴：自动扣 20 MP，按 `form * 0.07 * technique * 0.27 * 1.05` 增加宠物自身暴击加成，到期恢复，重触发计数使用 4320 帧。`VS-030` 已完成 `fsnl` 法术能量：自动扣 20 MP，按 `form * 30 * technique * 1.05` 增加宠物自身技能伤害加值，到期恢复。`VS-031` 已完成 `fsnl` 技能伤害加值接入：已复现宠物主动技能在原倍率伤害上增加 `skillDamageBonus`，`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`VS-032` 已完成 `sxkb` 暴击率接入：已复现宠物主动技能可注入随机源，暴击命中时对包含 `skillDamageBonus` 的技能伤害应用 2 倍最小暴击倍率，暴击未命中和无暴击率时旧伤害不变；`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`TASK-SETTINGS-029` 已扒清马系 `sp/bd/bz/tmaoyi` 专属技能链，`TASK-SLICE-058` 已完成首个马系技能 `horse1/sp`：P1 可切换出战 `horse1`，按已学习、MP、目标距离 `50..100`、2 秒 CD 门禁释放 `PetHorse1Bullet2` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-059` 已完成 `horse2/bd`：P1 可切换出战 `horse2`，主人受击等价触发后按已学习、MP、目标、触发 ready 和 2 秒 CD 门禁释放 `PetHorse2Bullet2` / `hit2` 占位 projectile，伤害接入 `fsnl/sxkb`，释放后清除触发并命中附加 2 秒冰冻；`TASK-SLICE-060` 已完成 `horse3/bz`：P1 可切换出战 `horse3`，按已学习、MP、目标距离 `<= 250`、目标和约 6 秒 CD 门禁释放 `PetHorse3Bullet4` / `hit4` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-061` 已完成 `horse4/tmaoyi`：P1 可切换出战 `horse4`，按已学习、MP、目标和奥义 CD 门禁释放 `PetHorse4Bullet5` 占位 projectile，`sp` 记录追踪目标，`bd` 让首段附加 2.4 秒冰冻并记录 1 秒爆炸延迟，`bz` 生成 `PetHorse4Bullet5Explode` 爆炸段并按 `6.6 * pet.atk + skillDamageBonus` 接入 `fsnl/sxkb` 造成伤害，`tmaoyi` 本体直接伤害保持 0；`TASK-SETTINGS-030` 已补清青龙 `fs/sdcc/ltwj/qlaoyi` 专属技能链，`TASK-SLICE-062` 已完成 `dragon1/fs`：P1 可切换出战 `dragon1`，按已学习、MP 和约 10 秒 CD 门禁释放 10 秒分身占位反馈，直接伤害保持 0；`TASK-SLICE-063` 已完成 `dragon2/sdcc`：P1 可切换出战 `dragon2`，按已学习、MP、目标、距离 `<= 300` 和约 3.6 秒 CD 门禁释放 `PetDragon2Bullet2` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-064` 已完成 `dragon3/ltwj`：P1 可切换出战 `dragon3`，按已学习、MP、目标、距离 `<= 500` 和约 5 秒 CD 门禁释放 4 段 `PetDragon3Bullet3` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-065` 已完成 `dragon4/qlaoyi`：P1 可切换出战 `dragon4`，按已学习、MP `>= 30`、目标、距离 `<= 200` 和约 24 秒 CD 门禁释放 `PetDragonBullet4` / `hit4` 奥义占位 projectile，直接伤害保持 0，并按已学 `fs/sdcc/ltwj` 记录 `fs-clone/sdcc-charge/ltwj-multi` 组合反馈；下一步 `TASK-SETTINGS-031` 逆向下一组宠物专属技能链；成长洗练、P2/联机、任务奖励经验、完整全局存档、全部宠物专属技能和真实资源后置 |
| M-043 | 法宝 | 已扒 | 部分复现 | `magic-weapons-index.md`、`BaseMagicWeapon.as`、`export/magicWeapon/`、`SutraInterface.as`、`BaseHero.initMagicWeapon()`、`BaseHero.showSkillFaBao()`、`KeyBoardControl.as`、`AllEquipment.as`、`MyEquipObj.as`、`BackPack.as`、`Ling.as`、`MagicBigBottle.as` | `src/systems/MagicWeaponSystem.ts`、`src/systems/PetSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`src/systems/EquipmentSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`tools/system-tests.ts` | 已完成完整法宝基础逆向，并补清 `mdhf/MagicFlag` 10 秒护体反制 debuff、`xhmt/MagicPearl` 最近目标多段链/结束随机效果、`tjbg/MagicBagua` 全屏眩晕、`zltc/MagicZLHummer` 前方雷锤、`stlp/Ling` 随机落雪与 `qljfb/MagicBigBottle` 临时墙/船；现代侧已复现 `xhhl` 捕捉入口、`kyl/syl` 治疗、`lxj` 伤害、`fbqpj` 多剑/自动飞剑、`hyzzs/hywjs` 护盾、`zjld` 无敌/回复、`zsTimer` 时间回溯、`lxfb/sxfb/yxfb` 入魔 buff、`jyhl/MagicFlower` 全体友方增益和 Monster30 减益、`mdhf/MagicFlag` 护体反制 debuff、`xhmt/MagicPearl` 多段随机打击和结束随机回蓝/眩晕/中毒、`tjbg/MagicBagua` 全体 Monster30 眩晕、`zltc/MagicZLHummer` 前方雷锤伤害/眩晕、`stlp/Ling` 镜头范围 120 个落雪 projectile/3 秒冰冻、`qljfb/MagicBigBottle` 20 秒临时跟随平台/站立托举，以及 `SutraInterface` 等价最小强化面板：C 打开背包后展示当前 `zbfb` 等级/五行/成长率/主要属性/灵魂消耗，U 消耗测试灵魂完成 1→2 升级并让 `MagicWeaponSystem` 读取新等级；完整材料阶段、五行重置、真实资源、存档和联机同步后置 |
| M-044 | 存档 | 部分已扒 | 未复现 | `skills-input-index.md`、`pets-index.md`、`User.getSaveObj()`、`MemoryClass.setStorage()`、`SaveInter.as` | `src/systems/PetSystem.ts` 字段级宠物技能编解码 | 已确认技能相关存档字段、文件格式（AMF+compress+encrypt → gameData/{0-5}.sav）和顶层存储结构；宠物字段为 `petSave`，多宠物用 `}` 分隔，单宠物 26 个 `|` 字段并含 `isFight` 与 `skillSaveString`；宠物技能存档字段已由 `TASK-SLICE-048` 接入字段级现代函数，`sname~sname` 可编解码，空串代表无已学技能，未知 key 可安全保留；完整全局存档、AMF/compress/encrypt、装备/任务等字段留给对应系统任务 |
| M-045 | 多人网络 | 暂缓 | 暂缓 | `Config.as` 中 `Client` | 无 | 本地双人优先，网络不进第一批 |
| M-046 | 支付/活动/礼包 | 暂缓 | 暂缓 | `Config.as`、UI | 无 | 非核心复刻，后续按需判断 |
| M-047 | 角色普攻特效资源 | 部分已扒 | 部分复现 | `attack-effects-index.md`、`assets-index.md`、`Role*.normalHit()`、`Role*.doHit*()`、`BaseBitmapDataPool.as`、`extracted_flash/resources` | `src/assets/AssetManifest.ts`、`src/systems/HeroNormalAttackSystem.ts`、`src/scenes/TestScene.ts` | 现代占位 key 和可见特效已接入；真实素材与白龙枪形态 `doSingleHit(...)` 资源名仍需后续补提取/P-code |

M-042 当前补充：`TASK-SETTINGS-031` 已补清玄龟 `turtle1..4` 的 `sld/txlj/sybh/xwaoyi` 专属技能链，事实已足够进入实现。`TASK-SLICE-066` 已完成 `turtle1/sld`：P1 可切换出战 `turtle1`，按已学、MP、目标、距离 `50..200` 和约 6 秒 CD 门禁释放 `PetTurtle1Bullet2`，按 `pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成伤害，并按本次实际伤害治疗宠物自身。`TASK-SLICE-067` 已完成 `turtle2/txlj`：P1 可切换出战 `turtle2`，按已学、MP、目标和约 20 秒 CD 门禁添加链接状态；链接期间主人受伤时宠物承受 5% 转嫁伤害、主人承受 95% 伤害，主人治疗和宠物治疗按 `1.05` 倍联动，`sld` 自疗可同步给主人最小治疗反馈。`sybh` 是 `PetTurtle3Bullet3` 范围伤害；`xwaoyi` 是依赖前三技能的 5 秒组合奥义。下一步推荐 `TASK-SLICE-068` 实现 `turtle3/sybh` 水湮八荒范围伤害最小闭环。

## 第一批复现门槛

第一批纵向切片开始前，最低门槛如下：

| 切片 | 需要机制 | 当前状态 | 处理 |
| --- | --- | --- | --- |
| VS-001 双玩家输入验证 | M-008 基础键位、M-009 方向键归属 | 已扒且已复现 | 已完成 |
| VS-002 第一个角色动作索引 | M-017 角色列表、M-023 普攻、M-024 组合键、M-025 技能槽/效果 | 角色列表、组合键、普攻和技能分发已扒；推荐 Role2 | 已完成 |
| VS-003 第一个角色移动切片 | VS-001、VS-002、M-011、M-012、M-013 | 已完成：`HeroMovementSystem.ts` 与 `TestScene.ts` 支持走、跑、双跳和 `ThroughWall` 下穿 | 已完成 |
| VS-004 五角色普攻与特效切片 | VS-003、M-023、M-047、M-035 | 已完成：五角色普攻状态机、攻击窗口和占位特效已接入测试场景；真实资源仍后补 | 已接入 `VS-006` 首批伤害事件 |
| VS-005 第一个怪物受击死亡 | M-030 怪物系统、M-031 第一个怪物 | 已完成：`Monster30` 等价怪物可追踪、受击、死亡并移除 | 已接入 `VS-006` 首批互伤闭环 |
| VS-006 基础伤害闭环 | VS-004、VS-005、M-032、M-033 | 已完成：`DamageEvent`、命中去重、玩家 HP/受击/死亡、`Monster30 hit1` 对玩家造成 `power = 15` 物理伤害 | 已支撑后续 `VS-008` 的技能 projectile 伤害结算 |
| VS-007 第一个关卡闭环 | M-014 通关交互、M-027 地图标记、M-028 第一个关卡 | 已完成：`Monster3System.ts` 实现 boss 行为、`LevelSystem.ts` 实现 arena/传送门/通关、`TestScene.ts` 接入 boss 区完整闭环 | 下一步扩展完整纵向爬升（云层、周期刷怪、停点）或转向 TASK-SLICE-010 技能 UI |
| VS-008 一个技能/子弹 | M-025 角色技能效果、M-034 子弹/技能飞行物、M-015 技能槽输入、M-041 技能学习/绑定 | 已完成首个技能 projectile 扩展：`Role2.sgq -> hit5` 固定特效、`Role2.smb -> hit4_1` 移动弹体和 `hit4_2` 二段占位特效均可用 `DamageEvent` 命中 `Monster30`；正式槽位、MP 门禁和 `smb` 二段重入已接入测试场景 | 下一步 `TASK-SETTINGS-011`：细扒完整技能 UI、学习/拖拽绑定和存档字段，或转向 `VS-007` 关卡闭环前置资源 |

## 更新规则

逆向任务完成后：

- 更新 `逆向状态`。
- 补充 AS3 证据文件和逆向文档链接。
- 如果已足够支持实现，把下一步指向对应 `VS-*` 或 `TASK-ARCH-*`。

实现任务完成后：

- 更新 `复现状态`。
- 补充现代产物文件。
- 同步更新 `docs/tasks/vertical-slices.md`。

如果实现中发现机制没扒清楚：

- 不硬写。
- 把机制逆向状态退回 `部分已扒` 或 `未扒`。
- 在 `下一步` 中写明需要新增的 `TASK-SETTINGS-*`。
