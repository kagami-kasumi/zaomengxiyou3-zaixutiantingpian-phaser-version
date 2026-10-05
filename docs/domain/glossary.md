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
| 英雄原版运动输入 | `HeroSourceMovementInput` | Value Object | Combat / Runtime | 261普通构造profile、host步长和已证静态墙输入；由既有HeroMovement入口适配源root/速度单位，位置与速度仍归既有movement | — |
| 英雄聚拢坐标控制 | `HeroGatherCoordinateSystem` | System | Combat | 257B原一秒Tween的lazy起点、覆盖和暂停/退出；持有既有movement引用，不拥有第二份英雄坐标、物理或HP | — |
| 怪物命中来源属性 | `MonsterDamageSource` | Type | Combat | 已处理的来源Hit/暴击/魔花/随机输入；不持HP或第二怪物 | `MonsterDamageOwner` |
| 怪物命中接收请求 | `MonsterDamageRequest` | Type | Combat | 来源、动作、几何布尔、难度与原host输入；不含预期HP | `MonsterDamageFixture` |
| 怪物命中接收结果 | `MonsterDamageReception` | Value Object | Combat | 拒绝、闪避接受、returnvoid与实际HP前后值；HP由既有owner写入 | `MonsterHealthResult` |
| 怪物攻击接收计数 | `MonsterAttackReception` | Internal State | Combat | 独立攻击的ID/检测间隔/max；不持显示、几何或世界时钟 | `MonsterReceptionRuntime` |
| 宠物给予主人的属性效果 | `HeroPetBuffState` | Internal Effect State | Combat | 既有party成员持有四项原host效果及已应用标志；属性仍写入该成员combat/skill/effectiveStats，不属于PetState | `PetOwnerStatsRuntime` |
| 主人宠物属性效果步骤 | `HeroPetBuffSystem` | System | Combat | 消费既有世界宿主tick，执行效果到期与int属性相位；不持独立计时器或另建英雄 | `HeroBuffRuntime` |
| 宠物攻击的目标附加效果 | `PetTargetEffects` | Internal Effect State | Combat | 受击目标持有猴火/马冰的连续host计数、刷新和取消状态；不属于源宠物生命周期，也不持有第二套HP | `PetBurnRuntime` |
| 怪物宠物附加效果消费 | `MonsterPetTargetEffectSystem` | System | Combat | 将目标效果接到怪物既有HP、世界host推进及可见状态，死亡仍走既有怪物归属/奖励路径 | `MonsterPetBuffRuntime` |
| 玩家槽位 | `PlayerSlot` | Value Object / Type | Input | P1/P2 控制位，不等于角色实体 | `PlayerIndex`, `UserSlot` |
| 玄龟链接效果 | `PetTurtleLinkBuff` | Type | Combat | HeroCombat 与 PetCombatEntitySession 各持一份瞬态效果；同名刷新，不持有第二套 HP，引用实际宠物会话 | `TurtleLinkRuntime` |
| 玩家输入状态 | `PlayerInputState` | Type | Input | 单个玩家当前输入意图 | `PlayerInput`, `KeyState`, `ControlState` |
| 存档队伍配置 | `PartyConfiguration` | Value Object / Save Data | Runtime / Save | 新建存档时确定的 1P/2P 与各活动 `PlayerSlot` 当前 `HeroId`；正式地图、关卡和功能页的唯一队伍事实源 | `PlayerCountConfig`, `TeamSetup`, `PartySetup` |
| 输入快照 | `InputState` | Type | Input | 一帧内 P1/P2 两套玩家输入状态 | `InputSnapshot`, `ControlsState` |
| 输入绑定 | `InputBindings` | Config / Type | Input | P1/P2 键位映射 | `KeyBindings`, `ControlBindings` |
| 输入系统 | `InputSystem` | System | Input | 读取键盘并输出玩家输入 | `KeyboardSystem`, `ControlSystem` |
| 游戏设置 | `GameSettings` | Config | Runtime | 画布、速度等全局轻量配置 | `GameConfig`, `Settings` |
| 游戏上下文 | `GameContext` | Context / Query Facade | Runtime | 薄运行时上下文，只提供共享运行时集合和查询入口，不承载玩法规则或完整 ECS 生命周期 | `WorldContext`, `RuntimeContext`, `GameWorld` |
| 资源清单 | `AssetManifest` | Config | Content | 现代资源键和加载策略 | `ResourceManifest`, `AssetsMap` |
| 玄龟已解码资源 | `PetTurtleAssets` | Read-only Resource Catalog | Content | 同一Phaser缓存中的223交付资源查询，含原状态、显示树、时钟定义和碰撞位平面；不持有战斗时钟、HP或目标 | — |
| 玄龟视觉状态 | `TurtleVisualState` | Read-only Resource Record | Content | 保留原生stateId、owner/paintParts、递归相位、显示树链接与源trace；不是可变战斗状态 | — |
| 玄龟命中采样 | `PetTurtleCollisionSystem` | Stateless Query | Combat | 将实际效果根与怪物根换算为原生交集，消费同一玄龟资源位平面；不选择目标、不推进时钟、不结算HP | — |
| 玄龟攻击数值 | `PetTurtleDamageSystem` | Stateless Calculation | Combat | 表达原版普攻/圣灵盾威力与BaseBullet缓存输入；缓存接受和HP结算沿用公共战斗入口 | — |
| 场景 | `Scene` | Phaser Concept | Runtime | Phaser 场景；具体类可用 `BootScene`、`TestScene` | `Screen`, `View` |
| 英雄 | `Hero` | Entity | Combat | 玩家可控制战斗角色；对应 AS3 `Role*` 行为参考 | `Role`, `Character`, `PlayerCharacter` |
| 英雄编号 | `HeroId` | Value Object / Type | Combat | 五个可选英雄的稳定编号，对应 AS3 `roleid` 1 至 5 | `RoleId`, `CharacterId` |
| 英雄普攻模型 | `HeroNormalAttackModel` | Model | Combat | 单个英雄普攻连段、冷却、当前动作和武器形态的运行状态 | `RoleAttackModel`, `AttackState` |
| 英雄普攻系统 | `HeroNormalAttackSystem` | System | Combat | 根据输入和英雄移动状态触发普攻动作、特效与命中框 | `RoleAttackSystem`, `NormalAttackSystem` |
| 英雄战斗模型 | `HeroCombatModel` | Model | Combat | 单个英雄生命、受击、死亡、保护和最近伤害事件状态 | `PlayerCombatModel`, `HeroHealthState` |
| 英雄队伍运行时 | `HeroPartyRuntime` | Runtime / Orchestrator | Combat / Runtime | 单局活动英雄的唯一运行时 owner，按 `PlayerSlot` 持有移动、战斗、普攻、技能与角色视觉生命周期；只消费关卡环境快照，不拥有地形、波次或机关规则 | `PlayerRuntime`, `PartyCombatRuntime`, `LevelHeroRuntime` |
| 英雄运行时 | `HeroRuntime` | Abstract Runtime Class | Combat / Runtime | 单个活动英雄的公共运行时骨架，统一移动、战斗、普攻、技能、快照与销毁顺序；`Hero1Runtime` 至 `Hero5Runtime` 只实现角色差异钩子，由 `HeroPartyRuntime` 聚合 | `RoleRuntime`, `CharacterRuntime`, `PlayerHeroRuntime` |
| 飞鸟怪独立攻击 | `Monster30AttackRuntime` | Runtime Model | Combat | 由既有Monster30实体持有身体时钟和已发射攻击，出生根固定，HP死亡不撤销，destroy释放；只覆盖232/241合同 | — |
| 飞鸟怪命中查询 | `Monster30CollisionSystem` | Stateless Query | Combat | 消费241正式位场与实际colipse profile，不持有HP/显示时钟 | — |
| 巫鹰独立攻击 | `Monster3AttackRuntime` | Runtime Model | Combat | 既有Boss/普通巫鹰实体共有的两攻击身体/发射/检测/销毁快照，消费247/248/250 | — |
| 巫鹰自然攻击选择 | `Monster3DecisionState` | Runtime Model | Combat | 实体持有的源host count/CD与自然动作决策，不属于显示桥 | — |
| 原生攻击位场查询 | `NativeAttackCollision` | Stateless Query | Combat | 复用已验证的带相位位场采样算法；具体怪物仍各自提供独立真值，不共享攻击像素或残差许可 | — |
| 怪物 | `Monster` | Entity | Combat | 敌方单位 | `Enemy`, `Mob` |
| 怪物击退运动 | `MonsterKnockbackMotion` | Runtime Model | Combat | 每个既有怪物owner持有的原host步速度、接触与秒制缓动；不新建怪物注册表 | `MonsterRecoilRuntime` |
| 怪物击退接缝 | `MonsterKnockbackBinding` | Runtime Model | Combat / Runtime | 挂在既有实体上的相位队列、host步累计和运动投影；释放随实体owner，不设全局注册表 | `MonsterRecoilSession` |
| 怪物击退计算 | `MonsterKnockbackSystem` | System | Combat | 按237实际profile推进原受击轨迹，复用静态轴对齐地面碰撞；不拥有AI、伤害或奖励 | `EnemyKnockbackSystem` |
| 怪物定义 | `MonsterDefinition` | Config | Combat / Content | 某类怪物跨关卡共享的只读配置，引用数值、物理、行为、能力、动画和奖励 profile | `EnemyDefinition`, `MonsterConfig` |
| 怪物定义目录 | `MonsterDefinitionCatalog` | Config / Registry | Combat / Content | 按怪物类型稳定 ID 查询唯一 `MonsterDefinition`；不保存单局可变状态 | `MonsterRegistry`, `EnemyCatalog` |
| 怪物攻击目标引用 | `MonsterAttackTarget` | Runtime Reference | Combat / Progression | 区分英雄/宠物、slot、运行实体与可选持久petId；保留真实对象回调，不按当前出战宠反查 | — |
| 怪物死亡经验绑定 | `MonsterExperienceBinding` | Internal State | Combat / Progression | 怪物既有模型持有目标与首次死亡结算状态；效果先于AI，帧尾清理；不接管掉落 | — |
| 怪物经验结算 | `MonsterExperienceSystem` | System | Combat / Progression | 消费231/239合同维护对象目标、原双英雄选择及一次性经验分配；由真实party/roster owner写数值和存档 | — |
| 英雄队伍经验适配 | `HeroPartyExperienceSystem` | System Adapter | Progression | 现有HeroPartyRuntime持有稳定英雄引用和实际当前宠查询；不创建第二英雄或宠物运行时 | — |
| 兼容宠物经验引用 | `PetExperienceTargetSystem` | Internal Adapter | Combat / Progression | 为尚未迁入Session的现有PetRuntimeModel保留对象身份与离场标记，瞬态元数据不进入存档 | — |
| 怪物运行状态 | `MonsterRuntime` | Runtime Model | Combat | 一只具体怪物的稳定 ID、位置、生命、目标与生命周期状态；不包含 Phaser 显示对象 | `EnemyRuntime`, `MonsterInstance` |
| 怪物行为策略 | `MonsterBrain` | Strategy / System Contract | Combat | 根据怪物与目标快照输出移动、攻击或技能意图；地面、飞行与 Boss 可替换实现 | `EnemyAI`, `MonsterController` |
| 怪物运行时注册表 | `MonsterRuntimeRegistry` | Runtime Registry | Combat / Runtime | 存活怪物唯一登记点，负责稳定 ID、创建、查询、死亡登记与安全移除；第一版不是完整 ECS | `MonsterWorld`, `EnemyManager`, `MonsterManager` |
| 宠物 | `Pet` | Entity | Combat / Progression | 玩家持有并可出战的伙伴实体；对应 AS3 `PetInfo`/`BasePet` 行为参考 | `Companion`, `Familiar` |
| 宠物模型 | `PetState` | Model | Combat / Progression | 单只宠物的可持久化运行数据，包含名称、等级、HP/MP、寿命、出战状态和技能名 | `PetInfo`, `PetData` |
| 宠物持久接收属性 | `PetReceptionAttributes` | Value / Save Fields | Combat / Progression / Save | PetState的missRate与magicDefenseRate比例及来源；A政策在存储边界备份后补缺项0并持久保留legacy-missing-baseline及字段列表，初始化/读档不代替成长或伤害结算 | `PetDefenseRuntime` |
| 宠物消耗品 | `PetConsumable` | Item Effect / Type | Progression | 道具背包中可对当前出战宠物生效的普通道具效果，例如寿命丹、还魂丹、经验石 | `PetItem`, `CompanionConsumable`, `FamiliarItem` |
| 宠物系统 | `PetSystem` | System | Combat / Progression | 管理宠物列表、单只出战、跟随实体运行状态和首批宠物 UI 数据 | `CompanionSystem`, `FamiliarSystem` |
| 宠物战斗运行时 | `PetCombatRuntime` | Runtime Class / Strategy Context | Combat / Runtime | 单个出战宠物在战斗中的唯一生命周期 owner，统一同步、跟随、索敌、技能选择、效果推进、快照与销毁；种类/形态差异只经 `PetBehavior` 注入 | `CompanionRuntime`, `PetBattleSystem`, `PetController` |
| 宠物战斗实体会话 | `PetCombatEntitySession` | Internal Runtime Session | Combat / Runtime | PetCombatRuntime内部复用的单实体步骤与临时会话；持有数值引用、目标/动作/阶段，不是第二顶层运行时或持久roster owner | — |
| 宠物动作时钟 | `PetAnimationClock` | Runtime Clock | Combat / Presentation | EntitySession持有的逐hosttick倒计时游标；消费形态只读持帧定义并产生typed动画事件，不负责AI、伤害或View | — |
| 宠物受击身体时钟 | `PetReceptionBodyClock` | Internal Runtime Component | Combat / Presentation | 254兼容19形态hurt/dead条件行路由，组合共享PetAnimationClock；只产生结束/技能清理信号，不持HP、保护、AI或显示对象；非受击动作只作为输入游标 | — |
| 兼容宠物受击组件 | `PetReceptionBodyOwner` | Internal Runtime Component | Combat / Runtime | 组合在既有兼容PetRuntimeModel上的动作/保护/清理组件；持有实际PetState引用，复用PetBattleOwnershipSystem唯一HP写入，不创建第二roster/AI/世界时钟 | — |
| 宠物私有召唤句柄 | `PetCombatSummonHandle` | Value Object | Combat / Runtime | 由顶层Runtime分配的私有实体身份；Behavior经窄端口创建/释放，包含父实体与出战来源身份，不持有另一套AI/CD | — |
| 宠物行为 | `PetBehavior` | Strategy Contract | Combat | 只表达某宠物种类/形态的技能选择、释放和持续效果差异，不拥有队伍存档、场景显示对象或公共跟随生命周期 | `PetAI`, `CompanionBehavior`, `PetStrategy` |
| 宠物普攻分支决策 | `PetNormalAttackDecision` | Internal Behavior Component | Combat | 猴/马 Behavior 各持一个实例，复用普攻分支间隔与两次条件随机选择；概率由家族提供，不持动画时钟、技能CD、目标或伤害状态 | — |
| 玄龟差异行为 | `TurtlePetBehavior` | Strategy | Combat | 四形态普攻/圣灵盾差异，经公共Session持有时钟、HP、CD与目标；后续技能选中时明确deferred，不伪装已释放 | — |
| 玄龟私有效果 | `PetTurtleProjectileSystem` | Internal Effect System | Combat | Behavior持有普攻/圣灵盾效果句柄，公共Session逐host tick推进；复用共享弹体存储、原生位平面与公共伤害端口 | — |
| 青龙后期形态私有效果 | `PetDragon23ProjectileSystem` | Internal Effect System | Combat | 二至四阶Behavior私有的逐host tick弹体与延迟波次，复用共享弹体存储/伤害端口，不持第二Runtime；沿用既有文件名 | — |
| 青龙效果碰撞采样 | `PetDragonEffectCollisionSystem` | Pure System | Combat | 消费219旧效果批准采样及220独立trigger源场；近似批准不跨对象，有限验证不声明普遍AIR像素等价 | — |
| 四阶青龙差异行为 | `Dragon4PetBehavior` | Strategy | Combat | 在青龙公共差异实现上表达奥义条件链、强化分身与移除治疗；AI、时钟、移动和私有实体生命周期仍由公共Session持有 | — |
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
| 战斗反馈事件 | `CombatFeedbackEvent` | Value Object / Event | Combat / Runtime | 只在伤害结算已形成实际 HP decrease 后派生，携带来源、owner、目标、暴击与可见反馈锚点；视图不得据攻击动画自行伪造 | `HitFeedback`, `DamagePopupEvent`, `FloatingDamageEvent` |
| 承伤数字显示输入 | `IncomingDamageFeedbackDisplay` | Value Object | Combat / Runtime | 215原版pnum显示API；消费结算producer提供的显示整数、target/owner与世界根坐标，显示值不必等于HP差；不计连击 | — |
| 承伤数字结算事件 | `IncomingDamageFeedbackEvent` | Value Object | Combat | 由实际HP结算owner发布source/attack/runtime、producer/ordinal、target/owner、结算值/显示值、HP前后与坐标快照；致死和零值不按HP差筛除 | — |
| 承伤数字会话 | `IncomingDamageFeedbackModel` | Model | Combat / Runtime | 关卡会话内的事件身份去重、trace与直接显示订阅；不持有伤害公式、怪物队列或连击 | — |
| 承伤数字目标绑定 | `IncomingDamageFeedbackTarget` | Value Object | Combat / Runtime | 把真实实体owner/runtime和当前世界根坐标绑定到其结算事件会话，发布时冻结坐标 | — |
| 承伤数字生产者 | `IncomingDamageProducer` | Value Object | Combat | 区分英雄、宠物、转嫁、环境及源显式数字调用；相同attack的不同producer不合并 | — |
| 命中框 | `Hitbox` | Value Object / Component | Combat | 攻击判定区域 | `AttackBox` |
| 受击框 | `Hurtbox` | Value Object / Component | Combat | 被命中判定区域 | `BodyBox` |
| 关卡 | `Level` | Entity / Config | Content | 一次可进入、刷怪、通关的流程 | `Stage`, `Mission` |
| 可玩关卡运行时 | `PlayableLevelRuntime` | Runtime Facade | Content / Runtime | 统一正式关卡的队伍/玩家、镜头/HUD、调度、失败、出口、结果、保存、路由和幂等销毁；组合定义、遭遇和窄 adapter，不是万能基类 | `BaseLevel`, `StageRuntime`, `LevelSceneRuntime` |
| 关卡定义 | `LevelDefinition` | Config | Content | 只读声明关卡 id、bundle、世界边界、出生点、门视觉引用、解锁与路由；不保存 Phaser 对象或单局状态 | `StageDefinition`, `LevelConfig` |
| 关卡世界适配器 | `LevelWorldAdapter` | Adapter | Content / Runtime | 跨越 Phaser 世界显示对象边界，创建地形/门视图并暴露明确快照；不实现战斗或遭遇规则 | `StageWorldBridge`, `LevelWorldBridge` |
| 关卡遭遇 | `LevelEncounter` | Runtime Contract | Content / Runtime | 编排停点、波次、Boss、机关与特殊入口并输出事件；不持有英雄/怪物内部算法 | `StageFlowSystem`, `LevelFlow`, `EncounterManager` |
| 传送门视觉定义 | `TransferDoorVisualDefinition` | Config | Content | 只读表达门皮肤、帧、原点与 SWF provenance；显隐、碰撞、上键和完成提交属于公共运行时 | `StageDoorConfig`, `TransferDoorDefinition` |
| 关卡解锁进度 | `LevelUnlockProgress` | Value Object / Save Data | Content / Save | 当前已解锁的最高关卡坐标；与英雄等级成长分离 | `StageProgress`, `LevelProgress` |
| 关卡英雄移动运行时 | `LevelHeroMovementRuntime` | Runtime Model / System | Combat / Runtime | 统一持有正式关卡内各玩家的移动模型、上一帧输入与移动调度；关卡只提供平台和动态边界 | `StagePlayerRuntime`, `PartyMovementRuntime` |
| 关卡生命周期 | `LevelLifecycle` | Runtime Class / System | Content / Runtime | 全部关卡默认复用的进行中、失败延迟、失败、通关、出口交互与幂等解锁 owner；特殊关卡只注入窄完成策略 | `StageLifecycle`, `StageFlowSystem`, `LevelStateSystem` |
| 关卡结果视图 | `LevelResultView` | Presenter / Scene View | Content / UI | 全部关卡共用的原版 `GameWin` / `GameFail` 投影，统一成绩字段、按钮状态与下一关/重试/返回回调；不持有关卡内容流程 | `StageResultBridge`, `ResultOverlay`, `LevelResultScreen` |
| 关卡内容流程模型 | `Stage*FlowModel` | Model | Content / Runtime | 单关地形推进、停点、波次、Boss/机关等内容状态；继承通用 `LevelLifecycle`，不得重新定义终态、失败倒计时或解锁提交 | `LevelState`, `StageLifecycle` |
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
| 丹药成长状态 | `ImmortalityFlags` | Value Object / Save Data | Progression / Save | 每名玩家五类五阶丹药的 5×5 二值服用状态；背包物品、灵魂和玩家槽位仍由既有 owner 持有 | `PillList`, `ImmortalityList`, `ElixirState` |
| 丹药系统 | `ImmortalitySystem` | System | Progression | 负责顺序解锁、服用、炼制、加成汇总和背包/灵魂原子事务；不创建页面私有库存 | `PillSystem`, `ElixirSystem` |
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

