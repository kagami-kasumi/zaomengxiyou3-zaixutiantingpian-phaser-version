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
| M-001 | 提取资料状态 | 已扒 | 不适用 | `extracted_flash/README_extract.md`、`evb-extraction-report.md` | 项目外 `D:\flash-unpacked` 与 `D:\flash-restored-swfs` | EVB 已恢复 206 个文件；175 个 SWF 中 174 个可解析，后续按资源族选择性接入 |
| M-002 | 主参考源码 | 已扒 | 不适用 | `extracted_flash/resources_by_swf/[172845].swf/scripts` | 无 | 遇疑点再看 `extracted_flash/resources_by_swf/[25034429].swf/scripts` |
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
| M-018 | Role1 悟空 | 已扒 | 已复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`Role1.as`、`Role1Shadow.as`、`BaseRoleProperies.as` | `Role1BasicSkillSystem.ts`、`Role1SkillProjectileFactory.ts`、`Role1ShadowSkillSystem.ts`、`Role1FinisherSkillSystem.ts`、`TestSceneRole1SkillBridge.ts`、独立测试 | `slz/sx`、`lys/hytj`、`lyfb/jdy`、`qsez/zz` 与 `hmz/hyjj` 已全部复现；真实角色/技能素材仍按全局资源任务补齐 |
| M-019 | Role2 唐僧 | 已扒 | 已复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`Role2.as`、`Role2Shadow.as` | `HeroNormalAttackSystem.ts`、`HeroSkillSystem.ts`、`Role2PassiveSkillSystem.ts`、`Role2XbzSkillSystem.ts`、`Role2SupportSkillSystem.ts`、`Role2ControlSkillSystem.ts`、`Role2JhsjSkillSystem.ts`、`Role2ShadowSkillSystem.ts` | 普攻、`sgq/smb/xbz`、`blb/sjt`、治疗/护盾、拉拽、多段和分身协同均已复现并有独立测试；真角色资源仍按全局资源任务补齐 |
| M-020 | Role3 八戒 | 已扒 | 已复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`Role3.as`、`BaseHero.as`、`BaseRoleProperies.as` | `Role3DefenseSkillSystem.ts`、`Role3ControlSkillSystem.ts`、`Role3ImpactSkillSystem.ts`、`Role3MobilitySkillSystem.ts`、`Role3UltimateSkillSystem.ts`、`TestSceneRole3SkillBridge.ts` | 九项主动、`rj` 被动、组合入口和完整协同已复现并有独立测试；真角色资源仍按全局资源任务补齐 |
| M-021 | Role4 沙僧 | 已扒 | 已复现 | `role4-combat-index.md`、`roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`Role4.as`、`MonsterRole4Hit5.as`、`BaseAddEffect.as` | `HeroNormalAttackSystem.ts`、`Role4PoisonSkillSystem.ts`、`Role4VoodooDollSystem.ts`、`Role4PoisonChainSystem.ts`、`Role4MobilitySkillSystem.ts`、`Role4FinisherSkillSystem.ts`、Role4 场景桥接与独立测试 | 铲/弓普攻、`zq/jdz/mds` 毒系、`wdww` 娃娃、`mbyj` 毒链、`qlj/tkj/dzj` 位移、`lybj` 标记传送与 `mmw` 双形态终结技均已复现；真实角色/技能素材仍按全局资源任务补齐 |
| M-022 | Role5 白龙 | 已扒 | 已复现 | `role5-combat-index.md`、`roles-index.md`、`Role5.as`、`BLMSkill5.as`、`JRJL.as` | `HeroNormalAttackSystem.ts`、`Role5SkillSystem.ts`、`Role5SkillTuning.ts`、`Role5SkillMath.ts`、`Role5SkillTypes.ts`、Role5 场景桥接、独立测试 | `TASK-SLICE-105..109` 已完成：枪/剑形态默认、普攻族、枪形态能量配置、标记瞬移纯逻辑、枪系主动、状态/组合入口、剑系链式、龙魂剑强化和两套随身箭对象均已复现；真实角色/技能素材仍按全局资源任务补齐 |
| M-023 | 普攻总规则 | 已扒 | 已复现 | `roles-index.md`、`attack-effects-index.md`、`Role*.normalHit()` | `src/systems/HeroNormalAttackSystem.ts`、`src/scenes/TestScene.ts` | 五角色普攻切片已完成；普攻已接入 `DamageEvent` 首批互伤结算 |
| M-024 | 角色组合键 | 已扒 | 已复现 | `roles-index.md`、`skills-input-index.md`、`role5-combat-index.md`、`Role*.myKeyDown()`、`controls-index.md` | `Role1BasicSkillSystem.ts`、`Role2PassiveSkillSystem.ts`、`Role3ImpactSkillSystem.ts`、`Role5SkillSystem.ts`、`HeroNormalAttackSystem.ts` | Role1 普攻+上 `slz`、跑动普攻 `hytj`、Role2 持续普攻蓄力、Role3 普攻+上 `hit8`、Role5 `0101 -> yyb` 均已复现并有系统测试 |
| M-025 | 角色技能效果 | 已扒 | 已复现 | `skills-input-index.md`、`roles-index.md`、`projectiles-index.md`、`role5-combat-index.md`、`Role*.showSkill()`、`Config.allSklName` | `HeroSkillSystem.ts`、`HeroNormalAttackSystem.ts`、`Role1BasicSkillSystem.ts`、`Role1ShadowSkillSystem.ts`、`Role1FinisherSkillSystem.ts`、`Role2*SkillSystem.ts`、`Role3*SkillSystem.ts`、`Role4*SkillSystem.ts`、`Role5SkillSystem.ts`、`ProjectileSystem.ts`、角色场景桥接 | Role1、Role2、Role3、Role4 和 Role5 完整战斗技能均已复现；真实素材与完整动画表现仍按资源任务后置 |
| M-026 | 关卡类命名 | 已扒 | 未复现 | `levels-index.md`、`gameplay-index.md`、`MainGame.newGame()`、`PhysicsWorld.pWorldInit()` | 无 | 资源缺口已确认：`sl11`/`bg11`/`floorBg1` 均不在当前导出；VS-007 采用手工参数 |
| M-027 | 地图标记 | 已扒 | 已复现 | `levels-index.md`、`BaseGameSence.as`、`PhysicsWorld.addSubObj()`、`StopPoint.as`、`MonsterAppearPoint.as` | `src/systems/LevelSystem.ts`（停点系统、刷怪点逻辑、传送门标记） | VS-007 已实现停点系统、刷怪管理和传送门通关闭环 |
| M-028 | 第一个关卡 | 已扒 | 已复现 | `levels-index.md`、`Config.initData()`、`StageListener11.as`、`Monster3.as` | `src/systems/Monster3System.ts`、`src/systems/LevelSystem.ts`、`src/scenes/TestScene.ts` | 已实现完整纵向爬升（镜头跟随、云层视差）、周期刷怪（每 6s 2/4 只 Monster30）、停点系统、Monster3 boss 战斗和传送门通关闭环 |
| M-029 | 世界主循环 | 已扒 | 部分复现 | `runtime-index.md` | `src/scenes/test-scene/TestSceneUpdatePipeline.ts`、`src/core/GameContext.ts` | 已把测试场景 update 调度顺序抽为 pipeline，并建立薄 `GameContext` 查询入口；下一步 `TASK-ARCH-006` 拆碰撞/命中桥接 |
| M-030 | 怪物系统 | 已扒 | 部分复现 | `monsters-index.md`、`BaseMonster.as`、`BaseObject.as`、`BaseBullet.as`、`PhysicsWorld.as`、`MainGame.as` | `src/systems/Monster30System.ts`、`src/systems/Monster3System.ts`、`src/scenes/TestScene.ts` | 已有飞行小怪和地面 boss 两种模式；后续扩展为通用怪物/战斗系统 |
| M-031 | 第一个怪物 | 已扒 | 已复现 | `monsters-index.md`、`Monster30.as`、`StageListener11.as`、`SpecialEffectBullet.as` | `src/systems/Monster30System.ts`、`src/scenes/TestScene.ts` | `Monster30` 首切片已完成；后续在真实角色/关卡中复用 |
| M-032 | 伤害/受击 | 已扒 | 已复现 | `combat-rules-index.md`、`monsters-index.md`、`BaseBullet.as`、`BaseHero.as`、`BaseMonster.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicZLHummer.as`、`Ling.as`、`magic-weapons-index.md` | `src/systems/CombatSystem.ts`、`src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`src/systems/HeroNormalAttackSystem.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`src/systems/MagicWeaponSystem.ts`、`src/systems/ProjectileSystem.ts` | 首批互伤闭环已完成；`Monster30` 已接 `jyhl/MagicFlower` 攻击减益状态，攻击伤害按 `0.925` 派生倍率降低；`mdhf/MagicFlag` 已接玩家护体被打反制，Monster30 debuff 每秒扣最大 HP 2% 并可致死清理；`xhmt/MagicPearl` 已接三段 `fabao-pearl` projectile，占位伤害按玩家 power 和法宝等级派生；`zltc/MagicZLHummer` 已接前方 `fabao-zltc` projectile 伤害和 Monster30 受击反馈；`stlp/Ling` 已接 120 个 `fabao-snow` 落雪 projectile，按 `magic`、击退 `[2,-2]`、`attackInterval = 999` 命中 Monster30；后续 boss/projectile 命中可继续迁移 |
| M-033 | 击退/硬直/保护 | 已扒 | 部分复现 | `combat-rules-index.md`、`BaseObject.setAttackBack()`、`BaseHero.beAttackDoing()`、`BaseObject.setYourFather()`、`magic-weapons-index.md`、`MagicUmbrella.as`、`MagicUmbrella2.as`、`MagicRing.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicBagua.as`、`MagicZLHummer.as`、`Ling.as` | `src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`src/systems/MagicWeaponSystem.ts` | 已有玩家受击短保护、`Monster30 hit1` 击退占位、伞类护盾扣 HP 前吸收、铃铛无敌免伤、`jyhl/MagicFlower` 友方增益状态展示、`mdhf/MagicFlag` 10 秒护体反制状态、`xhmt/MagicPearl` 结束随机 Monster30 眩晕/中毒最小状态、`tjbg/MagicBagua` 全体 Monster30 眩晕最小状态、`zltc/MagicZLHummer` 命中后 4.5 秒 Monster30 眩晕最小状态，以及 `stlp/Ling` 命中后 3 秒 Monster30 `magicSnowIce` 冰冻最小状态；完整受击条、浮空、反弹吸血、命中/闪避系统、通用 AddEffect 和原版硬直校准后置 |
| M-034 | 子弹/技能飞行物 | 已扒 | 部分复现 | `projectiles-index.md`、`role5-combat-index.md`、`BaseBullet.as`、`export/bullet/`、`Role1.as` 至 `Role5.as`、`Role1Shadow.as`、`MagicPearl.as`、`MagicZLHummer.as`、`Ling.as`、`MagicBigBottle.as` | `ProjectileSystem.ts`、`HeroNormalAttackSystem.ts`、`Role1BasicSkillSystem.ts`、`Role1SkillProjectileFactory.ts`、`Role1ShadowSkillSystem.ts`、`Role1FinisherSkillSystem.ts`、`Role2*SkillSystem.ts`、`Role3*SkillSystem.ts`、`Role4*SkillSystem.ts`、`Role5SkillSystem.ts`、`TestScene.ts`、`AssetManifest.ts` | Role1、Role2、Role3、Role4、Role5 的战斗 projectile/特殊对象等价行为已复现；M-034 仍保持“部分复现”仅表示真实素材、完整命中表现和全局通用弹体库未完全补齐 |
| M-035 | 资源加载策略 | 已扒 | 部分复现 | `README_extract.md`、`evb-extraction-report.md`、`modern-architecture.md`、`attack-effects-index.md`、`assets-index.md`、`projectiles-index.md`、`combat-assets-gap-plan.md` | `src/assets/AssetManifest.ts` 的状态化 manifest、Role1 普攻真资源和项目外已恢复源 SWF | 已完成首个 Role1 真资源族；其余角色、技能、怪物和关卡继续选择性接入 |
| M-036 | 装备 | 已扒 | 已复现 | `equipment-index.md`、`magic-weapons-index.md`、`my/AllEquipment.as`、`my/MyEquipObj.as`、`export/pack/BackPack.as`、`export/strength/SutraInterface.as`、`base/BaseRoleProperies.as` | `src/systems/EquipmentSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts` | 最小装备槽位、角色限制、穿戴/卸下、属性预览和 `zbfb` 1→2 级灵魂强化闭环已完成；完整材料阶段、五行重置、真实装备表和存档后置 |
| M-037 | 背包 | 已扒 | 已复现 | `equipment-index.md`、`user/User.as`、`export/pack/BackPackElement.as`、`export/pack/PackThings.as`、`config/Config.as` | `src/systems/InventorySystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/scenes/TestScene.ts` | 分类背包、堆叠数量、种子装备/道具/时装/技能书已完成；掉落拾取已接入最小切片，完整容量/存档后置 |
| M-038 | 掉落 | 已扒 | 已复现 | `drops-index.md`、`BaseMonster.as`、`BaseAura.as`、`my/FallEquipObj.as`、`SmallHP.as`、`BigHP.as`、`SmallMP.as`、`Monster*.as` | `src/systems/DropSystem.ts`、`src/systems/InventorySystem.ts`、`src/scenes/TestScene.ts` | `VS-009` 已覆盖装备/道具掉落拾取、药品即时恢复、红/白 aura 生成吸附、`wpqhs1` 强化石测试掉落入包，以及全 `Monster*.as` 扫描中已确认 `dj/zb` 的现代配置化掉落表；`Monster2001` 的 `cwzb` 已确认为未接通/unsupported 配置，不作为现代掉落类型 |
| M-039 | 合成 | 已扒 | 部分复现 | `crafting-index.md`、`reference/crafting-recipes-1.1.json`、`Fusion.as`、`AllEquipment.mixProduce()`、`getSunSutraValueEquip()`、`getMingDingHuaYanEquip()`、1.0 `crafting-recipes.csv` 辅助索引 | `src/systems/CraftingRecipeRegistry.ts`、`src/systems/CraftingSystem.ts`、`src/scenes/test-scene/TestSceneUIHandlers.ts`、`tools/crafting-tests.ts` | 1.1 的 67 个现代 `direct_static`、41 个默认继承和 4 个特殊继承配方均已复现；三槽 `CraftingSession` 已覆盖装备实例/堆叠单位移入、单槽退回、关闭全退、实时预览、成功清空、失败保留和 P1/P2 隔离；全部路径保留 1000 灵魂、容量预检和失败无副作用；现代版不保存时装生成时间，完整炼丹炉视觉待 `TASK-SETTINGS-044` 先建立资源索引 |
| M-040 | 等级/经验 | 已扒 | 已复现 | `progression-index.md`、`User.as`、`BaseHero.as`、`BaseRoleProperies.as`、`Role1.as` 至 `Role5.as`、`BaseMonster.as`、`TaskInterface.as` | `src/systems/ProgressionSystem.ts`、`src/systems/Monster30System.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`tools/system-tests.ts` | `VS-014` 已完成：`Monster30` 击杀经验、自动升级、扣本级经验、HP/MP 回满、五角色基础属性表、P1/P2 成长隔离和状态栏展示已复现；任务奖励经验、宠物经验、难度倍率、无尽模式经验和存档持久化后置 |
| M-041 | 技能学习/绑定 | 已扒 | 已复现 | `skills-input-index.md`、`User.skillbykey`、`SkillControl.as`、`SkillSetControl.as`、`BuySkill.as`、`PassiveSkillControl.as` | `src/systems/SkillUISystem.ts`、`src/systems/HeroSkillSystem.ts`、`src/scenes/TestScene.ts` | 完整心法树面板（5 角色 × 2 树 × 5 技能）、技能学习（上限 10）、升级（双公式+等级门禁）、键盘绑定交互（五槽分配）、被动技能五槽 UI 已全部实现；后续可接入存档持久化 |
| M-042 | 宠物 | 已扒 | 部分复现 | `pets-index.md`、`BasePet`、`BaseHero.initPet()`、`User.petsAry`、`User.findCurrentPet()`、`User.catchNewPet()`、`PetInfo.as`、`PetInterface.as`、`PackThings.as`、`MagicBottle.as`、`MagicFlower.as`、`Monster70.as` 至 `Monster78.as` | `src/systems/PetSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`tools/system-tests.ts` | 已复现 P1 预置宠物、B 键宠物面板、单只出战/休息、跟随/远距传送、宣花葫芦捕捉、宠物消耗品、`jyhl/MagicFlower` 对出战宠物的增益状态、`VS-015` 宠物经验/升级最小闭环、`VS-016` `monkey1/xj`、`VS-017` `monkey2/lj`、`VS-018` `monkey2/xj`、`VS-019` `monkey3/lyq`、`VS-020` `monkey3/xj`、`VS-021` `monkey3/lj` 和 `VS-022` `monkey4/jgaoyi` 宠物技能最小闭环：P1 可切换出战 `monkey2/monkey3/monkey4`；`monkey2` 持有已学 `lj/xj`，`lj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey2Bullet2` 占位 projectile 并造成 `4.2 * pet.atk` 伤害，`xj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey2Bullet3` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害；`monkey3` 持有已学 `lyq/xj/lj`，`lyq` 满足 MP/冷却/目标和距离 `<= 400` 门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey3Bullet2` / `hit2` 占位 projectile 并造成 `6.8 * pet.atk` 伤害，`xj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，复用 `PetMonkey1Bullet2` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害，`lj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey3Bullet3_2` / `hit4` 占位 projectile 并造成 `4.2 * pet.atk` 伤害；`monkey4` 持有已学 `xj/lj/lyq/jgaoyi`，`jgaoyi` 满足已学习、MP `>= 30`、冷却和目标门禁后扣 30 MP、重置 500ms 冷却，生成 `PetMonkey4Hit5` / `hit5` 占位反馈；AS3 `getRealPower("hit5")` 为 0，本切片固定无直接伤害。`VS-023` 已完成宠物技能存档/面板最小闭环：`PetState.skills` 可字段级编解码为 `sname~sname`，空技能保存为空字符串，未知 key 可安全保留但不会释放；宠物面板展示 8 个技能槽；背包种子新增 `cwjnxld`，当前出战宠物可按等级/种类/形态重算技能并消耗 1 个，道具无出战宠物时不消耗，随机源可注入并由系统测试固定。`TASK-SETTINGS-028` 已补清基础属性被动 `tsml/zrsh/smzf/mfby`、受击反击 `qlfj`、六个自动 buff `sxkb/fsnl/smjc/mfjc/gjjc/fyjc` 的入口、MP、计数器、持续和数值公式，并列出其他宠物形态专属技能仍未复现。`VS-024` 已完成首个基础自动 buff：当前出战宠物已学 `gjjc` 且 MP/计数器满足时自动扣 20 MP，为 P1 主人按 `form * 6 * technique * 1.05` 增加攻击，到期恢复，并在宠物面板展示状态。`VS-025` 已完成 `qlfj` 强力反击：当前出战宠物已学、受击且存活时按可注入随机概率触发，命中对最近 `Monster30` 造成 `pet.atk` 等价物理反击且不消耗 MP。`VS-026` 已完成 `smjc` 生命加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 HP 上限并按比例同步当前 HP，到期恢复。`VS-027` 已完成 `mfjc` 魔法加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 MP 上限并按比例同步当前 MP，到期恢复。`VS-028` 已完成 `fyjc` 防御加成：自动扣 20 MP，给主人按 `form * 5 * technique * 1.05` 增加防御，到期恢复。`VS-029` 已完成 `sxkb` 嗜血狂暴：自动扣 20 MP，按 `form * 0.07 * technique * 0.27 * 1.05` 增加宠物自身暴击加成，到期恢复，重触发计数使用 4320 帧。`VS-030` 已完成 `fsnl` 法术能量：自动扣 20 MP，按 `form * 30 * technique * 1.05` 增加宠物自身技能伤害加值，到期恢复。`VS-031` 已完成 `fsnl` 技能伤害加值接入：已复现宠物主动技能在原倍率伤害上增加 `skillDamageBonus`，`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`VS-032` 已完成 `sxkb` 暴击率接入：已复现宠物主动技能可注入随机源，暴击命中时对包含 `skillDamageBonus` 的技能伤害应用 2 倍最小暴击倍率，暴击未命中和无暴击率时旧伤害不变；`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`TASK-SETTINGS-029` 已扒清马系 `sp/bd/bz/tmaoyi` 专属技能链，`TASK-SLICE-058` 已完成首个马系技能 `horse1/sp`：P1 可切换出战 `horse1`，按已学习、MP、目标距离 `50..100`、2 秒 CD 门禁释放 `PetHorse1Bullet2` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-059` 已完成 `horse2/bd`：P1 可切换出战 `horse2`，主人受击等价触发后按已学习、MP、目标、触发 ready 和 2 秒 CD 门禁释放 `PetHorse2Bullet2` / `hit2` 占位 projectile，伤害接入 `fsnl/sxkb`，释放后清除触发并命中附加 2 秒冰冻；`TASK-SLICE-060` 已完成 `horse3/bz`：P1 可切换出战 `horse3`，按已学习、MP、目标距离 `<= 250`、目标和约 6 秒 CD 门禁释放 `PetHorse3Bullet4` / `hit4` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-061` 已完成 `horse4/tmaoyi`：P1 可切换出战 `horse4`，按已学习、MP、目标和奥义 CD 门禁释放 `PetHorse4Bullet5` 占位 projectile，`sp` 记录追踪目标，`bd` 让首段附加 2.4 秒冰冻并记录 1 秒爆炸延迟，`bz` 生成 `PetHorse4Bullet5Explode` 爆炸段并按 `6.6 * pet.atk + skillDamageBonus` 接入 `fsnl/sxkb` 造成伤害，`tmaoyi` 本体直接伤害保持 0；`TASK-SETTINGS-030` 已补清青龙 `fs/sdcc/ltwj/qlaoyi` 专属技能链，`TASK-SLICE-062` 已完成 `dragon1/fs`：P1 可切换出战 `dragon1`，按已学习、MP 和约 10 秒 CD 门禁释放 10 秒分身占位反馈，直接伤害保持 0；`TASK-SLICE-063` 已完成 `dragon2/sdcc`：P1 可切换出战 `dragon2`，按已学习、MP、目标、距离 `<= 300` 和约 3.6 秒 CD 门禁释放 `PetDragon2Bullet2` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-064` 已完成 `dragon3/ltwj`：P1 可切换出战 `dragon3`，按已学习、MP、目标、距离 `<= 500` 和约 5 秒 CD 门禁释放 4 段 `PetDragon3Bullet3` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-065` 已完成 `dragon4/qlaoyi`：P1 可切换出战 `dragon4`，按已学习、MP `>= 30`、目标、距离 `<= 200` 和约 24 秒 CD 门禁释放 `PetDragonBullet4` / `hit4` 奥义占位 projectile，直接伤害保持 0，并按已学 `fs/sdcc/ltwj` 记录 `fs-clone/sdcc-charge/ltwj-multi` 组合反馈；`TASK-SLICE-070` 已完成 `ufo1/pms` 魔破杀首段；`TASK-SLICE-071` 已完成 `ufo2/ss` 瞬闪第二段；`TASK-SLICE-072` 已完成 `ufo3/kmsk` 狂魔闪空第三段：P1 可切换出战 `ufo3`，按已学 `kmsk`、MP `>= 20`、约 5 秒 CD 和目标门禁释放，先进入约 600ms 上升（`hit4_1`），后生成 `PetKabu3Bullet4` / `hit4` 占位 projectile 于宠物下方 `y + 30`，按 `6 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成下方/范围伤害；UFO/卡布三条技能链（`pms/ss/kmsk`）已全部实现；虎系（`hy/sxhz/hsqj/bhaoyi`）、凤凰系（`np/bshn/dhly/zqaoyi`）、兔系（`yg/jf/bs/ysaoyi`）、鼠系（`sc/hxfb/zsaoyi`）四条专属技能链均已完成最小闭环实现；成长洗练、P2/联机、任务奖励经验、完整全局存档和真实资源后置 |
| M-043 | 法宝 | 已扒 | 部分复现 | `magic-weapons-index.md`、`BaseMagicWeapon.as`、`export/magicWeapon/`、`SutraInterface.as`、`BaseHero.initMagicWeapon()`、`BaseHero.showSkillFaBao()`、`KeyBoardControl.as`、`AllEquipment.as`、`MyEquipObj.as`、`BackPack.as`、`Ling.as`、`MagicBigBottle.as` | `src/systems/MagicWeaponSystem.ts`、`src/systems/PetSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`src/systems/EquipmentSystem.ts`、`src/systems/EquipmentUISystem.ts`、`src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`tools/system-tests.ts` | 已完成完整法宝基础逆向，并补清 `mdhf/MagicFlag` 10 秒护体反制 debuff、`xhmt/MagicPearl` 最近目标多段链/结束随机效果、`tjbg/MagicBagua` 全屏眩晕、`zltc/MagicZLHummer` 前方雷锤、`stlp/Ling` 随机落雪与 `qljfb/MagicBigBottle` 临时墙/船；现代侧已复现 `xhhl` 捕捉入口、`kyl/syl` 治疗、`lxj` 伤害、`fbqpj` 多剑/自动飞剑、`hyzzs/hywjs` 护盾、`zjld` 无敌/回复、`zsTimer` 时间回溯、`lxfb/sxfb/yxfb` 入魔 buff、`jyhl/MagicFlower` 全体友方增益和 Monster30 减益、`mdhf/MagicFlag` 护体反制 debuff、`xhmt/MagicPearl` 多段随机打击和结束随机回蓝/眩晕/中毒、`tjbg/MagicBagua` 全体 Monster30 眩晕、`zltc/MagicZLHummer` 前方雷锤伤害/眩晕、`stlp/Ling` 镜头范围 120 个落雪 projectile/3 秒冰冻、`qljfb/MagicBigBottle` 20 秒临时跟随平台/站立托举，以及 `SutraInterface` 等价最小强化面板：C 打开背包后展示当前 `zbfb` 等级/五行/成长率/主要属性/灵魂消耗，U 消耗测试灵魂完成 1→2 升级并让 `MagicWeaponSystem` 读取新等级；完整材料阶段、五行重置、真实资源、存档和联机同步后置 |
| M-044 | 存档 | 已扒 | 部分复现 | `skills-input-index.md`、`pets-index.md`、`User.getSaveObj()`、`MemoryClass.setStorage()`、`SaveInter.as` | `src/systems/SaveSystem.ts`、`src/scenes/test-scene/TestSceneSaveBridge.ts`、`src/systems/PetSkillSaveSystem.ts`、`tools/system-tests.ts` | 已确认原版 P1/P2 顶层字段、AMF+compress+encrypt 容器和宠物 26 字段格式；`TASK-SLICE-077` 已完成现代 P1 版本化 localStorage 闭环，刷新可恢复角色等级/经验、装备、技能配置/心法/被动，以及宠物列表、出战状态、持久属性和已学技能；冷却与临时 Buff 不持久化。P2、任务/活动、完整背包和桌面多槽文件后置 |
| M-045 | 多人网络 | 暂缓 | 暂缓 | `Config.as` 中 `Client` | 无 | 本地双人优先，网络不进第一批 |
| M-046 | 支付/活动/礼包 | 暂缓 | 暂缓 | `Config.as`、UI | 无 | 非核心复刻，后续按需判断 |
| M-047 | 角色普攻特效资源 | 已扒 | 部分复现 | `attack-effects-index.md`、`assets-index.md`、`combat-assets-gap-plan.md`、`evb-extraction-report.md`、`Role*.normalHit()`、`Role*.doHit*()`、`BaseBitmapDataPool.as` | Role1 `Role1Bullet1/3/4/5` 真资源序列、`src/assets/AssetManifest.ts`、`HeroNormalAttackSystem.ts`、测试场景 | Role1 普攻占位已替换；Role2/3/4/5 仍待选择性接入，白龙枪形态语义缺口保留 |

M-042 当前补充：`TASK-SETTINGS-031` 已补清玄龟 `turtle1..4` 的 `sld/txlj/sybh/xwaoyi` 专属技能链，事实已足够进入实现。`TASK-SLICE-066` 已完成 `turtle1/sld`：P1 可切换出战 `turtle1`，按已学、MP、目标、距离 `50..200` 和约 6 秒 CD 门禁释放 `PetTurtle1Bullet2`，按 `pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成伤害，并按本次实际伤害治疗宠物自身。`TASK-SLICE-067` 已完成 `turtle2/txlj`：P1 可切换出战 `turtle2`，按已学、MP、目标和约 20 秒 CD 门禁添加链接状态；链接期间主人受伤时宠物承受 5% 转嫁伤害、主人承受 95% 伤害，主人治疗和宠物治疗按 `1.05` 倍联动，`sld` 自疗可同步给主人最小治疗反馈。`TASK-SLICE-068` 已完成 `turtle3/sybh`：P1 可切换出战 `turtle3`，按已学、MP、目标和约 5.5 秒 CD 门禁释放 `PetTurtle3Bullet3` 范围 projectile，按 `5.4 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成范围伤害。`TASK-SLICE-069` 已完成 `turtle4/xwaoyi`：P1 可切换出战 `turtle4`，按已学、MP `>= 30`、目标和约 18 秒 CD 门禁释放 5 秒玄武奥义，占位记录免蓝 `sld`、刷新 `txlj` 和持续 `sybh` 范围反馈。下一步推荐 `TASK-SLICE-070` 实现 UFO/卡布首段 `ufo1/pms` 魔破杀最小闭环。

M-042 UFO/卡布补充：`TASK-SETTINGS-032` 已补清 `ufo1..3` / `PetKabu1..3` 的 `pms/ss/kmsk` 专属技能链。`TASK-SLICE-070` 已完成 `ufo1/pms` 首段：P1 可切换出战 `ufo1`，已学 `pms`，消耗 20 MP，约 2 秒 CD，生成 `PetKabu1Bullet2` / `hit2` 占位 projectile，并按 `3.6 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成伤害；`ss` 消耗 20 MP，约 4 秒 CD，瞬移到随机目标背后并接普攻，直接技能伤害为 0；`kmsk` 消耗 20 MP，约 5 秒 CD，先上升再生成 `PetKabu3Bullet4` / `hit4`，按 `6 * atk` 派生伤害。下一步 `TASK-SLICE-071` 实现 `ufo2/ss` 瞬闪最小闭环。

