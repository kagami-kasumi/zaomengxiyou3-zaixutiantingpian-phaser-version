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
| M-001 | 提取资料状态 | 已扒 | 不适用 | `local-resources/regima/legacy-extraction/README_extract.md`、`evb-extraction-report.md` | Git 忽略的 `local-resources/regima/source/unpacked/` 与 `source/restored-swfs/` | RegiMA 已恢复 206 个文件；175 个 SWF 中 174 个可解析；视觉资源优先检索恢复语料库，后续按资源族选择性接入 |
| M-002 | 主参考源码 | 已扒 | 不适用 | `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts` | 无 | 遇疑点再看 `local-resources/regima/legacy-extraction/resources_by_swf/[25034429].swf/scripts` |
| M-003 | 现代目标 | 已扒 | 部分复现 | `AGENTS.md`、`TASK_OUTLINE.md` | 当前文档体系 | 后续任务持续遵守 |
| M-004 | 技术脚手架 | 不适用 | 已复现 | `modern-architecture.md` | `package.json`、`src/`、Vite/Phaser 骨架、`src/scenes/test-scene/TestSceneViews.ts`、`src/scenes/test-scene/TestSceneUpdatePipeline.ts`、`src/core/GameContext.ts` | `TASK-ARCH-003/004/005` 已抽出首批 TestScene 视图工厂、update 调度层和薄查询上下文；下一步 `TASK-ARCH-006` 拆碰撞/命中桥接 |
| M-005 | 主流程 | 已扒 | 已复现 | `gameplay-index.md`、`runtime-index.md`、`save-party-flow-index.md`、`task-settings-175i-party-creation.json` | 启动/活动槽/地图/五个已接入关卡/结果主循环与 `FormalPartyRuntimeSystem.ts` | 新建人数/选角已直接消费 20 对象/30 状态真值；读档分流、地图直接进关、返回/重试/重载和正式 party owner 已闭合，未接入关卡仍按各自内容线推进 |
| M-006 | 单人/双人规则 | 已扒 | 已复现 | `controls-index.md`、`gameplay-index.md`、`save-party-flow-index.md`、`task-settings-175i-party-creation.json` | 当前 schema party、双玩家输入、正式关卡/HUD/功能页 | P1→P2、不同角色、selected/listener 门禁与 marker 已有 verified 真值并进入存档和正式消费者；中途换人、联网明确排除 |
| M-007 | 玩家控制位 | 已扒 | 未复现 | `User.as`、`KeyBoardControl.as` | 无 | 实现 `PlayerSlot` |
| M-008 | 基础键位 | 已扒 | 已复现 | `controls-index.md` | `src/systems/InputSystem.ts`、`src/scenes/TestScene.ts` 双玩家输入验证 | 后续角色控制器读取结构化 input state |
| M-009 | 方向键归属 | 已扒 | 已复现 | `KeyBoardControl.as`、`controls-index.md` | `InputBindings.p2` 独占方向键，`TestScene` 同时显示 P1/P2 状态 | 后续移动切片继续保持方向键只属于 P2 |
| M-010 | `keyarray` 四位 | 已扒 | 未复现 | `BaseHero.as`、`controls-index.md` | 无 | 角色控制器实现时转成结构化 input intent |
| M-011 | 跑步 | 已扒 | 已复现 | `movement-index.md`、`BaseHero.addDoubleCount()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts` | 后续在正式角色控制器中复用并按真素材继续校准手感 |
| M-012 | 跳跃 | 已扒 | 已复现 | `movement-index.md`、`KeyBoardControl.as`、Role1—Role5 `myKeyDown()`、`BaseHero.jump()`、`BaseHero.step()`、`BaseObject.getDownFloor()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts`、`Stage12GameplayBridge.ts` | Stage 1-2 已复用通用重力/落地/二段跳，P1 K 与 P2 小键盘 2 已有专项回归；水中重复跳与白龙特例继续后置 |
| M-013 | 下落平台 | 已扒 | 已复现 | `movement-index.md`、`BaseObject.getFallDown()`、`PhysicsWorld.addSubObj()` | `src/systems/HeroMovementSystem.ts`、`src/scenes/TestScene.ts` | 后续补完整平台库并继续校准特殊平台类型 |
| M-014 | 上/交互/通关 | 已扒 | 已复现 | `levels-index.md`、`level-result-ui-index.md`、`BaseHero.checkTransferDoor()`、`Role*.myKeyDown()`、`MainGame.levelClear()`、`GameWin.as`、`GameFail.as`、2026-07-26/30 用户试玩反馈 | `LevelLifecycleSystem.ts`、`LevelLifecycleBridge.ts`、`LevelResultView.ts`、五关 Flow/scenes | `TASK-ARCH-015` 统一真实 bounds 重叠 + 对应上键、全员判负、幂等解锁与结果终态；`TASK-SLICE-161` 补齐唯一原版 GameWin/GameFail presenter 并删除五关私有黑框，后续关卡必须同时消费生命周期与结果视图 |
| M-015 | 技能槽输入 | 已扒 | 已复现 | `skills-input-index.md`、`BaseHero.sendSkill()`、`KeyBoardControl.as`、`User.returnSkillNameBySkillKey()`、`roles-index.md` | `src/systems/InputSystem.ts`、`src/systems/HeroSkillSystem.ts`、`src/scenes/TestScene.ts` | 现代测试场景已按 0..4 普通技能槽触发，Space/小键盘 0 与 H/小键盘 7 不接普通技能；后续 UI 任务只负责可视化与配置 |
| M-016 | UI 快捷键 | 已扒 | 已复现 | `stage-feature-entry-index.md`、`task-settings-175c-stage-feature-host.json`、`skills-input-index.md`、`pets-index.md`、`KeyBoardControl.as`、`GameInfo.as`、`RoleInfo.as`、`magic-weapons-index.md` | `StageFeatureEntryRouterSystem.ts`、`StageSettingsSystem.ts`、`FormalFeatureUiEntryBridge.ts`、`StageSettingsScene.ts`、现有功能 systems | 574 五真 HUD、371/444 设置/帮助、P1 `C/V/B/N/Esc`、P2 `/ * -` 已有 25 对象/42 状态 verified 真值；176 移除重复常驻层，182 删除地图共享 chrome/跨页/Escape 通用关闭并恢复单页门，按钮 identity/命中/owner 未改 |
| M-017 | 角色列表 | 已扒 | 未复现 | `roles-index.md`、`export/hero/Role1.as` 至 `Role5.as`、`User.getRoleName()` | 无 | 角色动作索引已够支撑选择首个角色，后续实现前先补移动和资源 |
| M-018 | Role1 悟空 | 已扒 | 部分复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`role1-combat-visuals-index.md`、`task-settings-173-role1-shadow.json`、`Role1.as`、`Role1Shadow.as`、`BaseRoleProperies.as` | Role1 技能 systems、`Role1CombatVisualBridge.ts`、`Role1ShadowVisualBridge.ts`、共享 `HeroPartyRuntime`、TestScene 薄适配、独立测试 | 173A 的影分身/正式行为证据保留；2026-08-17 用户报告五角色动作流畅度不一，本角色的帧时序/持帧/clock/解包完整性在 195 审计前不再维持“整体已复现”措辞 |
| M-019 | Role2 唐僧 | 已扒 | 部分复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`role2-combat-visuals-index.md`、`attack-effects-index.md`、`Role2.as`、`Role2Shadow.as` | `HeroNormalAttackSystem.ts`、`HeroNormalAttackGeometry.ts`、Role2 技能 systems、Role2视觉桥 | 163 的 Bullet1/2 空间/命中证据保留；2026-08-17 用户报告五角色动作流畅度不一，本角色的帧时序/持帧/clock/解包完整性待 195 同标准复核 |
| M-020 | Role3 八戒 | 已扒 | 部分复现 | `roles-index.md`、`skills-input-index.md`、`projectiles-index.md`、`role3-combat-visuals-index.md`、`Role3.as`、`BaseAddEffect.as`、`BaseBitmapDataClip.as` | `Role3DefenseSkillSystem.ts`、`Role3ControlSkillSystem.ts`、`Role3ImpactSkillSystem.ts`、`Role3MobilitySkillSystem.ts`、`Role3UltimateSkillSystem.ts`、`Role3CombatVisualSystem.ts`、`Role3CombatVisualBridge.ts` | 技能行为与 069C/158C 视觉证据保留；2026-08-17 用户报告五角色动作流畅度不一，本角色的动作帧时序/转移/加载完整性待 195 复核 |
| M-021 | Role4 沙僧 | 已扒 | 部分复现 | `role4-combat-index.md`、`role4-combat-visuals-index.md`、`attack-effects-index.md`、`Role4.as`、`MonsterRole4Hit5.as`、`BaseAddEffect.as` | `HeroNormalAttackSystem.ts`、`HeroNormalAttackGeometry.ts`、Role4六技能系统与视觉桥 | 163 的 Arrow/Follow 空间证据保留；2026-08-17 用户报告五角色动作流畅度不一，本角色的双形态帧时序/转移/加载完整性待 195 复核 |
| M-022 | Role5 白龙 | 已扒 | 部分复现 | `role5-combat-index.md`、`role5-combat-visuals-index.md`、`attack-effects-index.md`、`Role5.as`、`BLMSkill5.as`、`JRJL.as` | `HeroNormalAttackSystem.ts`、`Role5SkillSystem.ts`、`Role5NormalAttackProjectileSystem.ts`、Role5视觉桥与专项测试 | 164/174 已闭合龙魂剑 hit18..20 三段 EnemyMove 轨迹、真资源、二维命中、共享结算与双 owner；未达遗留对象仍使角色机制保持部分复现 |
| M-023 | 普攻总规则 | 已扒 | 已复现 | `roles-index.md`、`attack-effects-index.md`、`Role*.normalHit()` | `HeroNormalAttackSystem.ts`、`HeroNormalAttackGeometry.ts`、`Role5NormalAttackProjectileSystem.ts`、共享Hero Runtime与TestScene | 163/164已闭合Follow、固定world effect、moving-projectile与corpus-negative分类；五角色现有J行为缺口清零 |
| M-024 | 角色组合键 | 已扒 | 已复现 | `roles-index.md`、`skills-input-index.md`、`role5-combat-index.md`、`Role*.myKeyDown()`、`controls-index.md` | `Role1BasicSkillSystem.ts`、`Role2PassiveSkillSystem.ts`、`Role3ImpactSkillSystem.ts`、`Role5SkillSystem.ts`、`HeroNormalAttackSystem.ts` | Role1 普攻+上 `slz`、跑动普攻 `hytj`、Role2 持续普攻蓄力、Role3 普攻+上 `hit8`、Role5 `0101 -> yyb` 均已复现并有系统测试 |
| M-025 | 角色技能效果 | 已扒 | 已复现 | `skills-input-index.md`、`roles-index.md`、`projectiles-index.md`、`role5-combat-index.md`、`Role*.showSkill()`、`Config.allSklName` | `HeroSkillSystem.ts`、`HeroNormalAttackSystem.ts`、`Role1BasicSkillSystem.ts`、`Role1ShadowSkillSystem.ts`、`Role1FinisherSkillSystem.ts`、`Role2*SkillSystem.ts`、`Role3*SkillSystem.ts`、`Role4*SkillSystem.ts`、`Role5SkillSystem.ts`、`ProjectileSystem.ts`、角色场景桥接 | Role1、Role2、Role3、Role4 和 Role5 完整战斗技能均已复现；真实素材与完整动画表现仍按资源任务后置 |
| M-026 | 关卡类命名 | 已扒 | 已复现 | `levels-index.md`、`gameplay-index.md`、`MainGame.newGame()`、`PhysicsWorld.pWorldInit()`、`PhysicsWorld.addSubObj()`、`BaseHero.checkTransferDoor()`、RegiMA 五关 SWF 与 `assets/1.swf` / `2.swf` | `PlayableLevelRuntime.ts`、五关 `PlayableLevelDefinition`、`TransferDoorView.ts`、`LevelLifecycleSystem.ts`、`LevelResultView.ts`、窄 adapters 与未来模板 | 016A..D 已迁移五关；1-1 使用自身 character 45/41/44 二十帧门，删除 1-3 门借用；PG-013 等首个新关卡观察样本后关闭 |
| M-027 | 地图标记 | 已扒 | 部分复现 | `levels-index.md`、`BaseGameSence.as`、`PhysicsWorld.addSubObj()`、`StopPoint.as`、`MonsterAppearPoint.as`、`ViewControllor.as`、`BaseHero.as`、恢复 `sl12/sl13/sl21/sl22.as` | `src/systems/LevelSystem.ts`、Stage 1 layout/traversal systems、`Stage21Layout.ts`、`Stage21TraversalSystem.ts`、`Stage22Layout.ts`、`Stage22TraversalSystem.ts`、`Stage22FlowSystem.ts` | Stage 2-2 的 3+1 墙、3 单向平台、5 停点、25 刷怪点、9 火焰、左右边界、五批放行与 940×590 全程运行验收已闭合 |
| M-028 | 第一个关卡 | 已扒 | 已复现 | `levels-index.md`、`Config.initData()`、`StageListener11.as`、`Monster3.as`、`BaseHero.as`、`GameWin.as`、`GameFail.as`、用户 2026-07-23/26 试玩反馈 | `Monster3System.ts`、`LevelLifecycleSystem.ts`、`Stage11FlowSystem.ts`、`Stage11EntryScene.ts`、Stage11 bridges | 既有 Boss、镜头和真门回归保持；`TASK-ARCH-015` 删除 1-1 私有坐标完成路径，改用五关共享的门 bounds + P1 W / P2 上键生命周期协议 |
| M-029 | 世界主循环 | 已扒 | 部分复现 | `runtime-index.md`、五关 Scene/World/Gameplay/Flow、PG-013 | `PlayableLevelRuntime.ts`、`TestSceneStage11RuntimeAdapter.ts`、`TestSceneUpdatePipeline.ts`、`GameContext.ts`、`playable-level-runtime.md`、关卡 adapters | 五关初始化、队伍/玩家、镜头/HUD、结果/保存/路由和销毁已收进公共 Runtime；专属遭遇/机关仍为窄 adapter。整体仍部分复现，因为原版更广泛世界活动/联机主循环不在当前范围 |
| M-030 | 怪物系统 | 已扒 | 部分复现 | `monsters-index.md`、`levels-index.md`、`stage1-monster-visuals-index.md`、`stage21-monster-visuals-index.md`、`BaseMonster.as`、`BaseObject.as`、`BaseBullet.as`、`PhysicsWorld.as`、`MainGame.as`、`Monster2/3/4/5/6/7/8/9/10/16/19/30.as` | `MonsterPhysicsSystem.ts`、`MonsterDefeatRewardSystem.ts`、Stage 1/2 visual systems 与 bridges、五关正式 scenes | 五关实际怪物真视觉保持；通用架构仍待 010A/B，且复评确认 Registry spawn 写死 grounded/100、正式 configured item 未传递、Monster4/5/6 已证掉落缺表，分别并入 010A/B 与 010C |
| M-031 | 第一个怪物 | 已扒 | 已复现 | `monsters-index.md`、`Monster30.as`、`StageListener11.as`、`SpecialEffectBullet.as` | `src/systems/Monster30System.ts`、`src/scenes/TestScene.ts` | `Monster30` 首切片已完成；后续在真实角色/关卡中复用 |
| M-032 | 伤害/受击 | 已扒 | 部分复现 | `combat-rules-index.md`、`monsters-index.md`、`BaseBullet.as`、`BaseHero.as`、`BaseMonster.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicZLHummer.as`、`Ling.as`、`magic-weapons-index.md` | `src/systems/CombatSystem.ts`、`src/systems/CombatFeedbackSystem.ts`、`src/systems/HeroCombatSystem.ts`、`src/systems/Stage1CombatSystem.ts`、`src/systems/HeroNormalAttackSystem.ts`、`src/systems/PetMonkeyCombatSystem.ts`、`src/systems/PetHorseCombatSystem.ts`、`src/systems/MagicWeaponSystem.ts`、`src/systems/ProjectileSystem.ts`、五关怪物 visual systems | 英雄、猴系和马系已通过共享结算形成实际 HP decrease、lastHitBy、source-agnostic hurt/dead 及统一命中反馈；212 让成功 `DamageEvent` 产出原版普通/暴击数字与共享连击。全局仍为部分复现，因为其余七个宠物家族尚未按完整合同闭合 |
| M-033 | 击退/硬直/保护 | 已扒 | 部分复现 | `combat-rules-index.md`、`BaseObject.setAttackBack()`、`BaseHero.beAttackDoing()`、`BaseObject.setYourFather()`、`magic-weapons-index.md`、`MagicUmbrella.as`、`MagicUmbrella2.as`、`MagicRing.as`、`MagicFlower.as`、`MagicFlag.as`、`MagicPearl.as`、`MagicBagua.as`、`MagicZLHummer.as`、`Ling.as` | `src/systems/HeroCombatSystem.ts`、`src/systems/Monster30System.ts`、`src/scenes/TestScene.ts`、`src/scenes/test-scene/TestSceneCombatBridge.ts`、`src/systems/MagicWeaponSystem.ts` | 已有玩家受击短保护、`Monster30 hit1` 击退占位、伞类护盾扣 HP 前吸收、铃铛无敌免伤、`jyhl/MagicFlower` 友方增益状态展示、`mdhf/MagicFlag` 10 秒护体反制状态、`xhmt/MagicPearl` 结束随机 Monster30 眩晕/中毒最小状态、`tjbg/MagicBagua` 全体 Monster30 眩晕最小状态、`zltc/MagicZLHummer` 命中后 4.5 秒 Monster30 眩晕最小状态，以及 `stlp/Ling` 命中后 3 秒 Monster30 `magicSnowIce` 冰冻最小状态；完整受击条、浮空、反弹吸血、命中/闪避系统、通用 AddEffect 和原版硬直校准后置 |
| M-034 | 子弹/技能飞行物 | 已扒 | 部分复现 | `projectiles-index.md`、五角色战斗视觉索引、Stage 1/2怪物视觉索引、`BaseBullet.as`、`export/bullet/`、`Role1.as` 至 `Role5.as` | `ProjectileSystem.ts`、角色技能 systems、五角色/Stage 1/2 visual systems 与 bridges、`AssetManifest.ts` | 173A 已闭合 Role1Shadow 正式派生/结算/销毁；174 已让 Role5 移动普攻恢复二维命中并委托共享英雄命中结算。未达遗留对象、宠物和后续关卡仍使全局状态为部分复现 |
| M-035 | 资源加载策略 | 已扒 | 部分复现 | `README_extract.md`、`evb-extraction-report.md`、`modern-architecture.md`、`assets-index.md`、`projectiles-index.md`、`levels-index.md`、`level-result-ui-index.md`、`stage1-monster-visuals-index.md`、`stage21-monster-visuals-index.md`、`equipment-visual-resource-catalog.md`、资源标注批次、`PG-009` | `AssetManifest.ts` provenance、`SceneAssetBundles.ts` 唯一 owner、`AssetBundleCoordinator.ts`、`SceneAssetBundleBridge.ts`、`EquipmentPreviewAssets.ts`、场景路由与负向门禁 | 图片 bundle/按当前装备加载保持闭合；复评确认 JS 仍静态包含全部场景和全量目录，发布前由 177A/177B 固化预算、场景/vendor 拆包与运行时瘦目录；不含纹理淘汰或图片转码 |
| M-036 | 装备 | 已扒 | 部分复现 | `equipment-index.md`、`equipment-data-catalog.md`、`reference/equipment-data-catalog-1.1.json`、`equipment-visual-resource-catalog.md`、`reference/equipment-visual-resource-catalog-1.1.json`、`evidence/TASK-SETTINGS-170B1-equipment-page.md`、`evidence/TASK-SETTINGS-189-equipment-tooltip.md`、`task-settings-170b1-equipment-page.json`、`task-settings-189-equipment-tooltip.json`、`equipment-workshop-index.md`、`workshop-rules-completeness-audit.md`、`magic-weapons-index.md` 与 1.1 装备/背包/角色消费者 | `EquipmentCatalog.ts`、`EquipmentTooltipSystem.ts`、`EquipmentTooltipView.ts`、`EquipmentPreviewSystem.ts`、`EquipmentPageTruthSystem.ts`、`EquipmentPageQaFixtureSystem.ts`、`EquipmentSystem.ts`、正式背包/工坊/法宝页面、`Stage1CombatSystem.ts` | 190A/B1..B4 已闭合正式背包、强化、合成、分解、打造的全部原版装备 hover 消费者；各页直接使用当前实例与 verified 命中几何，非装备槽排除。商城 49 项零装备且时装禁用 hover，VS-066 已完成；装备机制其余范围仍按各自切片推进 |
| M-037 | 背包 | 已扒 | 已复现 | `inventory-resource-catalog.md`、`reference/inventory-resource-catalog-1.1.json`、`evidence/TASK-SETTINGS-165B-backpack-review.md`、`equipment-index.md`、`user/User.as`、`export/pack/BackPackElement.as`、`export/pack/PackThings.as`、`config/Config.as` | `InventoryResourceCatalog.ts`、`InventorySystem.ts`、`FormalInventoryPageSystem.ts`、`InventoryGridProjection.ts`、`InventoryGridView.ts`、正式背包/工坊 view | 431 身份、428 真图标、3 原版缺陷排除、事务、P1/P2 与 V6 保持；166D/165D 闭合两宿主的同一四分类、25 格、五页与直接暂存投影；190C 又统一原生三态按钮、完整 `n/5` 和 pointer 生命周期，各页仅保留 verified 宿主几何 |
| M-038 | 掉落 | 已扒 | 已复现 | `drops-index.md`、`BaseMonster.as`、`BaseAura.as`、`RoleInfo.addWarriors()`、`FallEquipObj.as`、药品类、恢复 `Common1/OtherMat1.swf` | `MonsterDefeatRewardSystem.ts`、`DropSystem.ts`、`Stage1RewardBridge.ts`、Stage 1 三关 bridges | Stage 1 三关死亡统一结算生命/魔法拾取、灵魂追踪、战意副收益、直接经验和配置化物品；5 个正式拾取资源已接入，颜色只留在资源映射；`cwzb` 继续 unsupported |
| M-039 | 合成 | 已扒 | 已复现 | `crafting-index.md`、`crafting-ui-index.md`、`equipment-workshop-index.md`、`workshop-rules-completeness-audit.md`、`evidence/TASK-SETTINGS-167-workshop-left-pages.md`、四份 `task-settings-167-workshop-*.json`、`reference/crafting-recipes-1.1.json`、`Fusion.as`、`Making.as`、`AllEquipment.as` | `CraftingRecipeRegistry.ts`、`CraftingItemDefinitionRegistry.ts`、`CraftingSystem.ts`、`EquipmentMakingRegistry.ts`、`EquipmentMakingSystem.ts`、正式工坊页面与专项 | 171/171A 的 121 Fusion、78 打造、材料、事务与 UI 保持；171B 将经书继承值改为实例 `baseStatsOverride`，178 保留其当前 schema 两次保存和双 owner 回归，不再兼容旧档 |
| M-040 | 等级/经验 | 已扒 | 已复现 | `progression-index.md`、`reference/hero-progression-catalog-1.1.json`、`reference/hero-progression-catalog.schema.json`、`User.as`、`BaseHero.as`、`BaseRoleProperies.as`、`Role1.as` 至 `Role5.as`、`BaseMonster.as`、`TaskInterface.as` | `ProgressionSystem.ts`、`Stage1CombatSystem.ts`、`HeroPartyRuntimeSystem.ts`、`Stage1RewardBridge.ts`、`SaveSystem.ts`、`hero-progression-runtime-tests.ts` | 172 的 5×90 目录已由 179 直接消费；Role5 `int`、7 转换向量、89/90 sentinel、正式五关普通怪明确 owner、装备派生回满、P1/P2 HUD 与当前 V7 往返均闭合；任务奖励旁路、宠物成长、Monster111/无尽和升级特效仍按证据合同排除 |
| M-041 | 技能学习/绑定 | 已扒 | 已复现 | `skills-input-index.md`、`skill-ui-native-index.md`、`evidence/TASK-SETTINGS-175D-skill-pages.md`、`task-settings-175d-skill-pages.json`、`User.skillbykey`、`SkillControl.as`、`SkillSetControl.as`、`BuySkill.as`、`PassiveSkillControl.as` | `SkillUISystem.ts`、`FormalSkillPageSystem.ts`、`FormalSkillPageView.ts`、`FormalSkillRuntimeBridge.ts` | 技能学习/绑定规则和 175D/183 技能功能页的 250 对象/32 状态真值直接消费已闭合；2026-08-17 用户反证针对独立的战斗技能 HUD，该缺口由 M-049/M-052 与 197..199 承担，不回退技能功能页事实 |
| M-042 | 宠物 | 已扒 | 部分复现 | `pets-index.md`、`BasePet`、`BaseHero.initPet()`、`User.petsAry`、`User.findCurrentPet()`、`User.catchNewPet()`、`PetInfo.as`、`PetInterface.as`、`PackThings.as`、`MagicBottle.as`、`MagicFlower.as`、`Monster70.as` 至 `Monster78.as` | `src/systems/PetSystem.ts`、`src/systems/ProjectileSystem.ts`、`src/scenes/TestScene.ts`、`tools/system-tests.ts` | 已复现 P1 预置宠物、B 键宠物面板、单只出战/休息、跟随/远距传送、宣花葫芦捕捉、宠物消耗品、`jyhl/MagicFlower` 对出战宠物的增益状态、`VS-015` 宠物经验/升级最小闭环、`VS-016` `monkey1/xj`、`VS-017` `monkey2/lj`、`VS-018` `monkey2/xj`、`VS-019` `monkey3/lyq`、`VS-020` `monkey3/xj`、`VS-021` `monkey3/lj` 和 `VS-022` `monkey4/jgaoyi` 宠物技能最小闭环：P1 可切换出战 `monkey2/monkey3/monkey4`；`monkey2` 持有已学 `lj/xj`，`lj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey2Bullet2` 占位 projectile 并造成 `4.2 * pet.atk` 伤害，`xj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey2Bullet3` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害；`monkey3` 持有已学 `lyq/xj/lj`，`lyq` 满足 MP/冷却/目标和距离 `<= 400` 门禁后扣 20 MP、重置 500ms 冷却，生成 `PetMonkey3Bullet2` / `hit2` 占位 projectile 并造成 `6.8 * pet.atk` 伤害，`xj` 满足 MP/冷却/目标门禁后扣 20 MP、重置 500ms 冷却，复用 `PetMonkey1Bullet2` / `hit3` 占位 projectile 并造成 `2.6 * pet.atk` 伤害，`lj` 在等价受击触发、MP/冷却/目标门禁满足后扣 20 MP、重置触发和 500ms 冷却，生成 `PetMonkey3Bullet3_2` / `hit4` 占位 projectile 并造成 `4.2 * pet.atk` 伤害；`monkey4` 持有已学 `xj/lj/lyq/jgaoyi`，`jgaoyi` 满足已学习、MP `>= 30`、冷却和目标门禁后扣 30 MP、重置 500ms 冷却，生成 `PetMonkey4Hit5` / `hit5` 占位反馈；AS3 `getRealPower("hit5")` 为 0，本切片固定无直接伤害。`VS-023` 已完成宠物技能存档/面板最小闭环：`PetState.skills` 可字段级编解码为 `sname~sname`，空技能保存为空字符串，未知 key 可安全保留但不会释放；宠物面板展示 8 个技能槽；背包种子新增 `cwjnxld`，当前出战宠物可按等级/种类/形态重算技能并消耗 1 个，道具无出战宠物时不消耗，随机源可注入并由系统测试固定。`TASK-SETTINGS-028` 已补清基础属性被动 `tsml/zrsh/smzf/mfby`、受击反击 `qlfj`、六个自动 buff `sxkb/fsnl/smjc/mfjc/gjjc/fyjc` 的入口、MP、计数器、持续和数值公式，并列出其他宠物形态专属技能仍未复现。`VS-024` 已完成首个基础自动 buff：当前出战宠物已学 `gjjc` 且 MP/计数器满足时自动扣 20 MP，为 P1 主人按 `form * 6 * technique * 1.05` 增加攻击，到期恢复，并在宠物面板展示状态。`VS-025` 已完成 `qlfj` 强力反击：当前出战宠物已学、受击且存活时按可注入随机概率触发，命中对最近 `Monster30` 造成 `pet.atk` 等价物理反击且不消耗 MP。`VS-026` 已完成 `smjc` 生命加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 HP 上限并按比例同步当前 HP，到期恢复。`VS-027` 已完成 `mfjc` 魔法加成：自动扣 20 MP，给主人按 `form * 70 * technique * 1.05` 增加 MP 上限并按比例同步当前 MP，到期恢复。`VS-028` 已完成 `fyjc` 防御加成：自动扣 20 MP，给主人按 `form * 5 * technique * 1.05` 增加防御，到期恢复。`VS-029` 已完成 `sxkb` 嗜血狂暴：自动扣 20 MP，按 `form * 0.07 * technique * 0.27 * 1.05` 增加宠物自身暴击加成，到期恢复，重触发计数使用 4320 帧。`VS-030` 已完成 `fsnl` 法术能量：自动扣 20 MP，按 `form * 30 * technique * 1.05` 增加宠物自身技能伤害加值，到期恢复。`VS-031` 已完成 `fsnl` 技能伤害加值接入：已复现宠物主动技能在原倍率伤害上增加 `skillDamageBonus`，`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`VS-032` 已完成 `sxkb` 暴击率接入：已复现宠物主动技能可注入随机源，暴击命中时对包含 `skillDamageBonus` 的技能伤害应用 2 倍最小暴击倍率，暴击未命中和无暴击率时旧伤害不变；`qlfj` 与 `jgaoyi/hit5` 边界保持不变。`TASK-SETTINGS-029` 已扒清马系 `sp/bd/bz/tmaoyi` 专属技能链，`TASK-SLICE-058` 已完成首个马系技能 `horse1/sp`：P1 可切换出战 `horse1`，按已学习、MP、目标距离 `50..100`、2 秒 CD 门禁释放 `PetHorse1Bullet2` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-059` 已完成 `horse2/bd`：P1 可切换出战 `horse2`，主人受击等价触发后按已学习、MP、目标、触发 ready 和 2 秒 CD 门禁释放 `PetHorse2Bullet2` / `hit2` 占位 projectile，伤害接入 `fsnl/sxkb`，释放后清除触发并命中附加 2 秒冰冻；`TASK-SLICE-060` 已完成 `horse3/bz`：P1 可切换出战 `horse3`，按已学习、MP、目标距离 `<= 250`、目标和约 6 秒 CD 门禁释放 `PetHorse3Bullet4` / `hit4` 占位 projectile，伤害接入 `fsnl/sxkb` 并命中附加 2 秒冰冻；`TASK-SLICE-061` 已完成 `horse4/tmaoyi`：P1 可切换出战 `horse4`，按已学习、MP、目标和奥义 CD 门禁释放 `PetHorse4Bullet5` 占位 projectile，`sp` 记录追踪目标，`bd` 让首段附加 2.4 秒冰冻并记录 1 秒爆炸延迟，`bz` 生成 `PetHorse4Bullet5Explode` 爆炸段并按 `6.6 * pet.atk + skillDamageBonus` 接入 `fsnl/sxkb` 造成伤害，`tmaoyi` 本体直接伤害保持 0；`TASK-SETTINGS-030` 已补清青龙 `fs/sdcc/ltwj/qlaoyi` 专属技能链，`TASK-SLICE-062` 已完成 `dragon1/fs`：P1 可切换出战 `dragon1`，按已学习、MP 和约 10 秒 CD 门禁释放 10 秒分身占位反馈，直接伤害保持 0；`TASK-SLICE-063` 已完成 `dragon2/sdcc`：P1 可切换出战 `dragon2`，按已学习、MP、目标、距离 `<= 300` 和约 3.6 秒 CD 门禁释放 `PetDragon2Bullet2` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-064` 已完成 `dragon3/ltwj`：P1 可切换出战 `dragon3`，按已学习、MP、目标、距离 `<= 500` 和约 5 秒 CD 门禁释放 4 段 `PetDragon3Bullet3` 占位 projectile，接入混合伤害、`fsnl/sxkb` 和命中治疗记录；`TASK-SLICE-065` 已完成 `dragon4/qlaoyi`：P1 可切换出战 `dragon4`，按已学习、MP `>= 30`、目标、距离 `<= 200` 和约 24 秒 CD 门禁释放 `PetDragonBullet4` / `hit4` 奥义占位 projectile，直接伤害保持 0，并按已学 `fs/sdcc/ltwj` 记录 `fs-clone/sdcc-charge/ltwj-multi` 组合反馈；`TASK-SLICE-070` 已完成 `ufo1/pms` 魔破杀首段；`TASK-SLICE-071` 已完成 `ufo2/ss` 瞬闪第二段；`TASK-SLICE-072` 已完成 `ufo3/kmsk` 狂魔闪空第三段：P1 可切换出战 `ufo3`，按已学 `kmsk`、MP `>= 20`、约 5 秒 CD 和目标门禁释放，先进入约 600ms 上升（`hit4_1`），后生成 `PetKabu3Bullet4` / `hit4` 占位 projectile 于宠物下方 `y + 30`，按 `6 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成下方/范围伤害；UFO/卡布三条技能链（`pms/ss/kmsk`）已全部实现；虎系（`hy/sxhz/hsqj/bhaoyi`）、凤凰系（`np/bshn/dhly/zqaoyi`）、兔系（`yg/jf/bs/ysaoyi`）、鼠系（`sc/hxfb/zsaoyi`）四条专属技能链均已完成最小闭环实现；成长洗练、P2/联机、任务奖励经验、完整全局存档和真实资源后置 |
| M-043 | 法宝 | 已扒 | 部分复现 | `magic-weapons-index.md`、`BaseMagicWeapon.as`、`export/magicWeapon/`、`SutraInterface.as`、`BaseHero.initMagicWeapon()`、`BaseHero.showSkillFaBao()`、`KeyBoardControl.as`、`AllEquipment.as`、`MyEquipObj.as`、`BackPack.as`、`Ling.as`、`MagicBigBottle.as` | `MagicWeaponSystem.ts`、`FormalMagicWeaponPageSystem.ts`、`FormalMagicWeaponPageView.ts`、projectile/pet/combat systems、V4 与专项测试 | 已复现现有法宝战斗技能族，以及 596 真 `SutraInterface` 等价页：P1 N/正式导航、未装备拒绝、等级/成长/五行/属性、常规灵魂与龙女眼泪、`zsTimer`/神器/`fbqpj` 特殊材料分支、提交/取消、3 个传承法器重置、关闭重算和 V4 round-trip；原版没有 P2 面板快捷键，现代明确不伪造。M-043 仍为“部分复现”只因法宝战斗真素材、联机/活动等外部范围后置，不再代表强化页缺失 |
| M-044 | 存档 | 已扒 | 部分复现 | `save-slots-index.md`、`save-party-flow-index.md`、`skills-input-index.md`、`pets-index.md`、`levels-index.md`、`level-result-ui-index.md`、`inventory-resource-catalog.md`、`User.getSaveObj()`、`MemoryClass.setStorage()`、`MainGame.levelClear()`、`GameWin.nextClick()` | `SaveSystem.ts`、`PartyConfigurationSystem.ts`、`SaveSlotSystem.ts`、`FormalPartyRuntimeSystem.ts`、`PlayerSoulSystem.ts`、`LevelResultView.ts`、`pre-stage23-save-journey-tests.ts`、`save-schema-tests.ts`、`hero-progression-runtime-tests.ts` | 178 的唯一当前 schema 保持；179 又闭合 `heroId/level/currentExp` 双 owner 的正式关卡恢复/奖励写回、装备派生和坏类型拒绝。M-044 只因未进入当前线明确排除的更广泛原版存档域而保持部分复现 |
| M-045 | 多人网络 | 暂缓 | 暂缓 | `Config.as` 中 `Client` | 无 | 本地双人优先，网络不进第一批 |
| M-046 | 支付/活动/礼包 | 暂缓 | 暂缓 | `Config.as`、UI | 无 | 非核心复刻，后续按需判断 |
| M-047 | 角色普攻特效资源 | 已扒 | 部分复现 | `attack-effects-index.md`、`hero-combat-visuals-index.md`、五角色战斗视觉索引、`Role*.normalHit()`、`Role*.doHit*()`、`BaseBitmapDataPool.as` | 五角色真资源序列、对应 CombatVisualBridge、`HeroNormalAttackSystem.ts` | 旧普攻资源身份/空间证据保留；2026-08-17 用户报告跨角色动作流畅度不一，在 195 对帧数/帧时序/持帧/clock/加载完整性同标准复核前不再宣称五角色普攻动画整体已复现 |
| M-048 | 战斗可读性与通关校准 | 已扒 | 已复现 | `stage1-combat-calibration.md`、`combat-rules-index.md`、`progression-index.md`、`attack-effects-index.md`、Stage 1 怪物/角色 AS3、恢复语料窄查、用户 2026-07-21/23 试玩反馈 | `Stage1CombatSystem.ts`、`HeroCombatSystem.ts`、`HeroNormalAttackSystem.ts`、Stage 1 三关 bridge、`stage1-combat-tests.ts`、`stage11-browser-audit.mjs` | 三关共享战斗合同保持；1-1 高层触发 Boss 不再要求清空小怪，避免玩家已到顶层仍被旧波次门禁阻塞；原版 W 门继续承担通关提示 |
| M-049 | 正式战斗 HUD | 已扒 | 部分复现 | `combat-hud-index.md`、五角色战斗视觉索引、`Stage1CombatHudSystem.ts`、`Stage1CombatHudBridge.ts`、恢复 `OtherMat1/bossblood.swf` | Stage 1 三关共享 snapshot/bridge；P1/P2 独立成长与技能状态；Role1..Role5使用character 505 frame1..5头像；Boss即时/0.8s追赶条 | HP/MP/经验/头像/Boss 条证据保留；2026-08-17 用户在正式战斗 UI 中未看到角色技能，旧“五槽已运行闭合”结论降级，由 197..199 重建独立战斗技能 HUD 真值和正式可见联动 |
| M-050 | 启动与存档槽流程 | 已扒 | 已复现 | `save-slots-index.md`、`save-party-flow-index.md`、`task-settings-175i-party-creation.json`、`GameMenu.as`、`SelectRole.as`、`OtherMat1.swf` 1149/901、`Common1.swf` 69/18 | `PartyConfigurationSystem.ts`、`SaveProfileDraftSystem.ts`、`SaveSlotSystem.ts`、`SaveSlotScene.ts`、`SavePartyCreationTruth/View.ts`、`SaveSystem.ts` | 六槽、当前单 schema、原子建槽、1P/2P 与取消/重载闭合；187 已让 view 直接消费 20 对象/30 状态真值并删除手写坐标/命中源 |
| M-051 | 天庭地图选关 | 已扒 | 已复现 | `heaven-map-index.md`、`SelectPLace.as`、`MapMenu.as`、`GMain.as`、`MainGame.as`、`GameWin.as`、`GameFail.as`、`OtherMat1.swf` 1343/963/1311/1297/1304/1290、用户 2026-07-23/24 试玩反馈 | `HeavenMapSystem.ts`、`HeavenMapScene.ts`、`FormalPartyRuntimeSystem.ts`、正式结果/退出桥、专项与视觉证据 | 四节点状态、单调进度、活动槽 party 直接进关、往返/重试/重载已完成；现代逐关人数 chooser 已删除且有静态防回流门禁 |
| M-052 | 完整功能 UI | 已扒 | 部分复现 | `full-function-ui-index.md`、175A..I verified manifests、`evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md`、既有 verified 工坊/装备 manifests | `StageFeatureEntryRouterSystem.ts`、`StageSettingsSystem.ts`、`FormalFeatureUiEntryBridge.ts`、正式功能页 systems/views、`FormalImmortalityPageTruth.ts` | 175A..I/180..188 的单页真值/投影证据保留；2026-08-17 用户正式复验反证装备 hover、宠物 UI 可见性/动画和战斗技能 HUD，故整体交付降级，由 `LINE-PRE-STAGE-2-3-PRESENTATION` 重新闭合 |
| M-053 | 怪物命中可见反馈与连击 | 已扒 | 已复现 | `BaseMonster.as`、`CureHpQueue.as`、`GameInfo.as`、`Batter.as`、恢复 `OtherMat1.swf` 的 `hurtnum0..9`/`bnum0..9`/`num0..9`/`export.Batter`、`combat-hit-feedback-index.md` | `src/systems/CombatFeedbackSystem.ts`、`src/scenes/CombatFeedbackView.ts`、`src/scenes/CombatFeedbackQaBridge.ts`、`Stage1CombatSystem.ts`、TestScene 共享命中桥、五关正式 Runtime 与结果页 | 211 的 23 状态/53 对象 verified 真值已被直接消费；只有唯一实际 HP decrease 产生普通/暴击数字，Role/宠物/法宝共享 P1/P2 连击与最高值，effect 只显示数字，miss/0/dedup/dead 无假反馈。专项、source trace、结果页与 940×590 双人正式验收通过 |
| M-054 | 角色/宠物承伤数字 | 已定位 | 未复现 | `BaseHero.reduceHp()/addHeroHurtMc()`、`BasePet.reduceHp()/addMonHurtMc()`、`BaseMutiLevelListenering.as`、`CureHpQueue.addHpLose()`、`ANumber.as`、恢复 `OtherMat1.swf` 的 `pnum0..9` | `Stage1CombatSystem.resolveStage1EnemyAttack/resolveStage1EnemyPetAttack`、`HeroCombatSystem.applyHeroDamage`、`PetCombatRuntime.consumeDamageEvents` 当前只扣 HP/驱动 hurt-dead，无 incoming-number producer/view | 用户 2026-09-03 5173 反证与代码/AS3 窄查确认方向缺失；215 需冻结最终显示值、特殊防御、P1/P2 owner、几何/时序与负场景，216 才能实现并提升状态。治疗/回蓝/蓝耗/miss 不在本机制范围 |