| 宠物公共被动会话 | `PetPassiveSession` | Internal Runtime State | Combat | EntitySession持有回复/六增益计数及宠物自身效果；复用宿主步，不进入roster存档 | `PetPassiveRuntime` |

| 宠物增益显示信号 | `PetPassiveVisualSignal` / `PetPassiveVisualPort` | Transient Display Port | Combat | 既有数值owner发出的首次显示/宠物效果隐藏命令；刷新不重发，主人独立显示不随数值到期清除，不持久化 | `PetBuffRuntime` |

| Monster3独立攻击 | `Monster3Attack` / `Monster3AttackRuntime` | Runtime State | Combat | 持有独立攻击根/帧/接收计数与引用生命周期；身体死亡不自动清弹，显示只投影 | `Monster3BulletState` |
| Monster3自然选择计数 | `Monster3Selection` | Runtime State | Combat | 持有原宿主count/CD/rate；位置、动作和目标继续来自既有owner | `Monster3AIState` |
| Monster2独立攻击 | `Monster2Attack` / `Monster2AttackRuntime` | Runtime State | Combat | 既有怪物持有身体与两独立hit1的根、相位、接收和引用；hit2不成为伤害弹 | — |
| Monster2裸聚拢显示 | `Monster2RawDisplay` | Display State | Combat | 独立14帧ENTER/EXIT生命周期，无sourceRole或HP；普通暂停继续，Scene退出清理 | — |
| 怪物自然选择策略 | `MonsterAttackSelection` | Shared Policy | Combat | 复用有限原选择顺序，Monster2/3分别提供CD与范围；不持有第二怪物目标或动作owner | — |