M-042 完成度整改补充：`TASK-SLICE-078` 已补齐涅槃持续减伤与结束回血、朱雀奥义灼烧、月光概率入口、疾风攻速/闪避、月神奥义持续治疗、三枚回旋飞镖、白虎/紫鼠分段奥义，并由 `PetSkillPrioritySystem.ts` 统一虎/凤凰/兔/鼠的 `skill1 -> skill4` 调度顺序。`VS-036` 专属技能链恢复已完成；M-042 仍保持“部分复现”，剩余范围是 P2/联机、任务奖励经验、完整存档和真实资源。

M-042 成长洗练补充：`TASK-SETTINGS-034` 已补清 `cwzzxld` 三属性独立随机洗练、`wphtd` 还童至 1 级/一阶/品质 1 并按物种重建资质与基础属性、`nianjhd` 绕过等级门禁的三阶到四阶进化及奥义槽位边界。`nianqld` 只存在 `potential + 100` 动态调用，当前 `PetInfo` 和 26 字段存档均无该字段/方法，故登记为悬空入口，不猜造数值公式；对应现代闭环已由 `TASK-SLICE-079` 完成。

M-042 成长洗练实现补充：`TASK-SLICE-079` 已新增 `PetGrowthSystem.ts`，复现 `cwzzxld` 独立随机链、`wphtd` 全已知物种还童数值、`nianjhd` 形态/技能槽/基础被动重算和空耗边界，并接入背包、面板、运行时重建及独立系统测试；`nianqld` 因原版证据缺失而明确拒绝且不消耗。后续 `TASK-SETTINGS-035` 已补清 P2 宠物所有权、输入、经验、道具、捕捉与存档边界。