2026-07-24 前置体验补全调整：用户将天庭地图“丹药/商城/设置/任务”、关卡内“设置/技能/背包/法宝/宠物”、已完成关卡全部小怪真动画和五角色战斗 UI/技能动画提升为 Stage 2-3 逆向前置。`M-016/M-052` 现有“可达/已有页面业务”不得作为原版逐状态关闭证据；`M-030/M-034/M-047` 的代表性或占位视觉不得作为全集关闭证据。`M-044/M-050` 的六槽 V6 `localStorage` 已满足“存到本地”的基础要求，不新增重复实现，只由 `VS-063` 在全部新功能完成后做跨重启正式旅程回归。调度见 `LINE-PRE-STAGE-2-3-COMPLETION` 与 `GOAL-037..041`。

2026-08-17 Stage 2-3 前用户复验再次反证：装备 hover 未显示数值，正式路径未看到宠物 UI/真动画，五角色动作流畅度不一，战斗 HUD 未可见显示角色技能。这些反证不删除 170/175/180/183 的目录、单页真值和业务证据，但立即降级 `M-036/M-047/M-049/M-052`、`VS-051/054/062` 的整体关闭措辞；`M-018..M-022` 一律等待 195 的同标准帧时序/持帧/clock/资源完整性审计，不预先认定是解包不全。`M-042` 的行为/双 owner/存档证据保留，但真动画与正式 UI 交付明确未关闭；193 必须先按恢复源资源族分区，再生成逐族证据/实现 task。新调度见 `LINE-PRE-STAGE-2-3-PRESENTATION`。

