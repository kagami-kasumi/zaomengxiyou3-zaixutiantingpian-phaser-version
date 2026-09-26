# 公共怪物死亡经验归属合同

来源任务：TASK-SETTINGS-231，2026-09-26。适用 M-030/M-032/M-040、VS-067。后续实现：TASK-SLICE-238。

本项闭合的是当前五关/TestScene 所需的攻击者对象和死亡经验合同；没有修改现代玩法，也不核销猴马原84项中的生产归属责任。功能线仍 Active。

## 待证明问题与范围

1. 直接命中、火焰 tick、AI 重选分别何时写入归属？
2. 死亡时究竟读取玩家 slot、英雄对象还是宠物对象？英雄和宠物如何分配经验？
3. 攻击者死亡、离场、换宠与怪物效果/AI/清理的相位怎样影响接收者？
4. 正式五关与 TestScene 的真实入口是否保留这些事实？怎样拒绝错误比例、新宠冒领和重复奖励？

声明范围为当前12实际怪物类型 `2/3/4/5/6/7/8/9/10/16/19/30` 的公共归属；集合直接与237生成的 `src/assets/monster-knockback-profiles.json` 对账。12类均没有覆写 `beMagicAttack/selectTarget/reduceHp` 或直接重设 `curAttackTarget`，其 `myIntelligence` 都在 `!isBeAttacking()` 时调用基类。其他怪物、掉落随机分布、灵魂视觉、完整升级/进化与联机不在本项。

## 原版合同

