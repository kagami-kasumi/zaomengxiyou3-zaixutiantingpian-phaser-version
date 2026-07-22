# 领域词汇表

本文维护项目的统一语言。它不是完整 DDD 架构，而是轻量 DDD 约束：同一个领域概念只能有一个推荐代码名，避免不同对话把同一概念写成不同实体。

规则：

- 新增核心代码类型、系统或数据模型前，先查本文。
- 如果概念已存在，必须使用“推荐代码名”。
- 如果确实需要新概念，先按 `docs/domain/ubiquitous-language-process.md` 更新本文。
- 禁止别名不代表 AS3 原名不能出现在逆向文档中；AS3 原名可作为来源证据，但现代代码使用推荐代码名。

## 上下文

- `Input`：键盘、玩家槽位、输入意图。
- `Runtime`：Phaser 启动、场景、更新循环、系统调度。
- `Combat`：角色、怪物、移动、攻击、受击、死亡、技能、伤害。
- `Progression`：装备、背包、掉落、等级、经验、合成。
- `Save`：存档、读档和持久化数据。
- `Content`：关卡、地图、资源、动画和配置。

## 统一语言表

| 中文概念 | 推荐代码名 | 类型 | 上下文 | 说明 | 禁止别名 |
| --- | --- | --- | --- | --- | --- |
| 玩家槽位 | `PlayerSlot` | Value Object / Type | Input | P1/P2 控制位，不等于角色实体 | `PlayerIndex`, `UserSlot` |
| 玩家输入状态 | `PlayerInputState` | Type | Input | 单个玩家当前输入意图 | `PlayerInput`, `KeyState`, `ControlState` |
| 输入快照 | `InputState` | Type | Input | 一帧内 P1/P2 两套玩家输入状态 | `InputSnapshot`, `ControlsState` |
| 输入绑定 | `InputBindings` | Config / Type | Input | P1/P2 键位映射 | `KeyBindings`, `ControlBindings` |
| 输入系统 | `InputSystem` | System | Input | 读取键盘并输出玩家输入 | `KeyboardSystem`, `ControlSystem` |
| 游戏设置 | `GameSettings` | Config | Runtime | 画布、速度等全局轻量配置 | `GameConfig`, `Settings` |
| 游戏上下文 | `GameContext` | Context / Query Facade | Runtime | 薄运行时上下文，只提供共享运行时集合和查询入口，不承载玩法规则或完整 ECS 生命周期 | `WorldContext`, `RuntimeContext`, `GameWorld` |
| 资源清单 | `AssetManifest` | Config | Content | 现代资源键和加载策略 | `ResourceManifest`, `AssetsMap` |
| 场景 | `Scene` | Phaser Concept | Runtime | Phaser 场景；具体类可用 `BootScene`、`TestScene` | `Screen`, `View` |
| 英雄 | `Hero` | Entity | Combat | 玩家可控制战斗角色；对应 AS3 `Role*` 行为参考 | `Role`, `Character`, `PlayerCharacter` |
| 英雄编号 | `HeroId` | Value Object / Type | Combat | 五个可选英雄的稳定编号，对应 AS3 `roleid` 1 至 5 | `RoleId`, `CharacterId` |
| 英雄普攻模型 | `HeroNormalAttackModel` | Model | Combat | 单个英雄普攻连段、冷却、当前动作和武器形态的运行状态 | `RoleAttackModel`, `AttackState` |
| 英雄普攻系统 | `HeroNormalAttackSystem` | System | Combat | 根据输入和英雄移动状态触发普攻动作、特效与命中框 | `RoleAttackSystem`, `NormalAttackSystem` |
| 英雄战斗模型 | `HeroCombatModel` | Model | Combat | 单个英雄生命、受击、死亡、保护和最近伤害事件状态 | `PlayerCombatModel`, `HeroHealthState` |
| 怪物 | `Monster` | Entity | Combat | 敌方单位 | `Enemy`, `Mob` |
| 宠物 | `Pet` | Entity | Combat / Progression | 玩家持有并可出战的伙伴实体；对应 AS3 `PetInfo`/`BasePet` 行为参考 | `Companion`, `Familiar` |
| 宠物模型 | `PetState` | Model | Combat / Progression | 单只宠物的可持久化运行数据，包含名称、等级、HP/MP、寿命、出战状态和技能名 | `PetInfo`, `PetData` |
| 宠物消耗品 | `PetConsumable` | Item Effect / Type | Progression | 道具背包中可对当前出战宠物生效的普通道具效果，例如寿命丹、还魂丹、经验石 | `PetItem`, `CompanionConsumable`, `FamiliarItem` |
| 宠物系统 | `PetSystem` | System | Combat / Progression | 管理宠物列表、单只出战、跟随实体运行状态和首批宠物 UI 数据 | `CompanionSystem`, `FamiliarSystem` |
| 宠物成长系统 | `PetGrowthSystem` | System | Progression | 负责宠物属性洗练、还童和形态进化等可测试成长规则；道具扣除仍由背包系统负责 | `PetTrainingSystem`, `PetEvolutionSystem` |
| 基础对象 | `GameObjectModel` | Model | Runtime / Combat | 现代逻辑对象模型；不要直接照搬 AS3 `BaseObject` | `BaseObject`, `EntityBase` |
| 技能 | `Skill` | Entity / Config | Combat | 主动技能或技能配置 | `Ability`, `Spell` |
| 技能绑定 | `SkillBinding` | Value Object / Config | Combat | 单个技能槽中绑定的技能名、等级等最小释放配置 | `AbilityBinding`, `SkillSlotBinding` |
| 英雄技能配置 | `HeroSkillLoadout` | Config | Combat | 英雄五个普通技能槽的当前绑定集合 | `SkillLoadout`, `AbilityLoadout` |
| 英雄技能模型 | `HeroSkillModel` | Model | Combat | 单个英雄技能释放所需的 MP、技能配置和当前技能动作状态 | `SkillState`, `ManaState` |
| 子弹 | `Projectile` | Entity | Combat | 技能飞行物或抛射物 | `Bullet`, `Missile` |
| 子弹系统 | `ProjectileSystem` | System | Combat | 管理技能飞行物生命周期、命中间隔和释放清理 | `BulletSystem`, `MissileSystem` |
| 法宝 | `MagicWeapon` | Entity / Config | Combat / Progression | 装备在 `zbfb` 槽位、由 H/小键盘 7 触发的特殊装备能力 | `Artifact`, `Relic`, `Sutra` |
| 法宝系统 | `MagicWeaponSystem` | System | Combat / Progression | 管理当前法宝、H 键触发、使用中重入边界和首批持续效果 | `ArtifactSystem`, `RelicSystem`, `SutraSystem` |
| 战斗系统 | `CombatSystem` | System | Combat | 伤害事件、命中去重和首批互伤结算函数 | `DamageSystem`, `HitSystem` |
| 伤害事件 | `DamageEvent` | Value Object | Combat | 一次伤害结算输入 | `HitInfo`, `DamageInfo` |
| 命中框 | `Hitbox` | Value Object / Component | Combat | 攻击判定区域 | `AttackBox` |
| 受击框 | `Hurtbox` | Value Object / Component | Combat | 被命中判定区域 | `BodyBox` |
| 关卡 | `Level` | Entity / Config | Content | 一次可进入、刷怪、通关的流程 | `Stage`, `Mission` |
| 关卡解锁进度 | `LevelUnlockProgress` | Value Object / Save Data | Content / Save | 当前已解锁的最高关卡坐标；与英雄等级成长分离 | `StageProgress`, `LevelProgress` |
| 关卡英雄移动运行时 | `LevelHeroMovementRuntime` | Runtime Model / System | Combat / Runtime | 统一持有正式关卡内各玩家的移动模型、上一帧输入与移动调度；关卡只提供平台和动态边界 | `StagePlayerRuntime`, `PartyMovementRuntime` |
| 关卡流程模型 | `Stage11FlowModel` | Model | Content / Runtime | Stage 1-1 正式进入后的进行中、失败延迟、失败和通关状态 | `StageFlowState`, `LevelState` |
| 关卡流程系统 | `Stage11FlowSystem` | System | Content / Runtime | 管理 Stage 1-1 全队失败门禁、胜利幂等和解锁进度 | `StageFlowSystem`, `LevelStateSystem` |
| 地图 | `MapData` | Config | Content | 地形、平台、出生点等数据 | `Map`, `TileMapData` |
| 天庭选关地图 | `HeavenMap` | Aggregate / Config | Content | 当前存档下第一世界节点状态、命中区与关卡路由；不等于关卡内地形数据 | `WorldMap`, `StageMap`, `SelectPlace` |
| 掉落 | `Drop` | Entity / Config | Progression | 怪物死亡产生的奖励项 | `Loot`, `RewardDrop` |
| 生命恢复掉落 | `HealthPickup` | Entity | Progression | 落地后由玩家接触拾取并按最大生命比例恢复 HP | `HealthDrop`, `HpOrb` |
| 魔法恢复掉落 | `ManaPickup` | Entity | Progression | 落地后由玩家接触拾取并按最大魔法比例恢复 MP | `ManaDrop`, `MpOrb` |
| 灵魂掉落 | `SoulPickup` | Entity | Progression | 原版 `Aura`：短暂等待并上浮后自动追踪击杀归属英雄，收集时增加灵魂收益 | `AuraDrop`, `SoulOrb`, `RedBall`, `BlueBall` |
| 经验奖励 | `ExperienceReward` | Value / Event | Progression | 怪物死亡时直接结算给击杀归属玩家/宠物，不生成地面拾取物 | `ExperienceDrop`, `ExpOrb` |
| 英雄成长模型 | `HeroProgressionModel` | Model | Progression | 单个英雄等级、当前经验、本级升级所需经验和最近升级结果 | `HeroLevelState`, `ExperienceState`, `LevelProgress` |
| 成长系统 | `ProgressionSystem` | System | Progression | 管理玩家英雄经验增加、升级曲线和五角色基础属性成长 | `LevelSystem`, `ExperienceSystem`, `GrowthSystem` |
| 物品 | `Item` | Entity / Config | Progression | 背包中的基础物品概念 | `Goods`, `InventoryItem` |
| 装备 | `Equipment` | Entity / Config | Progression | 可穿戴、可提供属性的物品 | `Gear`, `Equip` |
| 背包 | `Inventory` | Aggregate / Store | Progression | 玩家持有物品集合 | `Bag`, `Backpack` |
| 装备配置 | `EquipmentDefinition` | Config | Progression | 只读装备/物品静态数据，保留原版 `fillName/type/user/quality` 映射 | `GearDefinition`, `EquipDefinition` |
| 装备实例 | `EquipmentInstance` | Entity | Progression | 背包中一件可穿戴装备的运行实例 | `GearInstance`, `EquipInstance` |
| 装备栏 | `EquipmentLoadout` | Aggregate / Store | Progression | 当前已穿戴装备的槽位集合 | `GearLoadout`, `EquipSlots` |
| 背包系统 | `InventorySystem` | System | Progression | 管理分类背包、堆叠物品、装备进出背包 | `BagSystem`, `BackpackSystem` |
| 合成配方 | `CraftingRecipe` | Config | Progression | 以三个无序材料 `fillName` 映射固定产物和灵魂消耗 | `FusionRecipe`, `SynthesisRecipe` |
| 合成物品定义目录 | `CraftingItemDefinitionRegistry` | Config / Registry | Progression | 由 1.1 权威物品目录生成合成材料与产物的 `EquipmentDefinition` 集合；不等于正式掉落来源 | `FusionItemRegistry`, `CraftingItemCatalog` |
| 合成系统 | `CraftingSystem` | System | Progression | 负责配方预览、门禁校验和材料/灵魂/产物的原子库存事务 | `FusionSystem`, `SynthesisSystem` |
| 装备系统 | `EquipmentSystem` | System | Progression | 管理装备槽位、角色限制和属性汇总 | `GearSystem`, `EquipSystem` |
| 装备强化系统 | `EquipmentStrengtheningSystem` | System | Progression | 管理强化目标与材料暂存、概率/灵魂门禁、成功升级、失败降级和取消返还 | `GearUpgradeSystem`, `StrengthSystem` |
| 装备分解系统 | `EquipmentResolutionSystem` | System | Progression | 管理分解目标暂存、100 灵魂门禁、可注入随机产物、原子提交和取消返还 | `DisassemblySystem`, `DecomposeSystem` |
| 装备 UI 系统 | `EquipmentUISystem` | System | Progression | 管理背包/装备面板状态、选择、穿脱命令和属性预览文本 | `InventoryUISystem`, `GearUISystem` |
| 存档 | `SaveData` | Data | Save | 可序列化的游戏进度数据 | `GameSave`, `SaveState` |
| 存档槽 | `SaveSlot` | Value Object / Aggregate | Save | 六个独立持久化位置之一，包含稳定槽 id 与 empty/valid/corrupt 状态；不等于 P1/P2 玩家槽位 | `SaveFile`, `UserSlot`, `PlayerSlot` |

## AS3 名称映射原则

- AS3 `Role1` 至 `Role5` 在现代领域中归入 `Hero`。
- AS3 `BaseMonster` 在现代领域中归入 `Monster` 基类或怪物系统参考。
- AS3 `BaseObject` 是行为参考，不直接成为现代代码基类名。
- AS3 `Bullet` 相关类在现代领域中优先命名为 `Projectile`。
- AS3 `StageListener` 相关关卡流程在现代领域中归入 `Level`。