M-016 P2 宠物输入补充：`TASK-SETTINGS-035` 已确认原版 P1 `B` 打开宠物面板，P2 小键盘 `-` 打开 P2 宠物面板，小键盘 `*` 才是 P2 心法面板；现代 `TestSceneSetup.ts` 当前把小键盘 `-` 分给 P2 心法，且宠物面板使用方向键选择，会与 P2 移动输入冲突。后续切片必须修正键位，并采用指针 UI 或不抢占战斗键的等价交互。

M-042 P2 所有权补充：`TASK-SETTINGS-035` 已确认 `player1` / `player2` 各自创建 `User` 和 `petsAry`，两位英雄分别通过自己的 `findCurrentPet()` 创建 `BasePet`，双宠可同时存在；P2 面板、背包宠物道具和宣花葫芦捕捉均沿 player/hero owner 路由到 P2。普通怪物经验依据怪物当前攻击目标分配，任务奖励的第二玩家分支却误查 `player1.findCurrentPet()`，属于原版已知 bug，现代任务系统接入时应按玩家修正而非复刻串号。下一步 `TASK-SLICE-080` 只先建立 P2 独立 roster、面板和跟随实体。

M-044 P2 宠物存档补充：原版顶层分别保存 `player1_obj` / `player2_obj`，每个 `User` 各自持有 `petSave`；读取先恢复两个 User，再创建英雄和出战宠物。原版宠物数组写入与读取方向相反，会在每次读取时反转列表，现代实现不复刻该 UI 顺序 bug。当前现代 V1 schema 仍只有 P1；后续 P2 存档应升级版本，V1 迁移为空 P2 roster，并分别保存两位玩家列表和单只出战约束，排除冷却与临时状态。

