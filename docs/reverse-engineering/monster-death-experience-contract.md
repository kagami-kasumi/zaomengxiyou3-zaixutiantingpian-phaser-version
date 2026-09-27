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

以下保留2026-09-26实施前的现代缺口；238接线及验证见文末。`targetSlot`、slot级`lastHitBy`、宠物实体ID与roster PetInfo身份不能互换。

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


## 238消费预检边界（2026-09-26）

**交叉确认（有限诊断）**：`tools/monster-experience-target-preflight.py` 执行原 `AUtils.GetNearestObj/GetDisBetweenTwoObj` 与 `BaseMonster.selectTarget`，原包AIR51.1.1.5共6输入全部符合独立预期。在怪物(0,0)、P1(20,0)、P2(100,0)、alertRange=1000时源选择P2，两个现代选择器选择P1；候选位置交换后源P1、现代P2。二维输入P1(100,400)/P2(200,0)时源P2，Stage1只按x选择P1。range=50的两例源均无目标；其中20/100例表明不能先过滤范围再选最近。range=50仅为诊断输入，不声称当前12类型实际配置如此。

**确认事实**：Stage1CombatSystem:606的helper按一维数值距离排序，类型输入无alertRange；Monster30System:753按二维数值最近选择。后者有范围检查也不代表原AUtils排序已消费。231固定100/400同数量级的264态仍成立，6例不是其经验比例/生命周期的反证；它们反证的是把现有数值最近选择当作合法XP-03消费者。

**未知/待239**：双英雄排序边界（含平局/空/单候选）、12实际构造最终alertRange、正式候选顺序与坐标适配尚无完整消费合同。239负责补证，238保持Blocked及全部XP-01..08责任。诊断采用注入的两活候选、调用原函数，不执行完整Config/构造/旧游戏；没有视觉或空间真值晋升，不改原231归档。可复验哈希/命令/原输出见本地 `docs/tasks/evidence/TASK-SLICE-238/selection-preflight.json`。


## 239选择输入补证完成（2026-09-26）

238预检的未知已在本有限范围解除；上节保留为历史失败记录，不再是当前阻塞。机器行为合同为 `docs/reverse-engineering/reference/monster-target-selection-contract.json`（`task-settings-239.monster-target-selection`）。238必须消费本节与原XP-01..08，不能恢复numeric nearest或经验fallback。

### 选择合同与接线要求

| 项 | 原事实/证据 | 238消费要求 |
| --- | --- | --- |
| 候选 | Config.as:1122按hero1、hero2顺序加入存在且非isDead的英雄；不排除仅readyToDestroy的活英雄，不加入pet | 从当前单局真实英雄对象按p1→p2建立候选，保存对象身份；不可依赖任意members/view数组顺序 |
| 选择 | AUtils.as:327无NUMERIC标志排序距离，再以indexOf(0)回指候选；612组原包AIR通过 | 只在无当前对象且通过原AI门禁时选择；最多两候选时按默认Number十进制字符串字典序，等距离保留第一候选；空/单候选分别无对象/唯一英雄 |
| 二维距离 | AUtils.as:316用sqrt(dx*dx+dy*dy)，输入是BaseObject.x/y | 使用同一世界坐标系的对象根，不用一维x、屏幕坐标、BBDC偏移或Math.hypot的另一舍入算法 |
| 警戒 | BaseMonster.as:708先选候选，再距离<=alertRange；原生180构造态验证12类在五关/20,24,30fps中最终值 | Monster19=600，其余11类=1000；不得先过滤范围再选，不得把攻击距离当警戒距离。EndlessModeCreate=2000唯一调用StageListener981，不属于本五关 |
| 保留与清理 | 原XP-03/04保留：活对象保留；已有死对象本次只清空；step尾部清死/readyToDestroy；效果致死可能先结算未清对象 | 同一对象归属供AI及死亡读；不能在每帧或死亡时用最近/首存活hero覆盖。恢复旧活hero/pet来源、已清为空及下一次合法重选三个状态 |
| 英雄根适配 | Role1..5 newColipse均ObjectBaseSprite；BaseHero:114仅横向scale1.2；BaseObject.getBottom:894为height/2+y。复用218 `/symbols/0`、`/monsterMappings/0/runtimeBounds` 原生高度100/top-50 | 对现代movement底点，根x=movement.x、根y=movement.y−50；角色BBDC视觉偏移不参与。两者已处于同一scene/world时共同平移抵消；不向距离转换额外加入落地0.1 |
| 怪物根 | 218/237已核定combat.x/y为对象根，236绑定持有sourceOffsetY及motion | 同次输入双方必须在同一坐标系：使用现代combat根与转换后的现代hero根，或对双方一致移除sourceOffsetY；禁止只移一方 |