2026-08-17 `TASK-SETTINGS-191` 宠物 UI 可见性复核：P1/P2 的 character 573 pointer、`feature-ui-pets` bundle、`FeatureUiScene` 顶层和 932 页面在 940×590 正式 Runtime 均可见且零 console，175A/180 单页事实保留；用户反证命中的精确层是独立战斗 HUD。原版 `RoleInfo` 动态添加 `pet1.swf` character 662 `ShowPetInfo`，显示当前宠物头像、等级及 25 帧 HP/MP 条/数值；现代 HUD 只有 `petAvailable` 文字。新增 `task-settings-191.pet-combat-hud` verified 真值，10 个序列化对象/10 状态、可见态 8 对象、`unresolved=[]`。M-016 的入口事实保持；M-042/M-049/M-052 等待 192A 正式冷启动旅程和 192B character 662 投影，不因本证据 task 提升复现状态。

2026-08-17 `TASK-SLICE-192A` 正式旅程门禁：当前 schema 双人冷启动槽经地图覆盖 `TestScene/Stage12Scene/Stage13Scene/Stage21Scene/Stage22Scene`，每个 Runtime 的 P1/P2 宠物入口均回归 932 页、分页/selected、出战/休息、放生确认、关闭重开与重载。`feature-ui-failed` 统一报告 bundle/page-assets/render 阶段、page、owner、origin 和 message，替代静默失败。940×590 非 QA P1/P2、skill hover、返回/重载为零 console；M-016 的正式入口交付闭合，M-042/M-052 仍等待 192B character 662 与后续动画范围。

