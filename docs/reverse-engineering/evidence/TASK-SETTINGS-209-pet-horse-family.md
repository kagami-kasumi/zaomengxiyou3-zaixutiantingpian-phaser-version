# TASK-SETTINGS-209 马系完整家族证据

## 范围与结论

- 家族：`horse1..4`；只覆盖 `PetHorse1..4`、共享 `BasePet/BaseBullet/BaseAddEffect`、`SpecialEffectBullet/FollowBaseObjectBullet/EnemyMoveBullet` 与 193C 已声明的 `20120203.swf`、`pet1.swf`、`StageCommon.swf`。
- 机器真值：`task-settings-209.pet-horse-family`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json`，状态 `verified`。
- 视觉引用：`task-settings-193c.pet-horse-animation` 的 716 states / 20 display objects / 716 original baselines，`unresolved=[]`；209 不重新派生 atlas 或 baseline。
- 实现交接：`TASK-SLICE-210`。本 task 不修改 `src/`，不宣告马系已经在正式运行复现。
- 完整合同集：`CONTRACT_SET:owner.body|owner.effects|owner.collision|visual.states|visual.baselines|runtime.update-order|runtime.target-order|runtime.target-loss|runtime.follow-owner|runtime.follow-target|runtime.warp|runtime.action-priority|runtime.normal-roll|runtime.cooldown-order|runtime.hurt|runtime.death|runtime.destroy|runtime.projectile-collision|runtime.attack-id-dedup|runtime.damage-pipeline|runtime.ice-effect|runtime.p1-p2|horse1.normal|horse1.sp|horse2.normal|horse2.bd|horse2.sp|horse2.hurt-release|horse3.normal|horse3.bd|horse3.sp|horse3.bz|horse3.hurt-release|horse4.normal|horse4.bd|horse4.sp|horse4.bz|horse4.tmaoyi|horse4.hurt-release|horse4.tmaoyi-targeting|horse4.tmaoyi-ice|horse4.tmaoyi-explosion|horse4.tmaoyi-cleanup`

实现影响型未知为零。expected 集由四个 `PetHorse` 类、技能池 `sp/bd/bz/tmaoyi` 和三份恢复 SWF 在提取前冻结；extracted 集由生成器从四个 form/action 对象与效果引用独立汇总。两者在 manifest `/completeness` 中逐项相等，不能用现代 `HorsePetBehavior` 已有分支反向缩小范围。

## 待证明问题的回答

1. `BasePet` 以怎样的更新顺序完成索敌、追击、普通攻击、技能优先级、冷却、回跟和 warp？见 manifest `/sharedRuntime`。
2. horse1..4 的普通攻击、全部已继承技能、发射时刻、碰撞、伤害与销毁是什么？见 `/forms/0..3`。
3. `PETHORSE_ICE` 与 `tmaoyi` 的追踪、冻结、二段爆炸和组合技能门槛如何工作？见 `/sharedRuntime/ice-effect` 与 `/forms/3/special/tmaoyi`。
4. owner/load precedence、视觉时间轴、碰撞体与 P1/P2 生命周期是否闭合？见 `/owners`、`/visualTruth`、`/collisionProfiles`、`/playerLifecycle`。
5. 现代实现当前能证明什么？193D 只证明孤立真动画；公共 Runtime 和双 slot 已存在，但马系普通攻击仍是字符串事件，正式 horse bridge 仍使用第二套 `PetRuntimeSystem` 表现 owner，正式伤害解析缺失。见 `/modernConsumers`。
6. 实现 task 如何避免猴系 V2 的“同源测试自证”？见 `/p1rAcceptance/acceptanceMatrix`：43 个合同 id 各自绑定 expected fields、受控场景、黑盒 trace 字段与语义 assertion，并要求 range/hit/source 三类 mutation-kill。

## Owner、来源与反证

| 对象 | 运行 owner | 一手 locator | 反证与裁决 | 等级 |
| --- | --- | --- | --- | --- |
| `PetHorseBmd1..3` | `assets/20120203.swf` characters `17/15/12` | 193C manifest `/provenance/0`；`Aloader` 启动加载链 | `pet1.swf` 有较晚重名候选；同一 `ApplicationDomain` 中启动补丁 owner 已先建立 | 交叉确认 |
| `PetHorseBmd4` | `assets/pet1.swf` character `19` | 193C `/provenance/1` | 审计包中无第二精确候选 | 交叉确认 |
| 一至三阶普通/技能对象 | `assets/20120203.swf` characters `129/124/118/101/97/93/88/82` | 193C `/displayObjects` 与证据表 | `pet1` 的重名对象加载更晚；不得混帧 | 交叉确认 |
| `PetHorse4Bullet5/Explode` | `assets/pet1.swf` characters `699/695` | 193C `/displayObjects` | 699 根 1 帧但 nested character 698 为 8 帧；禁止误判静态 | 交叉确认 |
| `PetHorseIceEffect` | `assets/StageCommon.swf` character `40` | `BaseAddEffect.as:2947-2987`；193C owner 表 | `pet1` character 1107 是关卡期较晚候选 | 交叉确认 |
| `ObjectBaseSprite3/4` | `assets/StageCommon.swf` characters `103/101` | `PetHorse1.as:92-97`、`PetHorse2..4.newColipse`；SWF-derived SVG | 同一确切 collision class 直接用于马系，尺寸分别 `31.05×29.95`、`35×69.95` | 交叉确认 |

三个恢复 SWF、四个家族类、共享 runtime/bullet/effect 类、`PetInfo` 与 193C manifest 的 SHA-256 固化在 `/sources`；生成器先校验 hash 和关键源码片段，再允许输出 verified。

## 共享 BasePet 行为合同

| 合同 | 原版事实 | locator | 反证条件 |
| --- | --- | --- | --- |
| update | 每 step 先推进私有 bullets；每 `frameClips` 触发 passive；随后 AI、passive upgrade、CD 递减、timeCount、`>=1000` warp、BaseObject step | `BasePet.as:141-184` | 更新顺序变化 |
| target | `gc.obbsiteArray` 中首个距离 `<=1200` 的对象；死亡或距离 `>=1200` 后清空，当前帧不重选 | `BasePet.as:305-333,1075-1086` | 改为 nearest 或同帧重选 |
| skill priority | `skill1 -> skill2 -> skill3 -> skill4 -> once-per-second normal/follow`；AI 在 CD 递减前读当前值 | `BasePet.as:334-374,185-215` | 选择前 tick CD 或并行施法 |
| normal roll | 进入各形态 `attackRange` 后第一次随机 `<=0.7` 才攻击；失败后重新随机，`<0.3` wait，否则追击 | `BasePet.as:354-374` | 合并为一次随机或范围外攻击 |
| follow/warp | 无目标时距离主人 `>640` 回跟；有目标时范围外追击；离主人 `>=1000` 且非攻击/受击直接把 root 放到 `owner.x, owner.y-30` | `BasePet.as:174-182,1009-1043` | 新增无证据 warp 动画或便利阈值 |
| hurt/death/destroy | horse2..4 在 `super.reduceHp` 后置 `skill1Release=true`；死亡显示仍优先；dead 行结束销毁全部私有 bullet/效果并清 owner slot | `PetHorse2.as:280-284`、`PetHorse3.as:318-322`、`PetHorse4.as:358-362`、`BasePet.as:865-934,1150-1189` | lethal hit 不再置 flag 或跨 slot 清理 |

## 四形态普通攻击与技能

所有发射只在单机或 `gc.sid == sourceRole.sid` 的 owner 侧创建；`setRole` 快照 pet attack id，`BaseBullet.checkAttack()` 每 active step 对 `monsterArray + likeMonsterArray` 做碰撞，目标 `beAttackIdArray` 去重后进入 `beMagicAttack`。效果存在或动画播放不等于命中；210 必须以实际 `hpAfter < hpBefore` 证明伤害。

| 形态 | attackRange | 普攻发射 | 已继承技能（按优先级） | 碰撞 |
| --- | ---: | --- | --- | --- |
| horse1 | 40 | body normal sequence 5 hold tick 8，`PetHorse1Bullet1`，`±45,-25` | `sp`：目标距离 `50..100`，CD `2s -> 2s`，20 MP；sequence 4 tick 8，跟随本体的 `PetHorse1Bullet2`，2 秒冰效 | `ObjectBaseSprite3` |
| horse2 | 70 | sequence 3 tick 20，`PetHorse2Bullet1`，`±70,-90` | `bd`：受击 flag、CD `2s -> 2s`、20 MP，sequence 1 tick 15，`PetHorse2Bullet2`，清 flag；`sp`：CD `3s -> 4s`、距离 `50..100`，sequence 3 tick 1，复用 `PetHorse1Bullet2` | `ObjectBaseSprite4` |
| horse3 | 150（BasePet 默认） | sequence 3 tick 20，`PetHorse3Bullet1`，`±150,-140` | `bd`、`sp`；`bz`：CD `5s -> 6s`、20 MP、距离 `<=250`，sequence 3 tick 20，`PetHorse3Bullet4` | `ObjectBaseSprite4` |
| horse4 | 150（BasePet 默认） | 同 horse3 并乘 `hurtBaseEffectRate()` | `bd -> sp -> bz -> tmaoyi`；前三者沿用 horse3 视觉/门禁并乘倍率；奥义 CD `15s -> 24s`、30 MP、有 target 即可 | `ObjectBaseSprite4` |

### 伤害与 hit 配置

- 普攻：`(atk + magicAdd) × crit(1|2) × GXP(1|1.2)`；horse4 再乘 `hurtBaseEffectRate()`。
- `sp/bd`：`(3.6 × atk × 1.05 + magicAdd) × crit × GXP`；`bz` 把 `3.6` 换为 `6.6`；horse4 再乘倍率。
- `hit1/hit2/hit3/hit4` 的 `attackInterval` 分别为 `999/24/21/12`。`hit2` 带 2 秒 `PETHORSE_ICE`。
- `BaseBullet.refreshSourceRoleAttackInfoObject()` 还把 pet `_atk` 快照为 `petInfo.atk × 2.8` 供目标伤害管线使用；不能把该字段误当 `hurt` 公式本身。

### 天马奥义的非通用差异

1. body `hit5` sequence 3 hold tick 10 后，以当时 `monsterArray.length` 为数量，每怪一枚 `PetHorse4Bullet5`；遍历目标使用反向数组索引，生成 x 为 `horse.x + (count/2-index)×90`，y 固定 `50`。
2. 下落物根只有 1 帧，nested 视觉循环 8 帧；初速 `(0,1)`、加速度 `(0,1)`、y 速度上限 35，距离 2000 或 `frameClips×10` 销毁。
3. 只有学 `sp` 才绑定对应 monster 为 tracking target；否则只按重力下落。
4. `hit5_1` 复用 `sp` 伤害，运行时强制 `hitMaxCount=1`、`attackInterval=20`；学 `bd` 才附加 `frameClips×2.4` 冰冻。
5. 只有学 `bz` 才在命中点创建 `PetHorse4Bullet5Explode`，其 `hit5_2` 复用 `bz` 伤害；同时学 `bd` 时延迟 1 秒，否则立即创建；创建时 pet 已死则取消。
6. 奥义前置还创建 disabled `FollowBaseObjectBullet("AoyiBuff")` 并 `setYourFather(20)`。所有下落物、延迟爆炸和 buff 都属于该 pet 的私有销毁范围。

## 共享冰效与视觉时间轴

`BaseAddEffect.show_pethorse_ice()` 只允许目标上存在一个同名 `PetHorseIceEffect`，把 width/height 强制设为 collision 尺寸，并停止目标 BBDC；到期移除 child、恢复 BBDC 和玩家输入。视觉 owner、逐对象矩阵、注册点、可见边界、host clock、frame-over 与销毁直接引用 193C manifest `/states`、`/displayObjects`、`/baselines`，不在本证据文档复制第二份坐标表。

193C 已证明 body wait/walk/hurt/dead/normal/sp/bd/bz/tmaoyi 与 10 个 bullet/effect 对象的 716 个状态。209 新增的是这些视觉状态与 AI、发射、碰撞、伤害、owner、P1/P2 lifecycle 的同集合同，而不是重新把视觉 verified 当成战斗完成。

## 现代 owner / 消费者审计

| 合同 | 当前 owner / 消费者 | 能证明 | 不能证明 / 210 要关闭 |
| --- | --- | --- | --- |
| body/effects | `PetHorseAnimationAssets -> PetHorseAnimationView -> FormalPetHorseBodyBridge` | 193C/193D 的孤立真动画、五关可创建 view | bridge 仍消费 `PetRuntimeSystem`，没有 `PetCombatSnapshot/actionToken`，无法证明攻击对应真实命中 |
| Runtime owner | `HeroPartyRuntimeBridge` 的 P1/P2 `PetCombatRuntime`；TestScene 共用入口 | 双 slot 公共 Runtime 已存在 | horse action/projectile/damage 未接上正式结算 |
| Behavior | `HorsePetBehavior` | 四形态注册和一个 form-labelled 技能请求 | 普攻只有字符串事件；缺继承技能优先级、距离门、双随机、受击 flag 的三四阶继承、奥义组合链 |
| skill request | `PetSystem requestPetHorse*Skill` 与 `TestScenePetMagicBridge` | 旧现代最小技能返回值 | 不是 verified body hit timing、真实 projectile collision 或正式 HP decrease；数值不是本真值公式 |
| formal damage | `HeroPartyRuntimeBridge.resolveAttacks` | 猴系已有正式 `resolveFormalPetMonkeyProjectileHits` | 没有 horse 对应解析；动画不能自证命中 |
| lifecycle | Runtime/roster/bridge 各有局部 destroy | 换宠、休息入口存在 | 旧 horse body owner 与 CombatRuntime 可能分叉，delayed explosion/source cleanup 未证明 |

明确拒绝：恢复 `Scene -> requestPetHorse*Skill` 直连、让 view 直接扣血、保留 `PetRuntimeSystem` 为第二战斗 owner、用字符串 `basic-attack` 当普通攻击、用现代 tuning 反推 expected、仅跑 TestScene 或仅看动画宣告完成。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| owner 与完整视觉集 | `PetHorse1..4.initBBDC/newColipse`、193C owner 表 | `Aloader -> ApplicationDomain.currentDomain -> AssetsLoader` | 193C 716 states / 20 objects / baselines | 交叉确认 | load order/SymbolClass/hash 变化 | 193C truth + 209 source hash + corpus |
| BasePet AI/普通攻击 | `BasePet.myIntelligence` 与每形态 `normalHit/enterFrameFunc` | ordered target、CD、movement、bullet step | form collision、emit world offset、body sequence/tick | 交叉确认 | 范围外出现 action/projectile | generator + 210 range negative trace + range mutation |
| `sp/bd/bz` | 四个类 `beforeSkill/releSkill/doHit/getRealPower` | PetInfo MP/harm、BaseBullet hit、BaseAddEffect ice | 193C effect timeline、emit matrix、collision class | 交叉确认 | inherited slot/门禁/公式变化 | generator + 每技能 P1/P2 trace + hit mutation |
| `tmaoyi` | `PetHorse4.as:352-565,615-713` | EnemyMoveBullet、TweenMax delayed callback、BaseBullet callback/damage | 699 nested 8 帧、695 30 帧、逐怪 world fixture | 交叉确认 | skill 组合不再改变 tracking/ice/explosion | 五组合 fixture + 多目标 formal trace |
| damage/dedup | `BaseBullet.checkAttack/setRole/setAction/refreshSourceRoleAttackInfoObject` | monster `beMagicAttack -> reduceHp` | target collision 与 projectile display tree | 确认事实 | 同 attackId 重复 HP decrease 或动画无伤害 | HP before/after + attackId trace + source mutation |
| P1/P2 lifecycle | `sourceRole.sid` emit gate、BasePet destroy | roster/public bridge/正式五关/TestScene | P1/P2 各自 body/effect/projectile root | 确认事实 + 现代待实现 | 跨 slot target/CD/projectile/source/cleanup | 双 slot 生命周期与 940×590 正式运行 |

## 配对实现验收

`TASK-SLICE-210` 必须直接消费 manifest `/p1rAcceptance`：

- 43 个合同 id 在 evidence、manifest matrix、acceptance matrix、210 `CONTRACT_SET` 中顺序完全一致；
- 四形态 × P1/P2 从 `attackRange` 外开始，先证明无早攻和距离下降，再入围攻击；
- action token → projectile id/action → attack id → pet damage source → HP decrease → cleanup reason 保持同链；
- 每个继承/本阶技能均覆盖 CD/MP/距离/受击门、visual emit、collision/tracking、伤害与销毁；
- 奥义覆盖无继承技能、sp only、bz only、bd+bz、sp+bd+bz 和多怪目标；
- range、普通攻击 verified hit timing、source owner 三种 mutation 都必须被独立 verifier 杀死；
- TestScene 与至少一个 940×590 正式关卡共用 Runtime 和 source snapshot，P1/P2 零串扰、零 console warning/error；
- `npm run check:system-design -- pet P1H`、马系专项、193C/193D、全系统、build、structure、annotations、workflow、problem audit 与 diff check 全绿。

## Skill 第二家族证据阶段记录

- `$pet-family-reverse` V3 阻止了 4 类可能遗漏：只沿用 193C 视觉；只登记现有 Horse Behavior；把 `basicAttack` 字符串事件当命中；把奥义压成一个 generic area skill。
- 新的家族差异有 5 类：三四阶继承全部早阶技能；`bd` 受击门且发射时清 flag；共享冰效暂停目标 BBDC；奥义按 monster 数量生成对象；`sp/bd/bz` 分别控制 tracking/ice/explosion，且 bd 改变爆炸时序。
- 本证据 task 没有跨家族、没有修改 `src/`、没有新增第四份视觉 owner、没有触发拆分条件；`unresolved=[]`。
- 阶段结论只能是“第二家族证据阶段通过”；是否跨家族采纳必须等 210 正式实现、独立语义 verifier、mutation-kill 和玩家可见运行完成后裁决。