**交叉确认范围**：612选择态、180实际构造态、240真实HeroParty模型/生产投影表达式态；9原源码变异拒绝（numeric、一维、先过滤、反转平局、候选逆序、始终重选、严格小于、纳入死英雄、不清离场），4损坏报告反例拒绝。231源哈希及264经验态复验未改写。全部输入/源码/编译SWF/原包AIR51.1.1.5/工具与输出哈希在本地239报告中可查；机器合同收录完整612有限样本及12profile。

### 六段证据矩阵

| 段 | 证据等级与材料 | 边界/反证条件 |
| --- | --- | --- |
| 局部 | 确认事实：12完整构造与newColipse；恢复源StageCommon，原237构造支架复用 | 新怪物/第三候选/无尽模式不外推 |
| 共享链 | 交叉确认：原Config/AUtils/BaseMonster方法，231 step/清理及typed经验setter原样保留 | 动态支架的移动、攻击、升级等服务是明确stub，不等于旧游戏回放 |
| 空间 | 既有verified218同一ObjectBaseSprite及217/237环境/怪物根；5英雄newColipse/scaleY/getBottom源码推导底点→根 | 不生成新视觉几何；不宣称英雄完整视觉、出生点或原移动轨迹等价；不得使用FFDec99.95代替AIR原生100 |
| 可观察合同 | 612独立expected覆盖同/跨数量级、交换、平局、空/单候选、死亡/仅离场、二维/十进制、边界、保留与清理 | 当前正常双英雄、有限实测状态；任意非有限坐标、第三候选另核 |
| 现代映射 | 240实际HeroParty模型及抽取的生产表达式执行；源码哈希绑定四关目标输入/TestScene方法 | 它证明当前输入是什么，不证明整个Phaser场景或生产选择/经验已修复 |
| 双验 | 原包AIR原方法/真实构造与独立表/源变异；真实现代模型/投影核对；verify及--check再生一致 | 本项没有UI变化，无像素验收声明；正式攻击、可见经验与真实保存/重载全部仍交238 |

### 五关/TestScene消费者交接

- Stage1-2：MonsterRuntimeRegistryBridge的`targets: heroes.snapshots()`实际转发HeroParty快照；Registry frame/Stage1目前只声明slot/x/alive，须将y及具体英雄引用沿原owner接入。
- Stage1-3/2-1/2-2：各GameplayBridge的同名targets表达式直接转发快照，y是movement脚点，包含dead entry；在公共选择端按原Config过滤与顺序，不逐关复制规则。
- Stage1-1/TestScene普通怪/Boss：TestScene.getMonsterTargets先过滤死亡后读取marker sprite.x/y；marker由HeroPartyRuntimeBridge.syncVisuals写movement脚点。转换应从同一实际成员的movement/root读取并核对更新相位，不把显示偏移或当前数组下标当对象身份。
- 原生排序不同的6预检例仍是生产反例；本项不修改src，不能把补证通过写成238实现通过。reversed模型输入刻意测试适配前提，不宣称正式路由当前以错误顺序创建英雄。
- 同一场景平移抵消仅适用于双方同坐标系；原始出生/完整逐帧移动及wall的0.1落地间距仍由原移动合同持有，不在本次目标转换顺手改动。

复验入口：`python tools/monster-selection-source/capture.py`、`capture.py --mutations`、`profiles.py`、`audit.py`、`npx --no-install tsx tools/monster-selection-consumer-inputs.ts`、`python tools/monster-selection-source/verify.py --check`。源输入不变时复用本地原生报告，优先运行audit/verify；不要重复全采231。完整报告与handoff在 `docs/tasks/evidence/TASK-SETTINGS-239/`，支架/SWF在 `local-resources/regima/task-outputs/TASK-SETTINGS-239/`；生产依赖不得指向这些被忽略目录。

## 238生产接线与验收（2026-09-27）

`MonsterExperienceSystem` 保存既有实体上的对象引用，在第一次死亡同步分配。`HeroPartyExperienceSystem` 连接实际英雄进度、当前运行宠物和原roster；`HeroPartyExperienceBridge` 写回既有active save，不创建第二套进度或奖励owner。经验从死亡时发放，掉落仍由原defeat-id/Stage1RewardBridge处理；任务进度保存改读最新save，避免用旧快照覆盖刚结算的经验。