2026-08-17 `TASK-SLICE-192B` character 662 投影：共享 HUD snapshot 直接读取当前活动存档 P1/P2 `PetRoster`，并在既有 `FormalPetsUpdatedEvent` 上替换同一 roster 引用；没有第二宠物数值/runtime owner。605 shell、610/614 各 25 帧、同源头像和三字段按 `task-settings-191.pet-combat-hud` 投影，P2 镜像与字段反转、满值/半值/0 HP、休息移除和再次出战重建均通过；原版 662 无技能 child，故不添加现代技能层。M-049 的宠物战斗 HUD 子范围已复现，M-042/M-052 与 VS-067 因宠物本体/技能真动画仍保持部分状态并转入 193。

2026-08-21 character 657 真值与宠物类调度纠正：PG-017 的用户运行反证已使上段“同源头像已复现”降级。旧 191 把 42 帧动态头像选择器的联合 bounds 当作具体头像，192B 又用身体 atlas 代替实际帧内 child；605/610/614、条和文本静态范围暂不受此反证波及。用户要求在 193E 前先修真值/UI、再建宠物基类，故新增 `TASK-SETTINGS-201 -> TASK-SLICE-202 -> TASK-ARCH-203`：201 按 35 个中文名 fixture 递归 character 657 目标帧，202 让正式 HUD 直接消费新真值，203 按已冻结设计只建立 `PetCombatRuntime/PetBehavior/Registry/Targeting` P1。M-042/M-049/M-052 与 VS-067 均保持部分复现，完成 203 后才恢复 193E。