M-016/M-042 P2 所有权实现补充：`TASK-SLICE-080` 已新增 `PetOwnershipSystem.ts`，建立对象与宠物 ID 隔离的 P1/P2 roster 和唯一 `PetPanelSession.owner`；P1 `B`、P2 小键盘 `-` 打开各自面板，P2 心法键修正为小键盘 `*`，面板使用指针按钮而不占用方向键。`TestSceneP2PetBridge.ts` 已让 P2 宠物独立跟随 P2、远距传送和休息销毁，双宠可同时存在。下一步 `TASK-SLICE-081` 接入 P2 宠物战斗和普通击杀经验归属。

M-032/M-040/M-042 P2 战斗实现补充：`TASK-SLICE-081` 已让 P1/P2 通过同一显式 owner 宠物调度入口运行全部既有自动 Buff、受击触发和主动技能；P2 projectile 使用带 `p2-` 前缀的宠物 ID，冷却、主人属性、承伤转嫁和伤害来源互不串号。Monster30 普攻、projectile、反击与持续伤害死亡按当前 `targetSlot` 一次性领取经验：目标英雄有宠物为 60%/60%，无宠物为 100%/0，并保留宠物目标 100% 的显式接口。下一步 `TASK-SLICE-082` 接入 P2 道具和捕捉所有权。