| 生产边界 | 接线 | 验证责任 |
| --- | --- | --- |
| 五关创建/AI/尾部清理 | Registry与13/21/22自有创建路径在效果/AI之前绑定；视觉等待分支也维护目标。Monster30/3保留既有运动/攻击，选择根使用239投影，Monster30移动仍使用脚底坐标 | 612独立源选择态；264源expected；实际五关创建 |
| 英雄接受直击 | Stage1CombatSystem、TestScene近战及普通/Boss弹体在接受后、HP变化前写对象 | 保护/闪避/零伤害反例；双owner实际按键攻击 |
| 宠物攻击身份 | EntitySession生成稳定引用；PetCombatContext在生弹及私有攻击口捕获，猴/马resolver、马后续爆炸继承；兼容宠物沿原runtime挂元数据 | 24实际native普攻碰撞、失效ID、旧宠/换宠、同identity roster替换反例 |
| 效果与死亡 | 纯效果只扣受害者HP；Stage1/Monster30/Monster3第一次死亡调用同一分配；旧slot领奖在已绑定实体上退出 | 原264首次/重复/旧对象/清空后/再次AI选择，7核心生产变异 |
| 实际英雄/宠物/保存 | 英雄无实际宠100%，有宠各int(60%)；宠物仅保留petInfo100%；共享后重读当前宠。按slot写真实progression与encodePet | 12类型×P1/P2×3分配分支72例，加2旧宠晚到引用、2升级临界值，共76例；3消费者生产变异 |
| TestScene Boss通用pet-* | 兼容updateOwnedPetSystem真实生弹并捕获source，WorldBridge实际几何/去重/伤害/死亡/保存 | P1/P2单独Boss样本；显式提供Boss目标作为攻击请求输入，不替换碰撞，不声明完整Boss宠物AI |

`tools/pet-target-owner-preflight.ts` 已迁移至严格的实际模型/roster/保存专项；226原错误P2报告仅保留为历史，不能再把旧诊断退出0计作通过。TestScene兼容宠物由既有兼容owner执行，未注册到公共PetCombatRuntime的物种不再误送该运行器；本次未实现新的家族Behavior。

复验入口：

```powershell
npx esbuild tools/monster-experience-trace.ts --bundle --platform=node --format=esm --outfile=.tmp/monster-experience-trace.mjs
node .tmp/monster-experience-trace.mjs
python -B tools/verify-monster-experience.py
npx esbuild tools/monster-experience-runtime-tests.ts --bundle --platform=node --format=esm --outfile=.tmp/monster-experience-runtime-tests.mjs
node .tmp/monster-experience-runtime-tests.mjs
node tools/run-monster-experience-mutations.mjs
node tools/run-monster-experience-browser.mjs
# 宠物矩阵另设 XP_BROWSER_PET=1；Boss另设 XP_BROWSER_SCENE=TestScene / XP_BROWSER_BOSS=1。
```

本地证据目录 `docs/tasks/evidence/TASK-SLICE-238/` 保存production-trace、runtime-save-results、mutations及browser逐场景/owner/重载结果；`handoff.md`记录最终检查、实际场景数量和失败后修正。原231/239expected及源语料未被生产测试重写。生产运行不依赖该证据目录。

验证边界：264态使用生产目标/AI/死亡逻辑，但其无player/商人回血/英雄setter中换宠仍是显式回调环境，不冒充完整旧游戏。当前现代场景无商人时装buff生产者，保留首死回调合同，不借本项新增时装系统。76例使用真实progression/roster/codec，24宠物攻击的敌人初始HP=1、宠物ATK=10000是明确fixture；旧引用例先证明正常换宠会清除旧弹体，再强制提交保留引用，不能称作被删除弹体自然命中。浏览器使用level20存档和英雄生存保护；宠物ATK=10000，正常关卡由真实按键/宠物AI攻击，未修改怪物HP或注入命中。

未核销：232身体→攻击对象→效果→死亡顺序、233Canvas、234捕获身份、235被动回复，以及原84其余组合/完整猴马家族、VS-067和整条功能线。对象身份隔离只解决本次XP及带source弹体清理，不等于234完整捕获流程已修复。无新UI或原版视觉替换，也不以既有HUD截图宣称UI原生化。

### 238可见经验的窄修复

重载后的实际宠物页采用175A既有 `task-settings-175a.pet-page` verified真值（74对象/16态）和原版结构基准，不新增UI资源或重提语料。显示列表范围仅 `expmc`（character852/depth44）与 `exptxt`（character912/depth103）；根932同父子关系与坐标直接消费原manifest。经验字符串从FormalPetPageSystem恢复的同一roster读取，经FormalPetPageView写入；原稿先画文字再画进度图，导致文字存在但不可见，已改为进度图后画该文字。源depth与现代截图交叉确认，原版显示语义未新增推断。

差异证据：本地238/browser/pet-xp-page-before.png显示文字被遮挡；Stage12Scene-p1/p2-pet-pet-page.png显示恢复后的数值，P2为10/11025，并由page.json保存实际文本。只核销P1/P2经验字段这一状态差异，不称为全页或其他资质字段的新增验收。原字体/抗锯齿和长期授权像素差异不扩大；无新增现代视觉例外。`npm run test:pet-page-truth`复核原74对象/16态、Schema及原生资产约束通过，未重生成或改写verified JSON。