2026-08-24 `TASK-SETTINGS-201` character 657 细粒度真值：`task-settings-201.pet-combat-hud-head` 由 35 项 corpus + AS3 中文名映射独立声明 expected，以恢复 `pet1.swf` 的 42 帧 XML 时间线提取 actual，并逐 fixture 用 SVG child/matrix/size 与 PNG alpha/baseline 交叉确认；生成 70 个 P1/P2 可见投影、4 个无出战/休息负状态，`unresolved=[]`。灵猴为 frame 5 / character 619 / `46.75×40`，旧 191 的 `104.8×93.6` 仅是 657 联合画布；191 的动态 head 对象已机器标记由 201 取代，605/610/614 与文本保留。M-035/M-042/M-049/M-052 仍不提升复现状态，等待 202 正式消费。

2026-08-24 `TASK-SLICE-202` 正式消费：`PetCombatHudHeadAssets` 直接导入并断言 201 verified manifest，按目标 frame、终端 child、child matrix、registration 与 visible bounds 生成 35 个投影；33 个唯一 child 由 `pet-combat-hud-heads` 专属 bundle 加载。`Stage1PetCombatHudView` 删除宠物页/身体头像引用、`104.8×93.6` 拉伸和硬编码头像偏移，191 壳体/条/文本与既有 roster owner 保持。关键字段变异、P1/P2、五关旅程、九物种零像素差、全系统/build 与 940×590 双人零 console 通过；M-049 的宠物战斗 HUD 头像子范围重新闭合，M-042/M-052 与 VS-067 仍因公共类和其余动画范围保持部分复现。