M-016/M-037/M-042/M-043 P2 道具与捕捉实现补充：`TASK-SLICE-082` 已建立 P1/P2 独立 inventory、法宝 loadout、强化/捕捉灵魂和 UI owner；P2 小键盘 `/` 打开自己的背包，八类宠物道具只查询并修改 P2 roster，P2 小键盘 `7` 通过共享 owner 适配器触发自己的宣花葫芦。捕捉成功/失败/灵魂不足/满栏与 P1 完全隔离。下一步 `TASK-SLICE-083` 完成双玩家宠物存档 V2 与 V1 迁移。

M-042/M-044 双玩家宠物存档补充：`TASK-SLICE-083` 已将现代存档升级为 V2，分别保存并恢复 P1/P2 宠物列表、选择位置和单只出战状态，V1 自动保留 P1 并迁移为空 P2；冷却、临时 Buff 和场景运行时不持久化。至此宠物领域自身的双玩家面板、跟随、战斗、经验、全已逆向技能链、成长道具、捕捉和存档闭环均已完成；M-042 表格仍保留“部分复现”，只表示任务奖励、商城活动、真实资源和网络等外部/全局集成尚未完成，不再阻塞宠物系统交付。下一块大任务已转向五角色完整战斗扩展，当前执行 `TASK-SLICE-084`。

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