以下路径均以 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/` 为根。AS3只用于行为；本项没有视觉/空间提取结论。

| ID | 确认事实与边界 | 一手入口 | 动态交叉确认 |
| --- | --- | --- | --- |
| XP-01 | `BaseBullet.checkAttack` 在 attack-id 去重后传递真实 `sourceRole` 对象给 `beMagicAttack`。保护、碰撞失败和闪避提前返回，不覆盖目标；通过后在伤害结算前写 `curAttackTarget = param2`。即使 attackInfo 为空也已写入，不能把“HP实际下降”作为唯一写入条件 | BaseBullet.as:298；BaseMonster.as:847–916、1146–1153 | hero/pet/dodge/protected/miss/accepted-no-info；BaseMonster前缀动态；BaseBullet调用/去重仅静态确认，碰撞为受控输入 |
| XP-02 | 火焰每次到期只对效果宿主 `sourceRole.reduceHp(hurt,false)`；该 sourceRole 是被烧的怪物，不是施火者。不写攻击者，也不能永远按最初火焰owner结算 | BaseAddEffect.as:748–754 | fire-retains-pet、later-hero、later-pet；火焰时长与视觉仍复用228/229/226 |
| XP-03 | 基类AI冻结/debuff门禁之后：无目标才 normalWalk/selectTarget；已有死目标只清空、本次不立即重选；已有活目标执行 hasAttackTarget。12类受击时跳过基类AI。原Config候选只含存活hero1/hero2，不含宠物；selectTarget沿AUtils原算法并受alertRange约束 | BaseMonster.as:532–546、708–719；Config.as:1122–1134；AUtils.as:316–356；12覆写见source-audit | ai-retains、dead-ai-clear/next、retired-reselected、frozen-ai、hurt-ai、out-of-range、no-live-heroes |
| XP-04 | `BaseMonster.step` 先 `super.step`（身体/物理后效果），活着才AI，再在尾部清理目标的 isDead/isReadyToDestroy。故效果致死可以先向尚未清除的已死/离场对象结算；先清空一帧、下一帧效果致死可能无接收者；再多一帧合法AI重选后才可能归新英雄 | BaseObject.as:165–238；BaseMonster.as:305–369；PhysicsWorld.as:470起先monsterArray后heroArray | retired/dead-world-lethal、retired-world-one-wait、retired-world-two-waits；执行完整原BaseMonster.step，基类仅保留原效果调用片段，移动/显示为明示边界 |
| XP-05 | reduceHp首次转入dead时同步分配。英雄对象无pet：英雄100%；英雄对象有当时的getPet：英雄与该宠各60%（总120%，非平分）；宠物对象：仅该petInfo100%，英雄0。无对象/其他对象：无经验。两setter参数为int，小数在调用时截断。英雄分支先英雄setter，再重新读getPet给宠物 | BaseMonster.as:1433–1470；BaseRoleProperies.as:790–811；PetInfo.as:2371–2375 | hero、hero-pet、pet；exp=1/7/101/1000 × P1/P2；101共享各60 |
| XP-06 | 英雄分支的pet是死亡时实例，英雄归属后换宠则新当前pet共享；宠物分支保留原petInfo对象，不能按同slot当前宠替换。BasePet.destroy标记待销毁、clearPet、断sourceRole，但不清空_petInfo；失效清理前仍可给旧petInfo经验。清理后依XP-03/04，不承诺“所有离场旧宠永远有经验” | BasePet.as:95–96、127–135、1150–1189；BaseHero.as:990–993、1616–1619 | hero-new-pet、old-pet-new-active、retired-before-fire/cleared/reselected |
| XP-07 | 经验一次性边界是 `curAction != dead`，不是是否还收到reduceHp调用；重复直接扣血/火焰不重复发放。英雄附带商人时装回血也只在该首次英雄分支执行。hero已死但引用未清时仍可写经验；roleProperties没有who/player时setter拒绝写入 | BaseMonster.as:1443–1470；BaseRoleProperies.as:792–795 | repeat、hero-merchant、dead-hero-before-fire、hero-no-player |
| XP-08 | BaseHero.initPet拿User.findCurrentPet返回的同一PetInfo建宠物；User.petsAry持有其存档对象，getPetSaveString遍历这些对象。宠物经验setter会触发petUpdate；英雄setter写User当前经验并可能升级。现代实现必须到达真实进度/存档owner，不能以奖励sink收到数字证明完成 | BaseHero.as:394–427；User.as:955–970、1263–1283；PetInfo.as:1364–1420、2371；BaseRoleProperies.as:790 | typed原setter执行；升级回调/持久存储是受控边界，现代真实升级与重载留238验收 |

XP-01的BaseBullet producer/attack-id去重顺序为静态源码**确认事实**，沿用230已有去重证据；264例没有执行完整BaseBullet.checkAttack。XP-01中BaseMonster接受/拒绝与目标赋值，以及XP-02..07的表列动态分支，为原源码与原包AIR 51.1.1.5有界重放的**交叉确认**；其他对象无经验及XP-08对象/存档连接为静态**确认事实**。普通伤害数值、碰撞、完整技能以及升级视觉没有在本项重新核销。

原 `AUtils.GetNearestObj` 使用 `sort(Array.RETURNINDEXEDARRAY).indexOf(0)`，不得擅自视为新的标准数值最短距离算法。探针原样执行，输入只选两候选、同数量级且无平局；本项不声明任意列表排序几何或重构全怪物AI。238应保留已证选择算法/候选顺序，遇到新排序或AI行为缺口须补证。

## 六段证据链与验证边界

| 段 | 本项证据 | 不足与反证条件 |
| --- | --- | --- |
| 局部对象 | 237实际类型集合与12个Monster源码继承核查，BaseMonster受击与reduceHp | 若新类型覆写奖励/目标，不能直接外推 |
| 共享链 | BaseBullet→BaseMonster；BaseObject效果→BaseAddEffect；Config候选；BaseHero/BasePet→PetInfo/User | 不能用当前slot代替对象；不能忽略setter和生命周期相位 |
| SWF几何 | **不适用**：不新增UI、显示列表、位置/碰撞事实，探针x只是AI输入；既有228/229/237空间证据不变 | 未生成UI Schema/视觉truth，不宣称原生UI或像素通过 |
| 可观察合同 | XP-01..08；独立expected表 `tools/monster-reward-source/verify.py` | 任何策略改变接收对象/数值/重复发放即失败 |
| 现代映射 | 下方五关/TestScene矩阵；真实实现留238 | 本次没有现代修复、消费者通过或家族完成结论 |
| 双重验证 | 原包AIR的264运行样本、六类编译源变异、四字段损坏拒绝；现代既有preflight实跑重现反例 | AIR是提取方法/片段在受控支架中执行，非完整旧游戏回放；现代可见经验、正式真实攻击与重载留238 |

有界原生支架直接编译：完整reduceHp/myIntelligence/selectTarget、完整BaseMonster.step、受击方法截至赋值的前缀、原火焰分支、原目标清理/宠物销毁身份片段、原typed经验setter、原Config/AUtils方法。可复验源码片段hash、行号、完整文件hash、编译/运行命令与SWF hash在 `docs/tasks/evidence/TASK-SETTINGS-231/source-trace.json`。

明确的支架边界：接受/拒绝碰撞由fixture注入；HP、isDead、受击状态是输入；动画/移动、hasAttackTarget技能行为、升级与进化回调、Antiwear容器、实际磁盘存档均未在该支架内完整运行。完整BaseBullet入口和attack-id去重未在264例内动态重放。原版无显示改动，本项不需要浏览器视觉验收；后续不能把此样本当作正式游戏端到端通过。

## 现代消费者矩阵

以下为2026-09-26核定的现代缺口；`targetSlot`、slot级`lastHitBy`、宠物实体ID与roster PetInfo身份不能互换。

| 入口 | 实际链与关键位置 | 当前反例/缺口 | 238关闭要求 |
| --- | --- | --- | --- |
| 正式1-1/TestScene普通英雄 | TestScene.ts:451/500→TestSceneStage11RuntimeAdapter.ts:26→TestSceneCombatBridge.ts:133–145→PetBattleOwnershipSystem.ts:70–78 | 命中只写aura map，XP优先AI targetSlot；两者可分叉 | 真实P1命中/P2原AI目标，归属写入与同步死亡分配；不依赖fallback |
| 正式1-1/TestScene宠物 | TestSceneHeroPartyRuntimeBridge.ts:155–160→TestScenePetEnemyAdapter.ts:31–50→Stage1CombatSystem.resolveStage1PetHit | adapter setter只回传slot；没有kind/实体/宠物数据身份 | 正式Runtime宠物命中、火焰致死，验证具体宠物100%且英雄0 |
| 正式1-1/TestScene效果与弹体 | TestSceneWorldBridge.ts:115–124、679–690、732–737→claimMonsterExperienceForCurrentTarget | 普通弹体和毒路径写targetSlot不一致；AI每次刷新覆盖；纯tick后以AI目标领奖 | XP-01..04所有状态转移，共享一次性owner；每种有效直击入口纳入，不扩展毒技能逆向 |
| 正式1-1 Boss | TestSceneBossArena.ts:67–87、213–228；TestSceneWorldBridge.ts:754–813 | 英雄近战写boss.lastHitBy；通用弹体接受pet-*却未写owner，死亡fallback到inventory玩家；无pet身份 | 真实Boss英雄/宠物producer分别测；不可只用普通Monster30适配器替代 |
| 正式1-2 | Stage12GameplayBridge.ts:72–95→Stage1RewardBridge.ts:59–90 | 以lastHitBy/首存活玩家结算；只awardStage1CombatPlayerExperience | 正式关卡创建的bridge，真实roster、英雄进度、奖励通知及重载 |
| 正式1-3 | Stage13GameplayBridge.ts:85–89、205–212→同一reward bridge | 同上 | 同上 |
| 正式2-1 | Stage21GameplayBridge.ts:118–123、262–269→同一reward bridge | 同上 | 同上 |
| 正式2-2 | Stage22GameplayBridge.ts:150–155、280–287→同一reward bridge | 同上 | 同上 |
| 公共战斗入口 | HeroPartyRuntimeBridge.ts:321–340→Stage1CombatSystem.ts:490–552 | resolveStage1PetHit接收到petId，落地却仅写ownerSlot到lastHitBy | 传递具体运行对象与持久宠物身份；晚到弹体、换宠不靠当前active反查 |
| 分配/去重/持久层 | PetBattleOwnershipSystem.ts:81–103；PetConsumableSystem.ts:103；MonsterDefeatRewardSystem.ts:68–120 | pet分支虽存在，缺petId时回退activePet；当前消费者只传hero。settledDefeatIds只能防重复，不能证明对象正确 | 去掉新宠冒领；英雄分配按实际getPet语义；同一次死亡独立验证经验/掉落不重复，保存/重载真实结果 |

已有行为一致项只有局部：PetConsumableSystem英雄共享公式为floor(exp×0.6)，奖励系统有defeat-id去重。均不足以说明真实consumer正确。子agent只读矩阵已由主agent抽查关键消费者；其最初“分离AI且固定效果owner”的建议与XP-03冲突，已退回并修正，未采用。

## 复验与交接

```powershell
python tools/monster-reward-source/audit.py
python tools/monster-reward-source/capture.py
python tools/monster-reward-source/verify.py --mutations
npx --no-install tsx tools/pet-target-owner-preflight.ts
npm run check:workflow
npm run audit:problems
```

原包AIR动态样本：33场景 × P1/P2 × 4经验值 = 264；每例另比较首次/两次重复结算、setter调用和英雄持久接口。六变异为不写攻击者、共享比例100%、旧宠换为当前宠、重复奖励、不清离场目标、AI始终重选；全部必须改变运行结果并被独立表拒绝。`later-hero/later-pet` 拒绝固定火焰来源，`ai-retains`拒绝始终AI目标，world三相位拒绝忽略清理时机。

本地保留：`docs/tasks/evidence/TASK-SETTINGS-231/` 的source-trace/source-audit/verification、日志与handoff；`local-resources/regima/task-outputs/TASK-SETTINGS-231/air/` 的生成支架、SWF与descriptor用于下一task复验。均非生产依赖；Git保留本合同、工具与独立expected，换机器运行源级复验仍需本地语料和已安装AIR，普通游戏构建不需要这些文件。

未决边界：没有当前有限经验归属合同内的未决源分支；完整旧游戏画面、升级进化、删宠移出roster后的持久化政策、其他怪物覆写/任意AI排序不在本项的通过声明。238遇到删除宠物数据而非仅离场的需求时须保留原对象接收与存档存在性区别，禁止fallback新宠，必要时同线补证。灵魂/dropAura读取目标的时机不同，不得用本经验合同顺手重写掉落owner。