2026-08-24 `TASK-ARCH-203` 宠物战斗公共类 P1：新增无 Phaser 依赖的 `PetCombatRuntime` Context、`PetBehavior` Strategy、唯一 `PetBehaviorRegistry` 与纯 `PetCombatTargeting`；Runtime 固定同步出战宠物、既有跟随/warp、存活目标快照、Behavior 动作/持续效果、只读事件/快照和幂等销毁顺序。专项合同覆盖换宠、死亡、重复/缺失注册、目标选择、错误输入与 destroy；`pet P1`=0，`PetSystem.ts` 未新增逻辑。M-032/M-034/M-042 与 VS-067 仍保持原复现状态，因为 P2-P4 消费者迁移和其余七族真动画不在本批范围。

2026-08-25 宠物公共类优先级纠正：用户明确 203 的 P1 骨架不足以作为完整宠物基类，故在任何后续宠物逆向前插入 Split 父任务 204 与连续 204A..F，依次完成九物种真实 Behavior、35 形态 Registry、TestScene P1/P2、正式五关/功能页同步和旧入口清零，以 `pet all=0` 作为完整公共类唯一完成证据。193E 暂回 Planned；193E/G/I/K/M/O/Q 全部强制使用 `$pet-family-reverse` 和 `MO-001` 完成单族逆向。

2026-08-25 `TASK-ARCH-204A` 宠物公共类 P1B：`PetCombatRuntime` 统一推进跟随/warp、存活目标、全 roster 技能 cooldown、单帧 Behavior 动作和 `castSkill` 执行能力口；Monkey/Horse Behavior 按原 TestScene 顺序调用既有 11 个请求函数，默认 Registry 覆盖两族 8 形态，不复制数值、Projectile 或技能算法。`pet P1/P1B=0`，M-032/M-034/M-042 与 VS-067 仍保持部分复现，等待 204B..F 闭合其余 Behavior、消费者和旧入口。

2026-08-25 `TASK-ARCH-206` 设计校正：205 证据已使 204A 的 `pet P1/P1B=0` 降级为旧合同结果。唯一现代设计现要求 ordered-first/1200 sticky 目标、动作选择后仅活动实例 CD、`alive -> dead-playing -> destroy`、完整受击/移动/普攻/动画命中/私有清理钩子；当前新 P1/P1B 均为 1，M-032/M-034/M-042 与 VS-067 状态不提升，等待 204B..G。

2026-08-25 `TASK-ARCH-204B` 公共结构校正已完成：`PetCombatRuntime` 采用 ordered-first/1200 sticky 目标，动作与效果之后只推进活动宠物 CD，并以 `runtimeKey + actionToken` 拒绝旧 damage/animation event；HP0 进入 `dead-playing`，仅匹配 `dead-complete` 释放。Monkey/Horse 8 形态结构钩子使 `pet P1/P1B=0`，但该 gate 不证明正式消费者、自主攻击、动画命中或伤害闭环；M-042 与 VS-067 仍为部分复现。

2026-08-25 用户正式运行反证：现代 `PetCombatRuntime` 尚无 Scene/正式消费者，Monkey/Horse `basicAttack` 只发事件，没有真动画、命中和伤害链。后续改为 `TASK-SETTINGS-207 -> TASK-SLICE-208` 先完整闭合 monkey1..4，再从完整案例沉淀并以第二家族验证 `$pet-family-reverse`；旧 204C..G/193E..R 不再执行。

2026-08-26 `TASK-SETTINGS-207` 补齐 M-032/M-034/M-035/M-042 的猴系原版交叉证据：`task-settings-207.pet-monkey-family` 将 BasePet 更新/索敌/CD、monkey1..4 全技能和伤害公式、BaseBullet 命中、193A 的 626 状态视觉、StageCommon 三套碰撞、owner/load precedence、死亡销毁与 P1/P2 生命周期冻结为 41 项 P1R 同集合同，`unresolved=[]`。现代状态仍为部分复现；`PetCombatRuntime` 无正式消费者、basicAttack 无命中伤害、monkey4 受击 lj 与 jgaoyi 五段链缺失均由 208 关闭。

2026-08-26 `TASK-SLICE-208` 完成 M-032/M-034/M-035/M-042 的首个完整家族运行样本：P1/P2 公共桥各自拥有 `PetCombatRuntime`，monkey1..4 真普通攻击与全部技能按 verified hit frame 进入 Stage1 伤害/attack-id dedup，真动画、受击 lj、jgaoyi 五段链、死亡完成、换宠/休息/重试/返回均同源；`pet P1R=0`。这只提升猴系正式复现，不外推其余家族。

2026-08-26 后续用户反证覆盖上一行的现行完成结论：猴系在形态 `attackRange` 外原地播放攻击效果，不追击且不命中。207 manifest/BasePet 证据仍有效，缺口在现代 Runtime 未按目标距离追击、普攻无范围门，以及专项/P1R 未将字段映射成独立运行语义。M-032/M-034/M-035/M-042 的猴系状态恢复为部分复现，P1R=1；PG-017 V2 和猴系整改完成前不执行 209。

2026-08-27 PG-017 V2 已把 207 的 41 项合同映射为字段→场景→黑盒 trace→assertion，新增四形态 × P1/P2 范围链及 `attackRange`、命中帧、source owner mutation-kill。旧专项仍为绿时，真实 verifier/P1R 已稳定报出 `EARLY_ATTACK/NO_CHASE/NO_IN_RANGE` 并返回 1，证明门禁不再自证；唯一 Ready `TASK-SLICE-208A` 负责玩法整改，机制复现状态仍保持部分复现。

2026-08-25 `BasePet` 逆向前置纠正：用户指出原版宠物公共类应先审计 AS3 属性、继承、生命周期和具体类覆写，再据此裁决现代设计。现有 `pets-index.md` 已记录创建链、基础行为和技能事实，但没有完整继承树、字段/owner、公共方法/覆写矩阵与“原版职责→现代 owner”证据链。新增代码逆向 `TASK-SETTINGS-205` 为唯一 Ready；204B 暂回 Planned，205 后先生成现代宠物系统设计调整/确认 task，不得把 Monkey/Horse 已实现状态外推成原版分类事实。M-042 与 VS-067 状态不提升。

2026-08-25 `TASK-SETTINGS-205` 原版 `BasePet` 专项已闭合：`pet-base-class.md` 以 `[172845]` 可读主类和 `[25034429]` 混淆副本的 35/35 继承/override/function 结构一致性为双源，确认 33 个具体类直继承 `BasePet`、仅 `PetMouse2/3 -> PetMouse1`；冻结 `PetInfo` 数据 owner、`BaseHero` 活动实体 owner、BasePet 字段/活动实例时钟、ordered-first/1200 索敌、技能 1→4、AI 先于 CD 递减、hurt/dead/frame-over/destroy 及 P1/P2/联机回放合同。猴/马 warp、hurt/dead 与 193A/193C verified 真值一致，其余七族视觉细节不外推。现代审计判定 nearest、全 roster CD、HP 归零立即卸载与证据冲突，Behavior 也缺受击/移动/动画命中/私有清理接缝；M-042/VS-067 状态仍不提升，唯一 Ready 切到 `TASK-ARCH-206` 先修订/确认唯一宠物设计和 gate。

2026-08-17 `TASK-SETTINGS-193` 宠物动画 corpus：恢复 `pet1/20120203/20120808/mouse/StageCommon.swf` 精确 SymbolClass 扫描将当前 9 物种、35 实际形态、9 本体族与 38 技能视觉映射全部定位，`unlocated=[]`。重复符号按 `Aloader` 补丁顺序冻结候选 owner，并要求分族证据 task 用 ApplicationDomain/load precedence 反证；现代 `TestScenePetViewBridge` 几何本体、projectile fallback 和字符串 key 均仍是占位或未渲染。193A..193R 已按九物种串行插入 194 前，故 M-035/M-042 与 VS-067 仍保持部分复现，不因 corpus 定位提前提升。

2026-08-18 `TASK-SETTINGS-193A` 猴系逐帧真值：`task-settings-193a.pet-monkey-animation` 以 626 状态、20 显示对象与 626 个 SWF-derived 基准冻结 monkey1..4 本体行/持帧、普攻、xj/lj/lyq/jgaoyi、hurt/dead、左右注册点/alpha 边界、生成矩阵、20/24/30 host clock 和销毁合同，`unresolved=[]`。真实加载时序确认 `PetMonkeyBmd1..3` 与九对象选择 `20120203.swf` 补丁 owner，`Bmd4` 选择 `pet1.swf`；monkey2/3 两段对象、`PetMonkey2Bullet3` 错名和 jgaoyi 本体 hit5 差异已转交 193B。M-034/M-035/M-042 与 VS-067 仍保持部分复现，直到现代正式 Runtime 消费真值。

2026-08-18 `TASK-SLICE-193B` 猴系真动画接入：四本体 atlas 与九个唯一对象序列由 `combat-common` 唯一加载，Stage 1-1 和其余四关共享同一真值消费者；逐行动作 clock/持帧/注册点、lj 双段、xj 复用与 4 秒生命周期、jgaoyi 本体 hit5 均直接派生自 193A。P1/P2 roster、跟随/远距传送、伤害/冷却、AI 和存档 owner 未改。M-034/M-035/M-042 与 VS-067 仍为部分复现，等待其余八族 193C..193R 和 194 校准。

2026-08-18 `TASK-SETTINGS-193C` 马系逐帧真值：`task-settings-193c.pet-horse-animation` 以 716 状态、20 显示对象与 716 个 SWF-derived 基准冻结 horse1..4 本体行/持帧、普攻、sp/bd/bz/tmaoyi、共享冰效、hurt/dead、左右注册点/边界、host clock 和销毁合同，`unresolved=[]`。加载时序确认 1..3 阶本体/普通对象选 `20120203.swf`，4 阶本体/奥义选 `pet1.swf`，共享冰效选 `StageCommon.swf`；奥义根 1 帧下的 8 帧内嵌时间轴已单独冻结。M-034/M-035/M-042 与 VS-067 仍为部分复现，等待 193D 的正式 Runtime 消费。

2026-08-18 `TASK-SLICE-193D` 马系真动画接入：四本体 atlas 与 185 帧普攻/sp/bd/bz/tmaoyi/共享冰效对象由 `combat-common` 唯一加载，Stage 1-1 与其余四关共享同一真值消费者；逐行动作 clock/持帧/注册点、tmaoyi 本体 row8/8 subframes/30 帧爆炸和 60×80 冰效均直接派生自 193C。P1/P2 roster、跟随/远距传送、伤害/冷却、AI 和存档 owner 未改。M-034/M-035/M-042 与 VS-067 仍为部分复现，等待其余七族 193E..193R 和 194 校准。

2026-07-25 地图四服务页检查点：`MapMenu/GMain` 与 restored SWF 交叉确认丹药 990（`OtherMat1`）、商城 721 和任务 85（`backpack1`）、设置 148（`StageCommon`）。商城在该单机版本以玩家灵魂结算；购买成功只刷新运行态和 `MemoryClass.mystorage` 内存快照，必须返回地图手动存档才写文件，不得因旧充值/点券静态文字伪造在线服务；设置字段原版为会话态，不在 `User.getSaveObj`。四页深证据按 `TASK-SETTINGS-066A..D` 继续，详见 `map-service-ui-index.md`，当前不提升 `M-044/M-046/M-052` 状态。

2026-07-25 丹药页深证据：`TASK-SETTINGS-066A` 已闭合 character 990/969/1006、四按钮、五职业选择器、25 格顺序解锁、五类五阶加成、五配方、灵魂/材料/容量拒绝、原版刷新瑕疵、P1/P2 owner 和显式保存边界，详见 `immortality-ui-index.md`。这只清零 `TASK-SLICE-155A` 输入未知，不提前提升 `M-044/M-052` 或 `VS-059`。

2026-07-25 丹药页实现：`TASK-SLICE-155A` 已直接消费上述六段矩阵和统一背包事务，接入 character 990/969/1006、五 owner、25 格、五类五阶服用/炼制、拒绝态、P1/P2 隔离与 V6 标志迁移；专项和 940×590 逐状态证据通过。该结论只闭合丹药切片，`M-044/M-052` 仍为部分复现，`VS-059` 仍待商城/设置/任务三页。

2026-07-25 商城页深证据：`TASK-SETTINGS-066B` 已闭合 character 721/717/624、16 个按钮四状态、49 商品与权威价格、第三大关折扣例外、分页/数量/拒绝态、P1/P2 owner、离线灵魂事务和手动保存边界，详见 `shop-ui-index.md`。其中 `setStorage()` 只重建内存快照，实际文件写入由地图手动 `saveGame()` 完成；这只清零 `TASK-SLICE-155B` 输入未知，不提前提升 `M-044/M-046/M-052` 或 `VS-059`。

2026-07-25 商城页实现：`TASK-SLICE-155B` 已直接消费上述六段矩阵，接入 character 721/717/624、16 组原按钮三态、49 商品真图标与权威顺序/价格；分类、分页、0/99/100 数量、确认/取消、第三大关八折及 `zylhys` 例外、统一背包容量、P1/P2 灵魂 owner 和 V6 重载通过专项与 940×590 逐状态证据。成功后即时保存当前活动槽是现代离线可靠性选择，原 Flash 仍记录为地图手动保存；未新增在线支付或后端事实。该结论只闭合商城切片，`M-044/M-046/M-052` 仍为部分复现，`VS-059` 仍待设置与任务两页。

2026-07-25 设置页深证据：`TASK-SETTINGS-066C` 已闭合 character 148/134/136..147、关闭按钮四态、五行 white/yellow hover 与无独立 pressed、难度/声音/30-24-20 FPS 循环、全屏 overlay 生命周期、会话级全局 owner、原版非存档和默认音量死控件，详见 `settings-ui-index.md`。用户确认的跨应用重启范围只作为现代例外映射到独立全局 localStorage，不改 V6/player schema；这只清零 `TASK-SLICE-155C` 输入未知，不提前提升 `M-035/M-044/M-052` 或 `VS-059`。

2026-07-25 设置页实现：`TASK-SLICE-155C` 已直接消费上述六段矩阵，接入 character 148 原面板、五个原标签/动态值命中区、144 关闭三态、全屏模态阻挡、四项循环与默认音量死控件；独立全局 localStorage codec 只实现用户批准的跨重启现代例外，损坏回默认且不触碰 V6/player schema。专项、全系统与 940×590 normal/hover/值循环/关闭重开/重载双重验证通过；`M-035/M-044/M-052` 仍为部分复现，`VS-059` 仍待任务页。

2026-07-25 任务页深证据：`TASK-SETTINGS-066D` 已闭合 character 85 的双页签、五 tile、详情/进度、四奖励格、领取、分页、关闭与动态已领取图，列清 43 项日常和 4 项活动、生产者、随机奖励、共享 owner、同日恢复/跨日重置和显式保存边界，详见 `task-ui-index.md`。当前两个行为包都构造活动 101..104 却未 `push` 到 `actTask`，因此活动页实际为空；原版还保留空页陈旧详情可领取、尾页陈旧详情、多人 EXP 分发和非均匀随机等瑕疵。影响 `TASK-SLICE-155D` 的事实未知为零，但这不提前提升 `M-044/M-046/M-052` 或 `VS-059`。

2026-07-26 任务页实现：`TASK-SLICE-155D` 已接入 character 85 原生显示列表、43 日常、4 个休眠活动定义、共享进度、正式怪物死亡 producer、非均匀奖励、双方 owner 与当前槽跨日 V6；活动页保持空 `1/1`，P2 经验串号按各自 owner 修正并显式记录为现代差异。专项、全系统、build、资源标注和 940×590 逐状态零 console 通过，`VS-059` 提升为已完成；`M-044/M-046/M-052` 因更广范围仍保持原状态。

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

M-035/M-042/M-052 宠物页真值补充：`TASK-SETTINGS-175A` 已从恢复源 `pet1.swf` character 932
生成 `task-settings-175a.pet-page` verified manifest，闭合 74 对象、16 状态、按钮三态/命中、
动态列表/头像/8 技能/tooltip/放生确认、P1/P2 与关闭，`unresolved=[]`。这只解除宠物单页实现的
证据阻塞已解除；`TASK-SLICE-180` 已让 `FormalPetPageView` 直接消费 74 对象/16 状态真值，接入原 932 显示列表、恢复源动态头像/技能、按钮/tooltip/放生确认并删除现代覆盖，owner/存档/逐状态视觉与零 console 回归通过。该结论只闭合宠物单页，M-035/M-042/M-052 因更广范围保持原状态。

M-035/M-052/VS-059 丹药页真值补充：`TASK-SETTINGS-175E` 已从恢复源 `OtherMat1.swf`
character 990/969/1006 生成 `task-settings-175e.immortality-page` verified manifest，闭合 132 对象、
26 状态、25 格嵌套显示列表、五职业 selector、服用/炼制按钮、动态已服用图、拒绝/成功、P1/P2
与返回，`unresolved=[]`。这只解除丹药单页的证据债务；现代直接消费和逐状态差异仍待后续实现，
M-035/M-052 与 VS-059 状态不提前提升。

M-046/M-052/VS-059 商城页真值补充：`TASK-SETTINGS-175F` 已从恢复源 `backpack1.swf`
character 721/717/624 生成 `task-settings-175f.shop-page` verified manifest，闭合 132 对象、31 状态、
27 个根 child、九卡嵌套显示列表、动态商品图标、16 组按钮、分类/分页/数量、确认/取消/拒绝/成功、
P1/P2 与返回，`unresolved=[]`。`TASK-SLICE-184` 已让 `FormalShopPageTruth/ShopScene` 直接消费
132 对象/31 状态，删除页面第二套手写坐标并闭合业务、owner、当前存档、940×590 差异与零 console；
M-046 因更广支付/活动范围保持暂缓，M-052/VS-059 因设置、任务和建档等剩余页面不提前提升。

M-035/M-052/VS-059 设置页真值补充：`TASK-SETTINGS-175G` 已从恢复源 `StageCommon.swf`
character 148 生成 `task-settings-175g.settings-page` verified manifest，闭合 19 对象、23 状态、
12 个根 child、134/133 全舞台 overlay、五组 146/145、144 四态、四项全循环、默认音量死控件、
关闭/重开与原版非存档边界，`unresolved=[]`。`TASK-SLICE-185` 已让
`FormalSettingsPageTruth/FormalSettingsOverlay` 直接消费 19 对象/23 状态，删除五行坐标、命中、
字体与关闭锚点的手写视觉真值，并闭合全局 owner、独立跨重启现代例外、940×590 差异与零 console；
M-035/M-052 与 VS-059 因更广页面范围保持原状态。

M-044/M-046/M-052/VS-059 任务页真值补充：`TASK-SETTINGS-175H` 已从恢复源 `backpack1.swf`
character 85 生成 `task-settings-175h.task-page` verified manifest，闭合 45 对象、28 状态、21 个根
child、五个任务行、四个奖励格、三组按钮、动态已领取/0..4 奖励、daily/activity、末页/空活动
残留、P1/P2 与关闭/重开，`unresolved=[]`。`TASK-SLICE-186` 已让 `FormalTaskPageTruth/TaskScene`
直接消费 45 对象/28 状态，删除行/奖励/文字/按钮的手写视觉真值，并以 `root-static.svg` 消除整帧
动态 child 回填；43 定义、0..4 奖励、末页/空活动、P1/P2 经验 owner、即时保存/重载、940×590
运行与零 console 已关闭。M-044/M-046/M-052 与 VS-059 因丹药及更广任务/活动范围保持原状态。

M-035/M-043/M-052 法宝页真值补充：`TASK-SETTINGS-175B` 已从恢复源 `backpack1.swf`
character 596 生成 `task-settings-175b.magic-weapon-page` verified manifest，闭合 17 个根 child、
character 200/34 动态确认、28 对象、21 状态、按钮三态/命中、九字段、灵魂条、升级/拒绝/取消、
重置、P2 无入口与关闭，`unresolved=[]`。`TASK-SLICE-181` 已让正式 view 直接消费该 manifest，
删除现代覆盖并通过 owner/存档/940×590 回归；M-043 保持“部分复现”仅因外部战斗资源范围。

M-016/M-035/M-052 功能宿主真值补充：`TASK-SETTINGS-175C` 已从恢复源
`OtherMat1.swf` character 574/371/444 生成 `task-settings-175c.stage-feature-host` verified
manifest，闭合 25 对象、42 状态、P1/P2 五按钮四态、非对称门禁、设置/帮助与单页返回，
`unresolved=[]`。原版无地图态共享 chrome；当前暗层、标题、跨页/workshop/通用关闭已冻结为未批准差异，
后续由 `TASK-SLICE-182`。M-016 的原入口行为结论保持；M-035/M-052 因实现债务仍不提升。

M-041/M-052 技能页真值补充：`TASK-SETTINGS-175D` 已从恢复源 `OtherMat1.swf`
character 250/868/417/213、212 与 865 生成 `task-settings-175d.skill-pages` verified manifest，
闭合 250 对象、32 状态、五角色 selector、七类按钮、角色 selected、十树/50 图标三态、绑定 P1/P2、
被动动态字段和返回，`unresolved=[]`。`TASK-SLICE-183` 已让正式 view 直接消费该 manifest，
删除手写视觉真值、现代 owner 文字和第二坐标表，并完成主动/被动/P1-P2 绑定/拖放/返回的
940×590 与零 console 回归。M-041 的业务与页面闭环已完成；M-052 因更广功能 UI 范围保持原状态。

## 第一批复现门槛

第一批纵向切片开始前，最低门槛如下：

| 切片 | 需要机制 | 当前状态 | 处理 |
| --- | --- | --- | --- |
| VS-001 双玩家输入验证 | M-008 基础键位、M-009 方向键归属 | 已扒且已复现 | 已完成 |
| VS-002 第一个角色动作索引 | M-017 角色列表、M-023 普攻、M-024 组合键、M-025 技能槽/效果 | 角色列表、组合键、普攻和技能分发已扒；推荐 Role2 | 已完成 |
| VS-003 第一个角色移动切片 | VS-001、VS-002、M-011、M-012、M-013 | 已完成：`HeroMovementSystem.ts` 与 `TestScene.ts` 支持走、跑、双跳和 `ThroughWall` 下穿 | 已完成 |
| VS-004 五角色普攻与特效切片 | VS-003、M-023、M-047、M-035 | 已复现：163/164已闭合固定world effect与Role5移动projectile，五角色J分类和伤害空间无缺口 | 真视觉、释放点/轨迹、命中与P1/P2专项共同承载结论 |
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

2026-08-27 `TASK-SLICE-208A` 补充：`M-032/M-034/M-035/M-042/M-044` 的猴系范围链已由独立黑盒 verifier 重验。生产 Runtime 直接消费 207 冻结的 `attackRange=40/70/150/150`，范围外追击 sticky target、入围后普通攻击；projectile 保留 target/action token，在 verified hit frame 由正式伤害入口形成 pet-source HP decrease 与 cleanup。四形态 × P1/P2、TestScene/正式五关共享消费者、换宠/休息/返回生命周期由 P1R/家族/旅程回归覆盖；不修改存档 schema、视觉资源或其他家族，故这些机制的全局状态不额外提升。

2026-08-28 `TASK-SETTINGS-209` 补充：`M-032/M-034/M-035/M-042/M-044` 的马系原版事实已由 `task-settings-209.pet-horse-family` 冻结为 43 项同集合同。horse1..4 普攻范围 `40/70/150/150`、双随机追击、全部继承 `sp/bd/bz/tmaoyi`、受击 bd、共享冰效、奥义逐怪 tracking/ice/explosion 组合、body emit tick、BaseBullet collision/dedup/damage、三包 owner 与 P1/P2 生命周期均有字段级 acceptance；193C 的 716 状态/20 对象/716 基准被复核引用，`unresolved=[]`。这只提升马系逆向证据完成度，现代复现仍为部分复现，等待 `TASK-SLICE-210 / pet P1H`。

2026-08-31 `TASK-SLICE-210` 补充：`M-032/M-034/M-035/M-042/M-044` 的马系现代链已直接消费 209 的 43 项合同。horse1..4 × P1/P2 从范围外追击到双随机普攻，全部继承 `sp/bd/bz`、受击 bd、共享冰效及 `tmaoyi` tracking/ice/explosion 组合均生成真实 projectile；verified attack id/source 经 Stage1 共享结算形成实际 HP decrease 与 cleanup。独立字段覆盖、八条范围 trace、range/hit/source mutation-kill、`pet P1H=0`、五关旅程与 940×590 双人正式 Stage 1-2 通过。全局机制仍为部分复现，因为其余七宠物家族及 211/212 伤害数字/连击反馈尚未闭合。

2026-08-31 `TASK-SLICE-210A` 补充：用户反证恢复了原版 `BaseBullet.checkAttack()` 的怪物来源二段目标链——玩家候选命中检查后，只要攻击仍可命中，还会检查该玩家的出战 `BasePet`。现代正式五关共享桥现以宠物 Runtime 坐标、宠物物防、active attack 范围和共享 attack-id registry 生成 typed pet damage，P1/P2 `PetCombatRuntime` 消费后形成 HP decrease 与既有真 hurt/dead 动画输入；范围外、死亡宠物与重复 attack id 均不产生命中。怪物主动 AI 仍以玩家为追击目标，未无证据改为追宠；伤害数字/连击仍由 211/212 闭合。

2026-09-02 `TASK-SETTINGS-211` 补充：`M-032/M-035/M-049/M-053` 的怪物目标命中反馈已由 `task-settings-211.combat-hit-feedback` 冻结。恢复 `OtherMat1.swf` 证明 `hurtnum0..9` 30×30、`bnum0..9` 42×42、20px 伤害位距、character 299/298 Batter 背景和 `num0..9` 五帧 scale/blur pulse；AS3 链证明目标锚点、4×→1×弹出、延迟上浮淡出、队列五项扇出、直接命中连击、effect 不增连击反证、2 起显、40 host tick 相邻快照无增长清零和 `GameWin` 最高值。23 个 940×590 状态基准、Schema 与可重复生成通过，`unresolved=[]`；现代复现仍为部分复现，唯一 Ready `TASK-SLICE-212` 负责实际 HP decrease 到数字/连击/结果页的共享消费。

2026-09-02 `TASK-SLICE-212` 补充：`M-032/M-035/M-049/M-053` 的成功怪物命中已统一产出 `CombatFeedbackEvent`。事件只接受与 clamped `DamageEvent.amount` 一致的真实 HP decrease，并保存稳定 id、source/owner、目标锚点与最终 critical；五关正式 Runtime 和 TestScene 共用原版伤害位图/连击 view，P1/P2 共享 30fps、40-host-tick 连击和结果页最高值，effect 数字不增连击。专项覆盖六项扇出、miss/0/dedup/dead、普通/暴击及 Role/pet/magic/effect；940×590 双人 Stage 1-2 source trace 达 22 连击且 console 为 0。M-053 现已复现，M-032 仍因其余七宠物家族未闭合而保持部分复现。

2026-09-03 `M-054/VS-072` 新增：用户在 5173 正式双人战斗观察到角色/宠物 HP decrease 但没有头顶承伤数字；运行 trace 只含怪物 target。原版 `BaseHero.reduceHp()` 与 `BasePet.reduceHp()` 会在本地 owner/单机路径分别调用 `addHeroHurtMc()` / `addMonHurtMc()`，共同以 `pnum0..9`、20px 位距、`(x-20,y-60)` 锚点交给 `ANumber` 做 4×弹出和上浮淡出；恢复 `OtherMat1.swf` 的 SymbolClass 已确认十个 `pnum`。现代角色/宠物伤害只完成扣血与 hurt/dead，未生成 incoming feedback，故新增 215/216；在 verified 真值完成前只标记“已定位”，不把聊天核查越级写成已扒。

如果实现中发现机制没扒清楚：

- 不硬写。
- 把机制逆向状态退回 `部分已扒` 或 `未扒`。
- 在 `下一步` 中写明需要新增的 `TASK-SETTINGS-*`。


